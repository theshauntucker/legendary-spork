import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  getUserCredits,
  grantCredits,
  grantSubscriptionCycle,
  hasCreditsInDb,
  BETA_CREDITS,
  SUBSCRIPTION_CREDITS,
} from "@/lib/credits";
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

      if (!existingPayment) {
        // Not yet processed — verify with Stripe and grant credits
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Subscriptions: payment_status is "no_payment_required" after first
        // invoice pays. Accept both.
        const isSubMode = session.mode === "subscription";
        const paidOk =
          session.payment_status === "paid" ||
          (isSubMode && session.payment_status === "no_payment_required");

        if (paidOk && session.metadata?.user_id === user.id) {
          const paymentType =
            session.metadata?.payment_type || "beta_access";
          const referralCode = session.metadata?.referral_code || null;
          const isBeta = paymentType === "beta_access";
          const isPack = paymentType === "video_analysis";
          const isSingle = paymentType === "single";
          const isSubscription = paymentType === "subscription";
          const creditsToGrant = isSubscription
            ? SUBSCRIPTION_CREDITS
            : isBeta
            ? BETA_CREDITS
            : isPack
            ? 5
            : isSingle
            ? 2
            : 1;
          const amountFallback = isSubscription
            ? 1299
            : isPack
            ? 2999
            : isBeta
            ? 999
            : 899;

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
              amount_cents: session.amount_total || amountFallback,
              currency: session.currency || "usd",
              status: "completed",
              credits_granted: creditsToGrant,
              referral_code: referralCode,
            });

          if (insertError && insertError.code !== "23505") {
            console.error(
              "Dashboard: Payment insert failed:",
              insertError.message,
              { sessionId, userId: user.id, paymentType }
            );
          }

          if (isSubscription) {
            // Mirror webhook's subscription flow: upsert subscriptions row with
            // Stripe IDs + period window, then anti-arbitrage grant.
            const subscriptionId =
              typeof session.subscription === "string"
                ? session.subscription
                : null;
            const customerId =
              typeof session.customer === "string" ? session.customer : null;

            let periodStart = new Date();
            let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            if (subscriptionId) {
              try {
                const sub = (await stripe.subscriptions.retrieve(
                  subscriptionId
                )) as unknown as {
                  current_period_start?: number;
                  current_period_end?: number;
                  items?: {
                    data?: Array<{
                      current_period_start?: number;
                      current_period_end?: number;
                    }>;
                  };
                };
                const item = sub.items?.data?.[0];
                const pStart =
                  sub.current_period_start ?? item?.current_period_start;
                const pEnd =
                  sub.current_period_end ?? item?.current_period_end;
                if (pStart) periodStart = new Date(pStart * 1000);
                if (pEnd) periodEnd = new Date(pEnd * 1000);
              } catch (err) {
                console.error(
                  "Dashboard: Failed to fetch subscription:",
                  err
                );
              }
            }

            await serviceClient.from("subscriptions").upsert(
              {
                user_id: user.id,
                stripe_subscription_id: subscriptionId,
                stripe_customer_id: customerId,
                status: "active",
                current_period_start: periodStart.toISOString(),
                current_period_end: periodEnd.toISOString(),
                cancel_at_period_end: false,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );

            await grantSubscriptionCycle(
              serviceClient,
              user.id,
              SUBSCRIPTION_CREDITS,
              periodStart,
              periodEnd
            );
            console.log(
              `Dashboard: Season Member activated for ${user.id} (+${SUBSCRIPTION_CREDITS} credits, expires ${periodEnd.toISOString()}) — webhook fallback`
            );
          } else {
            // Pack / single / beta — additive grant
            await grantCredits(
              serviceClient,
              user.id,
              creditsToGrant,
              isBeta
            );
            console.log(
              `Dashboard: Granted ${creditsToGrant} credits to ${user.id} (${paymentType} — webhook fallback)`
            );
          }
        }
      }
    } catch (err) {
      console.error("Dashboard: Payment verification failed:", err, {
        sessionId,
        userId: user.id,
      });
      // Non-fatal — continue loading dashboard
    }
  }

  // ALWAYS check: if user has completed payments but no credits, recover them.
  // This catches cases where webhook, success page, and session_id fallbacks all failed.
  try {
    const hasCredits = await hasCreditsInDb(serviceClient, user.id);
    if (!hasCredits) {
      const { data: completedPayment } = await serviceClient
        .from("payments")
        .select("payment_type, credits_granted")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (completedPayment) {
        const isBeta = completedPayment.payment_type === "beta_access";
        const creditsToGrant = completedPayment.credits_granted || (isBeta ? BETA_CREDITS : 1);
        await grantCredits(serviceClient, user.id, creditsToGrant, isBeta);
        console.log(
          `Dashboard: Recovered ${creditsToGrant} missing credits for ${user.id} from existing payment`
        );
      }
    }
  } catch (err) {
    console.error("Dashboard: Credit recovery check failed:", err);
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
