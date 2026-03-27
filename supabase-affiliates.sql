-- RoutineX Affiliate / Referral Tracking Setup
-- Run this in your Supabase Dashboard → SQL Editor → New Query
-- Run AFTER supabase-payments.sql

-- ============================================
-- 1. AFFILIATES TABLE — each influencer gets a row
-- ============================================
create table if not exists public.affiliates (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,                        -- e.g. "DANCERJEN"
  name text not null,                               -- influencer display name
  email text,                                       -- influencer contact email
  revenue_share_pct numeric not null default 20,    -- rev share percentage (e.g. 20 = 20%)
  status text default 'active' check (status in ('active', 'paused', 'inactive')),
  notes text,                                       -- admin notes
  total_signups integer not null default 0,         -- denormalized counter
  total_revenue_cents integer not null default 0,   -- denormalized counter
  total_payout_cents integer not null default 0,    -- how much has been paid out
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.affiliates enable row level security;

-- Only service role can access affiliates
create policy "Service role full access to affiliates" on public.affiliates
  for all using (auth.role() = 'service_role');


-- ============================================
-- 2. ADD referral_code TO user_credits
-- ============================================
-- Links every customer to the affiliate who referred them
alter table public.user_credits
  add column if not exists referral_code text;


-- ============================================
-- 3. ADD referral_code TO payments
-- ============================================
-- Tracks which affiliate gets credit for each payment
alter table public.payments
  add column if not exists referral_code text;


-- ============================================
-- 4. RPC: Record a referral on signup
-- ============================================
create or replace function public.record_referral(
  p_user_id uuid,
  p_referral_code text
)
returns void as $$
declare
  v_affiliate_exists boolean;
begin
  -- Validate the code exists and is active
  select exists(
    select 1 from public.affiliates
    where code = upper(p_referral_code) and status = 'active'
  ) into v_affiliate_exists;

  if not v_affiliate_exists then
    return; -- silently ignore invalid codes
  end if;

  -- Update user_credits with the referral code (upsert)
  insert into public.user_credits (user_id, total_credits, used_credits, is_beta_member, referral_code)
  values (p_user_id, 0, 0, false, upper(p_referral_code))
  on conflict (user_id) do update
  set referral_code = upper(p_referral_code),
      updated_at = now()
  where public.user_credits.referral_code is null; -- don't overwrite existing referral

  -- Increment affiliate signup counter
  update public.affiliates
  set total_signups = total_signups + 1,
      updated_at = now()
  where code = upper(p_referral_code);
end;
$$ language plpgsql security definer;


-- ============================================
-- 5. RPC: Attribute a payment to an affiliate
-- ============================================
create or replace function public.attribute_affiliate_revenue(
  p_user_id uuid,
  p_amount_cents integer
)
returns void as $$
declare
  v_referral_code text;
begin
  -- Look up the user's referral code
  select referral_code into v_referral_code
  from public.user_credits
  where user_id = p_user_id;

  if v_referral_code is null then
    return; -- no affiliate to credit
  end if;

  -- Update the affiliate's revenue counter
  update public.affiliates
  set total_revenue_cents = total_revenue_cents + p_amount_cents,
      updated_at = now()
  where code = v_referral_code and status = 'active';
end;
$$ language plpgsql security definer;


-- ============================================
-- DONE! Deploy and the affiliate system is ready.
-- ============================================
