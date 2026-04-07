import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUserCredits } from "@/lib/credits";

interface FrameInput {
  timestamp: number;
  label: string;
  base64: string;
}

interface RoutineMetadata {
  routineName: string;
  dancerName?: string;
  studioName?: string;
  competitionName?: string;
  competitionDate?: string;
  ageGroup: string;
  style: string;
  entryType: string;
  duration: number;
  resolution: string;
  originalFilename: string;
  originalFileSize: number;
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const serviceClient = await createServiceClient();
    const creditStatus = await getUserCredits(serviceClient, user.id, user.email);
    if (!creditStatus.hasCredits) {
      return NextResponse.json({ error: "No credits remaining", code: "NO_CREDITS" }, { status: 402 });
    }

    const body = await request.json();
    const { frames, metadata } = body as { frames: FrameInput[]; metadata: RoutineMetadata };

    if (!frames || frames.length === 0) {
      return NextResponse.json({ error: "No frames provided" }, { status: 400 });
    }
    if (!metadata?.routineName || !metadata?.ageGroup || !metadata?.style || !metadata?.entryType) {
      return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
    }

    const durationStr = formatDuration(metadata.duration);

    // Parse competition date safely
    let parsedCompDate: string | null = null;
    if (metadata.competitionDate) {
      try {
        const d = new Date(metadata.competitionDate);
        if (!isNaN(d.getTime())) parsedCompDate = d.toISOString().split("T")[0];
      } catch { /* ignore invalid dates */ }
    }

    // Create video record — including new competition fields
    const { data: video, error: videoError } = await serviceClient
      .from("videos")
      .insert({
        user_id: user.id,
        filename: metadata.originalFilename,
        storage_path: `frames/${user.id}/${Date.now()}`,
        routine_name: metadata.routineName,
        dancer_name: metadata.dancerName || null,
        studio_name: metadata.studioName || null,
        competition_name: metadata.competitionName || null,
        competition_date: parsedCompDate,
        age_group: metadata.ageGroup,
        style: metadata.style,
        entry_type: metadata.entryType,
        file_size: metadata.originalFileSize || null,
        status: "processing",
      })
      .select("id")
      .single();

    if (videoError || !video) {
      console.error("DB error creating video:", videoError);
      return NextResponse.json({ error: "Failed to create video record" }, { status: 500 });
    }

    // Save frames to storage
    const frameUrls = await saveFramesToStorage(serviceClient, frames, user.id, video.id);

    // Store frame data + metadata for background processing
    await serviceClient
      .from("videos")
      .update({
        preprocessing_metadata: {
          frameCount: frames.length,
          duration: metadata.duration,
          durationFormatted: durationStr,
          resolution: metadata.resolution,
          frames: frameUrls,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", video.id);

    // Fire background analysis
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";
    fetch(`${baseUrl}/api/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: video.id, userId: user.id }),
    }).catch((err) => console.error("Failed to trigger background processing:", err));

    return NextResponse.json({ success: true, videoId: video.id });
  } catch (err) {
    console.error("Analyze route error:", err);
    return NextResponse.json({ error: "Something went wrong during upload" }, { status: 500 });
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

async function saveFramesToStorage(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  frames: FrameInput[],
  userId: string,
  videoId: string
): Promise<Array<{ timestamp: number; label: string; path: string }>> {
  const results: Array<{ timestamp: number; label: string; path: string }> = [];
  for (const frame of frames) {
    try {
      const buffer = Buffer.from(frame.base64, "base64");
      const filePath = `analysis-frames/${userId}/${videoId}/${frame.timestamp.toFixed(1)}.jpg`;
      const { error } = await serviceClient.storage
        .from("videos")
        .upload(filePath, buffer, { contentType: "image/jpeg", upsert: true });
      if (!error) results.push({ timestamp: frame.timestamp, label: frame.label, path: filePath });
    } catch { /* skip failed frames */ }
  }
  return results;
}
