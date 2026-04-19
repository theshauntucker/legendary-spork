import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  grantCredits,
  grantSubscriptionCycle,
  BETA_CREDITS,
  SUBSCRIPTION_CREDITS,
} from "@/lib/credits";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendWelcomeEmail, notifyWelcomeSent } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * Fallback payment verification — called when user lands on dashboard/success
 * with a session_id. If the webhook hasn't processed yet, this grants credits
 * directly by checking the Stripe session status.
 */
export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json();

    if (!session_id || typeof session_id !== "string") {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    // Verify the user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Verify payment is actually completed. For subscriptions, payment_status
    // is often 'no_payment_required' after the first invoice is paid; accept
    // both 'paid' and 'no_payment_required' when it's a subscription mode.
    const isSubMode = session.mode === "subscription";
    const paidOk = session.payment_status === "paid" ||
      (isSubMode && session.payment_status === "no_payment_required");
    if (!paidOk) {
      return NextResponse.json(
        { error: "Payment not completed", status: session.payment_status },
        { status: 402 }
      );
    }

    // Verify this session belongs to the authenticated user
    const sessionUserId = session.metadata?.user_id;
    if (sessionUserId !== user.id) {
      return NextResponse.json({ error: "Session mismatch" }, { status: 403 });
    }

    const serviceClient = await createServiceClient();

    const paymentType = session.metadata?.payment_type || "beta_access";
    const referralCode = session.metadata?.referral_code || null;
    const isBeta = paymentType === "beta_access";
    const isPack = paymentType === "video_analysis";
    const isSingle = paymentType === "single";
    const isSubscription = paymentType === "subscription";

    // subscription = 10/month, single = 2, pack = 5, beta = BETA_CREDITS
    const creditsToGrant = isSubscription
      ? SUBSCRIPTION_CREDITS
      : isBeta
      ? BETA_CREDITS
      : isPack
      ? 5
      : isSingle
      ? 2
      : 1;
    const amountFallback = isSubscription ? 1299 : isPack ? 2999 : isBeta ? 999 : 899;

    // Try to record payment (may already exist from webhook — that's fine)
    const { error: insertError } = await serviceClient
      .from("payments")
      .insert({
        user_id: user.id,
        stripe_session_id: session_id,
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
      console.error("Verify-payment: Payment insert failed:", insertError.message);
    }

    // Subscription path — reset to 10/0 with period window + mirror into
    // subscriptions table so status tracking is correct.
    if (isSubscription) {
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;

      let periodStart = new Date();
      let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      if (subscriptionId) {
        try {
          const sub = (await stripe.subscriptions.retrieve(subscriptionId)) as unknown as {
            current_period_start?: number;
            current_period_end?: number;
            items?: { data?: Array<{ current_period_start?: number; current_period_end?: number }> };
          };
          const item = sub.items?.data?.[0];
          const pStart = sub.current_period_start ?? item?.current_period_start;
          const pEnd = sub.current_period_end ?? item?.current_period_end;
          if (pStart) periodStart = new Date(pStart * 1000);
          if (pEnd) periodEnd = new Date(pEnd * 1000);
        } catch (err) {
          console.error("Verify-payment: Failed to fetch subscription:", err);
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

      // Anti-arbitrage: extends if user already has active sub credits,
      // resets otherwise. Prevents cancel→resubscribe credit washing.
      await grantSubscriptionCycle(
        serviceClient,
        user.id,
        SUBSCRIPTION_CREDITS,
        periodStart,
        periodEnd
      );
    } else {
      // Pack / single / beta — additive grant, grantCredits is idempotent-safe
      await grantCredits(serviceClient, user.id, creditsToGrant, isBeta);
    }

    console.log(
      `Verify-payment: ${isSubscription ? "Reset" : "Granted"} ${creditsToGrant} credits for ${user.id} (${paymentType}) — webhook fallback`
    );

    // VIP welcome email — only fires on the user's first completed payment.
    // Fire-and-forget so email failures never block the API response.
    (async () => {
      try {
        const { count } = await serviceClient
          .from("payments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "completed");
        if (count === 1 && user.email) {
          await sendWelcomeEmail(user.email, null, paymentType);
          notifyWelcomeSent(user.email, paymentType).catch(() => {});
        }
      } catch (err) {
        console.error("Verify-payment: welcome email failed:", err);
      }
    })().catch(() => {});

    return NextResponse.json({ verified: true, credits_granted: creditsToGrant });
  } catch (err) {
    console.error("Verify-payment error:", err);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
