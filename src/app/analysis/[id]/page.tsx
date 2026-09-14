import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isSeasonMember } from "@/lib/practice-plan";
import AnalysisReport from "./AnalysisReport";
import type { Milestone } from "@/components/MilestoneCelebration";

function formatDurationFromSeconds(seconds: number | undefined): string {
  if (!seconds || !isFinite(seconds)) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Fallback for when no analysis data exists
function generateFallbackAnalysis(id: string) {
  return {
    id,
    routineName: "Routine",
    dancerName: "Dancer",
    ageGroup: "—",
    style: "—",
    entryType: "—",
    duration: "—",
    totalScore: 0,
    awardLevel: "Pending",
    judgeScores: [
      { category: "Technique", max: 35, judges: [0, 0, 0], avg: 0, feedback: "Analysis not yet available. Please re-upload your routine." },
      { category: "Performance", max: 35, judges: [0, 0, 0], avg: 0, feedback: "Analysis not yet available." },
      { category: "Choreography", max: 20, judges: [0, 0, 0], avg: 0, feedback: "Analysis not yet available." },
      { category: "Overall Impression", max: 10, judges: [0, 0, 0], avg: 0, feedback: "Analysis not yet available." },
    ],
    timelineNotes: [],
    improvementPriorities: [],
    competitionComparison: { yourScore: 0, avgRegional: 261, top10Threshold: 282, top5Threshold: 288 },
  };
}

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Use service client for data reads (bypasses RLS issues)
  const serviceClient = await createServiceClient();

  // Fetch the video record
  const { data: video } = await serviceClient
    .from("videos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  let analysisData;

  if (video) {
    if (video.status !== "analyzed") {
      redirect(`/processing/${id}`);
    }

    // Fetch analysis separately
    const { data: analysis } = await serviceClient
      .from("analyses")
      .select("*")
      .eq("video_id", video.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (analysis) {
      const preprocessMeta = video.preprocessing_metadata as Record<string, unknown> | null;
      const durationFormatted =
        (preprocessMeta?.durationFormatted as string) ||
        formatDurationFromSeconds(preprocessMeta?.duration as number | undefined);

      // Detect if analysis was done by AI or simulated
      const analysisMethod = (preprocessMeta?.analyzedWithAI === true) ? "ai" as const : "simulated" as const;

      // Build signed URLs for saved frames
      const rawFrames = (preprocessMeta?.frames ?? []) as Array<{ timestamp: number; label: string; path: string }>;
      const frameUrls: Array<{ timestamp: number; label: string; url: string }> = [];
      for (const f of rawFrames) {
        const { data } = await serviceClient.storage
          .from("videos")
          .createSignedUrl(f.path, 60 * 60); // 1 hour
        if (data?.signedUrl) {
          frameUrls.push({ timestamp: f.timestamp, label: f.label, url: data.signedUrl });
        }
      }

      analysisData = {
        practicePlanStatus: "none" as string,
        isSeasonMember: false as boolean,
        showReviewPrompt: false as boolean,
        milestones: [] as Milestone[],
        shareLine: "" as string,
        id: video.id,
        routineName: video.routine_name,
        dancerName: video.dancer_name || "Dancer",
        ageGroup: video.age_group,
        style: video.style,
        entryType: video.entry_type,
        duration: durationFormatted,
        totalScore: analysis.total_score,
        awardLevel: analysis.award_level,
        judgeScores: analysis.judge_scores,
        timelineNotes: analysis.timeline_notes,
        improvementPriorities: analysis.improvement_priorities,
        competitionComparison: analysis.competition_comparison,
        progression: analysis.progression ?? null,
        analysisMethod,
        frames: frameUrls,
      };

      // Practice Plan upsell state
      const { data: planRow } = await serviceClient
        .from("practice_plans")
        .select("status")
        .eq("video_id", video.id)
        .maybeSingle();
      analysisData.practicePlanStatus = planRow?.status ?? "none";
      analysisData.isSeasonMember =
        user.email === (process.env.ADMIN_EMAIL || "22tucker22@comcast.net") ||
        (await isSeasonMember(serviceClient, user.id));

      // One-time "rate your report" prompt — only if this account has never answered it.
      const { data: reviewRow } = await serviceClient
        .from("review_prompts")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      analysisData.showReviewPrompt = !reviewRow;

      // ── Milestone celebrations ──────────────────────────────────────────
      // Highest-value first; the client shows the first one this account
      // hasn't already seen and then burns it. Each carries exactly one ask.
      const { count: analyzedCount } = await serviceClient
        .from("videos")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "analyzed");

      const totalAnalyses = analyzedCount ?? 1;
      const progression = analysisData.progression as
        | { isPersonalBest?: boolean; submissionNumber?: number; awardLevelChanged?: boolean; direction?: string; totalDelta?: number; baselineAwardLevel?: string }
        | null;
      const award = String(analysisData.awardLevel || "");
      const dancer = analysisData.dancerName || "Our dancer";
      const milestones: Milestone[] = [];

      if (/diamond/i.test(award)) {
        milestones.push({
          key: "diamond_first",
          eyebrow: "Top of the board",
          title: "That's a Diamond.",
          stat: `${analysisData.totalScore}/300`,
          body: `Only the cleanest routines land here. ${dancer} earned every point of it.`,
          ask: "review",
        });
      }

      if (progression?.awardLevelChanged && progression.direction === "up") {
        milestones.push({
          key: "award_level_up",
          eyebrow: "Level up",
          title: `${progression.baselineAwardLevel || "Last time"} → ${award}`,
          stat: progression.totalDelta ? `+${progression.totalDelta} pts` : undefined,
          body: "A whole award level, on the same routine. That's not luck — that's the work showing up.",
          ask: "share",
        });
      }

      if (progression?.isPersonalBest && (progression.submissionNumber ?? 1) > 1) {
        milestones.push({
          key: "personal_best",
          eyebrow: "Personal best",
          title: `${dancer}'s highest score yet.`,
          stat: `${analysisData.totalScore}/300`,
          body: "Every rep between those two uploads is in this number. Go tell somebody.",
          ask: "share",
        });
      }

      if (totalAnalyses >= 3) {
        milestones.push({
          key: "three_analyses",
          eyebrow: "Three routines in",
          title: "You're running a real season.",
          body: "Most parents stop at one. You're tracking progress like a coach does.",
          ask: "refer",
        });
      }

      if (totalAnalyses === 1) {
        milestones.push({
          key: "first_report",
          eyebrow: "Your first report",
          title: "Three judges just scored your routine.",
          body: "Before you close it — what's the one thing in here you didn't expect?",
          ask: "feedback",
        });
      }

      // Drop the ones this account has already celebrated.
      const { data: seenRows } = milestones.length
        ? await serviceClient
            .from("milestone_events")
            .select("milestone_key")
            .eq("user_id", user.id)
            .in("milestone_key", milestones.map((m) => m.key))
        : { data: [] as { milestone_key: string }[] };

      const seen = new Set((seenRows ?? []).map((r) => r.milestone_key));
      const unseen = milestones.filter((m) => !seen.has(m.key));

      analysisData.milestones = unseen;
      analysisData.shareLine = `${dancer} scored ${analysisData.totalScore}/300 — ${award}`;

      // One popup per report. A celebration outranks the star prompt — the
      // review ask will still be waiting on the next report, it never expires.
      if (unseen.length) analysisData.showReviewPrompt = false;
    } else {
      analysisData = generateFallbackAnalysis(id);
    }
  } else {
    analysisData = generateFallbackAnalysis(id);
  }

  return <AnalysisReport analysis={analysisData} />;
}
