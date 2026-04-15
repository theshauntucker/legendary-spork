import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";
import { fetchCollisionCounts, classify, type CollisionState } from "@/lib/studio/collisions";

export const dynamic = "force-dynamic";

const MAX_BATCH = 100;

/**
 * POST /api/studio/music/collisions/batch
 * Body: { trackIds: string[] }  (studio_music_tracks.id values)
 *
 * Returns a map keyed by trackId → { state, counts }. Designed for the
 * library grid to lazy-load collision indicator dots in one call.
 *
 * Privacy: same invariants as the single-track route — aggregate counts
 * only, caller's own studio excluded, no identity fields surfaced.
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
  if (!membership) return NextResponse.json({ error: "Not a studio member" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.trackIds)
    ? body.trackIds
        .filter((s: unknown): s is string => typeof s === "string")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    : [];

  if (ids.length === 0) {
    return NextResponse.json({ results: {} });
  }
  if (ids.length > MAX_BATCH) {
    return NextResponse.json(
      { error: `Too many trackIds (max ${MAX_BATCH})` },
      { status: 400 }
    );
  }

  const service = await createServiceClient();

  // One query pulls the spotify_track_ids for every requested UUID, scoped
  // to the caller's studio so unknown/foreign IDs silently drop out.
  const { data: rows } = await service
    .from("studio_music_tracks")
    .select("id, spotify_track_id")
    .eq("studio_id", membership.studioId)
    .in("id", ids);

  const validRows = rows ?? [];

  const { data: studio } = await service
    .from("studios")
    .select("region")
    .eq("id", membership.studioId)
    .single();
  const region = (studio?.region as string | null) ?? null;

  // RPC doesn't expose a batched form, so fan-out with a concurrency cap
  // to avoid thundering the DB.
  const concurrency = 8;
  const results: Record<string, { state: CollisionState; counts: Awaited<ReturnType<typeof fetchCollisionCounts>> }> = {};
  let idx = 0;

  async function worker() {
    while (idx < validRows.length) {
      const i = idx++;
      const row = validRows[i];
      try {
        const counts = await fetchCollisionCounts(
          service,
          row.spotify_track_id,
          membership!.studioId,
          region
        );
        results[row.id] = { state: classify(counts), counts };
      } catch (err) {
        console.error("batch collision row failed:", row.id, err);
        // Skip silently — partial results are better than 500ing the whole batch.
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, validRows.length) }, () => worker())
  );

  return NextResponse.json({ results, region });
}
