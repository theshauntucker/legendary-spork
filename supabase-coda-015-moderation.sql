-- supabase-coda-015-moderation.sql
-- Moderation primitives: reports + blocks
--
-- reports: user flags content or accounts. Admin reviews via the admin console
--   (status in {open, reviewing, actioned, dismissed}). One-row-per-reporter-per-target.
-- blocks: bidirectional mute. The UI treats a block as "I never see them, they
--   never see me" — feed and DM queries filter both directions.

begin;

-- ── reports ─────────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id             uuid        primary key default gen_random_uuid(),
  reporter_id    uuid        not null references auth.users(id) on delete cascade,
  target_kind    text        not null check (target_kind in ('user','post','comment','message','studio','choreographer','thread','video')),
  target_id      text        not null,
  reason         text        not null check (char_length(reason) between 1 and 500),
  status         text        not null default 'open' check (status in ('open','reviewing','actioned','dismissed')),
  admin_notes    text,
  created_at     timestamptz not null default now(),
  resolved_at    timestamptz,
  unique (reporter_id, target_kind, target_id)
);

create index if not exists reports_status_created_idx
  on public.reports(status, created_at desc);

alter table public.reports enable row level security;

drop policy if exists reports_owner_select on public.reports;
create policy reports_owner_select
  on public.reports for select
  using (auth.uid() = reporter_id);

drop policy if exists reports_owner_insert on public.reports;
create policy reports_owner_insert
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- ── blocks ──────────────────────────────────────────────────────────────────
create table if not exists public.blocks (
  blocker_id  uuid        not null references auth.users(id) on delete cascade,
  blocked_id  uuid        not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index if not exists blocks_blocked_idx on public.blocks(blocked_id);

alter table public.blocks enable row level security;

drop policy if exists blocks_owner_select on public.blocks;
create policy blocks_owner_select
  on public.blocks for select
  using (auth.uid() = blocker_id);

drop policy if exists blocks_owner_insert on public.blocks;
create policy blocks_owner_insert
  on public.blocks for insert
  with check (auth.uid() = blocker_id);

drop policy if exists blocks_owner_delete on public.blocks;
create policy blocks_owner_delete
  on public.blocks for delete
  using (auth.uid() = blocker_id);

-- ── helper: is_blocked(viewer, target) — symmetric check ────────────────────
create or replace function public.is_blocked(viewer uuid, target uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.blocks
     where (blocker_id = viewer and blocked_id = target)
        or (blocker_id = target and blocked_id = viewer)
  );
$$;

commit;
