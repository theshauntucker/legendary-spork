import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";

export const dynamic = "force-dynamic";

/**
 * POST /api/studio/join
 * Body: { code: string }
 *
 * Consumes a pending studio_invites row (if the code is valid and unexpired)
 * and inserts the caller into studio_members with the invite's role.
 * Idempotent: if the caller is already a member of the same studio, returns
 * success without mutating.
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

  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }

  const service = await createServiceClient();

  // Look up the invite. Using service client because studio_invites RLS
  // requires membership — which the joiner doesn't yet have.
  const { data: invite } = await service
    .from("studio_invites")
    .select("id, studio_id, email, role, status, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }
  if (invite.status !== "pending") {
    return NextResponse.json({ error: `Invite already ${invite.status}` }, { status: 410 });
  }
  if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
    // Best-effort: mark expired so future lookups fast-path
    await service.from("studio_invites").update({ status: "expired" }).eq("id", invite.id);
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  // Already a member of this studio? Accept silently.
  const { data: existing } = await service
    .from("studio_members")
    .select("id, role")
    .eq("studio_id", invite.studio_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    const { error: memberErr } = await service.from("studio_members").insert({
      studio_id: invite.studio_id,
      user_id: user.id,
      role: invite.role,
    });
    if (memberErr) {
      console.error("studio_members insert failed:", memberErr);
      return NextResponse.json({ error: "Could not join studio" }, { status: 500 });
    }
  }

  // Mark invite accepted (idempotent)
  await service
    .from("studio_invites")
    .update({ status: "accepted" })
    .eq("id", invite.id)
    .eq("status", "pending");

  return NextResponse.json({ studioId: invite.studio_id, role: invite.role });
}
