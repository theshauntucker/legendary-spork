-- ─────────────────────────────────────────────────────────────────────────
-- Engagement loop — applied to production 2026-09-14.
--
-- Feedback capture at every prompt, a one-per-account free-analysis reward,
-- publishable testimonials, and once-per-account milestone celebrations.
-- ─────────────────────────────────────────────────────────────────────────

-- Every piece of feedback a parent gives us, whatever the moment.
create table if not exists feedback_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,             -- pre_analysis | report_rating | milestone | idea
  prompt_key text,                -- which question we asked
  choice text,                    -- chip they tapped
  body text,                      -- what they typed
  rating int,
  video_id uuid,
  analysis_id text,
  platform text default 'web',
  credit_granted boolean default false,
  created_at timestamptz default now()
);

create index if not exists feedback_notes_user_idx on feedback_notes(user_id, created_at desc);
create index if not exists feedback_notes_kind_idx on feedback_notes(kind, created_at desc);

alter table feedback_notes enable row level security;
drop policy if exists "feedback_notes_own" on feedback_notes;
create policy "feedback_notes_own" on feedback_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- One free-analysis reward per account, ever. The primary key is the cap.
create table if not exists feedback_rewards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  credits int not null default 1,
  feedback_note_id uuid,
  granted_at timestamptz default now()
);

alter table feedback_rewards enable row level security;
drop policy if exists "feedback_rewards_own" on feedback_rewards;
create policy "feedback_rewards_own" on feedback_rewards
  for select using (auth.uid() = user_id);

-- Happy web users become publishable social proof (after Shaun approves).
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  display_name text,
  role text,
  quote text not null,
  rating int,
  approved boolean default false,
  created_at timestamptz default now()
);

create index if not exists testimonials_approved_idx on testimonials(approved, created_at desc);

alter table testimonials enable row level security;
drop policy if exists "testimonials_insert_own" on testimonials;
create policy "testimonials_insert_own" on testimonials
  for insert with check (auth.uid() = user_id);
drop policy if exists "testimonials_read_approved" on testimonials;
create policy "testimonials_read_approved" on testimonials
  for select using (approved = true);

-- A milestone celebration fires once per account, never again.
create table if not exists milestone_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_key text not null,
  video_id uuid,
  created_at timestamptz default now(),
  primary key (user_id, milestone_key)
);

alter table milestone_events enable row level security;
drop policy if exists "milestone_events_own" on milestone_events;
create policy "milestone_events_own" on milestone_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- The existing review prompt learns whether it paid out.
alter table review_prompts add column if not exists credit_granted boolean default false;
