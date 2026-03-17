import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyTrafficSummary } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * Daily traffic summary cron job.
 * Triggered by Vercel Cron at 8am ET every day.
 * Queries Supabase for signups/analyses in the last 24h as a proxy for traffic.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = await createServiceClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Get new users in last 24h
  const { count: newUsers } = await serviceClient
    .from("user_credits")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since);

  // Get analyses in last 24h
  const { count: analyses } = await serviceClient
    .from("analyses")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since);

  // Get payments in last 24h
  const { count: payments } = await serviceClient
    .from("payments")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since);

  // Get total revenue in last 24h
  const { data: revenueData } = await serviceClient
    .from("payments")
    .select("amount_cents")
    .gte("created_at", since)
    .eq("status", "completed");

  const totalRevenue = (revenueData || []).reduce(
    (sum, p) => sum + (p.amount_cents || 0),
    0
  );

  const today = new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  await notifyTrafficSummary({
    totalVisitors: newUsers || 0,
    pageViews: analyses || 0,
    topPages: [
      { page: "New Signups", views: newUsers || 0 },
      { page: "Analyses Run", views: analyses || 0 },
      { page: "Payments", views: payments || 0 },
      { page: "Revenue", views: totalRevenue > 0 ? Number((totalRevenue / 100).toFixed(0)) : 0 },
    ],
    period: today,
  });

  return NextResponse.json({
    success: true,
    summary: { newUsers, analyses, payments, totalRevenue },
  });
}
