import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import DancerProfileClient from "./DancerProfileClient";

export default async function DancerProfilePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const dancerName = decodeURIComponent(name);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const serviceClient = await createServiceClient();

  // Fetch all analyzed videos for this dancer belonging to the user
  const { data: videos } = await serviceClient
    .from("videos")
    .select("id, routine_name, dancer_name, style, age_group, entry_type, created_at, analyses!inner(id, total_score, award_level, judge_scores, created_at)")
    .eq("user_id", user.id)
    .eq("dancer_name", dancerName)
    .eq("status", "analyzed")
    .order("created_at", { ascending: true });

  if (!videos || videos.length === 0) {
    redirect("/dashboard");
  }

  // Fetch or create dancer profile
  let { data: profile } = await serviceClient
    .from("dancer_profiles")
    .select("*")
    .eq("user_id", user.id)
    .eq("dancer_name", dancerName)
    .maybeSingle();

  if (!profile) {
    // Auto-create from video metadata
    const styles = [...new Set(videos.map((v: Record<string, unknown>) => v.style as string))];
    const latestVideo = videos[videos.length - 1] as Record<string, unknown>;

    const { data: newProfile } = await serviceClient
      .from("dancer_profiles")
      .insert({
        user_id: user.id,
        dancer_name: dancerName,
        styles,
        age_group: latestVideo.age_group as string,
      })
      .select("*")
      .single();

    profile = newProfile;
  }

  // Fetch achievements
  const { data: achievements } = await serviceClient
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .eq("dancer_name", dancerName)
    .order("earned_at", { ascending: false });

  // Fetch competition scores for this dancer's videos
  const videoIds = videos.map((v: Record<string, unknown>) => v.id as string);
  const { data: competitionScores } = await serviceClient
    .from("competition_scores")
    .select("*")
    .eq("user_id", user.id)
    .in("video_id", videoIds)
    .order("competition_date", { ascending: false });

  // Build score history
  const scoreHistory = videos.map((v: Record<string, unknown>) => {
    const analyses = v.analyses as Array<Record<string, unknown>>;
    const a = analyses[0];
    return {
      videoId: v.id as string,
      analysisId: a.id as string,
      totalScore: a.total_score as number,
      awardLevel: a.award_level as string,
      date: v.created_at as string,
      routineName: v.routine_name as string,
      style: v.style as string,
    };
  });

  // Aggregate stats
  const allScores = scoreHistory.map((s) => s.totalScore);
  const bestScore = Math.max(...allScores);
  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  const awardCounts: Record<string, number> = {};
  scoreHistory.forEach((s) => {
    awardCounts[s.awardLevel] = (awardCounts[s.awardLevel] || 0) + 1;
  });

  const styles = [...new Set(videos.map((v: Record<string, unknown>) => v.style as string))];

  return (
    <DancerProfileClient
      dancerName={dancerName}
      profile={profile}
      scoreHistory={scoreHistory}
      achievements={achievements || []}
      competitionScores={competitionScores || []}
      stats={{
        totalAnalyses: videos.length,
        bestScore,
        avgScore,
        awardCounts,
        styles,
      }}
    />
  );
}
