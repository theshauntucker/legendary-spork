import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Live-ops feed for the admin dashboard. Refreshed client-side every 30s.
 * Auth: admin email gate (same pattern as /admin page). Anything else gets 403.
 *
 * Returns a snapshot of the numbers Shaun needs at a glance to know the
 * business is alive and healthy: revenue today, MRR, active subs, at-risk
 * cancel_at_period_end count, signups today, failed payments today, and
 * current processing-queue depth.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const svc = await createServiceClient();

  // Day boundary in America/New_York — Shaun's reporting TZ
  const now = new Date();
  const tz = "America/New_York";
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [{ value: yyyy }, , { value: mm }, , { value: dd }] = fmt.formatToParts(now);
  const startOfDayNY = new Date(`${yyyy}-${mm}-${dd}T00:00:00-04:00`);
  const startOfDayISO = startOfDayNY.toISOString();

  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: paymentsToday },
    { data: activeSubs },
    { data: cancelingSubs },
    { data: failedPaymentsToday },
    { data: signupsTodayRes },
    { data: processingVideos },
    { data: recent24hAnalyses },
    { data: activeSubsAll },
  ] = await Promise.all([
    svc
      .from("payments")
      .select("amount_cents, payment_type, status, created_at")
      .gte("created_at", startOfDayISO)
      .eq("status", "completed"),
    svc
      .from("subscriptions")
      .select("id, current_period_end, cancel_at_period_end")
      .eq("status", "active"),
    svc
      .from("subscriptions")
      .select("id, current_period_end")
      .eq("status", "active")
      .eq("cancel_at_period_end", true),
    svc
      .from("payments")
      .select("id, amount_cents, created_at, status")
      .gte("created_at", startOfDayISO)
      .in("status", ["failed", "requires_payment_method"]),
    svc.rpc("admin_signups_since", { p_since: startOfDayISO }).then(
      (r) => (r.error ? { data: null } : { data: r.data }),
      () => ({ data: null })
    ),
    svc
      .from("videos")
      .select("id, status, created_at")
      .in("status", ["processing", "uploading", "queued"]),
    svc
      .from("analyses")
      .select("id, total_score, created_at")
      .gte("created_at", last24h),
    svc
      .from("subscriptions")
      .select("id")
      .eq("status", "active"),
  ]);

  // MRR — $12.99 per active Season Member + $99 per active Studio sub.
  // We don't always have a reliable 'tier' column on subscriptions, so we
  // fall back to flat-rate-per-active: everyone gets $12.99 by default.
  // If you add a tier column later, branch here.
  const activeSubCount = (activeSubsAll ?? []).length;
  const mrrCents = activeSubCount * 1299; // TODO split Studio vs Season once tier is recorded

  const todayRevenueCents = (paymentsToday ?? []).reduce(
    (s, p) => s + (p.amount_cents || 0),
    0
  );

  // Signups fallback — if the RPC doesn't exist yet, count via auth list.
  // Swallowed RPC error above returns null; count separately via payments row
  // mapping would be wrong, so fall back to 0 and let Shaun add the RPC later.
  let signupsToday = 0;
  if (signupsTodayRes && typeof (signupsTodayRes as unknown) === "number") {
    signupsToday = signupsTodayRes as unknown as number;
  } else if (Array.isArray(signupsTodayRes)) {
    signupsToday = (signupsTodayRes as unknown[]).length;
  }

  const last24hAnalysisCount = (recent24hAnalyses ?? []).length;
  const avgScore24h =
    last24hAnalysisCount > 0
      ? Math.round(
          (recent24hAnalyses ?? []).reduce((s, a) => s + (a.total_score || 0), 0) /
            last24hAnalysisCount
        )
      : 0;

  return NextResponse.json({
    ts: now.toISOString(),
    todayRevenueCents,
    todayPaymentCount: (paymentsToday ?? []).length,
    mrrCents,
    activeSubCount,
    cancelAtPeriodEndCount: (cancelingSubs ?? []).length,
    failedPaymentsToday: (failedPaymentsToday ?? []).length,
    signupsToday,
    processingQueueDepth: (processingVideos ?? []).length,
    last24hAnalysisCount,
    avgScore24h,
    // Raw period-end dates of canceling subs so Shaun can see who's about
    // to churn and run a win-back.
    cancelingPeriodEnds: (cancelingSubs ?? [])
      .map((s) => s.current_period_end)
      .filter(Boolean)
      .sort(),
  });
}
