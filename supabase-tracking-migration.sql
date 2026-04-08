-- ============================================================
-- Routine Tracking Feature Migration
-- Adds parent_video_id to videos table for progress tracking
-- Run this in your Supabase SQL editor before deploying
-- ============================================================

-- Add parent_video_id column to videos table
-- Self-referencing FK: a video can optionally point to a previous version
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS parent_video_id uuid
  REFERENCES videos(id)
  ON DELETE SET NULL;

-- Index for fast lookups when querying a routine's history chain
CREATE INDEX IF NOT EXISTS idx_videos_parent_video_id
  ON videos(parent_video_id);

-- Optional: index to quickly find all videos for a user sorted by date
-- (useful for the "pick a previous routine" dropdown)
CREATE INDEX IF NOT EXISTS idx_videos_user_created
  ON videos(user_id, created_at DESC);
