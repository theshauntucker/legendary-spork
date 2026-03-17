import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AnalysisReport from "./AnalysisReport";

// Fallback simulated analysis for demo/sample purposes
function generateFallbackAnalysis(id: string) {
  const seed = id.charCodeAt(0) + (id.charCodeAt(1) || 0);
  const v = (base: number, range: number) =>
    Math.round((base + ((seed % range) - range / 2) * 0.1) * 10) / 10;

  return {
    id,
    routineName: "Uploaded Routine",
    dancerName: "Dancer",
    ageGroup: "Teen (12-15)",
    style: "Jazz",
    entryType: "Solo",
    duration: "2:45",
    totalScore: v(274, 20),
    awardLevel: "Platinum",
    judgeScores: [
      { category: "Technique", max: 35, judges: [v(32.5, 10), v(31.0, 10), v(33.0, 10)], avg: v(32.2, 10), feedback: "Solid foundational technique with good body placement and alignment throughout." },
      { category: "Performance", max: 35, judges: [v(33.0, 10), v(32.5, 10), v(34.0, 10)], avg: v(33.2, 10), feedback: "Strong stage presence with genuine connection to the music." },
      { category: "Choreography", max: 20, judges: [v(18.5, 8), v(17.5, 8), v(19.0, 8)], avg: v(18.3, 8), feedback: "Well-constructed routine with a clear narrative arc." },
      { category: "Overall Impression", max: 10, judges: [v(9.0, 4), v(8.5, 4), v(9.5, 4)], avg: v(9.0, 4), feedback: "A polished, competition-ready routine." },
    ],
    timelineNotes: [
      { time: "0:00–0:12", note: "Strong opening", type: "positive" },
      { time: "0:25", note: "Leap: watch back foot on landing", type: "improvement" },
      { time: "1:05", note: "Turn: focus on spotting", type: "improvement" },
      { time: "2:30–2:45", note: "Powerful ending", type: "positive" },
    ],
    improvementPriorities: [
      { priority: 1, item: "Landing control", impact: "High", timeToFix: "2–3 weeks" },
      { priority: 2, item: "Spotting consistency", impact: "High", timeToFix: "1–2 weeks" },
      { priority: 3, item: "Energy maintenance", impact: "Medium", timeToFix: "2–3 rehearsals" },
    ],
    competitionComparison: { yourScore: v(274, 20), avgRegional: 261, top10Threshold: 282, top5Threshold: 288 },
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
    analysisData = {
      id: video.id,
      routineName: video.routine_name,
      dancerName: video.dancer_name || "Dancer",
      ageGroup: video.age_group,
      style: video.style,
      entryType: video.entry_type,
      duration: "2:45",
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
