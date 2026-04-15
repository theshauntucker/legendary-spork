/**
 * Shared collision helpers. The get_collision_counts() security-definer
 * RPC runs under elevated privileges so it can count across studios; this
 * module wraps it and exposes a small typed interface to API routes.
 *
 * Privacy invariant: this module NEVER returns studio names, dancer
 * names, routine names, or user IDs from other studios. Only aggregate
 * counts tied to the caller's requested spotify_track_id + region.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface CollisionCounts {
  total_uses: number;
  this_season: number;
  locked_this_season: number;
  this_season_in_region: number;
  locked_this_season_in_region: number;
}

export type CollisionState = "green" | "yellow" | "red";

/**
 * Spec rule set:
 *   - red    = any locked-in use of this track this season in your region
 *   - yellow = ≥1 use this season anywhere (considered OR locked) but not
 *              a locked-in row in your region
 *   - green  = 0 uses this season
 */
export function classify(counts: CollisionCounts): CollisionState {
  if (counts.locked_this_season_in_region > 0) return "red";
  if (counts.this_season > 0) return "yellow";
  return "green";
}

export async function fetchCollisionCounts(
  service: SupabaseClient,
  spotifyTrackId: string,
  studioId: string,
  region: string | null
): Promise<CollisionCounts> {
  const { data, error } = await service.rpc("get_collision_counts", {
    p_spotify_id: spotifyTrackId,
    p_studio_id: studioId,
    p_region: region ?? "",
  });
  if (error) throw error;

  // Postgres returns table-valued functions as an array of one row.
  const row = Array.isArray(data) ? data[0] : data;
  return {
    total_uses: Number(row?.total_uses ?? 0),
    this_season: Number(row?.this_season ?? 0),
    locked_this_season: Number(row?.locked_this_season ?? 0),
    this_season_in_region: Number(row?.this_season_in_region ?? 0),
    locked_this_season_in_region: Number(row?.locked_this_season_in_region ?? 0),
  };
}
