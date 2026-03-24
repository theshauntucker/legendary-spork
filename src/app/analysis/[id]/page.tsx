import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import AnalysisReport from "./AnalysisReport";

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

      // Fetch competition scores for this analysis
      const { data: competitionScores } = await serviceClient
        .from("competition_scores")
        .select("*")
        .eq("analysis_id", analysis.id)
        .eq("user_id", user.id)
        .order("competition_date", { ascending: false });

      // Fetch score history for this dancer+routine
      const { data: historyVideos } = await serviceClient
        .from("videos")
        .select("id, routine_name, dancer_name, style, created_at, analyses!inner(id, total_score, award_level, created_at)")
        .eq("user_id", user.id)
        .eq("status", "analyzed")
        .eq("dancer_name", video.dancer_name || "")
        .order("created_at", { ascending: true });

      const scoreHistory = (historyVideos || []).map((v: Record<string, unknown>) => {
        const analyses = v.analyses as Array<Record<string, unknown>>;
        const a = analyses[0];
        return {
          videoId: v.id as string,
          analysisId: a.id as string,
          totalScore: a.total_score as number,
          awardLevel: a.award_level as string,
          date: v.created_at as string,
          routineName: v.routine_name as string,
        };
      });

      analysisData = {
        id: video.id,
        analysisRecordId: analysis.id,
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
        analysisMethod,
        frames: frameUrls,
        competitionScores: competitionScores || [],
        scoreHistory,
      };
    } else {
      analysisData = generateFallbackAnalysis(id);
    }
  } else {
    analysisData = generateFallbackAnalysis(id);
  }

  return <AnalysisReport analysis={analysisData} />;
}
