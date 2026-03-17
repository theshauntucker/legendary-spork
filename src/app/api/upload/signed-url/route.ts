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
