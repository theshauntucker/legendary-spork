-- RoutineX Studio Dashboard + Music Hub — Phase A migration
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- All-additive. Does NOT touch existing B2C tables.

-- ============================================================================
-- 1. STUDIOS — one row per studio account
-- ============================================================================
create table if not exists public.studios (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_user_id uuid references auth.users(id) on delete restrict not null,
  invite_code text unique not null,
  region text,                                  -- US 2-letter state code, e.g. 'IL'
  created_at timestamptz default now()
);

create index if not exists idx_studios_owner on public.studios(owner_user_id);
create index if not exists idx_studios_invite_code on public.studios(invite_code);

alter table public.studios enable row level security;


-- ============================================================================
-- 2. STUDIO_MEMBERS — owner + choreographers + viewers
-- ============================================================================
create table if not exists public.studio_members (
  id uuid default gen_random_uuid() primary key,
  studio_id uuid references public.studios(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'choreographer' check (role in ('owner','choreographer','viewer')),
  joined_at timestamptz default now(),
  unique(studio_id, user_id)
);

create index if not exists idx_studio_members_user on public.studio_members(user_id);
create index if not exists idx_studio_members_studio on public.studio_members(studio_id);

alter table public.studio_members enable row level security;


-- ============================================================================
-- 3. STUDIO_INVITES — pending email invitations (Phase B consumes)
-- ============================================================================
create table if not exists public.studio_invites (
  id uuid default gen_random_uuid() primary key,
  studio_id uuid references public.studios(id) on delete cascade not null,
  email text not null,
  role text default 'choreographer' check (role in ('choreographer','viewer')),
  code text unique not null,
  status text default 'pending' check (status in ('pending','accepted','revoked','expired')),
  expires_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now()
);

create index if not exists idx_studio_invites_studio on public.studio_invites(studio_id);
create index if not exists idx_studio_invites_code on public.studio_invites(code);

alter table public.studio_invites enable row level security;


-- ============================================================================
-- 4. STUDIO_CREDITS — shared analysis credit pool per studio
-- ============================================================================
create table if not exists public.studio_credits (
  studio_id uuid primary key references public.studios(id) on delete cascade,
  total_credits integer not null default 0,
  used_credits integer not null default 0,
  trial_ends_at timestamptz,
  subscription_status text default 'trial' check (subscription_status in ('trial','active','paused','canceled')),
  stripe_subscription_id text,
  updated_at timestamptz default now()
);

alter table public.studio_credits enable row level security;


-- ============================================================================
-- 5. STUDIO_ANALYSIS_LINKS — audit trail: which analyses were paid from a studio pool
-- ============================================================================
create table if not exists public.studio_analysis_links (
  id uuid default gen_random_uuid() primary key,
  studio_id uuid references public.studios(id) on delete cascade not null,
  video_id uuid references public.videos(id) on delete cascade not null,
  used_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_studio_analysis_links_studio on public.studio_analysis_links(studio_id);
create index if not exists idx_studio_analysis_links_video on public.studio_analysis_links(video_id);

alter table public.studio_analysis_links enable row level security;


-- ============================================================================
-- 6. STUDIO_MUSIC_TRACKS — Spotify tracks saved to a studio library
-- ============================================================================
create table if not exists public.studio_music_tracks (
  id uuid default gen_random_uuid() primary key,
  studio_id uuid references public.studios(id) on delete cascade not null,
  spotify_track_id text not null,
  track_name text,
  artist_name text,
  duration_ms integer,
  tempo_bpm float,
  energy float,
  danceability float,
  album_image_url text,
  lyrics_status text default 'unchecked' check (lyrics_status in ('unchecked','safe','flagged','unavailable')),
  lyrics_flags jsonb,                           -- { profanity, sexual_content, drug_references, violence, religious_conflict }
  age_rating text check (age_rating in ('all_ages','teen_plus','senior_only','flagged')),
  notes text,
  added_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique(studio_id, spotify_track_id)
);

create index if not exists idx_studio_music_tracks_studio on public.studio_music_tracks(studio_id);
create index if not exists idx_studio_music_tracks_spotify on public.studio_music_tracks(spotify_track_id);

alter table public.studio_music_tracks enable row level security;


-- ============================================================================
-- 7. STUDIO_ROUTINE_MUSIC — song-to-routine link, the collision-detection heart
-- ============================================================================
create table if not exists public.studio_routine_music (
  id uuid default gen_random_uuid() primary key,
  studio_id uuid references public.studios(id) on delete cascade not null,
  music_track_id uuid references public.studio_music_tracks(id) on delete cascade not null,
  routine_name text,
  dancer_name text,
  style text,
  entry_type text,
  age_division text,
  season text not null,                         -- auto-derived via current_season()
  status text default 'considering' check (status in ('considering','locked_in','performed')),
  competition_names text[],
  region text,                                  -- denormalized from studios.region for fast collision queries
  created_at timestamptz default now()
);

create index if not exists idx_studio_routine_music_studio on public.studio_routine_music(studio_id);
create index if not exists idx_studio_routine_music_track on public.studio_routine_music(music_track_id);
create index if not exists idx_studio_routine_music_season_region on public.studio_routine_music(season, region);

alter table public.studio_routine_music enable row level security;


-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Helper pattern: "I am a member of this studio" check
-- Studios: readable if member; only owner can update; only service_role can insert/delete
create policy "Members can view their studio"
  on public.studios for select
  using (
    auth.uid() = owner_user_id
    or exists (
      select 1 from public.studio_members m
      where m.studio_id = studios.id and m.user_id = auth.uid()
    )
  );

create policy "Owner can update studio"
  on public.studios for update
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "Service role full access to studios"
  on public.studios for all using (auth.role() = 'service_role');


-- Studio_members: members can see co-members of their studio
create policy "Members can view studio roster"
  on public.studio_members for select
  using (
    exists (
      select 1 from public.studio_members self
      where self.studio_id = studio_members.studio_id and self.user_id = auth.uid()
    )
  );

create policy "Service role full access to studio_members"
  on public.studio_members for all using (auth.role() = 'service_role');


-- Studio_invites: only studio members can view; only owner can create/update
create policy "Members can view studio invites"
  on public.studio_invites for select
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_invites.studio_id and m.user_id = auth.uid()
    )
  );

create policy "Service role full access to studio_invites"
  on public.studio_invites for all using (auth.role() = 'service_role');


-- Studio_credits: members can view their studio's pool; service role writes
create policy "Members can view studio credits"
  on public.studio_credits for select
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_credits.studio_id and m.user_id = auth.uid()
    )
  );

create policy "Service role full access to studio_credits"
  on public.studio_credits for all using (auth.role() = 'service_role');


-- Studio_analysis_links: members can view; service role writes
create policy "Members can view studio analysis links"
  on public.studio_analysis_links for select
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_analysis_links.studio_id and m.user_id = auth.uid()
    )
  );

create policy "Service role full access to studio_analysis_links"
  on public.studio_analysis_links for all using (auth.role() = 'service_role');


-- Studio_music_tracks: members can read their own studio's library
create policy "Members can view studio music library"
  on public.studio_music_tracks for select
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_music_tracks.studio_id and m.user_id = auth.uid()
    )
  );

create policy "Members can add to studio music library"
  on public.studio_music_tracks for insert
  with check (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_music_tracks.studio_id and m.user_id = auth.uid()
    )
  );

create policy "Members can update studio music library"
  on public.studio_music_tracks for update
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_music_tracks.studio_id and m.user_id = auth.uid()
    )
  );

create policy "Service role full access to studio_music_tracks"
  on public.studio_music_tracks for all using (auth.role() = 'service_role');


-- Studio_routine_music: RLS restricts normal SELECT to own studio only.
-- Cross-studio collision queries MUST go through get_collision_counts() (security definer).
create policy "Members can view own studio routine music"
  on public.studio_routine_music for select
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_routine_music.studio_id and m.user_id = auth.uid()
    )
  );

create policy "Members can manage own studio routine music"
  on public.studio_routine_music for all
  using (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_routine_music.studio_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.studio_members m
      where m.studio_id = studio_routine_music.studio_id and m.user_id = auth.uid()
    )
  );

create policy "Service role full access to studio_routine_music"
  on public.studio_routine_music for all using (auth.role() = 'service_role');


-- ============================================================================
-- current_season() — returns 'YYYY-spring' for Jan–Jun, 'YYYY-fall' for Jul–Dec
-- ============================================================================
create or replace function public.current_season()
returns text as $$
  select case
    when extract(month from now()) between 1 and 6
      then extract(year from now())::text || '-spring'
    else extract(year from now())::text || '-fall'
  end;
$$ language sql stable;


-- ============================================================================
-- get_collision_counts(spotify_id, requesting_studio_id, region_filter)
-- SECURITY DEFINER — bypasses RLS on studio_routine_music so it can count
-- across studios. Returns ONLY aggregate counts — never studio names, dancer
-- names, or routine names. Excludes the caller's own studio from counts.
-- ============================================================================
create or replace function public.get_collision_counts(
  p_spotify_id text,
  p_studio_id uuid,
  p_region text
)
returns table (
  total_uses bigint,
  this_season bigint,
  locked_this_season bigint,
  this_season_in_region bigint
)
as $$
  with matching_tracks as (
    select id from public.studio_music_tracks
    where spotify_track_id = p_spotify_id
  )
  select
    count(*)::bigint as total_uses,
    count(*) filter (where srm.season = public.current_season())::bigint as this_season,
    count(*) filter (where srm.season = public.current_season() and srm.status = 'locked_in')::bigint as locked_this_season,
    count(*) filter (where srm.season = public.current_season() and srm.region = p_region)::bigint as this_season_in_region
  from public.studio_routine_music srm
  where srm.music_track_id in (select id from matching_tracks)
    and srm.studio_id <> p_studio_id;
$$ language sql stable security definer;

revoke all on function public.get_collision_counts(text, uuid, text) from public;
grant execute on function public.get_collision_counts(text, uuid, text) to authenticated, service_role;


-- ============================================================================
-- DONE. Phase A schema complete.
-- ============================================================================
