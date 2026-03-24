import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { useCredit } from "@/lib/credits";
import { STYLE_CRITERIA, ENTRY_TYPE_CRITERIA, getCompetitionContext } from "@/lib/dance-criteria";
import { notifyAnalysisComplete, notifyAnalysisError } from "@/lib/notifications";
import { checkAndGrantAchievements } from "@/lib/achievements";

export const maxDuration = 300; // 5 min max for AI analysis

interface FrameData {
  timestamp: number;
  label: string;
  base64: string;
}

interface PreprocessingMetadata {
  frameCount: number;
  duration: number;
  durationFormatted: string;
  resolution: string;
  frames: Array<{ timestamp: number; label: string; path: string }>;
}

export async function POST(request: NextRequest) {
  let videoId: string | undefined;
  let userId: string | undefined;

  try {
    const body = await request.json();
    videoId = body.videoId;
    userId = body.userId;

    if (!videoId || !userId) {
      return NextResponse.json({ error: "Missing videoId or userId" }, { status: 400 });
    }

    const serviceClient = await createServiceClient();

    // Idempotency: if analysis already exists for this video, return early
    const { data: existingAnalysis } = await serviceClient
      .from("analyses")
      .select("id")
      .eq("video_id", videoId)
      .maybeSingle();

    if (existingAnalysis) {
      return NextResponse.json({ success: true, analysisId: existingAnalysis.id });
    }

    // Load video record with all metadata from DB
    const { data: video, error: videoError } = await serviceClient
      .from("videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (videoError || !video) {
      console.error("Video not found:", videoError);
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const meta = video.preprocessing_metadata as PreprocessingMetadata | null;
    if (!meta?.frames || meta.frames.length === 0) {
      console.error("No frames in preprocessing_metadata for video:", videoId);
      await markVideoError(serviceClient, videoId);
      return NextResponse.json({ error: "No frames available" }, { status: 400 });
    }

    // Download frames from Supabase storage
    const frames = await downloadFramesFromStorage(serviceClient, meta.frames);

    if (frames.length === 0) {
      console.error("All frame downloads failed for video:", videoId);
      await markVideoError(serviceClient, videoId);
      return NextResponse.json({ error: "Failed to download frames" }, { status: 500 });
    }

    // Build routine metadata from DB record
    const routineMetadata = {
      routineName: video.routine_name || "Untitled",
      dancerName: video.dancer_name || undefined,
      studioName: video.studio_name || undefined,
      ageGroup: video.age_group || "Senior (15-19)",
      style: video.style || "Contemporary",
      entryType: video.entry_type || "Solo",
      duration: meta.duration,
      resolution: meta.resolution || "unknown",
      originalFilename: video.filename || "video",
      originalFileSize: video.file_size || 0,
    };

    const durationStr = meta.durationFormatted || formatDuration(meta.duration);

    // Fetch historical analyses for the same routine+dancer (for contextual feedback)
    const historicalContext = await getHistoricalContext(
      serviceClient,
      userId,
      video.routine_name,
      video.dancer_name,
      videoId
    );

    // Run the AI analysis
    const { analysis, usedAI } = await analyzeWithClaude(frames, routineMetadata, durationStr, historicalContext);

    // Save analysis to database
    const { data: analysisRecord, error: analysisError } = await serviceClient
      .from("analyses")
      .insert({
        video_id: videoId,
        user_id: userId,
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
      await markVideoError(serviceClient, videoId);
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
    }

    // Update video as analyzed
    await serviceClient
      .from("videos")
      .update({
        status: "analyzed",
        analysis_id: analysisRecord.id,
        preprocessing_metadata: {
          ...meta,
          analyzedAt: new Date().toISOString(),
          analyzedWithAI: usedAI,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", videoId);

    // Analysis delivered successfully — NOW deduct the credit
    try {
      await useCredit(serviceClient, userId);
    } catch (creditErr) {
      console.error("Failed to deduct credit (analysis still saved):", creditErr);
    }

    // Check and grant achievements (non-blocking)
    checkAndGrantAchievements(
      serviceClient,
      userId,
      video.dancer_name,
      { totalScore: analysis.totalScore, awardLevel: analysis.awardLevel }
    ).catch((err) => console.warn("Achievement check failed:", err));

    // Notify admin of completed analysis
    const userEmail = video.user_id ? (await serviceClient.auth.admin.getUserById(userId)).data.user?.email || "unknown" : "unknown";
    notifyAnalysisComplete(
      userEmail,
      video.routine_name || "Untitled",
      video.style || "Unknown",
      analysis.totalScore,
      analysis.awardLevel
    ).catch(() => {});

    return NextResponse.json({ success: true, analysisId: analysisRecord.id });
  } catch (err) {
    console.error("Process route error:", err);

    // Notify admin of error
    notifyAnalysisError(
      "unknown",
      err instanceof Error ? err.message : String(err),
      `videoId: ${videoId}`
    ).catch(() => {});

    // Mark the video as error (no credit was deducted, so no refund needed)
    if (videoId) {
      try {
        const serviceClient = await createServiceClient();
        await markVideoError(serviceClient, videoId);
      } catch (updateErr) {
        console.error("Failed to mark video as error:", updateErr);
      }
    }

    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}

async function markVideoError(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  videoId: string
) {
  await serviceClient
    .from("videos")
    .update({ status: "error", updated_at: new Date().toISOString() })
    .eq("id", videoId);
}

/**
 * Download frame images from Supabase storage and convert to base64.
 */
async function downloadFramesFromStorage(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  storedFrames: Array<{ timestamp: number; label: string; path: string }>
): Promise<FrameData[]> {
  const frames: FrameData[] = [];

  // Download in parallel batches of 5 for speed
  const batchSize = 5;
  for (let i = 0; i < storedFrames.length; i += batchSize) {
    const batch = storedFrames.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (frame) => {
        const { data, error } = await serviceClient.storage
          .from("videos")
          .download(frame.path);

        if (error || !data) {
          console.warn(`Failed to download frame ${frame.path}:`, error);
          return null;
        }

        const buffer = Buffer.from(await data.arrayBuffer());
        return {
          timestamp: frame.timestamp,
          label: frame.label,
          base64: buffer.toString("base64"),
        };
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        frames.push(result.value);
      }
    }
  }

  return frames;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface HistoricalAnalysis {
  date: string;
  totalScore: number;
  awardLevel: string;
  judgeScores: Array<{ category: string; avg: number; max: number }>;
  topImprovements: string[];
}

/**
 * Fetch past analyses for the same routine+dancer combo to provide context.
 */
async function getHistoricalContext(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  userId: string,
  routineName: string | null,
  dancerName: string | null,
  currentVideoId: string
): Promise<HistoricalAnalysis[]> {
  if (!routineName) return [];

  try {
    let query = serviceClient
      .from("videos")
      .select("id, routine_name, created_at, analyses!inner(total_score, award_level, judge_scores, improvement_priorities, created_at)")
      .eq("user_id", userId)
      .eq("routine_name", routineName)
      .eq("status", "analyzed")
      .neq("id", currentVideoId)
      .order("created_at", { ascending: false })
      .limit(3);

    if (dancerName) {
      query = query.eq("dancer_name", dancerName);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) return [];

    return data.map((v: Record<string, unknown>) => {
      const analyses = v.analyses as Array<Record<string, unknown>>;
      const a = analyses[0];
      const judgeScores = (a.judge_scores as Array<{ category: string; avg: number; max: number }>) || [];
      const improvements = (a.improvement_priorities as Array<{ item: string }>) || [];

      return {
        date: new Date(v.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        totalScore: a.total_score as number,
        awardLevel: a.award_level as string,
        judgeScores: judgeScores.map((js) => ({ category: js.category, avg: js.avg, max: js.max })),
        topImprovements: improvements.slice(0, 3).map((imp) => imp.item),
      };
    });
  } catch (err) {
    console.warn("Failed to fetch historical context:", err);
    return [];
  }
}

/**
 * Send frames to Claude Vision API and get a structured dance analysis.
 */
async function analyzeWithClaude(
  frames: FrameData[],
  metadata: {
    routineName: string;
    dancerName?: string;
    studioName?: string;
    ageGroup: string;
    style: string;
    entryType: string;
    duration: number;
    resolution: string;
    originalFilename: string;
    originalFileSize: number;
  },
  durationStr: string,
  historicalContext: HistoricalAnalysis[] = []
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

  // Resolve style-specific and entry-type-specific criteria
  const styleCriteria = STYLE_CRITERIA[metadata.style] || STYLE_CRITERIA["Jazz"];
  const entryTypeCriteria = ENTRY_TYPE_CRITERIA[metadata.entryType] || ENTRY_TYPE_CRITERIA["Solo"];
  const competitionContext = getCompetitionContext(metadata.ageGroup, metadata.style, metadata.entryType);
  const isGroupEntry = entryTypeCriteria.additionalMetrics.length > 0;

  content.push({
    type: "text",
    text: `You are an expert competitive dance judge specializing in ${metadata.style}.

STYLE CONTEXT:
${styleCriteria.styleDefinition}

For ${metadata.style} routines, judges specifically evaluate:
- Technique: ${styleCriteria.techniqueEmphasis.join(", ")}
- Performance: ${styleCriteria.performanceEmphasis.join(", ")}
- Choreography: ${styleCriteria.choreographyEmphasis.join(", ")}

Common deductions in ${metadata.style}: ${styleCriteria.commonDeductions.join("; ")}

Use this vocabulary in your feedback: ${styleCriteria.judgeVocabulary.join(", ")}

ROUTINE DETAILS:
- Routine Name: "[ROUTINE]"
- Performer: [PERFORMER]
- Studio: [STUDIO]
- Age Division: ${metadata.ageGroup}
- Style: ${metadata.style}
- Entry Type: ${metadata.entryType}
- Total Duration: ${durationStr}
${isGroupEntry ? `
ENTRY TYPE CONSIDERATIONS (${metadata.entryType}):
In addition to individual merit, evaluate:
${entryTypeCriteria.additionalMetrics.map((m) => `- ${m}`).join("\n")}
${entryTypeCriteria.scoringNotes}
` : `
ENTRY TYPE NOTE: ${entryTypeCriteria.scoringNotes}
`}
${historicalContext.length > 0 ? `
HISTORICAL CONTEXT — PROGRESS TRACKING:
This dancer has ${historicalContext.length} previous analysis(es) for this same routine.
${historicalContext.map((h, i) => `
Previous Analysis #${i + 1} (${h.date}):
- Total Score: ${h.totalScore}/300 (${h.awardLevel})
${h.judgeScores.map((js) => `- ${js.category}: ${js.avg}/${js.max}`).join("\n")}
- Top improvements suggested: ${h.topImprovements.join("; ") || "N/A"}
`).join("")}
IMPORTANT: When providing feedback, REFERENCE the previous scores specifically. For example: "Your technique score has improved from X to Y since [date]" or "The [issue] noted in your previous analysis appears to be addressed." Be specific about what has changed. This helps the dancer track their progress.
` : ""}
You will be shown ${selectedFrames.length} frames extracted from this routine at specific timestamps. Analyze each frame carefully for:
- Technique: ${styleCriteria.techniqueEmphasis.slice(0, 3).join(", ")}
- Performance quality: ${styleCriteria.performanceEmphasis.slice(0, 3).join(", ")}
- Choreography: ${styleCriteria.choreographyEmphasis.slice(0, 3).join(", ")}
- Overall polish and competition readiness

IMPORTANT: Only reference timestamps that correspond to the actual frames shown. The video is ${durationStr} long — do NOT reference times beyond this duration.

Here are the frames:`,
  });

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
      "feedback": "<4-6 sentences about what you specifically observe in the technique — reference specific frames/moments, name exact body positions, and compare to competition standards>",
      "styleNotes": "<2-3 sentences of ${metadata.style}-specific technique observations using proper style vocabulary — be specific about what's working and what needs attention>"
    },
    {
      "category": "Performance",
      "max": 35,
      "judges": [<j1>, <j2>, <j3>],
      "avg": <avg>,
      "feedback": "<4-6 sentences about performance quality you observe — discuss energy arc, facial expression, stage presence, and audience connection across different moments in the routine>",
      "styleNotes": "<2-3 sentences of ${metadata.style}-specific performance observations — how well do they embody the style's performance demands?>"
    },
    {
      "category": "Choreography",
      "max": 20,
      "judges": [<j1>, <j2>, <j3>],
      "avg": <avg>,
      "feedback": "<4-6 sentences about choreographic elements — discuss structure, musicality, use of space/levels, transitions, and how well the choreography showcases the dancer's strengths>",
      "styleNotes": "<2-3 sentences of ${metadata.style}-specific choreography observations — does the choreography honor the style's traditions and expectations?>"
    },
    {
      "category": "Overall Impression",
      "max": 10,
      "judges": [<j1>, <j2>, <j3>],
      "avg": <avg>,
      "feedback": "<3-4 sentences overall assessment — what makes this routine memorable, what's the biggest opportunity for growth, and what would push it to the next award level>",
      "styleNotes": "<2 sentences on overall ${metadata.style} quality and where this dancer sits relative to their age division>"
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
      "timeToFix": "<realistic estimate>",
      "trainingTip": "<specific drill, exercise, or practice approach to address this — be actionable. Include how many reps, how long to practice, what to focus on. A parent should be able to read this to their dancer and they can immediately start working on it>"
    }
  ],
  "competitionComparison": {
    "yourScore": <same as totalScore>,
    "avgRegional": <estimated regional average for this age/style>,
    "top10Threshold": <estimated top 10% threshold>,
    "top5Threshold": <estimated top 5% threshold>,
    "benchmarkContext": "${competitionContext.benchmarkContext}",
    "ageStyleNote": "${competitionContext.ageStyleNote}"
  }
}

SCORING PHILOSOPHY:
Think of yourself as the ENCOURAGING judge on the panel — not the harshest judge, not the most generous, but the one who sees the best in a dancer while still being honest. Your scores should be realistic and comparable to what this dancer would receive at a real regional competition.

SCORING APPROACH:
- Score as a fair but warm-hearted judge would. When a moment is borderline, give the benefit of the doubt.
- Most trained dancers at competitive studios land in High Gold (270-279) to Platinum (280-289). This is normal and expected.
- Gold (260-269) is appropriate when there are real, visible technical gaps — don't avoid it if it's honest.
- Diamond (290+) should be rare and earned — reserve it for truly standout work.
- Parents WILL compare these scores to real competition results. If scores are consistently higher than what judges give at competitions, trust is lost. Aim for scores that feel familiar and credible to an experienced dance parent.

FEEDBACK APPROACH:
- Lead with what the dancer does WELL — be specific and genuine.
- Then address real areas for improvement with actionable, constructive language.
- Frame flaws as growth opportunities: "To push into Platinum range, focus on..." rather than "This was weak."
- Be SPECIFIC — reference what you actually see in the frames. Generic praise is useless.
- The improvement priorities should be the most honest, actionable part of the report. This is where real coaching value lives.

SCORING GUIDELINES:
- Gold: 260-269 (significant issues present)
- High Gold: 270-279 (solid work with clear room to grow)
- Platinum: 280-289 (strong, competition-ready routine)
- Diamond: 290-300 (exceptional, top-tier performance)

- Technique (max 35): ${styleCriteria.techniqueEmphasis.join(", ")}
- Performance (max 35): ${styleCriteria.performanceEmphasis.join(", ")}
- Choreography (max 20): ${styleCriteria.choreographyEmphasis.join(", ")}
- Overall Impression (max 10): Polish, professionalism, memorability, competition readiness

Provide 10-15 timeline notes using ONLY timestamps from the frames you were shown. IMPORTANT: Each timeline note MUST reference a DIFFERENT frame timestamp — never reuse the same timestamp. Spread your observations across the full duration of the routine so each note highlights a distinct moment. Mix positive observations with specific improvement notes — a parent should be able to read through these and feel like a judge was watching every key moment.

Provide 5-7 improvement priorities based on what you actually observe. IMPORTANT: Even for exceptional routines, there is ALWAYS room to grow. Every dancer benefits from specific, actionable feedback. Frame high-scoring improvement items as "to push from Platinum to Diamond" or "to dominate at nationals." There should never be a report that says "nothing to improve." Growth is infinite — that's what keeps great dancers great.

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
        max_tokens: 8192,
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

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from Claude response");
    }

    const rawAnalysis = JSON.parse(jsonMatch[0]);

    // De-anonymize: replace placeholders with real names in all text fields
    const performerName = metadata.dancerName || "Not specified";
    const studioName = metadata.studioName || "Not specified";
    const routineName = metadata.routineName;

    function deAnonymize(obj: unknown): unknown {
      if (typeof obj === "string") {
        return obj
          .replace(/\[PERFORMER\]/g, performerName)
          .replace(/\[STUDIO\]/g, studioName)
          .replace(/\[ROUTINE\]/g, routineName);
      }
      if (Array.isArray(obj)) {
        return obj.map(deAnonymize);
      }
      if (obj && typeof obj === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
          result[key] = deAnonymize(value);
        }
        return result;
      }
      return obj;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analysis = deAnonymize(rawAnalysis) as any;

    if (
      typeof analysis.totalScore !== "number" ||
      !analysis.judgeScores ||
      !analysis.timelineNotes
    ) {
      throw new Error("Invalid analysis structure from Claude");
    }

    // Recalculate award level from AI-returned score (no artificial boost)
    if (analysis.competitionComparison) {
      analysis.competitionComparison.yourScore = analysis.totalScore;
    }
    analysis.awardLevel = getAwardLevel(analysis.totalScore);

    return { analysis, usedAI: true };
  } catch (err) {
    console.error("Claude Vision analysis failed:", err);
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

function generateSimulatedAnalysis(
  frames: FrameData[],
  metadata: { routineName: string; dancerName?: string; studioName?: string; ageGroup: string; style: string; entryType: string },
  durationStr: string
) {
  const timelineFrames = selectEvenlySpaced(frames, 8);

  const seed =
    metadata.routineName.charCodeAt(0) +
    (metadata.routineName.charCodeAt(1) || 0);
  const v = (base: number, range: number) =>
    Math.round((base + ((seed % range) - range / 2) * 0.1) * 10) / 10;

  const totalScore = v(282, 12);

  const styleCriteria = STYLE_CRITERIA[metadata.style] || STYLE_CRITERIA["Jazz"];
  const competitionCtx = getCompetitionContext(metadata.ageGroup, metadata.style, metadata.entryType);
  const styleLC = metadata.style.toLowerCase();

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
        judges: [v(33.5, 6), v(33.0, 6), v(34.0, 6)],
        avg: v(33.5, 6),
        feedback: `Foundational technique shows solid training. Body placement and alignment are generally consistent throughout the ${styleLC} choreography. Focus on extension and clean lines in transitions.`,
        styleNotes: `For ${metadata.style}: ${styleCriteria.techniqueEmphasis[0]} is evident. Continue developing ${styleCriteria.techniqueEmphasis[1]}.`,
      },
      {
        category: "Performance",
        max: 35,
        judges: [v(33.5, 6), v(33.0, 6), v(34.5, 6)],
        avg: v(33.7, 6),
        feedback: `Stage presence is engaging with authentic connection to the movement. Energy level is mostly sustained throughout the ${durationStr} routine. Facial expressions support the choreographic intent.`,
        styleNotes: `For ${metadata.style}: ${styleCriteria.performanceEmphasis[0]} comes through well. Work on ${styleCriteria.performanceEmphasis[1]}.`,
      },
      {
        category: "Choreography",
        max: 20,
        judges: [v(19.0, 4), v(18.5, 4), v(19.5, 4)],
        avg: v(19.0, 4),
        feedback: `Well-structured ${metadata.entryType.toLowerCase()} routine with clear narrative arc. Effective use of space and levels. Music interpretation is thoughtful with room for more dynamic contrast.`,
        styleNotes: `For ${metadata.style}: ${styleCriteria.choreographyEmphasis[0]} is well-executed. Consider exploring ${styleCriteria.choreographyEmphasis[1]}.`,
      },
      {
        category: "Overall Impression",
        max: 10,
        judges: [v(9.5, 2), v(9.0, 2), v(9.5, 2)],
        avg: v(9.3, 2),
        feedback: `A polished, competition-ready ${metadata.entryType.toLowerCase()} performance. ${metadata.dancerName || "The performer"} demonstrates maturity and artistry appropriate for the ${metadata.ageGroup} division.`,
        styleNotes: `Shows strong ${styleLC} foundation with room to deepen ${styleCriteria.judgeVocabulary[0]} and ${styleCriteria.judgeVocabulary[1]}.`,
      },
    ],
    timelineNotes: timelineFrames.map((frame, i) => ({
      time: frame.label,
      note: timelineTemplates[i % timelineTemplates.length].note,
      type: timelineTemplates[i % timelineTemplates.length].type,
    })),
    improvementPriorities: [
      { priority: 1, item: "Extension and line quality in transitions", impact: "High", timeToFix: "2-3 weeks", trainingTip: "Practice slow relevé combinations at the barre, focusing on lengthening through the fingertips and toes. Hold each position for 4 counts." },
      { priority: 2, item: "Energy consistency throughout full routine", impact: "High", timeToFix: "1-2 weeks", trainingTip: "Run the routine 3 times back-to-back in rehearsal to build stamina. Focus on maintaining performance energy even when tired." },
      { priority: 3, item: "Dynamic contrast between sections", impact: "Medium", timeToFix: "2-3 rehearsals", trainingTip: "Mark through the routine identifying 'loud' and 'quiet' moments. Exaggerate the difference between them, then scale back to performance level." },
      { priority: 4, item: "Musicality detail in accents and phrasing", impact: "Medium", timeToFix: "1 rehearsal", trainingTip: "Listen to the music without dancing and mark every accent with a hand clap. Then layer those accents back into the choreography." },
      { priority: 5, item: "Stage presence projection to back of room", impact: "Medium", timeToFix: "Ongoing", trainingTip: "Practice performing to a specific spot on the back wall. Have someone stand at the back of the room and give feedback on what they can see." },
    ],
    competitionComparison: {
      yourScore: totalScore,
      avgRegional: 261,
      top10Threshold: 282,
      top5Threshold: 288,
      benchmarkContext: competitionCtx.benchmarkContext,
      ageStyleNote: competitionCtx.ageStyleNote,
    },
  };
}
