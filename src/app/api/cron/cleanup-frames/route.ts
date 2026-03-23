import { NextResponse } from "next/server";
import { readdir, readFile, unlink, stat, writeFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

// Called by Vercel Cron to auto-delete frames older than 24 hours
export async function GET() {
  try {
    const uploadsDir = join(process.cwd(), "uploads");
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in ms
    let deletedCount = 0;
    let errorCount = 0;

    let files: string[];
    try {
      files = await readdir(uploadsDir);
    } catch {
      return NextResponse.json({
        message: "No uploads directory found",
        deleted: 0,
      });
    }

    const frameFiles = files.filter((f) => f.endsWith("-frames.json"));

    for (const file of frameFiles) {
      try {
        const filePath = join(uploadsDir, file);
        const fileStat = await stat(filePath);
        const age = now - fileStat.mtimeMs;

        if (age > maxAge) {
          await unlink(filePath);
          deletedCount++;

          // Update corresponding metadata
          const analysisId = file.replace("-frames.json", "");
          const metaPath = join(uploadsDir, `${analysisId}.json`);
          try {
            const metaData = await readFile(metaPath, "utf-8");
            const metadata = JSON.parse(metaData);
            metadata.framesDeleted = true;
            metadata.framesDeletedAt = new Date().toISOString();
            metadata.deletedBy = "auto-cleanup";
            await writeFile(metaPath, JSON.stringify(metadata, null, 2));
          } catch {
            // Non-critical
          }
        }
      } catch {
        errorCount++;
      }
    }

    return NextResponse.json({
      message: "Cleanup complete",
      scanned: frameFiles.length,
      deleted: deletedCount,
      errors: errorCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cleanup cron error:", err);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
