import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";
import { rebuildCompetitionNames } from "@/lib/studio/schedule";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ competitionId: string }> };

/**
 * POST /api/studio/schedule/[competitionId]/entries
 * Body: { routineMusicId: string }
 *
 * Links a studio_routine_music row to this competition. Refreshes
 * studio_routine_music.competition_names[] so collision UI shows the
 * new entry immediately. Idempotent: re-linking the same pair returns
 * the existing row.
 */
export async function POST(request: NextRequest, { params }: Params) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  const { competitionId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership) return NextResponse.json({ error: "Not a studio member" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const routineMusicId = typeof body.routineMusicId === "string" ? body.routineMusicId.trim() : "";
  if (!routineMusicId) {
    return NextResponse.json({ error: "routineMusicId required" }, { status: 400 });
  }

  const service = await createServiceClient();

  // Validate both sides belong to the caller's studio.
  const { data: competition } = await service
    .from("studio_competitions")
    .select("id")
    .eq("id", competitionId)
    .eq("studio_id", membership.studioId)
    .maybeSingle();
  if (!competition) {
    return NextResponse.json({ error: "Competition not found" }, { status: 404 });
  }
  const { data: routine } = await service
    .from("studio_routine_music")
    .select("id")
    .eq("id", routineMusicId)
    .eq("studio_id", membership.studioId)
    .maybeSingle();
  if (!routine) {
    return NextResponse.json({ error: "Routine not found in your studio" }, { status: 404 });
  }

  const { error } = await service.from("studio_competition_entries").insert({
    competition_id: competitionId,
    routine_music_id: routineMusicId,
    studio_id: membership.studioId,
  });
  // 23505 = already linked, treat as idempotent success
  if (error && error.code !== "23505") {
    console.error("studio_competition_entries insert failed:", error);
    return NextResponse.json({ error: "Link failed" }, { status: 500 });
  }

  await rebuildCompetitionNames(service, routineMusicId);
  return NextResponse.json({ linked: true });
}

/**
 * DELETE /api/studio/schedule/[competitionId]/entries?routineMusicId=xxx
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  const { competitionId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership) return NextResponse.json({ error: "Not a studio member" }, { status: 403 });

  const url = new URL(request.url);
  const routineMusicId = url.searchParams.get("routineMusicId");
  if (!routineMusicId) {
    return NextResponse.json({ error: "routineMusicId required" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { error } = await service
    .from("studio_competition_entries")
    .delete()
    .eq("competition_id", competitionId)
    .eq("routine_music_id", routineMusicId)
    .eq("studio_id", membership.studioId);

  if (error) {
    return NextResponse.json({ error: "Unlink failed" }, { status: 500 });
  }

  await rebuildCompetitionNames(service, routineMusicId);
  return NextResponse.json({ unlinked: true });
}
