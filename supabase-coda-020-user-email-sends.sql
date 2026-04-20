-- Coda migration 020: user_email_sends audit table.
--
-- The coda-onboarding-emails cron (src/app/api/cron/coda-onboarding-emails)
-- treats this table as the source of truth for idempotency — it inserts a
-- (user_id, email_kind) row BEFORE calling Resend and relies on a unique
-- violation (code 23505) to treat repeat work as a no-op.
--
-- The cron shipped referencing this table but the schema was never migrated,
-- so every cron run has been failing on the first insert and no Coda welcome
-- or profile-nudge emails have gone out since launch. This migration creates
-- the table with the composite PK the cron expects.
--
-- Idempotent: safe to re-run.

create table if not exists public.user_email_sends (
  user_id    uuid not null references auth.users(id) on delete cascade,
  email_kind text not null,
  sent_at    timestamptz not null default now(),
  primary key (user_id, email_kind)
);

-- Useful for "show me the last wave of X emails" admin queries.
create index if not exists user_email_sends_kind_sent_at_idx
  on public.user_email_sends (email_kind, sent_at desc);

-- RLS: this is an internal audit log. No client should ever read or write.
-- The cron hits it via the service role (which bypasses RLS), so locking
-- everyone else out is correct.
alter table public.user_email_sends enable row level security;

drop policy if exists "no client access" on public.user_email_sends;
create policy "no client access" on public.user_email_sends
  for all
  using (false)
  with check (false);
