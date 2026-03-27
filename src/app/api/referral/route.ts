import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// POST — record a referral code for the current user
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

    const serviceClient = await createServiceClient();

    // Use the RPC function to safely record the referral
    const { error } = await serviceClient.rpc("record_referral", {
      p_user_id: user.id,
      p_referral_code: code.toUpperCase(),
    });

    if (error) {
      console.error("Failed to record referral:", error);
      return NextResponse.json({ error: "Failed to record referral" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Referral API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
