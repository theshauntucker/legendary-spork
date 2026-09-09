import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { grantCredits } from "@/lib/credits";
import { clientKey, rateLimit } from "@/lib/internal-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/free-credit
 *
 * Grants the free first analysis (1 credit) to the authenticated user if they
 * have no credits record yet. Called right after signup + sign-in so every
 * new account reaches the dashboard already able to upload.
 *
 * REINSTATED 2026-09-09. The free credit was removed 2026-06-30 over a
 * "throwaway-email farming" concern. The data since then: activation fell
 * from 71% of signups running an analysis to 13%, and the paid rate did not
 * move (8.4% → 6.7%). One analysis costs roughly a quarter to run. The
 * free credit is the funnel — it stays.
 *
 * Guards:
 *   - one grant per account, ever (existence of a user_credits row)
 *   - rate-limited per client so a script can't churn accounts from one IP
 *
 * Idempotent — safe to call multiple times.
 */
export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(clientKey(request, "free-credit"), {
      max: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    // Only grant if no credits record exists yet — paid, gifted, or previously
    // granted accounts all have a row and are skipped.
    const { data: existing } = await serviceClient
      .from("user_credits")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, alreadyGranted: true, granted: 0 });
    }

    await grantCredits(serviceClient, user.id, 1, false);
    console.log(`free-credit: granted first analysis to ${user.id}`);
    return NextResponse.json({ success: true, granted: 1 });
  } catch (err) {
    console.error("Free credit error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
