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

  // Try to fetch the video and its analysis from the database
  const { data: video } = await supabase
    .from("videos")
    .select("*, analyses(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  let analysisData;

  if (video && video.analyses && video.analyses.length > 0) {
    // Real data from database
    const analysis = video.analyses[0];
    // Get duration from preprocessing metadata, or calculate from timeline notes
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
  } else if (video && video.status !== "analyzed") {
    // Video exists but analysis isn't ready yet — redirect to processing
    redirect(`/processing/${id}`);
  } else {
    // Fallback to simulated data (for backward compatibility)
    analysisData = generateFallbackAnalysis(id);
  }

  return <AnalysisReport analysis={analysisData} />;
}
