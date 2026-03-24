-- RoutineX Community & Progress Platform — Database Migration
-- Run this in the Supabase SQL Editor

-- =============================================================
-- 1. competition_scores — Log real competition results
-- =============================================================
CREATE TABLE IF NOT EXISTS competition_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  competition_name TEXT NOT NULL,
  competition_date DATE NOT NULL,
  actual_score NUMERIC(5,1),
  actual_award_level TEXT,
  placement TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE competition_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own competition scores"
  ON competition_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own competition scores"
  ON competition_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own competition scores"
  ON competition_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own competition scores"
  ON competition_scores FOR DELETE USING (auth.uid() = user_id);

-- =============================================================
-- 2. dancer_profiles — Virtual trophy room identity
-- =============================================================
CREATE TABLE IF NOT EXISTS dancer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dancer_name TEXT NOT NULL,
  studio_name TEXT,
  styles TEXT[] DEFAULT '{}',
  age_group TEXT,
  bio TEXT,
  avatar_url TEXT,  -- Avatar/illustration only, NO real photos
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, dancer_name)
);

ALTER TABLE dancer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dancer profiles"
  ON dancer_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dancer profiles"
  ON dancer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dancer profiles"
  ON dancer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dancer profiles"
  ON dancer_profiles FOR DELETE USING (auth.uid() = user_id);

-- =============================================================
-- 3. achievements — Earned badges and milestones
-- =============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dancer_name TEXT NOT NULL,
  achievement_type TEXT NOT NULL,  -- 'first_gold', 'first_high_gold', 'first_platinum', 'first_diamond', 'score_jump', 'analysis_streak'
  achievement_data JSONB DEFAULT '{}',
  earned_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT USING (auth.uid() = user_id);

-- Service role handles inserts (from /api/process)
CREATE POLICY "Service role can insert achievements"
  ON achievements FOR INSERT WITH CHECK (true);

-- =============================================================
-- 4. Phase 2 (Community) — Schema only, no frontend yet
-- =============================================================
CREATE TABLE IF NOT EXISTS community_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',  -- pending, approved, rejected
  reason_to_join TEXT NOT NULL,
  dance_background TEXT NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE community_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application"
  ON community_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own application"
  ON community_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_type TEXT DEFAULT 'achievement',  -- 'achievement', 'trophy_share', 'milestone'
  content TEXT,
  achievement_id UUID REFERENCES achievements(id),
  dancer_name TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved community members can view posts"
  ON community_posts FOR SELECT USING (
    EXISTS (SELECT 1 FROM community_applications WHERE user_id = auth.uid() AND status = 'approved')
    OR auth.uid() = user_id
  );
CREATE POLICY "Approved members can insert posts"
  ON community_posts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM community_applications WHERE user_id = auth.uid() AND status = 'approved')
  );
