-- Coda migration 004: achievements (trophy wall) + backfill from analyses >= 260
-- Relies on profiles + visibility_settings from migrations 001-003.

-- Ensure optional videos columns referenced by the backfill exist (idempotent).
alter table public.videos add column if not exists competition_name text;
alter table public.videos add column if not exists competition_date date;

-- Drop legacy achievements table (from supabase-dancer-tracking.sql) if present.
-- That older schema (user_id, dancer_name, achievement_type, achievement_data, earned_at)
-- collides with the Coda trophy wall schema defined below. Legacy table is empty
-- in production (verified) and was never referenced by shipped UI, so dropping is safe.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'achievements'
      and column_name = 'dancer_name'
  ) then
    drop table public.achievements cascade;
  end if;
end $$;

create table if not exists public.achievements (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  video_id uuid references public.videos(id) on delete cascade,
  award_level text check (award_level in ('gold','high_gold','platinum','diamond')) not null,
  total_score numeric(5,2) not null,
  competition_name text,
  competition_date date,
  category text,
  earned_at timestamptz default now(),
  share_card_url text
);

create index if not exists idx_achievements_profile on public.achievements(profile_id, earned_at desc);
create index if not exists idx_achievements_video on public.achievements(video_id);

alter table public.achievements enable row level security;

drop policy if exists "achievement visibility" on public.achievements;
create policy "achievement visibility" on public.achievements for select
  using (public.can_view_item(auth.uid(), 'achievement', id));

drop policy if exists "owner writes achievements" on public.achievements;
create policy "owner writes achievements" on public.achievements for all
  using (profile_id in (select id from public.profiles where user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));

-- Backfill: every scored >= 260 analysis becomes a trophy for the owning profile.
-- Derives award_level from score thresholds.
insert into public.achievements (profile_id, video_id, award_level, total_score, competition_name, competition_date, category, earned_at)
select
  p.id,
  v.id,
  case
    when a.total_score >= 290 then 'diamond'
    when a.total_score >= 280 then 'platinum'
    when a.total_score >= 270 then 'high_gold'
    else 'gold'
  end as award_level,
  a.total_score,
  v.competition_name,
  v.competition_date,
  v.style,
  coalesce(a.created_at, v.created_at, now())
from public.analyses a
join public.videos v on v.id = a.video_id
join public.profiles p on p.user_id = v.user_id
where a.total_score >= 260
  and not exists (
    select 1 from public.achievements x
    where x.video_id = v.id
  );

-- Mark each backfilled achievement public by default so Day 1 feed isn't empty.
insert into public.visibility_settings (owner_profile_id, item_type, item_id, visibility)
select a.profile_id, 'achievement', a.id, 'public'
from public.achievements a
where not exists (
  select 1 from public.visibility_settings v
  where v.item_type = 'achievement' and v.item_id = a.id
);
