import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FeedClient from "./FeedClient";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/feed");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,handle")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.handle) {
    redirect("/onboarding/aura");
  }

  return <FeedClient />;
}
