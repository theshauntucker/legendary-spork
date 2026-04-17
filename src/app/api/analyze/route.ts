import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUserCredits } from "@/lib/credits";
import { minHammingAcrossFrames, DHASH_DUPLICATE_THRESHOLD } from "@/lib/dhash";

interface FrameInput {
  timestamp: number;
  label: string;
  base64: string;
}

interface RoutineMetadata {
  routineName: string;
  dancerName?: string;
  studioName?: string;
  choreographer?: string;
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
    const { frames, phashes, metadata, parentVideoId: explicitParentId, forceUpload } = body as {
      frames: FrameInput[];
      phashes?: string[];
      metadata: RoutineMetadata;
      parentVideoId?: string;
      forceUpload?: boolean;
    };

    // Normalize / validate perceptual hashes (client should send 1-3 16-char hex strings)
    const cleanPhashes: string[] = Array.isArray(phashes)
      ? phashes.filter((h): h is string => typeof h === "string" && /^[0-9a-f]{16}$/i.test(h))
      : [];

    if (!frames || frames.length === 0) {
      return NextResponse.json({ error: "No frames provided" }, { status: 400 });
    }
    if (!metadata?.routineName || !metadata?.ageGroup || !metadata?.style || !metadata?.entryType) {
      return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
    }

    const durationStr = formatDuration(metadata.duration);

    // ── Duplicate frame detection ────────────────────────────────────────────
    // Fingerprint the first 3 frames to catch re-uploads of the same video
    const fingerprintInput = frames
      .slice(0, 3)
      .map(f => f.base64.slice(0, 200))
      .join("|");
    const frameFingerprint = crypto
      .createHash("md5")
      .update(fingerprintInput)
      .digest("hex");

    // Check if this user has already submitted a video with this exact fingerprint
    const { data: existingMatch } = await serviceClient
      .from("videos")
      .select("id, routine_name, status, created_at")
      .eq("user_id", user.id)
      .eq("frame_fingerprint", frameFingerprint)
      .in("status", ["analyzed", "processing", "uploaded"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingMatch && !forceUpload) {
      return NextResponse.json({
        error: "DUPLICATE_VIDEO",
        code: "DUPLICATE_VIDEO",
        existingVideoId: existingMatch.id,
        existingRoutineName: existingMatch.routine_name,
        existingStatus: existingMatch.status,
        message: `This video has already been submitted as "${existingMatch.routine_name}". If you want to track a new submission, record a new version of the routine.`,
      }, { status: 409 });
    }
    // ────────────────────────────────────────────────────────────────────────

    // ── Perceptual dHash fuzzy duplicate detection (cross-user) ─────────────
    // The md5 fingerprint above catches exact re-uploads. The dHash check
    // catches visually identical routines that have been re-encoded, cropped,
    // or slightly trimmed. Threshold: min Hamming distance <= 8 bits.
    //
    // Bounded to the most recent 2000 videos to keep the query cheap. In
    // practice duplicates appear soon after the original upload.
    if (cleanPhashes.length && !forceUpload) {
      try {
        const { data: recentPhashed } = await serviceClient
          .from("videos")
          .select("id, routine_name, user_id, status, created_at, frame_phash")
          .not("frame_phash", "is", null)
          .in("status", ["analyzed", "processing", "uploaded"])
          .order("created_at", { ascending: false })
          .limit(2000);

        if (Array.isArray(recentPhashed)) {
          for (const row of recentPhashed) {
            const rowHashes = Array.isArray(row.frame_phash) ? row.frame_phash : [];
            if (!rowHashes.length) continue;
            const d = minHammingAcrossFrames(cleanPhashes, rowHashes);
            if (d <= DHASH_DUPLICATE_THRESHOLD) {
              const sameOwner = row.user_id === user.id;
              return NextResponse.json({
                error: "DUPLICATE_VIDEO",
                code: "DUPLICATE_VIDEO",
                existingVideoId: sameOwner ? row.id : undefined,
                existingRoutineName: sameOwner ? row.routine_name : "another member's routine",
                existingStatus: sameOwner ? row.status : "analyzed",
                hammingDistance: d,
                message: sameOwner
                  ? `This looks like the same routine you already submitted as "${row.routine_name}". If you want to track a new submission, record a new version of the routine.`
                  : `This video closely matches one already in our system. If you own the original footage, please re-record or reach out so we can help.`,
              }, { status: 409 });
            }
          }
        }
      } catch (phashErr) {
        console.warn("dHash duplicate check failed (non-fatal):", phashErr);
      }
    }
    // ────────────────────────────────────────────────────────────────────────

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
        choreographer: metadata.choreographer || null,
        competition_name: metadata.competitionName || null,
        competition_date: parsedCompDate,
        age_group: metadata.ageGroup,
        style: metadata.style,
        entry_type: metadata.entryType,
        file_size: metadata.originalFileSize || null,
        status: "processing",
        frame_fingerprint: frameFingerprint,
        frame_phash: cleanPhashes.length ? cleanPhashes : null,
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

    // parentVideoId is ONLY set via explicit URL param from "Submit Improved Routine" button.
    // Auto-detection by routine name has been removed — routines must be deliberately linked
    // by the user selecting "Submit Improved Routine". This prevents accidental cross-linking
    // of routines that happen to share the same name.
    const parentVideoId: string | null = explicitParentId || null;

    if (parentVideoId) {
      console.log(`Re-submission explicitly linked — parent video: ${parentVideoId}`);
    }

    // Fire background analysis (with parentVideoId if re-submission detected)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";
    fetch(`${baseUrl}/api/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: video.id, userId: user.id, parentVideoId }),
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
