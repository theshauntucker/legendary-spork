import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/studio/music/[trackId]
 * Returns a single studio_music_tracks row if the caller is a member of
 * the owning studio.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  const { trackId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership) return NextResponse.json({ error: "Not a studio member" }, { status: 403 });

  const service = await createServiceClient();
  const { data: track } = await service
    .from("studio_music_tracks")
    .select("*")
    .eq("id", trackId)
    .eq("studio_id", membership.studioId)
    .maybeSingle();

  if (!track) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ track });
}

/**
 * PATCH /api/studio/music/[trackId]
 * Body: { notes?: string }
 * Any studio member can edit notes on tracks in their studio library.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  const { trackId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership) return NextResponse.json({ error: "Not a studio member" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, string | null> = {};

  if (typeof body.notes === "string" || body.notes === null) {
    updates.notes =
      typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data, error } = await service
    .from("studio_music_tracks")
    .update(updates)
    .eq("id", trackId)
    .eq("studio_id", membership.studioId)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
  return NextResponse.json({ track: data });
}

/**
 * DELETE /api/studio/music/[trackId]
 * Any studio member can remove a track from their studio library.
 * Hard delete — studio_routine_music rows that reference this track row
 * cascade via FK (ON DELETE CASCADE on music_track_id).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  const { trackId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership) return NextResponse.json({ error: "Not a studio member" }, { status: 403 });

  const service = await createServiceClient();
  const { error } = await service
    .from("studio_music_tracks")
    .delete()
    .eq("id", trackId)
    .eq("studio_id", membership.studioId);

  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
