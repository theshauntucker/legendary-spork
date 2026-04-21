import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireStudioMembership } from "@/lib/studio/auth";
import PlaybookClient from "./PlaybookClient";

export const metadata = {
  title: "Coach's Playbook — RoutineX Studio",
};

interface JudgeScoreEntry {
  category: string;
  feedback?: string;
  judges?: number[];
  avg?: number;
}

interface AnalysisRecord {
  id: string;
  video_id: string;
  total_score: number;
  award_level: string;
  judge_scores?: JudgeScoreEntry[];
}

interface PlaybookRoutine {
  videoId: string;
  analysisId: string;
  routineName: string;
  dancerName: string;
  totalScore: number;
  awardLevel: string;
  feedbackPoints: string[];
}

interface TopTheme {
  label: string;
  count: number;
}

export default async function PlaybookPage() {
  const membership = await requireStudioMembership("/studio/playbook");
  if (!membership) return null;

  const { studio } = membership;
  const serviceClient = await createServiceClient();

  // 1. Fetch all active dancers in the studio
  const { data: dancers } = await serviceClient
    .from("studio_dancers")
    .select("id")
    .eq("studio_id", studio.id)
    .eq("is_active", true);

  const dancerIds = dancers?.map(d => d.id) ?? [];

  if (dancerIds.length === 0) {
    return <PlaybookClient routines={[]} topThemes={[]} />;
  }

  // 2. Fetch all analyzed videos for those dancers
  const { data: videos } = await serviceClient
    .from("videos")
    .select(
      "id, routine_name, dancer_name, studio_dancer_id, status, created_at, analyses(id, video_id, total_score, award_level, judge_scores)"
    )
    .in("studio_dancer_id", dancerIds)
    .eq("status", "analyzed")
    .order("created_at", { ascending: false });

  // 3. Process videos + analyses into routine records with feedback
  const routines: PlaybookRoutine[] = [];
  const allFeedbackPoints: string[] = [];

  for (const video of videos ?? []) {
    const aArr = Array.isArray(video.analyses)
      ? video.analyses
      : video.analyses
        ? [video.analyses]
        : [];

    const analysis = aArr[0];
    if (!analysis) continue;

    // Extract feedback from judge_scores
    const feedbackPoints: string[] = [];
    const judgeScores = (analysis.judge_scores ?? []) as JudgeScoreEntry[];

    for (const js of judgeScores) {
      if (js.feedback && typeof js.feedback === "string") {
        const points = js.feedback
          .split(/[.!?]+/)
          .map(p => p.trim())
          .filter(p => p.length > 0 && p.length < 150);
        feedbackPoints.push(...points);
        allFeedbackPoints.push(...points);
      }
    }

    routines.push({
      videoId: video.id as string,
      analysisId: analysis.id as string,
      routineName: video.routine_name as string,
      dancerName: video.dancer_name || "Dancer",
      totalScore: analysis.total_score as number,
      awardLevel: analysis.award_level as string,
      feedbackPoints: feedbackPoints.slice(0, 3), // Keep top 3 feedback points per routine
    });
  }

  // 4. Aggregate feedback into top themes (word frequency)
  // Find the most common 3-5 word phrases
  const themeCounts: Record<string, number> = {};
  for (const point of allFeedbackPoints) {
    // Extract first 5-7 words as a theme label
    const words = point.split(/\s+/).slice(0, 7).join(" ");
    if (words.length > 10) {
      themeCounts[words] = (themeCounts[words] ?? 0) + 1;
    }
  }

  const topThemes: TopTheme[] = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, count]) => ({ label, count }));

  return <PlaybookClient routines={routines} topThemes={topThemes} />;
}
