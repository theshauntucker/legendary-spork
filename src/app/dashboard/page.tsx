import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user's videos
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch analyses separately (join can fail if FK not detected)
  const videoIds = (videos ?? []).map((v) => v.id);
  let analysesMap: Record<string, { id: string; total_score: number; award_level: string }[]> = {};

  if (videoIds.length > 0) {
    const { data: analyses } = await supabase
      .from("analyses")
      .select("id, video_id, total_score, award_level")
      .in("video_id", videoIds);

    if (analyses) {
      for (const a of analyses) {
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

  return (
    <DashboardClient
      user={{
        email: user.email ?? "",
        name: user.user_metadata?.full_name ?? "",
      }}
      videos={videosWithAnalyses}
    />
  );
}
