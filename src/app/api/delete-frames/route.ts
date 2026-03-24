import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // Authenticate user
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get videoId from request body
    const body = await request.json();
    const { videoId } = body;
    if (!videoId) {
      return NextResponse.json(
        { error: "videoId is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: video, error: fetchError } = await supabase
      .from("videos")
      .select("id, user_id, frame_paths, frames_deleted")
      .eq("id", videoId)
      .single();

    if (fetchError || !video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    if (video.user_id !== user.id) {
      return NextResponse.json(
        { error: "You do not own this video" },
        { status: 403 }
      );
    }

    if (video.frames_deleted) {
      return NextResponse.json({
        success: true,
        message: "Frames already deleted",
      });
    }

    // Delete frames from Supabase Storage
    let deletedCount = 0;

    // Method 1: Delete by stored frame paths
    if (video.frame_paths && Array.isArray(video.frame_paths) && video.frame_paths.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from("frames")
        .remove(video.frame_paths);

      if (!deleteError) {
        deletedCount += video.frame_paths.length;
      } else {
        console.error("Error deleting frames by path:", deleteError);
      }
    }

    // Method 2: Also list and delete any frames in the video's folder
    const folderPath = `${videoId}/`;
    const { data: folderFiles } = await supabase.storage
      .from("frames")
      .list(videoId);

    if (folderFiles && folderFiles.length > 0) {
      const folderPaths = folderFiles.map((f) => `${folderPath}${f.name}`);
      const { error: folderDeleteError } = await supabase.storage
        .from("frames")
        .remove(folderPaths);

      if (!folderDeleteError) {
        deletedCount += folderFiles.length;
      } else {
        console.error("Error deleting frames by folder:", folderDeleteError);
      }
    }

    // Mark video as frames_deleted
    const { error: updateError } = await supabase
      .from("videos")
      .update({
        frames_deleted: true,
        frames_deleted_at: new Date().toISOString(),
      })
      .eq("id", videoId);

    if (updateError) {
      console.error("Error updating video record:", updateError);
      return NextResponse.json(
        { error: "Frames deleted but failed to update record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: "All frames have been permanently deleted",
    });
  } catch (err) {
    console.error("Delete frames error:", err);
    return NextResponse.json(
      { error: "Failed to delete frames" },
      { status: 500 }
    );
  }
}
