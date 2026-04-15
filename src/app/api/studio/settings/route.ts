import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";
import { isValidStateCode } from "@/lib/studio/us-states";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/studio/settings
 * Body: { name?: string, region?: string }
 *
 * Owner-only. Partial update of the studio's display name and/or region.
 * Region change updates studios.region; the denormalized region on
 * studio_routine_music rows is backfilled lazily in Phase F when collision
 * queries are added — for now we just update the studios row.
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
  if (!membership || membership.role !== "owner") {
    return NextResponse.json({ error: "Owner only" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, string> = {};

  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    if (trimmed.length < 2) {
      return NextResponse.json({ error: "Name too short" }, { status: 400 });
    }
    updates.name = trimmed;
  }

  if (typeof body.region === "string") {
    const region = body.region.toUpperCase();
    if (!isValidStateCode(region)) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 });
    }
    updates.region = region;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data, error } = await service
    .from("studios")
    .update(updates)
    .eq("id", membership.studioId)
    .select("id, name, region, invite_code")
    .single();

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ studio: data });
}


/**
 * POST /api/studio/settings/member/remove
 * Body: { userId: string }
 * Owner-only. Removes a member from the studio (not the owner themselves).
 */
export async function DELETE(request: NextRequest) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  const url = new URL(request.url);
  const targetUserId = url.searchParams.get("userId");
  if (!targetUserId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership || membership.role !== "owner") {
    return NextResponse.json({ error: "Owner only" }, { status: 403 });
  }
  if (targetUserId === user.id) {
    return NextResponse.json({ error: "Owner cannot remove themselves" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { error } = await service
    .from("studio_members")
    .delete()
    .eq("studio_id", membership.studioId)
    .eq("user_id", targetUserId);

  if (error) {
    return NextResponse.json({ error: "Remove failed" }, { status: 500 });
  }
  return NextResponse.json({ removed: true });
}
