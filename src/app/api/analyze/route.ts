import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUserCredits, useCredit } from "@/lib/credits";

interface FrameInput {
  timestamp: number;
  label: string;
  base64: string;
}

interface RoutineMetadata {
  routineName: string;
  dancerName?: string;
  studioName?: string;
  ageGroup: string;
  style: string;
  entryType: string;
  duration: number; // seconds
  resolution: string;
  originalFilename: string;
  originalFileSize: number;
}

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

    // Check credits before proceeding
    const serviceClient = await createServiceClient();
    const creditStatus = await getUserCredits(
      serviceClient,
      user.id,
      user.email
    );

    if (!creditStatus.hasCredits) {
      return NextResponse.json(
        {
          error: "No credits remaining",
          code: "NO_CREDITS",
          needsPurchase: !creditStatus.isBetaMember
            ? "beta_access"
            : "video_analysis",
        },
        { status: 402 }
      );
    }

    const body = await request.json();
    const { frames, metadata } = body as {
      frames: FrameInput[];
      metadata: RoutineMetadata;
    };

    if (!frames || frames.length === 0) {
      return NextResponse.json(
        { error: "No frames provided" },
        { status: 400 }
      );
    }

    if (!metadata?.routineName || !metadata?.ageGroup || !metadata?.style || !metadata?.entryType) {
      return NextResponse.json(
        { error: "Missing required metadata" },
        { status: 400 }
      );
    }

    // Format duration from seconds
    const durationStr = formatDuration(metadata.duration);

    // Create video record in the database
    const { data: video, error: videoError } = await serviceClient
      .from("videos")
      .insert({
        user_id: user.id,
        filename: metadata.originalFilename,
        storage_path: `frames/${user.id}/${Date.now()}`,
        routine_name: metadata.routineName,
        dancer_name: metadata.dancerName || null,
        studio_name: metadata.studioName || null,
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
      return NextResponse.json(
        { error: "Failed to create video record" },
        { status: 500 }
      );
    }

    // Save frames to storage immediately (before AI analysis)
    const frameUrls = await saveFramesToStorage(
      serviceClient,
      frames,
      user.id,
      video.id
    );

    // Store frame data and metadata so the background process can access it
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

    // Deduct credit now (before background processing)
    await useCredit(serviceClient, user.id, user.email);

    // Fire off the background analysis — don't await it
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";
    fetch(`${baseUrl}/api/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId: video.id,
        userId: user.id,
        frames,
        metadata,
        durationStr,
      }),
    }).catch((err) => {
      console.error("Failed to trigger background processing:", err);
    });

    // Return immediately — client redirects to processing page
    return NextResponse.json({
      success: true,
      videoId: video.id,
    });
  } catch (err) {
    console.error("Analyze route error:", err);
    return NextResponse.json(
      { error: "Something went wrong during upload" },
      { status: 500 }
    );
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function selectEvenlySpaced<T>(arr: T[], count: number): T[] {
  if (arr.length <= count) return arr;
  const step = (arr.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => arr[Math.round(i * step)]);
}

/**
 * Save a subset of key frames to Supabase Storage so they can be
 * displayed alongside the AI's timeline notes on the analysis report.
 */
async function saveFramesToStorage(
  serviceClient: ReturnType<typeof createServiceClient> extends Promise<infer T> ? T : never,
  frames: FrameInput[],
  userId: string,
  videoId: string
): Promise<Array<{ timestamp: number; label: string; path: string }>> {
  // Save ALL frames so each timeline note can match a unique thumbnail
  const selected = frames;
  const results: Array<{ timestamp: number; label: string; path: string }> = [];

  for (const frame of selected) {
    try {
      const buffer = Buffer.from(frame.base64, "base64");
      const filePath = `analysis-frames/${userId}/${videoId}/${frame.timestamp.toFixed(1)}.jpg`;

      const { error } = await serviceClient.storage
        .from("videos")
        .upload(filePath, buffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (!error) {
        results.push({
          timestamp: frame.timestamp,
          label: frame.label,
          path: filePath,
        });
      }
    } catch {
      // Skip failed frames — non-critical
    }
  }

  return results;
}
