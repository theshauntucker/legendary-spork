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

    // Fetch profile referral_code (auto-generated on insert by trigger)
    const { data: profile } = await service
      .from("profiles")
      .select("referral_code, handle")
      .eq("id", user.id)
      .single();

    let code = profile?.referral_code as string | null | undefined;

    // Defensive: if somehow null (legacy row pre-trigger), generate one now.
    if (!code) {
      const newCode = Array.from({ length: 6 }, () =>
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(
          Math.floor(Math.random() * 32)
        )
      ).join("");
      await service
        .from("profiles")
        .update({ referral_code: newCode })
        .eq("id", user.id);
      code = newCode;
    }

    // Stats from the view (lives in supabase-referrals.sql)
    const { data: stats } = await service
      .from("v_referral_stats")
      .select("*")
      .eq("referrer_user_id", user.id)
      .single();

    const total = stats?.total_referrals ?? 0;
    const credited = stats?.credited_count ?? 0;
    const pending = stats?.pending_count ?? 0;
    const capped = stats?.capped_count ?? 0;
    const thisMonthCredits = stats?.this_month_credits ?? 0;

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
