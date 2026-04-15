import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";
import { rebuildForCompetition, rebuildCompetitionNames } from "@/lib/studio/schedule";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ competitionId: string }> };

/**
 * PATCH /api/studio/schedule/[competitionId]
 * Body: { name?, competition_date?, location?, notes? }
 *
 * Edits a scheduled competition. If the name changes, every routine that
 * was linked to this competition has its competition_names[] backfilled
 * so the Music Hub / collision surfaces stay consistent.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
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
  const updates: Record<string, string | null> = {};

  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    if (trimmed.length < 2) {
      return NextResponse.json({ error: "name too short" }, { status: 400 });
    }
    updates.name = trimmed.slice(0, 200);
  }
  if (typeof body.competition_date === "string") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.competition_date)) {
      return NextResponse.json({ error: "competition_date must be YYYY-MM-DD" }, { status: 400 });
    }
    updates.competition_date = body.competition_date;
  } else if (body.competition_date === null) {
    updates.competition_date = null;
  }
  if (typeof body.location === "string" || body.location === null) {
    updates.location =
      typeof body.location === "string" ? body.location.trim().slice(0, 200) || null : null;
  }
  if (typeof body.notes === "string" || body.notes === null) {
    updates.notes =
      typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) || null : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data, error } = await service
    .from("studio_competitions")
    .update(updates)
    .eq("id", competitionId)
    .eq("studio_id", membership.studioId)
    .select("id, name, competition_date, location, notes, created_at")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // If name changed, every linked routine's competition_names[] needs a refresh.
  if (typeof updates.name === "string") {
    await rebuildForCompetition(service, competitionId);
  }
  return NextResponse.json({ competition: data });
}

/**
 * DELETE /api/studio/schedule/[competitionId]
 *
 * Deleting a competition cascades its entries (FK on delete cascade).
 * Before we let the cascade happen we snapshot the routine_music_ids so
 * we can rebuild their competition_names[] afterwards — otherwise they'd
 * still show the old (now-missing) name.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
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

  const service = await createServiceClient();

  // Snapshot routines before cascade.
  const { data: entries } = await service
    .from("studio_competition_entries")
    .select("routine_music_id")
    .eq("competition_id", competitionId);
  const routineIds = (entries ?? []).map((e) => e.routine_music_id as string);

  const { error } = await service
    .from("studio_competitions")
    .delete()
    .eq("id", competitionId)
    .eq("studio_id", membership.studioId);
  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  for (const id of routineIds) {
    await rebuildCompetitionNames(service, id);
  }

  return NextResponse.json({ deleted: true });
}
