import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  applyPaymentCredits,
  grantSubscriptionCycle,
  BETA_CREDITS,
  SUBSCRIPTION_CREDITS,
} from "@/lib/credits";
import { fulfillReferralOnPayment } from "@/lib/referral-fulfillment";
import { getStripe } from "@/lib/stripe";
import { sendWelcomeEmail, notifyWelcomeSent } from "@/lib/notifications";
import type { SupabaseClient } from "@supabase/supabase-js";
import SuccessClient from "./SuccessClient";

// VIP welcome email — only fires on the user's first completed payment.
async function maybeWelcome(
  serviceClient: SupabaseClient,
  userId: string,
  email: string,
  paymentType: string
) {
  try {
    const { count } = await serviceClient
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed");
    if (count === 1 && email && email.includes("@")) {
      await sendWelcomeEmail(email, null, paymentType);
      notifyWelcomeSent(email, paymentType).catch(() => {});
    }
  } catch (err) {
    console.error("Success page: welcome email failed:", err);
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : undefined;

  // Verify payment with Stripe and grant credits as webhook fallback
  if (sessionId) {
    try {
      const serviceClient = await createServiceClient();

      const { data: existingPayment } = await serviceClient
        .from("payments")
        .select("id")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();

      if (existingPayment) {
        // Recorded by another path — make sure its credits landed (exactly
        // once; no-op if they already did) and settle any referral reward.
        const { applied, credits } = await applyPaymentCredits(serviceClient, sessionId);
        if (applied) console.log(`Success page: applied ${credits} pending credits for ${user.id}`);
        await fulfillReferralOnPayment(serviceClient, user.id, sessionId, 0);
      } else {
        // Not yet processed by webhook — verify with Stripe and grant credits
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Subscriptions return payment_status="no_payment_required" on the
        // checkout session itself after the invoice is paid. Accept both.
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
          const isBogo = paymentType === "bogo";
          const isSingle = paymentType === "single";
          const isSubscription = paymentType === "subscription";
          const creditsToGrant = isSubscription
            ? SUBSCRIPTION_CREDITS
            : isBeta
            ? BETA_CREDITS
            : isPack
            ? 5
            : isBogo
            ? 2
            : isSingle
            ? 1
            : 1;
          const amountFallback = isSubscription
            ? 499
            : isPack
            ? 999
            : isBeta
            ? 999
            : isBogo
            ? 299
            : 199;

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
              credits_applied: isSubscription,
            });

          if (insertError && insertError.code !== "23505") {
            console.error(
              "Success page: Payment insert failed:",
              insertError.message,
              { sessionId, userId: user.id, paymentType }
            );
          }

          if (isSubscription) {
            // Mirror the webhook's subscription path: pull period window from
            // the Stripe sub, upsert subscriptions row, then grant via the
            // anti-arbitrage function.
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
                  "Success page: Failed to fetch subscription:",
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
              `Success page: Season Member activated for ${user.id} (+${SUBSCRIPTION_CREDITS} credits, expires ${periodEnd.toISOString()}) — webhook fallback`
            );
            await maybeWelcome(serviceClient, user.id, user.email || "", "subscription");
          } else {
            // Pack / single / BOGO / intro — exactly-once grant keyed on the session
            const { applied } = await applyPaymentCredits(serviceClient, sessionId);
            console.log(
              `Success page: ${applied ? "Granted" : "Already granted"} ${creditsToGrant} credits for ${user.id} (${paymentType} — webhook fallback)`
            );
            await maybeWelcome(serviceClient, user.id, user.email || "", paymentType);
          }
          await fulfillReferralOnPayment(serviceClient, user.id, sessionId, session.amount_total || 0);
        }
      }
    } catch (err) {
      console.error("Success page: Payment verification failed:", err, {
        sessionId,
        userId: user.id,
      });
    }
  }

  return <SuccessClient sessionId={sessionId} />;
}
