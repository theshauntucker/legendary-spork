import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/studio/music/link-routine
 * Body: {
 *   music_track_id: uuid,         // studio_music_tracks.id (must belong to caller's studio)
 *   routine_name?: string,
 *   dancer_name?: string,
 *   style?: string,
 *   entry_type?: string,
 *   age_division?: string,
 *   status?: 'considering' | 'locked_in' | 'performed',
 *   competition_names?: string[]
 * }
 *
 * Creates a studio_routine_music row. Auto-fills season (via current_season()
 * RPC) and region (from studios.region) so collision detection downstream
 * has a consistent shape. Any studio member can link.
 *
 * PATCH is also exposed for status transitions (considering → locked_in →
 * performed) since status changes directly drive collision color changes.
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
  const musicTrackId = typeof body.music_track_id === "string" ? body.music_track_id.trim() : "";
  if (!musicTrackId) {
    return NextResponse.json({ error: "music_track_id required" }, { status: 400 });
  }

  const status = body.status === "locked_in" || body.status === "performed" ? body.status : "considering";

  const competitionNames = Array.isArray(body.competition_names)
    ? body.competition_names
        .filter((s: unknown): s is string => typeof s === "string")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    : null;

  const text = (v: unknown) =>
    typeof v === "string" && v.trim().length > 0 ? v.trim().slice(0, 200) : null;

  const service = await createServiceClient();

  // Confirm the track belongs to the caller's studio (RLS would also catch
  // this, but fail fast with a clear error).
  const { data: track } = await service
    .from("studio_music_tracks")
    .select("id")
    .eq("id", musicTrackId)
    .eq("studio_id", membership.studioId)
    .maybeSingle();
  if (!track) {
    return NextResponse.json({ error: "Track not found in your library" }, { status: 404 });
  }

  // Load studio region for denormalized column on the link row.
  const { data: studio } = await service
    .from("studios")
    .select("region")
    .eq("id", membership.studioId)
    .single();
  const region = (studio?.region as string | null) ?? null;

  // Compute season via RPC so it matches what the collision function uses.
  const { data: seasonData } = await service.rpc("current_season");
  const season =
    typeof seasonData === "string" && seasonData.length > 0
      ? seasonData
      : fallbackSeason();

  const { data: inserted, error } = await service
    .from("studio_routine_music")
    .insert({
      studio_id: membership.studioId,
      music_track_id: musicTrackId,
      routine_name: text(body.routine_name),
      dancer_name: text(body.dancer_name),
      style: text(body.style),
      entry_type: text(body.entry_type),
      age_division: text(body.age_division),
      status,
      competition_names: competitionNames,
      season,
      region,
    })
    .select("id, status, season, region, routine_name, dancer_name, style, entry_type, age_division, competition_names, created_at")
    .single();

  if (error) {
    console.error("studio_routine_music insert failed:", error);
    return NextResponse.json({ error: "Link failed" }, { status: 500 });
  }

  return NextResponse.json({ link: inserted });
}

/**
 * PATCH /api/studio/music/link-routine
 * Body: { id: uuid, status: 'considering' | 'locked_in' | 'performed' }
 */
export async function PATCH(request: NextRequest) {
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
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const status = body.status;
  if (!id || (status !== "considering" && status !== "locked_in" && status !== "performed")) {
    return NextResponse.json({ error: "id + status required" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data, error } = await service
    .from("studio_routine_music")
    .update({ status })
    .eq("id", id)
    .eq("studio_id", membership.studioId)
    .select("id, status")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
  return NextResponse.json({ link: data });
}

/**
 * DELETE /api/studio/music/link-routine?id=uuid
 */
export async function DELETE(request: NextRequest) {
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
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const service = await createServiceClient();
  const { error } = await service
    .from("studio_routine_music")
    .delete()
    .eq("id", id)
    .eq("studio_id", membership.studioId);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ deleted: true });
}

function fallbackSeason(): string {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  return month <= 6 ? `${year}-spring` : `${year}-fall`;
}
