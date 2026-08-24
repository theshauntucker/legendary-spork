import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendSeasonRecapEmail } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "22tucker22@comcast.net";

/**
 * Weekly season recap — Mondays. Emails every user who has scored a routine in
 * the last 30 days a snapshot of where each dancer's season stands, with the
 * honest deltas the progression engine measured. One CTA: back to the dashboard.
 *
 * Dedupe: skips anyone who received a season_recap in the last 6 days.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = await createServiceClient();
  const now = Date.now();
  const activeSince = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const dedupeSince = new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString();

  // Active users: scored something in the last 30 days
  const { data: recentAnalyses } = await serviceClient
    .from("analyses")
    .select("user_id")
    .gte("created_at", activeSince);

  const activeUserIds = [...new Set((recentAnalyses ?? []).map((a: { user_id: string }) => a.user_id))].slice(0, 200);
  if (activeUserIds.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no active users" });
  }

  // Recently-recapped users to skip
  const { data: recentSends } = await serviceClient
    .from("user_email_sends")
    .select("user_id")
    .eq("email_kind", "season_recap")
    .gte("sent_at", dedupeSince);
  const skip = new Set((recentSends ?? []).map((s: { user_id: string }) => s.user_id));

  let sent = 0;
  const errors: string[] = [];

  for (const userId of activeUserIds) {
    if (skip.has(userId)) continue;

    try {
      const { data: userRes } = await serviceClient.auth.admin.getUserById(userId);
      const email = userRes?.user?.email;
      if (!email || email === ADMIN_EMAIL) continue;

      // Full season for this user
      const { data: videos } = await serviceClient
        .from("videos")
        .select("id, dancer_name, routine_name, status, created_at")
        .eq("user_id", userId)
        .eq("status", "analyzed")
        .order("created_at", { ascending: false })
        .limit(60);
      if (!videos || videos.length === 0) continue;

      const videoIds = videos.map((v: { id: string }) => v.id);
      const { data: analyses } = await serviceClient
        .from("analyses")
        .select("video_id, total_score, award_level, progression, improvement_priorities, created_at")
        .in("video_id", videoIds)
        .order("created_at", { ascending: false });
      if (!analyses || analyses.length === 0) continue;

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const byVideo = new Map<string, any>();
      for (const a of analyses as any[]) {
        if (!byVideo.has(a.video_id)) byVideo.set(a.video_id, a);
      }

      const scores = [...byVideo.values()].map((a) => Number(a.total_score)).filter((n) => n >= 200);
      if (scores.length === 0) continue;
      const bestScore = Math.max(...scores);
      const weekCount = (analyses as any[]).filter((a) => a.created_at >= weekAgo).length;

      // Latest entry per dancer
      const dancerLines = new Map<string, any>();
      for (const v of videos as any[]) {
        const name = (v.dancer_name || "Your dancer").trim();
        if (dancerLines.has(name)) continue; // videos are newest-first
        const a = byVideo.get(v.id);
        if (!a || Number(a.total_score) < 200) continue;
        const prog = a.progression;
        dancerLines.set(name, {
          dancerName: name,
          latestScore: Number(a.total_score),
          latestAward: a.award_level,
          delta: prog?.isTracked && typeof prog.totalDelta === "number" ? prog.totalDelta : null,
          routineName: v.routine_name || "Untitled",
          openPriority:
            (Array.isArray(prog?.carriedPriorities) && prog.carriedPriorities[0]) ||
            (Array.isArray(a.improvement_priorities) && a.improvement_priorities[0]?.item) ||
            null,
        });
      }
      if (dancerLines.size === 0) continue;

      await sendSeasonRecapEmail(email, {
        weekCount,
        seasonCount: scores.length,
        dancers: [...dancerLines.values()],
        bestScore,
      });

      await serviceClient
        .from("user_email_sends")
        .insert({ user_id: userId, email_kind: "season_recap" });

      sent++;
    } catch (err) {
      errors.push(`${userId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`Season recap cron: sent ${sent} emails, ${errors.length} errors`);
  return NextResponse.json({ sent, errors: errors.slice(0, 10) });
}
