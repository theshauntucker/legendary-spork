import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/delete-frames?videoId=xxx
 * Immediately deletes stored video frames for a given analysis.
 * Requires authentication — only the video owner can delete.
 */
export async function DELETE(request: NextRequest) {
  try {
    const videoId = request.nextUrl.searchParams.get("videoId");
    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    // Verify the user owns this video
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    // Fetch the video and confirm ownership
    const { data: video } = await serviceClient
      .from("videos")
      .select("id, user_id, preprocessing_metadata")
      .eq("id", videoId)
      .single();

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (video.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete frames from Supabase storage
    const meta = video.preprocessing_metadata as Record<string, unknown> | null;
    const frames = (meta?.frames ?? []) as Array<{ path: string }>;

    if (frames.length > 0) {
      const paths = frames.map((f) => f.path);
      const { error: deleteError } = await serviceClient.storage
        .from("videos")
        .remove(paths);

      if (deleteError) {
        console.error("Frame deletion error:", deleteError);
      }
    }

    // Clear the frames from metadata (keep other metadata intact)
    if (meta) {
      await serviceClient
        .from("videos")
        .update({
          preprocessing_metadata: {
            ...meta,
            frames: [],
            framesDeletedAt: new Date().toISOString(),
            framesDeletedBy: "user",
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", videoId);
    }

    return NextResponse.json({ success: true, deletedCount: frames.length });
  } catch (err) {
    console.error("Delete frames error:", err);
    return NextResponse.json({ error: "Failed to delete frames" }, { status: 500 });
  }
}
