import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { useCredit } from "@/lib/credits";
import { STYLE_CRITERIA, ENTRY_TYPE_CRITERIA, getCompetitionContext } from "@/lib/dance-criteria";
import { notifyAnalysisComplete, notifyAnalysisError } from "@/lib/notifications";

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

// Full routine history for progression-aware analysis
interface SubmissionHistory {
  submissionNumber: number;
  totalScore: number;
  awardLevel: string;
  analyzedAt: string;
  improvementPriorities: Array<{ priority: number; item: string }>;
}

interface ParentAnalysisContext {
  // Most recent submission data (for score boost baseline)
  totalScore: number;
  awardLevel: string;
  analyzedAt: string;
  judgeScores: Array<{ category: string; avg: number; max: number }>;
  improvementPriorities: Array<{ priority: number; item: string }>;
  // Full history across all submissions
  allSubmissions: SubmissionHistory[];
  totalSubmissions: number;
  firstScore: number;
  bestScore: number;
  totalPointsGained: number;
}

export async function POST(request: NextRequest) {
  let videoId: string | undefined;
  let userId: string | undefined;

  try {
    const body = await request.json();
    videoId = body.videoId;
    userId = body.userId;
    const parentVideoId: string | null = body.parentVideoId || null;

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

    // ── Fetch FULL routine history for progression-aware analysis ──────────────
    let parentContext: ParentAnalysisContext | null = null;
    if (parentVideoId) {
      try {
        // Find all analyzed videos with the same routine name for this user
        const { data: siblingVideos } = await serviceClient
          .from("videos")
          .select("id, created_at")
          .eq("user_id", userId)
          .eq("routine_name", video.routine_name)
          .eq("status", "analyzed")
          .neq("id", videoId)
          .order("created_at", { ascending: true });

        if (siblingVideos && siblingVideos.length > 0) {
          const siblingIds = siblingVideos.map(v => v.id);

          // Fetch all analyses for sibling videos
          const { data: allAnalyses } = await serviceClient
            .from("analyses")
            .select("video_id, total_score, award_level, judge_scores, improvement_priorities, created_at")
            .in("video_id", siblingIds)
            .order("created_at", { ascending: true });

          if (allAnalyses && allAnalyses.length > 0) {
            const latestAnalysis = allAnalyses[allAnalyses.length - 1];
            const firstAnalysis = allAnalyses[0];
            const bestScore = Math.max(...allAnalyses.map(a => a.total_score));

            const allSubmissions: SubmissionHistory[] = allAnalyses.map((a, idx) => ({
              submissionNumber: idx + 1,
              totalScore: a.total_score,
              awardLevel: a.award_level,
              analyzedAt: new Date(a.created_at).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              }),
              improvementPriorities: (a.improvement_priorities as Array<{ priority: number; item: string }>)
                .slice(0, 3)
                .map(p => ({ priority: p.priority, item: p.item })),
            }));

            parentContext = {
              totalScore: latestAnalysis.total_score,
              awardLevel: latestAnalysis.award_level,
              analyzedAt: new Date(latestAnalysis.created_at).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              }),
              judgeScores: (latestAnalysis.judge_scores as Array<{ category: string; avg: number; max: number }>)
                .map(s => ({ category: s.category, avg: s.avg, max: s.max })),
              improvementPriorities: (latestAnalysis.improvement_priorities as Array<{ priority: number; item: string }>)
                .slice(0, 3)
                .map(p => ({ priority: p.priority, item: p.item })),
              allSubmissions,
              totalSubmissions: allAnalyses.length,
              firstScore: firstAnalysis.total_score,
              bestScore,
              totalPointsGained: latestAnalysis.total_score - firstAnalysis.total_score,
            };
          }
        }
      } catch (parentErr) {
        // Non-fatal — proceed without parent context if fetch fails
        console.warn("Could not fetch routine history:", parentErr);
      }
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

    // Run the AI analysis (with parent context if available)
    const { analysis, usedAI } = await analyzeWithClaude(frames, routineMetadata, durationStr, parentContext);

    // ── Confidence-building score boost for re-submissions ──────────────────────
    // When a dancer comes back with the same routine, we guarantee their score
    // improves to show progress and build confidence — regardless of AI output.
    if (parentContext && typeof analysis.totalScore === "number") {
      const minProgress = 2;   // Always at least 2 pts above the best ever score
      const extraBoost = Math.floor(Math.random() * 7) + 2; // +2 to +8 extra
      // Use bestScore as baseline — never let a new submission score below their best
      const targetScore = Math.min(
        298,
        Math.max(
          parentContext.bestScore + minProgress,
          analysis.totalScore + extraBoost
        )
      );
      const actualBoost = targetScore - analysis.totalScore;

      if (actualBoost > 0) {
        // Distribute boost evenly across all judge scores
        const judgeCount = analysis.judgeScores?.reduce(
          (sum: number, cat: { judges: number[] }) => sum + (cat.judges?.length || 0), 0
        ) || 9;
        const perJudge = actualBoost / judgeCount;

        if (Array.isArray(analysis.judgeScores)) {
          for (const category of analysis.judgeScores) {
            if (Array.isArray(category.judges)) {
              category.judges = category.judges.map((score: number) =>
                Math.round((score + perJudge) * 10) / 10
              );
              category.avg = Math.round(
                (category.judges.reduce((s: number, j: number) => s + j, 0) /
                  category.judges.length) * 10
              ) / 10;
            }
          }
        }

        analysis.totalScore = targetScore;
        analysis.awardLevel = getAwardLevel(targetScore);
        if (analysis.competitionComparison) {
          analysis.competitionComparison.yourScore = targetScore;
        }
        console.log(`Score boost applied: ${targetScore - actualBoost} → ${targetScore} (+${actualBoost})`);
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

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

    // Notify admin of completed analysis
    const userEmail = video.user_id
      ? (await serviceClient.auth.admin.getUserById(userId)).data.user?.email || "unknown"
      : "unknown";
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

    notifyAnalysisError(
      "unknown",
      err instanceof Error ? err.message : String(err),
      `videoId: ${videoId}`
    ).catch(() => {});

    if (videoId) {
      try {
        const serviceClient = await createServiceClient();
        await markVideoError(serviceClient, videoId);
      } catch (updateErr) {
        console.error("Failed to mark video as error:", updateErr);
      }
    }

    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
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

async function downloadFramesFromStorage(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  storedFrames: Array<{ timestamp: number; label: string; path: string }>
): Promise<FrameData[]> {
  const frames: FrameData[] = [];

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
  parentContext: ParentAnalysisContext | null = null
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not set — using simulated analysis");
    return { analysis: generateSimulatedAnalysis(frames, metadata, durationStr), usedAI: false };
  }

  const maxFrames = 20;
  const selectedFrames =
    frames.length <= maxFrames ? frames : selectEvenlySpaced(frames, maxFrames);

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image"; source: { type: "base64"; media_type: "image/jpeg"; data: string } }
  > = [];

  const styleCriteria = STYLE_CRITERIA[metadata.style] || STYLE_CRITERIA["Jazz"];
  const entryTypeCriteria = ENTRY_TYPE_CRITERIA[metadata.entryType] || ENTRY_TYPE_CRITERIA["Solo"];
  const competitionContext = getCompetitionContext(metadata.ageGroup, metadata.style, metadata.entryType);
  const isGroupEntry = entryTypeCriteria.additionalMetrics.length > 0;

  // ── Build routine history section (only if this is a tracked re-submission) ──
  const routineHistorySection = parentContext
    ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROUTINE HISTORY — SUBMISSION #${parentContext.totalSubmissions + 1}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This dancer has been submitting this routine for ongoing coaching. They have come back ${parentContext.totalSubmissions} time${parentContext.totalSubmissions !== 1 ? "s" : ""} — that commitment and dedication deserves to be celebrated and rewarded.

FULL PROGRESSION HISTORY:
${parentContext.allSubmissions.map(s => `  Submission ${s.submissionNumber} (${s.analyzedAt}): ${s.totalScore}/300 — ${s.awardLevel}
    Working on: ${s.improvementPriorities.map(p => p.item).join(", ")}`).join("\n")}

TRAJECTORY SUMMARY:
  • Started at: ${parentContext.firstScore}/300 (${parentContext.allSubmissions[0]?.awardLevel ?? ""})
  • Best score: ${parentContext.bestScore}/300
  • Total improvement: +${parentContext.totalPointsGained} points over ${parentContext.totalSubmissions} submission${parentContext.totalSubmissions !== 1 ? "s" : ""}

Most Recent Analysis (${parentContext.analyzedAt}):
  Score: ${parentContext.totalScore}/300 (${parentContext.awardLevel})
  Category breakdown: ${parentContext.judgeScores.map(s => `${s.category} ${s.avg}/${s.max}`).join(", ")}
  Was working on: ${parentContext.improvementPriorities.map(p => `${p.priority}. ${p.item}`).join("; ")}

YOUR TASK FOR THIS SUBMISSION #${parentContext.totalSubmissions + 1}:
1. You are their ongoing coach who has watched every submission. Write feedback that references this ENTIRE journey, not just the last one.
2. Be generous and encouraging — this dancer has proven their dedication by coming back repeatedly. Score higher than you would for a first-time submission.
3. In each category's feedback, speak to specific improvements you see over the course of their ${parentContext.totalSubmissions}-submission arc. Name specific things from their history.
4. Frame improvement priorities as the NEXT chapter of their growth — they've already come so far.
5. The dancer and their parent see the full history side-by-side — make this report feel like the continuation of an ongoing coaching relationship.

This dancer has been putting in the work for ${parentContext.totalSubmissions} submission${parentContext.totalSubmissions !== 1 ? "s" : ""}. Every time you analyze them, acknowledge that arc. Make them proud of the journey.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
    : "";

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
${routineHistorySection}
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
      "feedback": "<4-6 sentences about what you specifically observe in the technique — reference specific frames/moments, name exact body positions, and compare to competition standards${parentContext ? ". Also compare to their previous submission and note what has improved." : ""}>",
      "styleNotes": "<2-3 sentences of ${metadata.style}-specific technique observations using proper style vocabulary>"
    },
    {
      "category": "Performance",
      "max": 35,
      "judges": [<j1>, <j2>, <j3>],
      "avg": <avg>,
      "feedback": "<4-6 sentences about performance quality — discuss energy arc, facial expression, stage presence${parentContext ? ". Reference progression from previous submission." : ""}>",
      "styleNotes": "<2-3 sentences of ${metadata.style}-specific performance observations>"
    },
    {
      "category": "Choreography",
      "max": 20,
      "judges": [<j1>, <j2>, <j3>],
      "avg": <avg>,
      "feedback": "<4-6 sentences about choreographic elements — structure, musicality, use of space${parentContext ? ". Note any improvements in choreographic execution since last submission." : ""}>",
      "styleNotes": "<2-3 sentences of ${metadata.style}-specific choreography observations>"
    },
    {
      "category": "Overall Impression",
      "max": 10,
      "judges": [<j1>, <j2>, <j3>],
      "avg": <avg>,
      "feedback": "<3-4 sentences overall assessment${parentContext ? `. Acknowledge this is a re-submission and speak to their growth arc — previous score was ${parentContext.totalScore}/300.` : ""}>",
      "styleNotes": "<2 sentences on overall ${metadata.style} quality and where this dancer sits relative to their age division>"
    }
  ],
  "timelineNotes": [
    {
      "time": "<REAL timestamp from the frames>",
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
      "trainingTip": "<specific drill or exercise — actionable enough that a parent can read it to their dancer and they start immediately>"
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
Think of yourself as the encouraging judge on the panel — not the harshest, not the most generous, but the one who sees the best in a dancer while still being honest. Scores should be realistic and comparable to what this dancer would receive at a real regional competition.

SCORING GUIDELINES:
- Gold: 260-269 (significant issues present)
- High Gold: 270-279 (solid work with clear room to grow)
- Platinum: 280-289 (strong, competition-ready routine)
- Diamond: 290-300 (exceptional, top-tier performance)

- Technique (max 35): ${styleCriteria.techniqueEmphasis.join(", ")}
- Performance (max 35): ${styleCriteria.performanceEmphasis.join(", ")}
- Choreography (max 20): ${styleCriteria.choreographyEmphasis.join(", ")}
- Overall Impression (max 10): Polish, professionalism, memorability, competition readiness

Provide 10-15 timeline notes using ONLY timestamps from the frames shown. Each note MUST reference a DIFFERENT frame — never reuse the same timestamp.

Provide 5-7 improvement priorities based on what you actually observe. Even exceptional routines have room to grow.

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
        model: "claude-opus-4-6",
        max_tokens: 8192,
        messages: [{ role: "user", content }],
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

    // De-anonymize: replace placeholders with real names
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
      if (Array.isArray(obj)) return obj.map(deAnonymize);
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
