import { NextRequest, NextResponse } from "next/server";
import { unlink, readFile, writeFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  try {
    const { analysisId } = await request.json();

    if (!analysisId) {
      return NextResponse.json(
        { error: "Missing analysisId" },
        { status: 400 }
      );
    }

    const uploadsDir = join(process.cwd(), "uploads");
    const framesPath = join(uploadsDir, `${analysisId}-frames.json`);

    // Verify the frames file exists
    try {
      await readFile(framesPath);
    } catch {
      return NextResponse.json(
        { message: "Frames already deleted", deleted: true },
        { status: 200 }
      );
    }

    // Delete the frames file
    await unlink(framesPath);

    // Update metadata to reflect deletion
    const metaPath = join(uploadsDir, `${analysisId}.json`);
    try {
      const metaData = await readFile(metaPath, "utf-8");
      const metadata = JSON.parse(metaData);
      metadata.framesDeleted = true;
      metadata.framesDeletedAt = new Date().toISOString();
      await writeFile(metaPath, JSON.stringify(metadata, null, 2));
    } catch {
      // Metadata update is non-critical
    }

    return NextResponse.json({
      message: "Frames deleted successfully",
      deleted: true,
      deletedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Delete frames error:", err);
    return NextResponse.json(
      { error: "Failed to delete frames" },
      { status: 500 }
    );
  }
}
