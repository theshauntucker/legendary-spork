import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";
import { fetchCollisionCounts, classify } from "@/lib/studio/collisions";

export const dynamic = "force-dynamic";

/**
 * GET /api/studio/music/collisions?trackId=<studio_music_tracks.id>
 *
 * Returns aggregate counts only. NEVER returns studio names, dancer
 * names, or routine names. Caller's own studio is excluded from counts
 * by the underlying RPC.
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
  if (!membership) return NextResponse.json({ error: "Not a studio member" }, { status: 403 });

  const url = new URL(request.url);
  const trackId = url.searchParams.get("trackId");
  if (!trackId) return NextResponse.json({ error: "trackId required" }, { status: 400 });

  const service = await createServiceClient();
  const { data: track } = await service
    .from("studio_music_tracks")
    .select("spotify_track_id")
    .eq("id", trackId)
    .eq("studio_id", membership.studioId)
    .maybeSingle();
  if (!track) return NextResponse.json({ error: "Track not found" }, { status: 404 });

  // Studio region is needed to populate "in your region" counts.
  const { data: studio } = await service
    .from("studios")
    .select("region")
    .eq("id", membership.studioId)
    .single();
  const region = (studio?.region as string | null) ?? null;

  try {
    const counts = await fetchCollisionCounts(
      service,
      track.spotify_track_id,
      membership.studioId,
      region
    );
    return NextResponse.json({
      counts,
      state: classify(counts),
      // Echo only flags the client legitimately needs for labeling. We
      // intentionally do NOT return the list of studios or their regions.
      region,
    });
  } catch (err) {
    console.error("collision lookup failed:", err);
    return NextResponse.json({ error: "Collision lookup failed" }, { status: 500 });
  }
}
