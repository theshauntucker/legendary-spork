-- RoutineX Push Notifications Setup
-- Run this in your Supabase Dashboard → SQL Editor → New Query
-- Run AFTER supabase-setup.sql

-- ============================================
-- DEVICE_TOKENS TABLE — stores iOS push tokens
-- ============================================
create table if not exists public.device_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  token text not null,
  platform text not null default 'ios' check (platform in ('ios', 'android')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, token)
);

alter table public.device_tokens enable row level security;

create policy "Users can view own tokens" on public.device_tokens
  for select using (auth.uid() = user_id);

create policy "Users can insert own tokens" on public.device_tokens
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own tokens" on public.device_tokens
  for delete using (auth.uid() = user_id);

create policy "Service role full access to device_tokens" on public.device_tokens
  for all using (auth.role() = 'service_role');

create index idx_device_tokens_user on public.device_tokens(user_id) where is_active = true;
