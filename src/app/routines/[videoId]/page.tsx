import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import RoutineProgressClient from "./RoutineProgressClient";

export default async function RoutineProgressPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const serviceClient = await createServiceClient();

  // Get the anchor video to find the routine name
  const { data: anchorVideo } = await serviceClient
    .from("videos")
    .select("id, routine_name, style, entry_type, age_group, user_id, choreographer")
    .eq("id", videoId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!anchorVideo) redirect("/dashboard");

  // Fetch ALL videos for this user with the same routine name
  const { data: allVideos } = await serviceClient
    .from("videos")
    .select("id, routine_name, style, entry_type, age_group, status, created_at, dancer_name, studio_name")
    .eq("user_id", user.id)
    .eq("routine_name", anchorVideo.routine_name)
    .eq("status", "analyzed")
    .order("created_at", { ascending: true });

  if (!allVideos || allVideos.length === 0) redirect("/dashboard");

  // Fetch analyses for all matching videos
  const videoIds = allVideos.map((v) => v.id);
  const { data: analyses } = await serviceClient
    .from("analyses")
    .select("id, video_id, total_score, award_level, judge_scores, improvement_priorities, timeline_notes, created_at")
    .in("video_id", videoIds)
    .order("created_at", { ascending: true });

  // Pair each video with its analysis
  const submissions = allVideos
    .map((v) => {
      const analysis = (analyses ?? []).find((a) => a.video_id === v.id);
      return analysis ? { video: v, analysis } : null;
    })
    .filter(Boolean) as Array<{
      video: typeof allVideos[0];
      analysis: NonNullable<typeof analyses>[0];
    }>;

  if (submissions.length === 0) redirect("/dashboard");

  return (
    <RoutineProgressClient
      routineName={anchorVideo.routine_name}
      style={anchorVideo.style}
      entryType={anchorVideo.entry_type}
      ageGroup={anchorVideo.age_group}
      choreographer={anchorVideo.choreographer ?? undefined}
      submissions={submissions.map((s) => ({
        videoId: s.video.id,
        date: s.video.created_at,
        totalScore: s.analysis.total_score,
        awardLevel: s.analysis.award_level,
        dancerName: s.video.dancer_name ?? undefined,
        studioName: s.video.studio_name ?? undefined,
        judgeScores: s.analysis.judge_scores as Array<{ category: string; avg: number; max: number }> ?? [],
        improvementPriorities: s.analysis.improvement_priorities as Array<{ priority: number; item: string; impact?: string; timeToFix?: string; trainingTip?: string }> ?? [],
        timelineNotes: s.analysis.timeline_notes as Array<{ time: string; note: string }> ?? [],
      }))}
    />
  );
}
