-- RoutineX Studio — Phase G migration (schedule)
-- Run this in Supabase Dashboard → SQL Editor AFTER supabase-studio-002-*.sql.
--
-- Additive-only: no existing table, column, policy, or RPC is modified.
-- Naming convention: supabase-studio-NNN-short-name.sql (see
-- STUDIO-MIGRATIONS.md at the repo root).

-- ============================================================================
-- 1. STUDIO_COMPETITIONS — one row per competition on a studio's schedule
-- ============================================================================
create table if not exists public.studio_competitions (
  id uuid default gen_random_uuid() primary key,
  studio_id uuid references public.studios(id) on delete cascade not null,
  name text not null,
  competition_date date,
  location text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_studio_competitions_studio
  on public.studio_competitions(studio_id, competition_date);

alter table public.studio_competitions enable row level security;

create policy "Members can view studio competitions"
  on public.studio_competitions for select
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_competitions.studio_id and m.user_id = auth.uid()
    )
  );

create policy "Members can manage studio competitions"
  on public.studio_competitions for all
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_competitions.studio_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_competitions.studio_id and m.user_id = auth.uid()
    )
  );

create policy "Service role full access to studio_competitions"
  on public.studio_competitions for all using (auth.role() = 'service_role');


-- ============================================================================
-- 2. STUDIO_COMPETITION_ENTRIES — join table: competition ↔ routine+music
-- ============================================================================
-- studio_id is denormalized from the competition's owning studio so RLS
-- checks don't have to join. Kept in sync by the API route (single
-- owning studio per competition, so no ambiguity).
create table if not exists public.studio_competition_entries (
  id uuid default gen_random_uuid() primary key,
  competition_id uuid references public.studio_competitions(id) on delete cascade not null,
  routine_music_id uuid references public.studio_routine_music(id) on delete cascade not null,
  studio_id uuid references public.studios(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(competition_id, routine_music_id)
);

create index if not exists idx_studio_competition_entries_competition
  on public.studio_competition_entries(competition_id);
create index if not exists idx_studio_competition_entries_routine
  on public.studio_competition_entries(routine_music_id);

alter table public.studio_competition_entries enable row level security;

create policy "Members can view studio competition entries"
  on public.studio_competition_entries for select
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_competition_entries.studio_id and m.user_id = auth.uid()
    )
  );

create policy "Members can manage studio competition entries"
  on public.studio_competition_entries for all
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_competition_entries.studio_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_competition_entries.studio_id and m.user_id = auth.uid()
    )
  );

create policy "Service role full access to studio_competition_entries"
  on public.studio_competition_entries for all using (auth.role() = 'service_role');
