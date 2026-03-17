import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

    const { data: video, error } = await supabase
      .from("videos")
      .select("id, status, thumbnail_path, analysis_id, updated_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
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
