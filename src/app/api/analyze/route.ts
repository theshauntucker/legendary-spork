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
  ageGroup: string;
  style: string;
  entryType: string;
  duration: number; // seconds
  resolution: string;
  originalFilename: string;
  originalFileSize: number;
}

export const maxDuration = 60; // Allow up to 60s for large uploads

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
        },
        { status: 402 }
      );
    }

    const body = await request.json();
    const { frames, metadata, parentVideoId } = body as {
      frames: FrameInput[];
      metadata: RoutineMetadata;
      parentVideoId?: string; // Optional: links this to a previously analyzed routine
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

    // ── Dedup check: prevent duplicate submissions from retry logic ────────────
    // If the user already has a video with the same routine name currently
    // processing (within the last 10 minutes), return that video ID instead
    // of creating a brand-new record. This stops the retry loop from burning
    // two analyses and showing the user two results.
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: existingProcessing } = await serviceClient
      .from("videos")
      .select("id")
      .eq("user_id", user.id)
      .eq("routine_name", metadata.routineName)
      .eq("status", "processing")
      .gt("created_at", tenMinutesAgo)
      .maybeSingle();

    if (existingProcessing) {
      // Already processing — return the existing video ID
      return NextResponse.json({
        success: true,
        videoId: existingProcessing.id,
      });
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
        parent_video_id: parentVideoId || null, // Link to previous routine if tracking
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

    // Fire off the background analysis — only send IDs, process reads frames from storage
    // Credit is deducted in /api/process AFTER successful analysis (not here)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";
    fetch(`${baseUrl}/api/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId: video.id,
        userId: user.id,
        parentVideoId: parentVideoId || null, // Forward for context injection
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
