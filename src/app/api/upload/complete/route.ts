import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "Missing videoId" },
        { status: 400 }
      );
    }

    const serviceClient = await createServiceClient();

    // Verify the video belongs to this user
    const { data: video, error } = await serviceClient
      .from("videos")
      .select("*")
      .eq("id", videoId)
      .eq("user_id", user.id)
      .single();

    if (error || !video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Update status to processing
    await serviceClient
      .from("videos")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", videoId);

    // Kick off preprocessing in the background (fire-and-forget)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    fetch(`${baseUrl}/api/preprocess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId,
        internalSecret: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20),
      }),
    }).catch((err) => {
      console.error("Failed to trigger preprocessing:", err);
    });

    return NextResponse.json({
      success: true,
      videoId,
      status: "processing",
    });
  } catch (err) {
    console.error("Upload complete error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
