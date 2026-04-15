import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";
import {
  getRecommendations,
  SpotifyConfigError,
  SpotifyAPIError,
} from "@/lib/studio/spotify";

export const dynamic = "force-dynamic";

/**
 * GET /api/studio/music/similar?trackId=<studio_music_tracks.id>
 *   Optional filter query params:
 *     minBpm, maxBpm, targetEnergy, minDurationMs, maxDurationMs, limit
 *
 * Returns Spotify's recommendations seeded from the given saved track's
 * Spotify ID. Members-only. The track must belong to the caller's studio.
 */
export async function GET(request: NextRequest) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership) {
    return NextResponse.json({ error: "Not a studio member" }, { status: 403 });
  }

  const url = new URL(request.url);
  const trackId = url.searchParams.get("trackId");
  if (!trackId) {
    return NextResponse.json({ error: "trackId required" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data: track } = await service
    .from("studio_music_tracks")
    .select("spotify_track_id, tempo_bpm, energy")
    .eq("id", trackId)
    .eq("studio_id", membership.studioId)
    .maybeSingle();

  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  // Parse optional filters
  const num = (key: string) => {
    const v = url.searchParams.get(key);
    if (v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const filters = {
    // Default tempo seed to the saved track's BPM so the first call feels
    // intentional even when the user hasn't touched any filter yet.
    targetTempo: num("targetTempo") ?? (track.tempo_bpm ?? undefined),
    minTempo: num("minBpm"),
    maxTempo: num("maxBpm"),
    // Same for energy.
    targetEnergy: num("targetEnergy") ?? (track.energy ?? undefined),
    minDurationMs: num("minDurationMs"),
    maxDurationMs: num("maxDurationMs"),
    limit: num("limit") ?? 20,
  };

  try {
    const results = await getRecommendations([track.spotify_track_id], filters);
    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof SpotifyConfigError) {
      return NextResponse.json(
        { error: "Music Hub is not configured." },
        { status: 503 }
      );
    }
    if (err instanceof SpotifyAPIError) {
      // Spotify deprecated /recommendations for new apps in Nov 2024;
      // surface a friendly message rather than a raw 404.
      if (err.status === 404) {
        return NextResponse.json(
          { error: "Recommendations are unavailable for this Spotify app." },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: "Spotify request failed" }, { status: 502 });
    }
    console.error("similar search failed:", err);
    return NextResponse.json({ error: "Similar search failed" }, { status: 500 });
  }
}
