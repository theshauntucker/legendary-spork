import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { consumeSpotlightCredit } from "@/lib/spotlight/fulfill";
import { isAdmin } from "@/lib/credits";
import { internalHeaders } from "@/lib/internal-auth";
import { selectKeyMoments } from "@/lib/spotlight/keyframes";
import { computeMetrics, type Pose } from "@/lib/spotlight/landmarks";
import type { SpotlightFrame } from "@/lib/spotlight/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/spotlight/complete
 * Body: { reportId, frames: [{ i, t, path, w, h, pose }] }
 * Frames are already in storage (uploaded straight from the browser via the
 * signed URLs from /start). This records them, consumes the credit, picks the
 * key moments and kicks off processing in the background.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const reportId = String(body.reportId || "");
    const rawFrames = Array.isArray(body.frames) ? body.frames : [];
    if (!reportId || rawFrames.length < 8) {
      return NextResponse.json({ error: "Not enough frames" }, { status: 400 });
    }

    const svc = await createServiceClient();
    const { data: row } = await svc
      .from("spotlight_reports")
      .select("id, user_id, frame_count, status")
      .eq("id", reportId)
      .maybeSingle();
    if (!row || row.user_id !== user.id) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    if (row.frame_count > 0) return NextResponse.json({ ok: true, alreadyStarted: true });

    const prefix = `spotlight/${user.id}/${reportId}/`;
    const frames: SpotlightFrame[] = rawFrames
      .filter((f: { path?: string }) => typeof f.path === "string" && f.path.startsWith(prefix))
      .map((f: { i: number; t: number; path: string; w: number; h: number; pose: Pose | null }) => {
        const pose = Array.isArray(f.pose) && f.pose.length === 33 ? (f.pose as Pose) : null;
        return {
          i: Number(f.i), t: Number(f.t), path: f.path, w: Number(f.w) || 0, h: Number(f.h) || 0,
          pose, metrics: pose ? computeMetrics(pose) : null,
        };
      })
      .sort((a: SpotlightFrame, b: SpotlightFrame) => a.i - b.i)
      .map((f: SpotlightFrame, idx: number) => ({ ...f, i: idx }));

    const tracked = frames.filter((f) => f.pose).length;
    if (tracked < 6) {
      await svc.from("spotlight_reports").update({ status: "error", error: "We couldn't track the dancer in enough frames. Try a clip where her whole body stays in view.", frame_count: frames.length, tracked_frames: tracked, frames }).eq("id", reportId);
      return NextResponse.json({ error: "We couldn't track the dancer in enough frames. Try a clip where her whole body stays in view.", code: "TRACKING" }, { status: 422 });
    }

    if (!isAdmin(user.email)) {
      const ok = await consumeSpotlightCredit(svc, user.id);
      if (!ok) return NextResponse.json({ error: "No Spotlight credit on this account", code: "NO_CREDIT" }, { status: 402 });
    }

    const keyFrames = selectKeyMoments(frames, 14);
    await svc
      .from("spotlight_reports")
      .update({ frames, frame_count: frames.length, tracked_frames: tracked, key_frames: keyFrames, status: "processing" })
      .eq("id", reportId);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";
    fetch(`${baseUrl}/api/spotlight/process`, {
      method: "POST",
      headers: internalHeaders(),
      body: JSON.stringify({ reportId }),
    }).catch((err) => console.error("spotlight: failed to trigger processing", err));

    return NextResponse.json({ ok: true, reportId, keyFrames: keyFrames.length, tracked });
  } catch (err) {
    console.error("spotlight/complete error:", err);
    return NextResponse.json({ error: "Could not finish the upload" }, { status: 500 });
  }
}
