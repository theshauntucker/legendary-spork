-- RoutineX Payment & Credits Setup
-- Run this in your Supabase Dashboard → SQL Editor → New Query
-- Run AFTER supabase-setup.sql

-- ============================================
-- 1. PAYMENTS TABLE — records every Stripe payment
-- ============================================
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_session_id text unique not null,
  stripe_payment_intent text,
  payment_type text not null check (payment_type in ('beta_access', 'video_analysis')),
  amount_cents integer not null,
  currency text default 'usd',
  status text default 'completed' check (status in ('completed', 'refunded')),
  credits_granted integer not null default 0,
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

-- Users can view their own payments
create policy "Users can view own payments" on public.payments
  for select using (auth.uid() = user_id);

-- Service role can insert/update payments (from webhook)
create policy "Service role full access to payments" on public.payments
  for all using (auth.role() = 'service_role');


-- ============================================
-- 2. USER_CREDITS TABLE — tracks credit balance
-- ============================================
create table if not exists public.user_credits (
  user_id uuid references auth.users(id) on delete cascade primary key,
  total_credits integer not null default 0,
  used_credits integer not null default 0,
  is_beta_member boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_credits enable row level security;

-- Users can view their own credits
create policy "Users can view own credits" on public.user_credits
  for select using (auth.uid() = user_id);

-- Service role can do everything
create policy "Service role full access to credits" on public.user_credits
  for all using (auth.role() = 'service_role');


-- ============================================
-- 3. RPC FUNCTIONS for safe credit updates
-- ============================================

-- Increment used_credits by 1 (after an analysis)
create or replace function public.increment_used_credits(p_user_id uuid)
returns void as $$
begin
  update public.user_credits
  set used_credits = used_credits + 1,
      updated_at = now()
  where user_id = p_user_id;
end;
$$ language plpgsql security definer;

-- Add credits (after a payment)
create or replace function public.add_credits(p_user_id uuid, p_credits integer, p_is_beta boolean)
returns void as $$
begin
  update public.user_credits
  set total_credits = total_credits + p_credits,
      is_beta_member = is_beta_member or p_is_beta,
      updated_at = now()
  where user_id = p_user_id;
end;
$$ language plpgsql security definer;


-- ============================================
-- DONE! Now deploy and set STRIPE_WEBHOOK_SECRET
-- in your Vercel environment variables.
-- ============================================
