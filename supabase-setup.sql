-- RoutineX Database Setup
-- Run this in your Supabase Dashboard → SQL Editor → New Query
-- Copy the entire contents of this file and click "Run"

-- ============================================
-- 1. WAITLIST TABLE (migrated from JSON file)
-- ============================================
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  name text,
  role text default 'parent',
  joined_at timestamptz default now()
);

alter table public.waitlist enable row level security;

-- Anyone can sign up for the waitlist (no login required)
create policy "Anyone can join waitlist" on public.waitlist
  for insert with check (true);

-- Only the server (service role) can read waitlist data
create policy "Service role can read waitlist" on public.waitlist
  for select using (auth.role() = 'service_role');


-- ============================================
-- 2. VIDEOS TABLE
-- ============================================
create table if not exists public.videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  filename text not null,
  storage_path text not null,
  routine_name text not null,
  dancer_name text,
  studio_name text,
  age_group text not null,
  style text not null,
  entry_type text not null,
  file_size bigint,
  status text default 'uploaded' check (status in ('uploaded', 'processing', 'ready', 'analyzed', 'error')),
  thumbnail_path text,
  analysis_id uuid,
  preprocessing_metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.videos enable row level security;

-- Users can only see their own videos
create policy "Users can view own videos" on public.videos
  for select using (auth.uid() = user_id);

-- Users can upload videos (insert)
create policy "Users can insert own videos" on public.videos
  for insert with check (auth.uid() = user_id);

-- Users can update their own videos
create policy "Users can update own videos" on public.videos
  for update using (auth.uid() = user_id);

-- Service role can do everything (for preprocessing pipeline)
create policy "Service role full access to videos" on public.videos
  for all using (auth.role() = 'service_role');


-- ============================================
-- 3. ANALYSES TABLE
-- ============================================
create table if not exists public.analyses (
  id uuid default gen_random_uuid() primary key,
  video_id uuid references public.videos(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  total_score numeric,
  award_level text,
  judge_scores jsonb,
  timeline_notes jsonb,
  improvement_priorities jsonb,
  competition_comparison jsonb,
  created_at timestamptz default now()
);

alter table public.analyses enable row level security;

-- Users can view their own analyses
create policy "Users can view own analyses" on public.analyses
  for select using (auth.uid() = user_id);

-- Service role can insert analyses (from preprocessing pipeline)
create policy "Service role can insert analyses" on public.analyses
  for insert with check (auth.role() = 'service_role');


-- ============================================
-- 4. LINK VIDEOS TO ANALYSES (foreign key)
-- ============================================
-- Note: This may fail if the constraint already exists. That's OK.
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'fk_analysis' and table_name = 'videos'
  ) then
    alter table public.videos
      add constraint fk_analysis
      foreign key (analysis_id) references public.analyses(id);
  end if;
end $$;


-- ============================================
-- 5. STORAGE BUCKET
-- ============================================
-- Note: You also need to create the storage bucket manually in the
-- Supabase Dashboard → Storage → New Bucket:
--   Name: videos
--   Public: OFF (private)
--   File size limit: 500 MB
--   Allowed MIME types: video/mp4, video/quicktime, video/x-msvideo, video/webm

-- Storage policies (run in SQL editor):
insert into storage.buckets (id, name, public, file_size_limit)
values ('videos', 'videos', false, 524288000)
on conflict (id) do nothing;


-- ============================================
-- DONE! Your database is ready.
-- ============================================
