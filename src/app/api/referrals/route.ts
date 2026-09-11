import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET — return the current user's referral code + stats
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const service = await createServiceClient();

    // Every account gets a persisted code (referral_codes table). The old
    // Coda-era profiles.referral_code is carried over where it existed.
    const { data: code, error: codeErr } = await service.rpc(
      "get_or_create_referral_code",
      { p_user_id: user.id }
    );
    if (codeErr || !code) {
      console.error("GET /api/referrals: code lookup failed", codeErr);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    const { data: rows } = await service
      .from("referrals")
      .select("status, credit_granted_referrer, updated_at")
      .eq("referrer_user_id", user.id);

    const list = rows ?? [];
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const total = list.length;
    const credited = list.filter((r) => r.status === "credited").length;
    const pending = list.filter((r) => r.status === "pending").length;
    const capped = list.filter((r) => r.status === "capped").length;
    const thisMonthCredits = list.filter(
      (r) => r.status === "credited" && r.updated_at && new Date(r.updated_at) >= monthStart
    ).length;

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL || "https://routinex.org";

    return NextResponse.json({
      code,
      shareUrl: `${origin.replace(/\/$/, "")}/?ref=${code}`,
      stats: {
        total,
        credited,
        pending,
        capped,
        thisMonthCredits,
        monthlyCap: 10,
        remainingThisMonth: Math.max(0, 10 - thisMonthCredits),
      },
    });
  } catch (err) {
    console.error("GET /api/referrals error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
