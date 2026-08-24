import { redirect, notFound } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isSeasonMember } from "@/lib/practice-plan";
import PracticePlanClient from "./PracticePlanClient";

export const metadata = {
  title: "Practice Plan — RoutineX",
  description:
    "A personalized 2-week home practice plan built from your dancer's judge report.",
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "22tucker22@comcast.net";

export default async function PracticePlanPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const serviceClient = await createServiceClient();

  const { data: video } = await serviceClient
    .from("videos")
    .select("id, routine_name, dancer_name, style, entry_type, age_group, status")
    .eq("id", videoId)
    .eq("user_id", user.id)
    .single();

  if (!video || video.status !== "analyzed") notFound();

  const { data: plan } = await serviceClient
    .from("practice_plans")
    .select("id, status, content")
    .eq("video_id", videoId)
    .maybeSingle();

  const member =
    user.email === ADMIN_EMAIL || (await isSeasonMember(serviceClient, user.id));

  return (
    <PracticePlanClient
      videoId={videoId}
      routineName={video.routine_name || "Untitled"}
      dancerName={video.dancer_name || "Your dancer"}
      style={video.style || null}
      initialStatus={plan?.status ?? "none"}
      initialContent={plan?.status === "ready" ? plan.content : null}
      isMember={member}
    />
  );
}
