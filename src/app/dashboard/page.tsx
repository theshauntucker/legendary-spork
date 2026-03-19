import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUserCredits, grantCredits, hasCreditsInDb, BETA_CREDITS } from "@/lib/credits";
import { getStripe } from "@/lib/stripe";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Verify authentication with user's session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Use service client for data reads (bypasses RLS issues)
  const serviceClient = await createServiceClient();

  // If returning from Stripe checkout, verify payment and grant credits as fallback
  const params = await searchParams;
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : undefined;

  if (sessionId) {
    try {
      // Check if already processed
      const { data: existingPayment } = await serviceClient
        .from("payments")
        .select("id")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();

      if (existingPayment) {
        // Payment recorded — but were credits actually granted?
        const hasCredits = await hasCreditsInDb(serviceClient, user.id);
        if (!hasCredits) {
          await grantCredits(serviceClient, user.id, BETA_CREDITS, true);
          console.log(`Dashboard: Recovered missing credits for ${user.id}`);
        }
      } else {
        // Not yet processed — verify with Stripe and grant credits
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (
          session.payment_status === "paid" &&
          session.metadata?.user_id === user.id
        ) {
          const paymentType =
            session.metadata?.payment_type || "beta_access";
          const isBeta = paymentType === "beta_access";
          const creditsToGrant = isBeta ? BETA_CREDITS : 1;

          const { error: insertError } = await serviceClient
            .from("payments")
            .insert({
              user_id: user.id,
              stripe_session_id: sessionId,
              stripe_payment_intent:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : null,
              payment_type: paymentType,
              amount_cents: session.amount_total || (isBeta ? 999 : 399),
              currency: session.currency || "usd",
              status: "completed",
              credits_granted: creditsToGrant,
            });

          if (insertError) {
            console.error("Dashboard: Payment insert failed:", insertError.message);
          } else {
            await grantCredits(serviceClient, user.id, creditsToGrant, isBeta);
            console.log(
              `Dashboard: Granted ${creditsToGrant} credits to ${user.id} (webhook fallback)`
            );
          }
        }
      }
    } catch (err) {
      console.error("Dashboard: Payment verification failed:", err);
      // Non-fatal — continue loading dashboard
    }
  }

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
