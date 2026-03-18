import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUserCredits } from "@/lib/credits";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // Verify authentication with user's session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Use service client for data reads (bypasses RLS issues)
  const serviceClient = await createServiceClient();

  // Auto-fix videos stuck in "processing" for over 7 minutes
  await serviceClient
    .from("videos")
    .update({ status: "error", updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("status", "processing")
    .lt("updated_at", new Date(Date.now() - 7 * 60 * 1000).toISOString());

  // Fetch user's videos
  const { data: videos } = await serviceClient
    .from("videos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch analyses separately
  const videoIds = (videos ?? []).map((v: { id: string }) => v.id);
  const analysesMap: Record<string, { id: string; total_score: number; award_level: string }[]> = {};

  if (videoIds.length > 0) {
    const { data: analyses } = await serviceClient
      .from("analyses")
      .select("id, video_id, total_score, award_level")
      .in("video_id", videoIds);

    if (analyses) {
      for (const a of analyses as { id: string; video_id: string; total_score: number; award_level: string }[]) {
        if (!analysesMap[a.video_id]) analysesMap[a.video_id] = [];
        analysesMap[a.video_id].push(a);
      }
    }
  }

  // Merge analyses into video records
  const videosWithAnalyses = (videos ?? []).map((v) => ({
    ...v,
    analyses: analysesMap[v.id] ?? [],
  }));

  // Fetch actual credit balance from database
  const creditStatus = await getUserCredits(
    serviceClient,
    user.id,
    user.email
  );

  return (
    <DashboardClient
      user={{
        email: user.email ?? "",
        name: user.user_metadata?.full_name ?? "",
      }}
      videos={videosWithAnalyses}
      credits={{
        remaining: creditStatus.remaining,
        total: creditStatus.totalCredits,
        used: creditStatus.usedCredits,
      }}
    />
  );
}
