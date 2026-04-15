import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { generateInviteCode } from "@/lib/studio/invite";
import { isValidStateCode } from "@/lib/studio/us-states";

export const dynamic = "force-dynamic";

/**
 * POST /api/studio/signup
 * Body: { studioName: string, region: string (2-letter state code) }
 *
 * Assumes the caller is already authenticated (they went through the
 * /studio/signup page which does supabase.auth.signUp() client-side first,
 * then hits this endpoint). Creates the studios row + adds the caller as
 * owner member in one transaction-like flow. Idempotent: if the user
 * already owns a studio, returns that studio instead of creating a duplicate.
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
  const studioName = typeof body.studioName === "string" ? body.studioName.trim() : "";
  const region = typeof body.region === "string" ? body.region.toUpperCase() : "";

  if (!studioName || studioName.length < 2) {
    return NextResponse.json({ error: "Studio name required (min 2 chars)" }, { status: 400 });
  }
  if (!isValidStateCode(region)) {
    return NextResponse.json({ error: "Invalid region (expected US 2-letter state code)" }, { status: 400 });
  }

  const service = await createServiceClient();

  // Idempotency: if they already own a studio, don't create another.
  const { data: existing } = await service
    .from("studios")
    .select("id, name, invite_code, region")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      studioId: existing.id,
      studio: existing,
      alreadyExisted: true,
    });
  }

  // Create studios row (with retry on invite_code collision — unlikely but cheap)
  let inviteCode = generateInviteCode(studioName);
  let studioId: string | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await service
      .from("studios")
      .insert({
        name: studioName,
        owner_user_id: user.id,
        invite_code: inviteCode,
        region,
      })
      .select("id")
      .single();

    if (!error && data) {
      studioId = data.id;
      break;
    }
    if (error?.code === "23505") {
      // invite_code collision — regenerate + retry
      inviteCode = generateInviteCode(studioName);
      continue;
    }
    console.error("studios insert failed:", error);
    return NextResponse.json({ error: "Could not create studio" }, { status: 500 });
  }

  if (!studioId) {
    return NextResponse.json({ error: "Invite code collision — please retry" }, { status: 500 });
  }

  // Add owner as member (role='owner')
  const { error: memberErr } = await service.from("studio_members").insert({
    studio_id: studioId,
    user_id: user.id,
    role: "owner",
  });
  if (memberErr) {
    console.error("studio_members insert failed:", memberErr);
    // Best-effort cleanup so we don't leave orphan studios rows
    await service.from("studios").delete().eq("id", studioId);
    return NextResponse.json({ error: "Could not attach owner" }, { status: 500 });
  }

  return NextResponse.json({
    studioId,
    studio: { id: studioId, name: studioName, invite_code: inviteCode, region },
    alreadyExisted: false,
  });
}
