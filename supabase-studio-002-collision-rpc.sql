-- RoutineX Studio — Phase F migration
-- Run this in Supabase Dashboard → SQL Editor AFTER supabase-studio.sql.
--
-- Adjusts get_collision_counts() to expose a fifth count,
-- locked_this_season_in_region, so the UI can paint the red "lock-in in
-- your region" state distinctly from the yellow "considered elsewhere"
-- state. Return-shape change → DROP + CREATE (Postgres disallows
-- CREATE OR REPLACE on function return-type changes).
--
-- Additive-only principle: no existing table, column, or policy is
-- modified. The only object touched is the security-definer function,
-- which was itself added in supabase-studio.sql.

drop function if exists public.get_collision_counts(text, uuid, text);

create function public.get_collision_counts(
  p_spotify_id text,
  p_studio_id uuid,
  p_region text
)
returns table (
  total_uses bigint,
  this_season bigint,
  locked_this_season bigint,
  this_season_in_region bigint,
  locked_this_season_in_region bigint
)
as $$
  with matching_tracks as (
    select id from public.studio_music_tracks
    where spotify_track_id = p_spotify_id
  )
  select
    count(*)::bigint                                                                                   as total_uses,
    count(*) filter (where srm.season = public.current_season())::bigint                               as this_season,
    count(*) filter (where srm.season = public.current_season() and srm.status = 'locked_in')::bigint  as locked_this_season,
    count(*) filter (where srm.season = public.current_season() and srm.region = p_region)::bigint     as this_season_in_region,
    count(*) filter (
      where srm.season = public.current_season()
        and srm.region = p_region
        and srm.status = 'locked_in'
    )::bigint                                                                                          as locked_this_season_in_region
  from public.studio_routine_music srm
  where srm.music_track_id in (select id from matching_tracks)
    and srm.studio_id <> p_studio_id;
$$ language sql stable security definer;

revoke all on function public.get_collision_counts(text, uuid, text) from public;
grant execute on function public.get_collision_counts(text, uuid, text) to authenticated, service_role;
