import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";
import {
  callClaudeLyricCheck,
  deriveRating,
  type LyricFlags,
  type LyricsStatus,
  type AgeRating,
} from "@/lib/studio/lyrics";

export const dynamic = "force-dynamic";

/**
 * POST /api/studio/music/check-lyrics
 * Body: { trackId: string }   (our studio_music_tracks.id)
 *
 * Flow:
 *   1. Resolve the caller's studio_music_tracks row.
 *   2. Platform-wide cache lookup: find ANY row with the same
 *      spotify_track_id that has already been checked (lyrics_status in
 *      {safe, flagged, unavailable}). If found, copy the result into the
 *      caller's row and return — no Claude call.
 *   3. Otherwise call Claude Haiku once, derive status + age_rating, and
 *      write the result back.
 */
export async function POST(request: NextRequest) {
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

  const body = await request.json().catch(() => ({}));
  const trackId = typeof body.trackId === "string" ? body.trackId.trim() : "";
  if (!trackId) {
    return NextResponse.json({ error: "trackId required" }, { status: 400 });
  }

  const service = await createServiceClient();

  // 1. Own-row lookup
  const { data: track } = await service
    .from("studio_music_tracks")
    .select("id, spotify_track_id, track_name, artist_name, lyrics_status")
    .eq("id", trackId)
    .eq("studio_id", membership.studioId)
    .maybeSingle();

  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  // Already checked for this studio? Return current state idempotently.
  if (track.lyrics_status && track.lyrics_status !== "unchecked") {
    const { data: current } = await service
      .from("studio_music_tracks")
      .select("lyrics_status, lyrics_flags, age_rating")
      .eq("id", trackId)
      .single();
    return NextResponse.json({
      cached: true,
      lyrics_status: current?.lyrics_status,
      lyrics_flags: current?.lyrics_flags,
      age_rating: current?.age_rating,
    });
  }

  // 2. Platform-wide cache: any studio's already-checked result for the
  //    same spotify_track_id.
  const { data: cached } = await service
    .from("studio_music_tracks")
    .select("lyrics_status, lyrics_flags, age_rating")
    .eq("spotify_track_id", track.spotify_track_id)
    .neq("lyrics_status", "unchecked")
    .not("lyrics_status", "is", null)
    .limit(1)
    .maybeSingle();

  let status: LyricsStatus;
  let flags: LyricFlags | null;
  let ageRating: AgeRating | null;
  let confidence: "high" | "medium" | "low" | null = null;
  let notes = "";
  let fromPlatformCache = false;

  if (cached) {
    status = cached.lyrics_status as LyricsStatus;
    flags = (cached.lyrics_flags as LyricFlags | null) ?? null;
    ageRating = (cached.age_rating as AgeRating | null) ?? null;
    fromPlatformCache = true;
  } else {
    // 3. Fresh Claude call
    const result = await callClaudeLyricCheck(
      track.track_name || "",
      track.artist_name || ""
    );
    if (!result) {
      // Claude unavailable — mark as 'unavailable' so the user sees an
      // actionable message instead of stuck on "unchecked".
      status = "unavailable";
      flags = null;
      ageRating = null;
      notes = "Unable to verify lyrics automatically.";
    } else {
      const derived = deriveRating(result);
      status = derived.status;
      ageRating = derived.ageRating;
      flags = result.flags;
      confidence = result.confidence;
      notes = result.notes;
    }
  }

  // Write back to caller's row.
  const { error: updateError } = await service
    .from("studio_music_tracks")
    .update({
      lyrics_status: status,
      lyrics_flags: flags,
      age_rating: ageRating,
    })
    .eq("id", trackId)
    .eq("studio_id", membership.studioId);

  if (updateError) {
    console.error("studio_music_tracks update failed:", updateError);
    return NextResponse.json({ error: "Write failed" }, { status: 500 });
  }

  return NextResponse.json({
    cached: false,
    fromPlatformCache,
    lyrics_status: status,
    lyrics_flags: flags,
    age_rating: ageRating,
    confidence,
    notes,
  });
}
