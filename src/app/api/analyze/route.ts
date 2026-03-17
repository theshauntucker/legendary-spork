import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUserCredits, useCredit } from "@/lib/credits";

export const maxDuration = 300; // 5 min max for AI analysis

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

    // Format duration from seconds
    const durationStr = formatDuration(metadata.duration);

    // Build the analysis using Claude Vision
    const { analysis, usedAI } = await analyzeWithClaude(frames, metadata, durationStr);

    // Save key frames to storage for the analysis report
    const frameUrls = await saveFramesToStorage(
      serviceClient,
      frames,
      user.id,
      video.id
    );

    // Save analysis to database
    const { data: analysisRecord, error: analysisError } = await serviceClient
      .from("analyses")
      .insert({
        video_id: video.id,
        user_id: user.id,
        total_score: analysis.totalScore,
        award_level: analysis.awardLevel,
        judge_scores: analysis.judgeScores,
        timeline_notes: analysis.timelineNotes,
        improvement_priorities: analysis.improvementPriorities,
        competition_comparison: analysis.competitionComparison,
      })
      .select("id")
      .single();

    if (analysisError || !analysisRecord) {
      console.error("Analysis insert error:", analysisError);
      await serviceClient
        .from("videos")
        .update({ status: "error" })
        .eq("id", video.id);
      return NextResponse.json(
        { error: "Failed to save analysis" },
        { status: 500 }
      );
    }

    // Update video as analyzed
    await serviceClient
      .from("videos")
      .update({
        status: "analyzed",
        analysis_id: analysisRecord.id,
        preprocessing_metadata: {
          frameCount: frames.length,
          duration: metadata.duration,
          durationFormatted: durationStr,
          resolution: metadata.resolution,
          analyzedAt: new Date().toISOString(),
          analyzedWithAI: usedAI,
          frames: frameUrls,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", video.id);

    // Deduct one credit after successful analysis
    await useCredit(serviceClient, user.id, user.email);

    return NextResponse.json({
      success: true,
      videoId: video.id,
      analysisId: analysisRecord.id,
    });
  } catch (err) {
    console.error("Analyze route error:", err);
    return NextResponse.json(
      { error: "Something went wrong during analysis" },
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
 * Send frames to Claude Vision API and get a structured dance analysis.
 */
async function analyzeWithClaude(
  frames: FrameInput[],
  metadata: RoutineMetadata,
  durationStr: string
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not set — using simulated analysis");
    return { analysis: generateSimulatedAnalysis(frames, metadata, durationStr), usedAI: false };
  }

  // Select a subset of frames if we have too many (Claude has image limits)
  const maxFrames = 20;
  const selectedFrames =
    frames.length <= maxFrames
      ? frames
      : selectEvenlySpaced(frames, maxFrames);

  // Build Claude message content with frames
  const content: Array<
    | { type: "text"; text: string }
    | { type: "image"; source: { type: "base64"; media_type: "image/jpeg"; data: string } }
  > = [];

  // System context about the routine
  content.push({
    type: "text",
    text: `You are an expert competitive dance judge analyzing a ${metadata.style} ${metadata.entryType} routine.

ROUTINE DETAILS:
- Routine Name: "${metadata.routineName}"
- Performer: ${metadata.dancerName || "Not specified"}
- Studio: ${metadata.studioName || "Not specified"}
- Age Division: ${metadata.ageGroup}
- Style: ${metadata.style}
- Entry Type: ${metadata.entryType}
- Total Duration: ${durationStr}

You will be shown ${selectedFrames.length} frames extracted from this routine at specific timestamps. Analyze each frame carefully for:
- Technique (body placement, alignment, extension, turnout, flexibility, strength)
- Performance quality (facial expression, energy, projection, musicality cues)
- Choreography (use of space, levels, formations, transitions visible between frames)
- Overall polish and competition readiness

IMPORTANT: Only reference timestamps that correspond to the actual frames shown. The video is ${durationStr} long — do NOT reference times beyond this duration.

Here are the frames:`,
  });

  // Add each frame with its timestamp
  for (const frame of selectedFrames) {
    content.push({
      type: "text",
      text: `\n--- Frame at ${frame.label} (${frame.timestamp.toFixed(1)}s) ---`,
    });
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: frame.base64,
      },
    });
  }

  // Request structured analysis
  content.push({
    type: "text",
    text: `
Now provide your complete analysis as a JSON object with EXACTLY this structure. Be specific and accurate — reference only what you actually see in the frames. Use the REAL timestamps from the frames shown above.

{
  "totalScore": <number 260-300>,
  "awardLevel": "<Gold|High Gold|Platinum|Diamond>",
  "judgeScores": [
    {
      "category": "Technique",
      "max": 35,
      "judges": [<judge1 score>, <judge2 score>, <judge3 score>],
      "avg": <average>,
      "feedback": "<2-3 sentences about what you specifically observe in the technique>"
    },
    {
      "category": "Performance",
      "max": 35,
      "judges": [<j1>, <j2>, <j3>],
      "avg": <avg>,
      "feedback": "<2-3 sentences about performance quality you observe>"
    },
    {
      "category": "Choreography",
      "max": 20,
      "judges": [<j1>, <j2>, <j3>],
      "avg": <avg>,
      "feedback": "<2-3 sentences about choreographic elements visible>"
    },
    {
      "category": "Overall Impression",
      "max": 10,
      "judges": [<j1>, <j2>, <j3>],
      "avg": <avg>,
      "feedback": "<1-2 sentences overall assessment>"
    }
  ],
  "timelineNotes": [
    {
      "time": "<REAL timestamp from the frames, e.g. '0:05' or '0:10-0:15'>",
      "note": "<specific observation about what you see at this moment>",
      "type": "<positive|improvement>"
    }
  ],
  "improvementPriorities": [
    {
      "priority": 1,
      "item": "<specific improvement based on what you observed>",
      "impact": "<High|Medium|Low>",
      "timeToFix": "<realistic estimate>"
    }
  ],
  "competitionComparison": {
    "yourScore": <same as totalScore>,
    "avgRegional": <estimated regional average for this age/style>,
    "top10Threshold": <estimated top 10% threshold>,
    "top5Threshold": <estimated top 5% threshold>
  }
}

SCORING GUIDELINES:
- Gold: 260-269
- High Gold: 270-279
- Platinum: 280-289
- Diamond: 290-300

- Technique (max 35): Body placement, alignment, extension, turnout, flexibility, strength, control
- Performance (max 35): Projection, energy, musicality, facial expression, stage presence, emotional connection
- Choreography (max 20): Creativity, musicality, use of space/levels, transitions, difficulty
- Overall Impression (max 10): Polish, professionalism, memorability, competition readiness

Provide 6-10 timeline notes using ONLY timestamps from the frames you were shown.
Provide 3-5 improvement priorities based on what you actually observe.

Return ONLY the JSON object, no other text.`,
  });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Claude API error:", response.status, errorData);
      throw new Error(`Claude API returned ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;

    if (!text) {
      throw new Error("Empty response from Claude");
    }

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from Claude response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (
      typeof analysis.totalScore !== "number" ||
      !analysis.judgeScores ||
      !analysis.timelineNotes
    ) {
      throw new Error("Invalid analysis structure from Claude");
    }

    // Ensure award level is correct based on score
    analysis.awardLevel = getAwardLevel(analysis.totalScore);

    return { analysis, usedAI: true };
  } catch (err) {
    console.error("Claude Vision analysis failed:", err);
    // Fall back to simulated analysis if Claude fails
    console.warn("Falling back to simulated analysis");
    return { analysis: generateSimulatedAnalysis(frames, metadata, durationStr), usedAI: false };
  }
}

function getAwardLevel(score: number): string {
  if (score >= 290) return "Diamond";
  if (score >= 280) return "Platinum";
  if (score >= 270) return "High Gold";
  return "Gold";
}

function selectEvenlySpaced<T>(arr: T[], count: number): T[] {
  if (arr.length <= count) return arr;
  const step = (arr.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => arr[Math.round(i * step)]);
}

/**
 * Fallback: Generate analysis based on real frame timestamps
 * when Claude API key is not configured.
 */
function generateSimulatedAnalysis(
  frames: FrameInput[],
  metadata: RoutineMetadata,
  durationStr: string
) {
  // Use actual frame timestamps for timeline notes
  const timelineFrames = selectEvenlySpaced(frames, 8);

  const seed =
    metadata.routineName.charCodeAt(0) +
    (metadata.routineName.charCodeAt(1) || 0);
  const v = (base: number, range: number) =>
    Math.round((base + ((seed % range) - range / 2) * 0.1) * 10) / 10;

  const totalScore = v(274, 20);

  const timelineTemplates = [
    { note: `Opening position — energy and stage presence`, type: "positive" },
    { note: `${metadata.style} technique visible — check alignment`, type: "improvement" },
    { note: `Strong movement quality and musicality`, type: "positive" },
    { note: `Transition — maintain energy through phrase changes`, type: "improvement" },
    { note: `Good use of space and levels`, type: "positive" },
    { note: `Watch extension and follow-through`, type: "improvement" },
    { note: `Dynamic moment — strong execution`, type: "positive" },
    { note: `Ending — solid final position`, type: "positive" },
  ];

  return {
    totalScore,
    awardLevel: getAwardLevel(totalScore),
    judgeScores: [
      {
        category: "Technique",
        max: 35,
        judges: [v(32.5, 10), v(31.0, 10), v(33.0, 10)],
        avg: v(32.2, 10),
        feedback: `Foundational technique shows solid training. Body placement and alignment are generally consistent throughout the ${metadata.style.toLowerCase()} choreography. Focus on extension and clean lines in transitions.`,
      },
      {
        category: "Performance",
        max: 35,
        judges: [v(33.0, 10), v(32.5, 10), v(34.0, 10)],
        avg: v(33.2, 10),
        feedback: `Stage presence is engaging with authentic connection to the movement. Energy level is mostly sustained throughout the ${durationStr} routine. Facial expressions support the choreographic intent.`,
      },
      {
        category: "Choreography",
        max: 20,
        judges: [v(18.5, 8), v(17.5, 8), v(19.0, 8)],
        avg: v(18.3, 8),
        feedback: `Well-structured ${metadata.entryType.toLowerCase()} routine with clear narrative arc. Effective use of space and levels. Music interpretation is thoughtful with room for more dynamic contrast.`,
      },
      {
        category: "Overall Impression",
        max: 10,
        judges: [v(9.0, 4), v(8.5, 4), v(9.5, 4)],
        avg: v(9.0, 4),
        feedback: `A polished, competition-ready ${metadata.entryType.toLowerCase()} performance. ${metadata.dancerName || "The performer"} demonstrates maturity and artistry appropriate for the ${metadata.ageGroup} division.`,
      },
    ],
    timelineNotes: timelineFrames.map((frame, i) => ({
      time: frame.label,
      note: timelineTemplates[i % timelineTemplates.length].note,
      type: timelineTemplates[i % timelineTemplates.length].type,
    })),
    improvementPriorities: [
      { priority: 1, item: "Extension and line quality in transitions", impact: "High", timeToFix: "2-3 weeks" },
      { priority: 2, item: "Energy consistency throughout full routine", impact: "High", timeToFix: "1-2 weeks" },
      { priority: 3, item: "Dynamic contrast between sections", impact: "Medium", timeToFix: "2-3 rehearsals" },
      { priority: 4, item: "Musicality detail in accents and phrasing", impact: "Medium", timeToFix: "1 rehearsal" },
      { priority: 5, item: "Stage presence projection to back of room", impact: "Medium", timeToFix: "Ongoing" },
    ],
    competitionComparison: {
      yourScore: totalScore,
      avgRegional: 261,
      top10Threshold: 282,
      top5Threshold: 288,
    },
  };
}

/**
 * Save a subset of key frames to Supabase Storage so they can be
 * displayed alongside the AI's timeline notes on the analysis report.
 * Returns an array of { timestamp, label, path } objects.
 */
async function saveFramesToStorage(
  serviceClient: ReturnType<typeof createServiceClient> extends Promise<infer T> ? T : never,
  frames: FrameInput[],
  userId: string,
  videoId: string
): Promise<Array<{ timestamp: number; label: string; path: string }>> {
  // Select up to 10 evenly-spaced frames for the report
  const selected = selectEvenlySpaced(frames, 10);
  const results: Array<{ timestamp: number; label: string; path: string }> = [];

  for (const frame of selected) {
    try {
      // Convert base64 to buffer
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
