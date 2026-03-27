import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { grantCredits, hasCreditsInDb, BETA_CREDITS } from "@/lib/credits";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyPayment } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata?.user_id;
    const paymentType = session.metadata?.payment_type || "beta_access";
    const referralCode = session.metadata?.referral_code || null;

    if (!userId) {
      console.error("Webhook: No user_id in session metadata", session.id);
      return NextResponse.json({ received: true });
    }

    // Determine credits to grant based on payment type
    // single = $8.99 = 1 credit
    // video_analysis / pack = $29.99 = 5 credits
    // trial (legacy) = 1 credit
    // beta_access (legacy) = 3 credits
    const isBeta = paymentType === "beta_access";
    const isPack = paymentType === "video_analysis";
    const isSingle = paymentType === "single";
    const creditsToGrant = isBeta ? BETA_CREDITS : isPack ? 5 : 1;

    const serviceClient = await createServiceClient();

    // Check for duplicate — idempotency
    const { data: existingPayment } = await serviceClient
      .from("payments")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (existingPayment) {
      // Payment recorded — but were credits actually granted?
      const hasCredits = await hasCreditsInDb(serviceClient, userId);
      if (!hasCredits) {
        // Payment exists but credits missing — recover now
        try {
          await grantCredits(serviceClient, userId, creditsToGrant, isBeta);
          console.log(`Webhook: Recovered missing credits for ${userId}`);
        } catch (err) {
          console.error("Webhook: Credit recovery failed:", err);
          return NextResponse.json({ error: "Credit recovery failed" }, { status: 500 });
        }
      }
      return NextResponse.json({ received: true });
    }

    // Record payment and grant credits
    try {
      const { error: insertError } = await serviceClient
        .from("payments")
        .insert({
          user_id: userId,
          stripe_session_id: session.id,
          stripe_payment_intent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          payment_type: paymentType,
          amount_cents: session.amount_total || (isBeta ? 999 : 399),
          currency: session.currency || "usd",
          status: "completed",
          credits_granted: creditsToGrant,
          referral_code: referralCode,
        });

      if (insertError) {
        // Unique constraint violation = success page already recorded this payment.
        // That's fine — continue to grant credits (they may not have been granted yet).
        if (insertError.code !== "23505") {
          throw new Error(`Payment insert failed: ${insertError.message}`);
        }
        console.log(`Webhook: Payment already recorded for session ${session.id}, ensuring credits granted...`);
      }

      // Always attempt to grant credits — grantCredits is idempotent-safe
      // (uses insert-first with unique constraint fallback)
      await grantCredits(serviceClient, userId, creditsToGrant, isBeta);
    } catch (err) {
      console.error("Webhook: Failed to record payment or grant credits:", err);
      // Return 500 so Stripe retries the webhook
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }

    console.log(
      `Webhook: Granted ${creditsToGrant} credits to ${userId} (${paymentType})`
    );

    // Attribute revenue to affiliate if referral code present
    if (referralCode) {
      serviceClient.rpc("attribute_affiliate_revenue", {
        p_user_id: userId,
        p_amount_cents: session.amount_total || 0,
      }).then(({ error: affErr }) => {
        if (affErr) console.error("Affiliate attribution failed:", affErr);
      });
    }

    // Send payment notification email (non-blocking, ok to fail)
    const customerEmail = session.customer_email || session.customer_details?.email || userId;
    notifyPayment(
      customerEmail,
      userId,
      paymentType,
      session.amount_total || (isBeta ? 999 : 399)
    ).catch((err: unknown) => console.error("Payment notification failed:", err));
  }

  return NextResponse.json({ received: true });
}
