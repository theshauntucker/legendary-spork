import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/cleanup-frames
 * Hourly cron job that auto-deletes video frames older than 24 hours.
 * COPPA compliance: ensures no frames persist beyond the retention window.
 *
 * Auth: Bearer CRON_SECRET, matching the pattern used by the other three
 * crons. Without this, anyone can hit the endpoint and force a sweep — not
 * catastrophic (only removes frames of already-analyzed videos that were due
 * for deletion anyway) but there's no reason to leave it open.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const serviceClient = await createServiceClient();

    // Find videos that are analyzed and older than 24 hours with frames still present
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Analyzed videos: 24h after the report. Failed or stuck uploads: 24h after
    // upload (retry-errored only retries inside that window). Until Nov 17 2026
    // only analyzed videos were swept, so frames from failed uploads were kept
    // forever — breaking the "deleted within 24 hours" promise.
    const [analyzed, failed] = await Promise.all([
      serviceClient
        .from("videos")
        .select("id, preprocessing_metadata")
        .eq("status", "analyzed")
        .lt("updated_at", cutoff),
      serviceClient
        .from("videos")
        .select("id, preprocessing_metadata")
        .in("status", ["error", "processing"])
        .lt("created_at", cutoff),
    ]);
    const error = analyzed.error || failed.error;
    const videos = [...(analyzed.data || []), ...(failed.data || [])];

    if (error) {
      console.error("Cleanup query error:", error);
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    let totalDeleted = 0;

    for (const video of videos || []) {
      const meta = video.preprocessing_metadata as Record<string, unknown> | null;
      const frames = (meta?.frames ?? []) as Array<{ path: string }>;

      // Skip if frames already deleted
      if (frames.length === 0) continue;

      // Delete frames from storage
      const paths = frames.map((f) => f.path);
      const { error: deleteError } = await serviceClient.storage
        .from("videos")
        .remove(paths);

      if (deleteError) {
        console.error(`Failed to delete frames for video ${video.id}:`, deleteError);
        continue;
      }

      // Update metadata to reflect deletion
      await serviceClient
        .from("videos")
        .update({
          preprocessing_metadata: {
            ...meta,
            frames: [],
            framesDeletedAt: new Date().toISOString(),
            framesDeletedBy: "auto-cleanup",
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", video.id);

      totalDeleted += frames.length;
    }

    return NextResponse.json({
      success: true,
      videosProcessed: videos?.length || 0,
      framesDeleted: totalDeleted,
    });
  } catch (err) {
    console.error("Cleanup cron error:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
