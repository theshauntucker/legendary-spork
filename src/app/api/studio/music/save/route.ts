import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";
import { getTrackById, SpotifyConfigError, SpotifyAPIError } from "@/lib/studio/spotify";

export const dynamic = "force-dynamic";

/**
 * POST /api/studio/music/save
 * Body: { spotifyTrackId: string, notes?: string }
 *
 * Any studio member can add a track. Metadata (name, artist, BPM, etc.)
 * is fetched server-side from Spotify at save-time so it's frozen in the
 * library even if the catalog entry later changes. Idempotent via
 * UNIQUE(studio_id, spotify_track_id) — repeat saves return the existing
 * row rather than erroring.
 */
export async function POST(request: NextRequest) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership) {
    return NextResponse.json({ error: "Not a studio member" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const spotifyTrackId = typeof body.spotifyTrackId === "string" ? body.spotifyTrackId.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;

  if (!spotifyTrackId || spotifyTrackId.length > 100) {
    return NextResponse.json({ error: "spotifyTrackId required" }, { status: 400 });
  }

  const service = await createServiceClient();

  // Idempotency: existing row short-circuits
  const { data: existing } = await service
    .from("studio_music_tracks")
    .select("id")
    .eq("studio_id", membership.studioId)
    .eq("spotify_track_id", spotifyTrackId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ trackId: existing.id, alreadyExisted: true });
  }

  // Pull fresh metadata from Spotify
  let track;
  try {
    track = await getTrackById(spotifyTrackId);
  } catch (err) {
    if (err instanceof SpotifyConfigError) {
      return NextResponse.json(
        { error: "Music Hub is not configured." },
        { status: 503 }
      );
    }
    if (err instanceof SpotifyAPIError) {
      if (err.status === 404) {
        return NextResponse.json({ error: "Track not found on Spotify" }, { status: 404 });
      }
      return NextResponse.json({ error: "Spotify request failed" }, { status: 502 });
    }
    console.error("getTrackById failed:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
  if (!track) {
    return NextResponse.json({ error: "Track not found on Spotify" }, { status: 404 });
  }

  const { data: inserted, error: insertError } = await service
    .from("studio_music_tracks")
    .insert({
      studio_id: membership.studioId,
      spotify_track_id: track.spotifyTrackId,
      track_name: track.name,
      artist_name: track.artists.join(", "),
      duration_ms: track.durationMs,
      tempo_bpm: track.tempoBpm,
      energy: track.energy,
      danceability: track.danceability,
      album_image_url: track.albumImageUrl,
      notes,
      added_by_user_id: user.id,
    })
    .select("id")
    .single();

  if (insertError) {
    // Race: another member inserted the same track between our check and
    // insert. Fall back to the existing row instead of erroring.
    if (insertError.code === "23505") {
      const { data: winner } = await service
        .from("studio_music_tracks")
        .select("id")
        .eq("studio_id", membership.studioId)
        .eq("spotify_track_id", spotifyTrackId)
        .maybeSingle();
      if (winner) {
        return NextResponse.json({ trackId: winner.id, alreadyExisted: true });
      }
    }
    console.error("studio_music_tracks insert failed:", insertError);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ trackId: inserted.id, alreadyExisted: false });
}
