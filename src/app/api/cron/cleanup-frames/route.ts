import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Find videos that are analyzed, frames not yet deleted, and older than 24 hours
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: videos, error: fetchError } = await supabase
      .from("videos")
      .select("id, frame_paths")
      .eq("status", "analyzed")
      .or("frames_deleted.is.null,frames_deleted.eq.false")
      .lt("updated_at", twentyFourHoursAgo)
      .limit(50); // Process in batches

    if (fetchError) {
      console.error("Cron fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch videos" },
        { status: 500 }
      );
    }

    if (!videos || videos.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No frames to clean up",
        processed: 0,
      });
    }

    let processed = 0;
    let errors = 0;

    for (const video of videos) {
      try {
        // Delete frames from storage by path
        if (video.frame_paths && Array.isArray(video.frame_paths) && video.frame_paths.length > 0) {
          await supabase.storage
            .from("frames")
            .remove(video.frame_paths);
        }

        // Also try folder-based deletion
        const { data: folderFiles } = await supabase.storage
          .from("frames")
          .list(video.id);

        if (folderFiles && folderFiles.length > 0) {
          const folderPaths = folderFiles.map((f) => `${video.id}/${f.name}`);
          await supabase.storage
            .from("frames")
            .remove(folderPaths);
        }

        // Mark as deleted
        await supabase
          .from("videos")
          .update({
            frames_deleted: true,
            frames_deleted_at: new Date().toISOString(),
          })
          .eq("id", video.id);

        processed++;
      } catch (err) {
        console.error(`Error cleaning up video ${video.id}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      total: videos.length,
    });
  } catch (err) {
    console.error("Cron cleanup error:", err);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
