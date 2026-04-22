import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// POST — record a referral code for the current user
// Tries user-to-user referral first (6-char profile code), then falls back
// to affiliate/partner code from supabase-affiliates.sql.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const upper = code.trim().toUpperCase();
    const serviceClient = await createServiceClient();

    // 1) Try user-to-user referral (profiles.referral_code)
    const { data: userRefResult, error: userRefError } = await serviceClient.rpc(
      "record_user_referral",
      { p_referred_user_id: user.id, p_referral_code: upper }
    );

    if (!userRefError && userRefResult && typeof userRefResult === "object") {
      const status = (userRefResult as { status?: string }).status;
      if (status === "recorded" || status === "already_recorded") {
        return NextResponse.json({ success: true, kind: "user", status });
      }
      // If RPC explicitly said "not_found", keep going to try affiliate.
      if (status && status !== "not_found") {
        // self_referral, invalid, etc. — reflect but don't error loudly
        return NextResponse.json({ success: false, kind: "user", status });
      }
    }

    // 2) Fall back to affiliate/partner referral code
    const { error: affErr } = await serviceClient.rpc("record_referral", {
      p_user_id: user.id,
      p_referral_code: upper,
    });

    if (affErr) {
      console.error("Failed to record referral (both paths):", {
        userRefError,
        affErr,
      });
      return NextResponse.json(
        { error: "Failed to record referral" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, kind: "affiliate" });
  } catch (err) {
    console.error("Referral API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
