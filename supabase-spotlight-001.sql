-- RoutineX Spotlight — premium one-dancer coaching report ($14.99)
-- Additive only. Nothing about routine scoring / user_credits changes.

-- 1. payments.payment_type must accept the new product (the BOGO lesson:
--    a missing value here silently drops every purchase row).
alter table public.payments drop constraint if exists payments_payment_type_check;
alter table public.payments add constraint payments_payment_type_check
  check (payment_type = any (array[
    'beta_access','video_analysis','trial','single','bogo','intro',
    'subscription','subscription_renewal','studio_subscription','practice_plan',
    'spotlight'
  ]));

-- 2. Spotlight credits — separate from analysis credits on purpose.
create table if not exists public.spotlight_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total integer not null default 0,
  used integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.spotlight_credits enable row level security;
drop policy if exists "spotlight_credits_read_own" on public.spotlight_credits;
create policy "spotlight_credits_read_own" on public.spotlight_credits
  for select using (auth.uid() = user_id);

-- Atomic grant / consume so webhook retries and double-taps can't double-count.
create or replace function public.spotlight_grant(p_user uuid, p_amount integer)
returns void language sql security definer set search_path = public as $$
  insert into public.spotlight_credits (user_id, total, used)
  values (p_user, p_amount, 0)
  on conflict (user_id) do update
    set total = public.spotlight_credits.total + excluded.total, updated_at = now();
$$;

create or replace function public.spotlight_consume(p_user uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  update public.spotlight_credits
     set used = used + 1, updated_at = now()
   where user_id = p_user and used < total
  returning true into ok;
  return coalesce(ok, false);
end $$;

-- 3. The report itself.
create table if not exists public.spotlight_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'processing' check (status in ('processing','ready','error')),
  dancer_name text not null,
  routine_name text,
  style text not null,
  age_division text,
  level text,
  focus_note text,
  frame_count integer not null default 0,
  tracked_frames integer not null default 0,
  video_duration numeric,
  frames jsonb not null default '[]'::jsonb,
  key_frames jsonb,
  report jsonb,
  model text,
  error text,
  attempts integer not null default 0,
  pdf_path text,
  share_token text unique default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz not null default now(),
  ready_at timestamptz
);
create index if not exists spotlight_reports_user_idx on public.spotlight_reports (user_id, created_at desc);
create index if not exists spotlight_reports_status_idx on public.spotlight_reports (status) where status = 'processing';
alter table public.spotlight_reports enable row level security;
drop policy if exists "spotlight_reports_read_own" on public.spotlight_reports;
create policy "spotlight_reports_read_own" on public.spotlight_reports
  for select using (auth.uid() = user_id);

-- 4. Bayda conversations — saved per account so we can follow up with the
--    families who asked about progress.
create table if not exists public.bayda_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_key text not null,
  page text,
  platform text,
  messages jsonb not null default '[]'::jsonb,
  message_count integer not null default 0,
  topics text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists bayda_conversations_session_idx on public.bayda_conversations (session_key);
create index if not exists bayda_conversations_user_idx on public.bayda_conversations (user_id, updated_at desc);
alter table public.bayda_conversations enable row level security;
