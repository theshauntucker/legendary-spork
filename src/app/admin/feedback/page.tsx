import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createClient as createRawSupabaseClient } from "@supabase/supabase-js";
import FeedbackInbox from "./FeedbackInbox";

export const dynamic = "force-dynamic";

/**
 * The customer inbox.
 *
 * Everything parents have told us in one place — the wait-room questions, the
 * star prompt, milestone notes, and the testimonials waiting to be published.
 * Email is the alert; this is the record.
 */
export default async function AdminFeedbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    redirect("/dashboard");
  }

  const serviceClient = await createServiceClient();
  const adminClient = createRawSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const [{ data: notes }, { data: testimonials }, { data: rewards }, { data: authUsers }] =
    await Promise.all([
      serviceClient
        .from("feedback_notes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(400),
      serviceClient
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      serviceClient.from("feedback_rewards").select("user_id, granted_at"),
      adminClient.auth.admin.listUsers(),
    ]);

  const emailById = new Map((authUsers?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const rows = (notes ?? []).map((n) => ({
    id: n.id as string,
    email: emailById.get(n.user_id as string) ?? "unknown",
    kind: n.kind as string,
    promptKey: (n.prompt_key as string) ?? null,
    choice: (n.choice as string) ?? null,
    body: (n.body as string) ?? null,
    rating: (n.rating as number) ?? null,
    analysisId: (n.analysis_id as string) ?? null,
    videoId: (n.video_id as string) ?? null,
    platform: (n.platform as string) ?? "web",
    creditGranted: !!n.credit_granted,
    createdAt: n.created_at as string,
  }));

  const quotes = (testimonials ?? []).map((t) => ({
    id: t.id as string,
    email: emailById.get(t.user_id as string) ?? "unknown",
    displayName: (t.display_name as string) ?? null,
    role: (t.role as string) ?? null,
    quote: t.quote as string,
    rating: (t.rating as number) ?? null,
    approved: !!t.approved,
    createdAt: t.created_at as string,
  }));

  return (
    <FeedbackInbox
      rows={rows}
      quotes={quotes}
      creditsPaid={(rewards ?? []).length}
    />
  );
}
