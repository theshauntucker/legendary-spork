import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  // Fetch the video record
  const { data: video } = await supabase
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

    // Fetch analysis separately (more reliable than join)
    const { data: analysis } = await supabase
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

      analysisData = {
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
      };
    } else {
      analysisData = generateFallbackAnalysis(id);
    }
  } else {
    analysisData = generateFallbackAnalysis(id);
  }

  return <AnalysisReport analysis={analysisData} />;
}
