-- Coda migration 009: competition check-ins + weekend threads

create table if not exists public.competition_checkins (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  competition_id text not null,
  competition_date date not null,
  checked_in_at timestamptz default now(),
  unique (profile_id, competition_id, competition_date)
);
create index if not exists idx_checkins_event on public.competition_checkins(competition_id, competition_date);

create table if not exists public.competition_threads (
  competition_id text not null,
  competition_date date not null,
  thread_id uuid default gen_random_uuid(),
  seeded boolean default false,
  primary key (competition_id, competition_date)
);

create table if not exists public.thread_messages (
  id uuid default gen_random_uuid() primary key,
  competition_id text not null,
  competition_date date not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now()
);
create index if not exists idx_thread_msgs on public.thread_messages(competition_id, competition_date, created_at);

alter table public.competition_checkins enable row level security;
alter table public.competition_threads enable row level security;
alter table public.thread_messages enable row level security;

drop policy if exists "anyone reads checkins" on public.competition_checkins;
create policy "anyone reads checkins" on public.competition_checkins for select using (true);
drop policy if exists "users write own checkin" on public.competition_checkins;
create policy "users write own checkin" on public.competition_checkins for insert
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));
drop policy if exists "anyone reads threads" on public.competition_threads;
create policy "anyone reads threads" on public.competition_threads for select using (true);
drop policy if exists "anyone reads thread msgs" on public.thread_messages;
create policy "anyone reads thread msgs" on public.thread_messages for select using (true);
drop policy if exists "adults post to threads" on public.thread_messages;
create policy "adults post to threads" on public.thread_messages for insert
  with check (
    profile_id in (
      select id from public.profiles
      where user_id = auth.uid() and age_tier = 'adult'
    )
  );
