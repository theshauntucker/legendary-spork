import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify authentication with user's session
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use service client for DB reads (avoids RLS issues after Stripe redirect)
    const serviceClient = await createServiceClient();

    const { data: video, error } = await serviceClient
      .from("videos")
      .select("id, status, thumbnail_path, analysis_id, updated_at, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Self-healing: if video is stuck in "processing", take action
    if (video.status === "processing" && video.updated_at) {
      const updatedAt = new Date(video.updated_at).getTime();
      const staleMs = Date.now() - updatedAt;

      if (staleMs > 7 * 60 * 1000) {
        // Stuck for over 7 minutes — mark as error
        await serviceClient
          .from("videos")
          .update({ status: "error", updated_at: new Date().toISOString() })
          .eq("id", id);
        return NextResponse.json({
          videoId: video.id,
          status: "error",
          thumbnailPath: video.thumbnail_path,
          analysisId: video.analysis_id,
          updatedAt: new Date().toISOString(),
        });
      }

      if (staleMs > 30_000) {
        // Stuck for over 30 seconds — re-trigger processing (self-healing)
        // Update timestamp to prevent re-triggering on next poll (3s interval)
        await serviceClient
          .from("videos")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", id);

        // Re-trigger the process route
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";
        fetch(`${baseUrl}/api/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId: id, userId: user.id }),
        }).catch((err) => {
          console.error("Self-healing: Failed to re-trigger processing:", err);
        });

        console.log(`Self-healing: Re-triggered processing for video ${id}`);
      }
    }

    return NextResponse.json({
      videoId: video.id,
      status: video.status,
      thumbnailPath: video.thumbnail_path,
      analysisId: video.analysis_id,
      updatedAt: video.updated_at,
    });
  } catch (err) {
    console.error("Status check error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
