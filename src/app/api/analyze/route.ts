import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { getClaude } from "@/lib/claude";
import { parseAnalysisResponse } from "@/lib/parseAnalysis";
import type { UploadMetadata, ExtractedFrame } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert panel of three dance competition judges analyzing a routine from video frames. You have decades of experience judging at events like StarQuest, Showstopper, NUVO, The Dance Awards, Star Power, JUMP, UCA, and NCA.

You score on a 300-point scale across four categories:
- Technique (max 35 per judge, 3 judges): body alignment, extension, control, turns, leaps, footwork precision, landing mechanics
- Performance (max 35 per judge, 3 judges): stage presence, facial expression, musicality, energy, audience connection, emotional projection
- Choreography (max 20 per judge, 3 judges): creativity, formations, use of space/levels, musical interpretation, dynamics, transitions
- Overall Impression (max 10 per judge, 3 judges): polish, competition-readiness, wow factor, costuming synergy

SCORING CALIBRATION:
- Gold (100-249): Developing skills, notable areas for growth
- High Gold (250-264): Solid foundation, approaching competitive level
- Platinum (265-279): Strong competitive routine, polished execution
- Platinum Star (280-289): Outstanding, top-tier regional competitor
- Titanium (290-300): Elite, national-level excellence

IMPORTANT RULES:
- Vary scores between the three judges slightly (within 1-2 points) to simulate realistic judging panels
- Be honest but constructive in feedback
- Base your analysis ONLY on what you can actually observe in the provided video frames
- Provide specific, actionable feedback referencing moments you can see in the frames
- Distribute timeline notes across the full duration of the routine`;

function buildUserMessage(
  metadata: UploadMetadata,
  frames: ExtractedFrame[],
  duration: string
) {
  return `Analyze this ${metadata.style} ${metadata.entryType} routine titled "${metadata.routineName}" performed by ${metadata.dancerName} in the ${metadata.ageGroup} division from ${metadata.studioName}.

The video is ${duration} long. I am providing ${frames.length} frames extracted at regular intervals throughout the routine.

Based on what you can observe in these frames, provide your detailed competition-style analysis.

For timestamps in timelineNotes, distribute your observations across the full duration of the routine (${duration}). Use formats like "0:00-0:12" for ranges or "1:05" for specific moments.

Respond with ONLY a valid JSON object (no markdown, no code fences) matching this exact schema:
{
  "routineName": "${metadata.routineName}",
  "dancerName": "${metadata.dancerName}",
  "ageGroup": "${metadata.ageGroup}",
  "style": "${metadata.style}",
  "entryType": "${metadata.entryType}",
  "duration": "${duration}",
  "totalScore": <number between 100-300>,
  "judgeScores": [
    {
      "category": "Technique",
      "max": 35,
      "judges": [<judge1_score>, <judge2_score>, <judge3_score>],
      "avg": <average of 3 judges>,
      "feedback": "<detailed technique feedback, 2-3 sentences>"
    },
    {
      "category": "Performance",
      "max": 35,
      "judges": [<judge1_score>, <judge2_score>, <judge3_score>],
      "avg": <average of 3 judges>,
      "feedback": "<detailed performance feedback, 2-3 sentences>"
    },
    {
      "category": "Choreography",
      "max": 20,
      "judges": [<judge1_score>, <judge2_score>, <judge3_score>],
      "avg": <average of 3 judges>,
      "feedback": "<detailed choreography feedback, 2-3 sentences>"
    },
    {
      "category": "Overall Impression",
      "max": 10,
      "judges": [<judge1_score>, <judge2_score>, <judge3_score>],
      "avg": <average of 3 judges>,
      "feedback": "<detailed overall impression feedback, 2-3 sentences>"
    }
  ],
  "timelineNotes": [
    {"time": "<timestamp>", "note": "<observation>", "type": "positive" or "improvement"},
    ... (6-10 notes spread across the routine)
  ],
  "improvementPriorities": [
    {"priority": 1, "item": "<specific improvement>", "impact": "High" or "Medium" or "Low", "timeToFix": "<estimate>"},
    ... (3-5 priorities)
  ],
  "competitionComparison": {
    "yourScore": <same as totalScore>,
    "avgRegional": <realistic regional average for this age/style, typically 255-265>,
    "top10Threshold": <realistic top 10% threshold, typically 278-285>,
    "top5Threshold": <realistic top 5% threshold, typically 285-292>
  }
}`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const uploadsDir = join(process.cwd(), "uploads");

  try {
    const analysisData = await readFile(
      join(uploadsDir, `${id}-analysis.json`),
      "utf-8"
    );
    return NextResponse.json({ status: "analyzed", analysis: JSON.parse(analysisData) });
  } catch {
    // Check if metadata exists at all
    try {
      const metaData = await readFile(join(uploadsDir, `${id}.json`), "utf-8");
      const metadata = JSON.parse(metaData);
      return NextResponse.json({ status: metadata.status || "processing" });
    } catch {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisId } = body;

    if (!analysisId) {
      return NextResponse.json(
        { error: "Missing analysisId" },
        { status: 400 }
      );
    }

    const uploadsDir = join(process.cwd(), "uploads");

    // Check if analysis already exists
    try {
      const existing = await readFile(
        join(uploadsDir, `${analysisId}-analysis.json`),
        "utf-8"
      );
      return NextResponse.json({
        status: "analyzed",
        analysis: JSON.parse(existing),
      });
    } catch {
      // Analysis doesn't exist yet, proceed
    }

    // Read metadata
    let metadata: UploadMetadata;
    try {
      const metaData = await readFile(
        join(uploadsDir, `${analysisId}.json`),
        "utf-8"
      );
      metadata = JSON.parse(metaData);
    } catch {
      return NextResponse.json(
        { error: "Upload metadata not found" },
        { status: 404 }
      );
    }

    // Read frames
    let frames: ExtractedFrame[];
    let duration: number;
    try {
      const framesData = await readFile(
        join(uploadsDir, `${analysisId}-frames.json`),
        "utf-8"
      );
      const parsed = JSON.parse(framesData);
      frames = parsed.frames;
      duration = parsed.duration;
    } catch {
      return NextResponse.json(
        { error: "Video frames not found. Please re-upload the video." },
        { status: 404 }
      );
    }

    const durationStr = formatDuration(duration);

    // Build Claude API request with image content blocks
    const imageBlocks = frames.map((frame) => {
      // dataUrl format: "data:image/jpeg;base64,<data>"
      const base64Data = frame.dataUrl.split(",")[1];
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: "image/jpeg" as const,
          data: base64Data,
        },
      };
    });

    const claude = getClaude();
    const userMessage = buildUserMessage(metadata, frames, durationStr);

    const response = await claude.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            { type: "text" as const, text: userMessage },
          ],
        },
      ],
    });

    // Extract text response
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse and validate the analysis
    const analysis = parseAnalysisResponse(textBlock.text, analysisId);

    // Save analysis results
    await writeFile(
      join(uploadsDir, `${analysisId}-analysis.json`),
      JSON.stringify(analysis, null, 2)
    );

    // Update metadata status
    metadata.status = "analyzed";
    metadata.duration = durationStr;
    await writeFile(
      join(uploadsDir, `${analysisId}.json`),
      JSON.stringify(metadata, null, 2)
    );

    return NextResponse.json({ status: "analyzed", analysis });
  } catch (err) {
    console.error("Analysis error:", err);
    const message =
      err instanceof Error ? err.message : "Analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
