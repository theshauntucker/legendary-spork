-- Coda migration 001: profiles + aura_catalog
-- Apply in Supabase SQL editor against project xkckvrbxaessudolxhte
-- Safe to re-run — uses IF NOT EXISTS / IF EXISTS guards.

create table if not exists public.aura_catalog (
  id text primary key,
  name text not null,
  category text not null check (category in ('warm','cool','jewel','mono','rare','founding')),
  gradient_stops jsonb not null,
  unlock_tier text default 'starter',
  unlock_condition text
);

create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  handle text unique not null,
  display_name text,
  profile_type text check (profile_type in ('dancer','parent','studio','choreographer')) not null,
  aura_style text references public.aura_catalog(id),
  aura_stops jsonb,
  aura_tier text check (aura_tier in ('starter','gold','platinum','diamond')) default 'starter',
  glyph text,
  age_tier text check (age_tier in ('minor','teen','adult')) not null,
  parent_consent_verified boolean default false,
  minor_safe_mode boolean default true,
  is_verified boolean default false,
  is_diamond_club boolean default false,
  founding_member boolean default false,
  founding_diamond boolean default false,
  studio_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profiles_handle on public.profiles(handle);
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_studio on public.profiles(studio_id);

alter table public.profiles enable row level security;
alter table public.aura_catalog enable row level security;

drop policy if exists "public profiles readable" on public.profiles;
create policy "public profiles readable" on public.profiles for select using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "aura catalog readable" on public.aura_catalog;
create policy "aura catalog readable" on public.aura_catalog for select using (true);
