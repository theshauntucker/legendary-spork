-- RoutineX Dancer Season Tracking — Database Migration
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT DO NOTHING)

-- ============================================
-- 1. ADD COMPETITION FIELDS TO VIDEOS TABLE
-- ============================================
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS competition_name TEXT,
  ADD COLUMN IF NOT EXISTS competition_date DATE;

-- ============================================
-- 2. DANCERS TABLE
-- One row per dancer per user — stores profile info.
-- dancer_name on videos is the FK reference (by name).
-- ============================================
CREATE TABLE IF NOT EXISTS public.dancers (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  studio_name  TEXT,
  age_group    TEXT,
  primary_style TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.dancers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own dancers"
  ON public.dancers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own dancers"
  ON public.dancers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own dancers"
  ON public.dancers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Service role full access to dancers"
  ON public.dancers FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 3. SEASON TABLE
-- Tracks a named season (e.g. "2024-2025 Season").
-- Optional — used to group analyses by season.
-- ============================================
CREATE TABLE IF NOT EXISTS public.seasons (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,              -- e.g. "2024-2025 Season"
  start_date  DATE,
  end_date    DATE,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own seasons"
  ON public.seasons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage own seasons"
  ON public.seasons FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 4. ADD season_id TO VIDEOS (optional FK)
-- ============================================
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL;

-- ============================================
-- 5. HELPFUL INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_videos_dancer_name
  ON public.videos(user_id, dancer_name);

CREATE INDEX IF NOT EXISTS idx_videos_competition
  ON public.videos(user_id, competition_name, competition_date);

CREATE INDEX IF NOT EXISTS idx_analyses_created
  ON public.analyses(user_id, created_at DESC);

-- ============================================
-- DONE! Dancer tracking tables are ready.
-- ============================================
