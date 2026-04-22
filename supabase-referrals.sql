-- RoutineX User-to-User Referral Program
-- Run this in your Supabase Dashboard → SQL Editor → New Query
-- Run AFTER supabase-affiliates.sql and supabase-coda-001-profiles-auras.sql
--
-- This adds PEER referrals (every user can refer friends and earn free credits)
-- on top of the existing AFFILIATE system (influencers with custom codes).
-- The two systems coexist — affiliate codes attribute revenue %, user codes
-- grant +1 free credit to both parties on first paid signup.

-- ============================================
-- 1. Add referral_code column to profiles
-- ============================================
alter table public.profiles
  add column if not exists referral_code text;

-- Backfill any existing profiles that lack a code
update public.profiles
set referral_code = upper(substring(md5(random()::text || id::text) from 1 for 6))
where referral_code is null;

-- Enforce uniqueness going forward
create unique index if not exists idx_profiles_referral_code on public.profiles(referral_code);


-- ============================================
-- 2. Auto-generate referral_code on profile insert
-- ============================================
create or replace function public.generate_referral_code()
returns trigger as $$
begin
  if new.referral_code is null then
    new.referral_code := upper(substring(md5(random()::text || new.id::text) from 1 for 6));
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_referral_code_trigger on public.profiles;
create trigger profiles_referral_code_trigger
  before insert on public.profiles
  for each row
  execute function public.generate_referral_code();


-- ============================================
-- 3. referrals table — each referral event
-- ============================================
create table if not exists public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_user_id uuid references auth.users(id) on delete cascade not null,
  referred_user_id uuid references auth.users(id) on delete cascade not null,
  referral_code text not null,
  status text not null default 'pending'
    check (status in ('pending','paid','credited','capped','invalid')),
  credit_granted_referrer boolean not null default false,
  credit_granted_referred boolean not null default false,
  first_payment_id text,
  amount_cents integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(referred_user_id) -- each user can only be referred once
);

alter table public.referrals enable row level security;

-- Users can read referrals where they are the referrer or the referred
create policy "Users read own referrals (as referrer)" on public.referrals
  for select using (auth.uid() = referrer_user_id);
create policy "Users read own referrals (as referred)" on public.referrals
  for select using (auth.uid() = referred_user_id);

-- Only service role writes
create policy "Service role full access to referrals" on public.referrals
  for all using (auth.role() = 'service_role');

create index if not exists idx_referrals_referrer on public.referrals(referrer_user_id);
create index if not exists idx_referrals_referred on public.referrals(referred_user_id);
create index if not exists idx_referrals_status on public.referrals(status);


-- ============================================
-- 4. RPC: record a user-to-user referral at signup time
-- Called from /api/referral POST after a user signs up with ?ref=CODE
-- Safely idempotent + ignores self-referrals + ignores invalid codes.
-- ============================================
create or replace function public.record_user_referral(
  p_referred_user_id uuid,
  p_referral_code text
)
returns jsonb as $$
declare
  v_referrer_user_id uuid;
  v_existing uuid;
  v_code text := upper(trim(p_referral_code));
begin
  if v_code is null or length(v_code) = 0 then
    return jsonb_build_object('status', 'invalid', 'reason', 'empty_code');
  end if;

  -- Find referrer by code
  select user_id into v_referrer_user_id
  from public.profiles
  where referral_code = v_code
  limit 1;

  if v_referrer_user_id is null then
    return jsonb_build_object('status', 'invalid', 'reason', 'code_not_found');
  end if;

  if v_referrer_user_id = p_referred_user_id then
    return jsonb_build_object('status', 'invalid', 'reason', 'self_referral');
  end if;

  -- Don't overwrite if this user was already referred
  select id into v_existing
  from public.referrals
  where referred_user_id = p_referred_user_id
  limit 1;

  if v_existing is not null then
    return jsonb_build_object('status', 'duplicate', 'referral_id', v_existing);
  end if;

  insert into public.referrals (
    referrer_user_id, referred_user_id, referral_code, status
  ) values (
    v_referrer_user_id, p_referred_user_id, v_code, 'pending'
  );

  return jsonb_build_object('status', 'recorded', 'referrer', v_referrer_user_id);
end;
$$ language plpgsql security definer;


-- ============================================
-- 5. RPC: fulfill a referral on first paid signup
-- Called from Stripe webhook checkout.session.completed branch.
-- Grants +1 credit to both parties if:
--   - The paying user was referred by someone
--   - Not already credited
--   - Referrer is below the 10-credits-per-month cap
-- ============================================
create or replace function public.fulfill_referral_on_payment(
  p_paying_user_id uuid,
  p_payment_id text,
  p_amount_cents integer
)
returns jsonb as $$
declare
  v_referral public.referrals%rowtype;
  v_month_count integer;
  v_monthly_cap integer := 10;
begin
  select * into v_referral
  from public.referrals
  where referred_user_id = p_paying_user_id
    and credit_granted_referrer = false
  limit 1;

  if v_referral.id is null then
    return jsonb_build_object('status', 'no_referral');
  end if;

  -- Count how many referral credits this referrer already earned this calendar month
  select count(*) into v_month_count
  from public.referrals
  where referrer_user_id = v_referral.referrer_user_id
    and credit_granted_referrer = true
    and created_at >= date_trunc('month', now());

  if v_month_count >= v_monthly_cap then
    update public.referrals
    set status = 'capped',
        updated_at = now()
    where id = v_referral.id;
    return jsonb_build_object('status', 'capped', 'monthly_count', v_month_count);
  end if;

  -- Grant +1 credit to REFERRER
  insert into public.user_credits (user_id, total_credits, used_credits, is_beta_member)
  values (v_referral.referrer_user_id, 1, 0, false)
  on conflict (user_id) do update
  set total_credits = public.user_credits.total_credits + 1,
      updated_at = now();

  -- Grant +1 credit to REFERRED
  insert into public.user_credits (user_id, total_credits, used_credits, is_beta_member)
  values (p_paying_user_id, 1, 0, false)
  on conflict (user_id) do update
  set total_credits = public.user_credits.total_credits + 1,
      updated_at = now();

  update public.referrals
  set status = 'credited',
      credit_granted_referrer = true,
      credit_granted_referred = true,
      first_payment_id = p_payment_id,
      amount_cents = p_amount_cents,
      updated_at = now()
  where id = v_referral.id;

  return jsonb_build_object(
    'status', 'credited',
    'referrer_user_id', v_referral.referrer_user_id,
    'referred_user_id', p_paying_user_id
  );
end;
$$ language plpgsql security definer;


-- ============================================
-- 6. Helper view: user's referral stats
-- ============================================
create or replace view public.v_referral_stats as
select
  p.user_id,
  p.referral_code,
  count(r.id) filter (where r.status = 'pending') as pending_count,
  count(r.id) filter (where r.status = 'credited') as credited_count,
  count(r.id) filter (where r.status = 'capped') as capped_count,
  count(r.id) filter (
    where r.credit_granted_referrer = true
      and r.created_at >= date_trunc('month', now())
  ) as this_month_credits,
  count(r.id) as total_referrals
from public.profiles p
left join public.referrals r on r.referrer_user_id = p.user_id
group by p.user_id, p.referral_code;

grant select on public.v_referral_stats to authenticated;

-- ============================================
-- DONE. Referral program is ready.
-- ============================================
