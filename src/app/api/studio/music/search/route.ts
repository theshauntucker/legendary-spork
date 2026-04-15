import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";
import {
  searchTracks,
  SpotifyConfigError,
  SpotifyAPIError,
} from "@/lib/studio/spotify";

export const dynamic = "force-dynamic";

/**
 * GET /api/studio/music/search?q=<query>&limit=<n>
 *
 * Proxies to Spotify search + audio-features in one call. Server-only:
 * client never sees Spotify credentials. Returns track summaries enriched
 * with tempo/energy/danceability when available.
 *
 * Auth: any studio member. Non-members 403.
 */
export async function GET(request: NextRequest) {
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

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limitParam = Number(url.searchParams.get("limit") || "20");
  const limit = Number.isFinite(limitParam) ? limitParam : 20;

  if (!q) {
    return NextResponse.json({ results: [] });
  }
  if (q.length > 200) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  try {
    const results = await searchTracks(q, limit);
    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof SpotifyConfigError) {
      console.error("Spotify not configured:", err);
      return NextResponse.json(
        { error: "Music Hub is not configured. Ask your admin to set SPOTIFY_CLIENT_ID/SECRET." },
        { status: 503 }
      );
    }
    if (err instanceof SpotifyAPIError) {
      console.error("Spotify API error:", err);
      return NextResponse.json({ error: "Spotify request failed" }, { status: 502 });
    }
    console.error("Spotify search failed:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
