-- Deconstruction Aggregator Database Schema
-- Supabase PostgreSQL with UUID PKs, TIMESTAMPTZ, RLS enabled

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Religions
create table religions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  icon_name text,
  display_order integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Resource Types
create table resource_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  icon_name text
);

-- Resources
create table resources (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null,
  religion_id uuid references religions(id) on delete cascade,
  type_id uuid references resource_types(id) on delete restrict,
  url text,
  author text,
  date_published date,
  license text,
  hostable boolean default false,
  priority integer check (priority between 1 and 5),
  summary text,
  description text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  format text,
  affiliate_url text,
  affiliate_eligible boolean default false,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(religion_id, slug)
);

-- Tags
create table tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique
);

-- Resource Tags
create table resource_tags (
  resource_id uuid references resources(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (resource_id, tag_id)
);

-- Forum Categories
create table forum_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer,
  religion_id uuid references religions(id) on delete set null
);

-- Forum Threads
create table forum_threads (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category_id uuid references forum_categories(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  content text,
  is_pinned boolean default false,
  is_locked boolean default false,
  view_count integer default 0,
  reply_count integer default 0,
  last_reply_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Forum Posts
create table forum_posts (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid references forum_threads(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  content text,
  parent_post_id uuid references forum_posts(id) on delete cascade,
  upvote_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User Profiles
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  bio text,
  former_religion text,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User Stories
create table user_stories (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references user_profiles(id) on delete set null,
  title text not null,
  content text,
  religion_id uuid references religions(id) on delete set null,
  is_anonymous boolean default false,
  is_published boolean default false,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quiz Results
create table quiz_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  group_name text,
  behavior_score integer,
  information_score integer,
  thought_score integer,
  emotional_score integer,
  total_score integer,
  interpretation text,
  share_token text unique,
  created_at timestamptz default now()
);

-- Newsletter Subscribers
create table newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  source text,
  subscribed_at timestamptz default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

-- Indexes
create index religions_slug_idx on religions(slug);
create index resources_religion_id_idx on resources(religion_id);
create index resources_type_id_idx on resources(type_id);
create index resources_is_published_idx on resources(is_published);
create index resource_tags_tag_id_idx on resource_tags(tag_id);
create index forum_threads_category_id_idx on forum_threads(category_id);
create index forum_threads_author_id_idx on forum_threads(author_id);
create index forum_posts_thread_id_idx on forum_posts(thread_id);
create index forum_posts_author_id_idx on forum_posts(author_id);
create index user_stories_religion_id_idx on user_stories(religion_id);
create index user_stories_is_published_idx on user_stories(is_published);
create index quiz_results_share_token_idx on quiz_results(share_token);
create index newsletter_subscribers_email_idx on newsletter_subscribers(email);

-- Row Level Security
alter table resources enable row level security;
alter table forum_threads enable row level security;
alter table forum_posts enable row level security;
alter table user_profiles enable row level security;
alter table user_stories enable row level security;
alter table quiz_results enable row level security;

-- RLS Policies
create policy "resources_public_select" on resources
  for select using (is_published = true);

create policy "resources_auth_select" on resources
  for select using (auth.role() = 'authenticated');

create policy "forum_threads_public_select" on forum_threads
  for select using (true);

create policy "forum_threads_insert" on forum_threads
  for insert with check (auth.role() = 'authenticated' and author_id = auth.uid());

create policy "forum_posts_public_select" on forum_posts
  for select using (true);

create policy "forum_posts_insert" on forum_posts
  for insert with check (auth.role() = 'authenticated' and author_id = auth.uid());

create policy "user_profiles_select" on user_profiles
  for select using (is_public = true or id = auth.uid());

create policy "user_profiles_update" on user_profiles
  for update using (id = auth.uid());

create policy "user_stories_select" on user_stories
  for select using (is_published = true or author_id = auth.uid());

create policy "user_stories_insert" on user_stories
  for insert with check (auth.role() = 'authenticated');

create policy "quiz_results_insert" on quiz_results
  for insert with check (true);

create policy "quiz_results_select" on quiz_results
  for select using (user_id = auth.uid() or user_id is null);

-- Updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_religions_updated_at before update on religions
  for each row execute function update_updated_at_column();

create trigger update_resources_updated_at before update on resources
  for each row execute function update_updated_at_column();

create trigger update_forum_threads_updated_at before update on forum_threads
  for each row execute function update_updated_at_column();

create trigger update_forum_posts_updated_at before update on forum_posts
  for each row execute function update_updated_at_column();

create trigger update_user_profiles_updated_at before update on user_profiles
  for each row execute function update_updated_at_column();

create trigger update_user_stories_updated_at before update on user_stories
  for each row execute function update_updated_at_column();

-- Seed resource types
insert into resource_types (name, slug, icon_name) values
  ('Document', 'document', 'file-text'),
  ('Book', 'book', 'book'),
  ('Podcast', 'podcast', 'headphones'),
  ('Website', 'website', 'globe'),
  ('Documentary', 'documentary', 'film'),
  ('Subreddit', 'subreddit', 'users'),
  ('Organization', 'organization', 'building'),
  ('YouTube', 'youtube', 'play-circle'),
  ('TV Series', 'tv-series', 'tv'),
  ('Court Document', 'court-document', 'gavel'),
  ('Gov Document', 'gov-document', 'landmark'),
  ('Academic', 'academic', 'graduation-cap');
