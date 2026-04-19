import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { filename, contentType, fileSize, routineName, ageGroup, style, entryType, dancerName, studioName } = body;

    if (!filename || !routineName || !ageGroup || !style || !entryType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
    if (contentType && !allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload MP4, MOV, AVI, or WebM." },
        { status: 400 }
      );
    }

    // Validate file size (500MB max)
    if (fileSize && fileSize > 500 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 500MB." },
        { status: 400 }
      );
    }

    // Use service client for storage operations
    const serviceClient = await createServiceClient();

    // ─── Re-submission auto-link ──────────────────────────────────────────
    // If this user has a prior video with the same routine + dancer name
    // (case-insensitive, trimmed), mark the new upload as a child of the
    // original via parent_video_id. This powers the "score progression"
    // experience on the results page: first upload = baseline, subsequent
    // uploads of the same routine show the delta from the original.
    //
    // We walk at most one hop: if the matched prior video itself has a
    // parent, we point at THAT root so the chain stays flat (root → child,
    // root → child, ...) rather than a linked list. This keeps queries
    // cheap and matches what the score-progression UI already expects.
    let parentVideoId: string | null = null;
    const normalizedRoutine = (routineName ?? "").trim().toLowerCase();
    const normalizedDancer = (dancerName ?? "").trim().toLowerCase();
    if (normalizedRoutine) {
      const { data: priorVideos } = await serviceClient
        .from("videos")
        .select("id, parent_video_id, routine_name, dancer_name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      const match = (priorVideos ?? []).find((v) => {
        const vr = (v.routine_name ?? "").trim().toLowerCase();
        const vd = (v.dancer_name ?? "").trim().toLowerCase();
        if (vr !== normalizedRoutine) return false;
        // If either side has a dancer name, both must match (case-insensitive).
        // If neither side does, a routine-name match is enough.
        if (normalizedDancer || vd) return vd === normalizedDancer;
        return true;
      });

      if (match) {
        parentVideoId = match.parent_video_id ?? match.id;
      }
    }
    // ──────────────────────────────────────────────────────────────────────

    // Create the video record first to get the ID
    const { data: video, error: dbError } = await serviceClient
      .from("videos")
      .insert({
        user_id: user.id,
        filename,
        storage_path: "", // Will update after we know the path
        routine_name: routineName,
        dancer_name: dancerName || null,
        studio_name: studioName || null,
        age_group: ageGroup,
        style,
        entry_type: entryType,
        file_size: fileSize || null,
        status: "uploaded",
        parent_video_id: parentVideoId,
      })
      .select("id")
      .single();

    if (dbError || !video) {
      console.error("DB error:", dbError);
      return NextResponse.json(
        { error: "Failed to create video record" },
        { status: 500 }
      );
    }

    // Generate storage path
    const storagePath = `${user.id}/${video.id}/${filename}`;

    // Update the video record with the storage path
    await serviceClient
      .from("videos")
      .update({ storage_path: storagePath })
      .eq("id", video.id);

    // Create signed upload URL
    const { data: signedUrl, error: storageError } = await serviceClient.storage
      .from("videos")
      .createSignedUploadUrl(storagePath);

    if (storageError || !signedUrl) {
      console.error("Storage error:", storageError);
      // Clean up the video record
      await serviceClient.from("videos").delete().eq("id", video.id);
      return NextResponse.json(
        { error: "Failed to create upload URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      videoId: video.id,
      storagePath,
      signedUrl: signedUrl.signedUrl,
      token: signedUrl.token,
    });
  } catch (err) {
    console.error("Signed URL error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
