-- supabase-coda-015-moderation.sql
-- Moderation primitives: reports + blocks helper
--
-- reports: user flags content or accounts. Admin reviews via the admin console
--   (status in {open, reviewing, actioned, dismissed}). One-row-per-reporter-per-target.
-- blocks: table and policies are owned by migration 010-dm.sql (profile-based).
--   This file only adds the symmetric is_blocked() helper, adapted to the
--   profile-based schema so feed/DM/comment queries can filter both directions
--   using auth.uid().

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

-- ── blocks helper ───────────────────────────────────────────────────────────
-- Migration 010-dm.sql already creates public.blocks with profile-based columns
-- (blocker_profile_id, blocked_profile_id) and RLS policies. Do not recreate.
--
-- Ensure blocked_profile_id lookup index exists (010 creates the table but
-- may not have created a dedicated index on the blocked side).
create index if not exists blocks_blocked_profile_idx
  on public.blocks(blocked_profile_id);

-- is_blocked(viewer, target): viewer/target are auth.users UUIDs (auth.uid()).
-- Resolves each to a profile id, then checks the symmetric block relation.
create or replace function public.is_blocked(viewer uuid, target uuid)
returns boolean
language sql
stable
as $$
  with v as (select id from public.profiles where user_id = viewer),
       t as (select id from public.profiles where user_id = target)
  select exists (
    select 1
      from public.blocks b, v, t
     where (b.blocker_profile_id = v.id and b.blocked_profile_id = t.id)
        or (b.blocker_profile_id = t.id and b.blocked_profile_id = v.id)
  );
$$;

commit;
