import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get("video") as File | null;
    const routineName = formData.get("routineName") as string;
    const ageGroup = formData.get("ageGroup") as string;
    const style = formData.get("style") as string;
    const entryType = formData.get("entryType") as string;
    const dancerName = formData.get("dancerName") as string;
    const studioName = formData.get("studioName") as string;

    if (!video) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    if (!routineName || !ageGroup || !style || !entryType) {
      return NextResponse.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
      "video/avi",
    ];
    if (!validTypes.includes(video.type) && !video.name.match(/\.(mp4|mov|avi|webm)$/i)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload MP4, MOV, AVI, or WebM." },
        { status: 400 }
      );
    }

    // Validate file size (500MB max)
    const maxSize = 500 * 1024 * 1024;
    if (video.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 500MB." },
        { status: 400 }
      );
    }

    // Create uploads directory
    const uploadsDir = join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique analysis ID
    const analysisId = randomUUID().slice(0, 8);
    const ext = video.name.split(".").pop() || "mp4";
    const filename = `${analysisId}.${ext}`;

    // Save the video file
    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(join(uploadsDir, filename), buffer);

    // Save extracted frames if provided
    const framesJson = formData.get("frames") as string | null;
    const duration = formData.get("duration") as string | null;
    if (framesJson) {
      await writeFile(
        join(uploadsDir, `${analysisId}-frames.json`),
        framesJson
      );
    }

    // Save metadata
    const metadata = {
      analysisId,
      filename,
      routineName,
      ageGroup,
      style,
      entryType,
      dancerName: dancerName || "Unknown",
      studioName: studioName || "Independent",
      fileSize: video.size,
      uploadedAt: new Date().toISOString(),
      status: "processing",
      ...(duration ? { duration } : {}),
    };

    await writeFile(
      join(uploadsDir, `${analysisId}.json`),
      JSON.stringify(metadata, null, 2)
    );

    return NextResponse.json({
      success: true,
      analysisId,
      message: "Video uploaded — analysis starting",
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
