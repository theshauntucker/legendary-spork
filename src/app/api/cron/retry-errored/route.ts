import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { internalHeaders } from "@/lib/internal-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/retry-errored — every 10 minutes.
 *
 * WHY: On 2026-09-10 (bad request param) and 2026-09-13 (Anthropic account out
 * of credits) every upload failed and the customer landed on a red "Retry"
 * screen. Both outages were fixed within the hour, but nothing re-ran the
 * failed videos — the founder had to notice the alert email and retry each one
 * by hand. Customers who had already closed the tab never got their report.
 *
 * /api/process now tags a video with preprocessing_metadata.autoRetry when the
 * Anthropic call fails for a reason that will clear on its own (billing,
 * overload, rate limit, bad key/model that gets corrected). This cron re-fires
 * /api/process for those videos until one succeeds (which also sends the
 * "your report is ready" email) or 24h of attempts have passed.
 *
 * Auth: Bearer CRON_SECRET (same as the other crons).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = await createServiceClient();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: videos, error } = await serviceClient
    .from("videos")
    .select("id, user_id, preprocessing_metadata, updated_at")
    .eq("status", "error")
    .gt("created_at", cutoff)
    .not("preprocessing_metadata->autoRetry", "is", null)
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    console.error("retry-errored query failed:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";
  const fired: string[] = [];

  for (const v of videos ?? []) {
    const meta = v.preprocessing_metadata as {
      frames?: unknown[];
      autoRetry?: { attempts: number; lastAt: string };
    } | null;
    if (!meta?.frames?.length || !meta.autoRetry) continue;

    // Don't stack a retry on top of one that fired in the last few minutes.
    const lastAt = new Date(meta.autoRetry.lastAt).getTime();
    if (Date.now() - lastAt < 5 * 60 * 1000) continue;

    await serviceClient
      .from("videos")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", v.id);

    // Sequential on purpose: if the API is still down we want ONE clear failure
    // per tick, not ten parallel ones hammering a broken account.
    try {
      const res = await fetch(`${baseUrl}/api/process`, {
        method: "POST",
        headers: internalHeaders(),
        body: JSON.stringify({ videoId: v.id, userId: v.user_id }),
      });
      fired.push(`${v.id}:${res.status}`);
      // If the engine is still unavailable, stop — the rest will fail the same way.
      if (res.status === 503) break;
    } catch (err) {
      console.error("retry-errored: re-trigger failed for", v.id, err);
      fired.push(`${v.id}:network-error`);
      break;
    }
  }

  return NextResponse.json({ checked: videos?.length ?? 0, fired });
}
