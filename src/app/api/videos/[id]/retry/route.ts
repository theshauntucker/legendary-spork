import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    // Verify the video belongs to this user and is in error/processing state
    const { data: video, error } = await serviceClient
      .from("videos")
      .select("id, status, user_id, preprocessing_metadata")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (video.status === "analyzed") {
      return NextResponse.json({ error: "Video already analyzed" }, { status: 400 });
    }

    const meta = video.preprocessing_metadata as { frames?: unknown[] } | null;
    if (!meta?.frames || meta.frames.length === 0) {
      return NextResponse.json(
        { error: "No frames available for retry. Please re-upload the video." },
        { status: 400 }
      );
    }

    // Reset to processing
    await serviceClient
      .from("videos")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", id);

    // Re-trigger background analysis (lightweight — just IDs)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";
    fetch(`${baseUrl}/api/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId: video.id,
        userId: user.id,
      }),
    }).catch((err) => {
      console.error("Failed to trigger retry processing:", err);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Retry error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
