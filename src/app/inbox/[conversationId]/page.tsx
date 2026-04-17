import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConversationView } from "@/components/ConversationView";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!profile) redirect("/welcome");

  return <ConversationView conversationId={conversationId} selfProfileId={profile.id} />;
}
