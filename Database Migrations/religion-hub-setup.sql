-- FaithLens Religion Hub Database Setup
-- Run this in your Supabase SQL editor

-- Email subscribers
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'website'
);

ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON email_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Only service role reads subscribers" ON email_subscribers FOR SELECT USING (auth.role() = 'service_role');

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Forum threads
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pinned BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read threads" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create threads" ON forum_threads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can update own threads" ON forum_threads FOR UPDATE USING (auth.uid() = author_id);

-- Forum replies
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read replies" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON forum_replies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can update own replies" ON forum_replies FOR UPDATE USING (auth.uid() = author_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_topic ON forum_threads(topic);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
