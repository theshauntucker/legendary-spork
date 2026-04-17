-- supabase-coda-014-push-subscriptions.sql
-- P1: Web Push subscriptions + in-app notifications
--
-- push_subscriptions: one row per browser install. Keyed by endpoint to keep
--   re-subscriptions from duplicating. Service role writes; owner reads.
-- notifications: in-app feed of events (new follower, comment on your post,
--   bond unlocked, thread activity). Read-own, insert-service-role.

begin;

-- ── push_subscriptions ─────────────────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  endpoint      text        not null,
  p256dh        text        not null,
  auth          text        not null,
  user_agent    text,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  unique (endpoint)
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists push_subs_owner_select on public.push_subscriptions;
create policy push_subs_owner_select
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists push_subs_owner_delete on public.push_subscriptions;
create policy push_subs_owner_delete
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- Inserts + updates happen via service role only; no public insert policy.

-- ── notifications ──────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  kind        text        not null, -- follow, comment, reaction, bond, checkin, thread, system
  title       text        not null,
  body        text,
  href        text,         -- deep link inside the app
  actor_id    uuid          references auth.users(id) on delete set null,
  target_id   text,         -- polymorphic id (post, video, thread, etc.)
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications(user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications(user_id)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists notifications_owner_select on public.notifications;
create policy notifications_owner_select
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists notifications_owner_update on public.notifications;
create policy notifications_owner_update
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists notifications_owner_delete on public.notifications;
create policy notifications_owner_delete
  on public.notifications for delete
  using (auth.uid() = user_id);

-- Inserts only via service role.

commit;
