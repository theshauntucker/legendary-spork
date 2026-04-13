import { NextRequest, NextResponse } from "next/server";
import { seedStories } from "./seed-data";

export type { SeedStory } from "./seed-data";

export async function GET() {
  return NextResponse.json(seedStories);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, religion, storyBody, anonymous, displayName } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    if (!religion || typeof religion !== "string") {
      return NextResponse.json(
        { error: "Please select a religion or tradition." },
        { status: 400 }
      );
    }

    if (
      !storyBody ||
      typeof storyBody !== "string" ||
      storyBody.trim().length < 50
    ) {
      return NextResponse.json(
        { error: "Story must be at least 50 characters long." },
        { status: 400 }
      );
    }

    if (!anonymous && (!displayName || displayName.trim().length === 0)) {
      return NextResponse.json(
        { error: "Please provide a display name or choose to share anonymously." },
        { status: 400 }
      );
    }

    // Log to console (placeholder until Supabase)
    console.log("[stories] New story submission:", {
      title: title.trim(),
      religion,
      bodyLength: storyBody.trim().length,
      anonymous,
      displayName: anonymous ? null : displayName?.trim(),
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message:
          "Thank you for sharing your story. It will be reviewed and published soon.",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
