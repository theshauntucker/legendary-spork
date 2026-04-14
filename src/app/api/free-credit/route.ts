import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { grantCredits } from "@/lib/credits";

export const dynamic = "force-dynamic";

/**
 * POST /api/free-credit
 *
 * Grants 1 free credit to the authenticated user if they have no credits record.
 * Called immediately after signup + sign-in in the signup form so users always
 * have their free analysis credit before reaching the dashboard.
 *
 * Idempotent — safe to call multiple times. Returns success even if already granted.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    // Only grant if no credits record exists yet
    const { data: existing } = await serviceClient
      .from("user_credits")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, alreadyGranted: true });
    }

    await grantCredits(serviceClient, user.id, 1, false);
    return NextResponse.json({ success: true, granted: 1 });
  } catch (err) {
    console.error("Free credit error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
