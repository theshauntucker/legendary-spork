import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { generateInviteLinkCode } from "@/lib/studio/invite";
import { loadStudioMembership } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/studio/invite
 * Body: { email: string, role?: "choreographer" | "viewer" }
 *
 * Owner-only. Creates a pending studio_invites row with a unique one-shot
 * code valid for 14 days (default from migration). Returns the code and
 * the absolute join URL so the client can copy/email it manually. Actual
 * email delivery is deferred until a later phase — keep the surface small
 * and testable first.
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

  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership) {
    return NextResponse.json({ error: "Not a studio member" }, { status: 403 });
  }
  if (membership.role !== "owner") {
    return NextResponse.json({ error: "Owner only" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = body.role === "viewer" ? "viewer" : "choreographer";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const service = await createServiceClient();

  // Allow multiple pending invites to the same email — owner might rotate.
  // Generate a fresh code each call with retry on collision.
  let code = generateInviteLinkCode();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { error } = await service.from("studio_invites").insert({
      studio_id: membership.studioId,
      email,
      role,
      code,
      status: "pending",
    });
    if (!error) break;
    if (error.code === "23505") {
      code = generateInviteLinkCode();
      continue;
    }
    console.error("studio_invites insert failed:", error);
    return NextResponse.json({ error: "Could not create invite" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";
  const joinUrl = `${baseUrl}/studio/join?code=${encodeURIComponent(code)}`;

  return NextResponse.json({ code, joinUrl, email, role });
}


/**
 * DELETE /api/studio/invite?code=xxx
 * Owner revokes a pending invite.
 */
export async function DELETE(request: NextRequest) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
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

  const service = await createServiceClient();
  const { error } = await service
    .from("studio_invites")
    .update({ status: "revoked" })
    .eq("code", code)
    .eq("studio_id", membership.studioId);

  if (error) {
    return NextResponse.json({ error: "Revoke failed" }, { status: 500 });
  }
  return NextResponse.json({ revoked: true });
}
