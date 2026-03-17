import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user's videos with their analyses
  const { data: videos } = await supabase
    .from("videos")
    .select("*, analyses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardClient
      user={{
        email: user.email ?? "",
        name: user.user_metadata?.full_name ?? "",
      }}
      videos={videos ?? []}
    />
  );
}
