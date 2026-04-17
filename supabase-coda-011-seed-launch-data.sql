-- Coda migration 011: Day-0 seed — backfill profiles + achievements for all existing users.
-- Idempotent: guards every insert with NOT EXISTS; safe to re-run.
-- Depends on migrations 001-009.

-- 1) Create profiles for every auth.user who doesn't have one yet.
--    profile_type is guessed: user has a dancer_name on any video → parent; else dancer.
--    age_tier defaults to adult. founding_member true for the first 1000 by created_at.
with needs as (
  select u.id as user_id, u.email, u.created_at,
    case when exists (
      select 1 from public.videos v
      where v.user_id = u.id and v.dancer_name is not null and v.dancer_name <> ''
    ) then 'parent' else 'dancer' end as profile_type
  from auth.users u
  where not exists (select 1 from public.profiles p where p.user_id = u.id)
),
ranked as (
  select n.*, row_number() over (order by n.created_at asc) as rn,
    (select count(*) from public.profiles) as existing_count
  from needs n
)
insert into public.profiles (user_id, handle, profile_type, age_tier, founding_member, aura_style, aura_stops)
select
  r.user_id,
  lower(
    regexp_replace(
      coalesce(split_part(r.email, '@', 1), 'user'),
      '[^a-zA-Z0-9_]', '_', 'g'
    )
  ) || '_' || substr(r.user_id::text, 1, 6),
  r.profile_type,
  'adult',
  (r.existing_count + r.rn) <= 1000,
  (select id from public.aura_catalog where unlock_tier = 'starter' order by random() limit 1),
  (select gradient_stops from public.aura_catalog where unlock_tier = 'starter' order by random() limit 1)
from ranked r;

-- 2) Backfill achievements from every analyzed video with total_score >= 260.
--    (Mirrors migration 004; kept here for idempotent re-runs on late sign-ups.)
insert into public.achievements (profile_id, video_id, award_level, total_score, competition_name, competition_date, category, earned_at)
select
  p.id, v.id,
  case
    when a.total_score >= 290 then 'diamond'
    when a.total_score >= 280 then 'platinum'
    when a.total_score >= 270 then 'high_gold'
    else 'gold'
  end,
  a.total_score, v.competition_name, v.competition_date, v.style,
  coalesce(a.created_at, v.created_at, now())
from public.analyses a
join public.videos v on v.id = a.video_id
join public.profiles p on p.user_id = v.user_id
where a.total_score >= 260
  and not exists (select 1 from public.achievements x where x.video_id = v.id);

-- 3) Default every backfilled achievement to public visibility.
insert into public.visibility_settings (owner_profile_id, item_type, item_id, visibility)
select a.profile_id, 'achievement', a.id, 'public'
from public.achievements a
where not exists (
  select 1 from public.visibility_settings v
  where v.item_type = 'achievement' and v.item_id = a.id
);

-- 4) Ensure a "Bayda" system profile exists (used by the daily posts cron).
insert into public.profiles (user_id, handle, profile_type, age_tier, display_name, is_verified)
select null, 'bayda', 'studio', 'adult', 'Bayda', true
where not exists (select 1 from public.profiles where handle = 'bayda');
