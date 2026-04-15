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

  // ── Subscription renewal — grant 10 credits each billing cycle ─────────────
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as {
      subscription?: string;
      customer_email?: string;
      amount_paid?: number;
      billing_reason?: string;
      subscription_details?: { metadata?: Record<string, string> };
    };

    // Only process subscription renewals (not the first invoice — that's handled by checkout.session.completed)
    if (invoice.billing_reason === "subscription_cycle") {
      const subMetadata = invoice.subscription_details?.metadata || {};
      const userId = subMetadata.user_id;

      if (userId) {
        const serviceClient = await createServiceClient();
        try {
          await grantCredits(serviceClient, userId, 10, false);
          console.log(`Webhook: Granted 10 renewal credits to ${userId} (subscription cycle)`);

          // Record renewal payment
          await serviceClient.from("payments").insert({
            user_id: userId,
            stripe_session_id: invoice.subscription || `renewal_${Date.now()}`,
            payment_type: "subscription_renewal",
            amount_cents: invoice.amount_paid || 1299,
            currency: "usd",
            status: "completed",
            credits_granted: 10,
          }).then(({ error }) => {
            if (error && error.code !== "23505") console.error("Renewal payment insert error:", error);
          });
        } catch (err) {
          console.error("Webhook: Failed to grant renewal credits:", err);
          return NextResponse.json({ error: "Renewal credit grant failed" }, { status: 500 });
        }
      }

      // ─── Studio subscription renewal branch (additive) ─────────────────
      // Studio subscriptions set subscription_data.metadata.payment_type =
      // "studio_subscription" and studio_id (NOT user_id), so the Season
      // Member block above no-ops for them. This block handles:
      //   • trial → active transition (bump total_credits from 25 to 50)
      //   • monthly renewal (additive grant of 50, used_credits untouched)
      if (subMetadata.payment_type === "studio_subscription" && subMetadata.studio_id) {
        const studioId = subMetadata.studio_id;
        const serviceClient = await createServiceClient();
        try {
          const { data: pool } = await serviceClient
            .from("studio_credits")
            .select("total_credits, subscription_status")
            .eq("studio_id", studioId)
            .maybeSingle();

          if (!pool) {
            console.error(`Webhook: studio_credits row missing for studio ${studioId}`);
          } else if (pool.subscription_status === "trial") {
            // First real payment after trial — bump pool from 25 to 50 and flip to active
            await serviceClient
              .from("studio_credits")
              .update({
                total_credits: 50,
                subscription_status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("studio_id", studioId);
            console.log(`Webhook: Studio ${studioId} trial → active, pool bumped to 50`);
          } else {
            // Already active — monthly additive grant of 50, leave used_credits alone
            await serviceClient
              .from("studio_credits")
              .update({
                total_credits: pool.total_credits + 50,
                subscription_status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("studio_id", studioId);
            console.log(`Webhook: Studio ${studioId} monthly renewal — pool +50`);
          }
        } catch (err) {
          console.error("Webhook: Studio subscription renewal failed:", err);
          return NextResponse.json({ error: "Studio renewal failed" }, { status: 500 });
        }
      }
      // ────────────────────────────────────────────────────────────────────
    }
    return NextResponse.json({ received: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata?.user_id;
    const paymentType = session.metadata?.payment_type || "beta_access";
    const referralCode = session.metadata?.referral_code || null;

    // ─── Studio subscription early branch (additive) ─────────────────────
    // Studio checkouts set payment_type="studio_subscription" and studio_id
    // on session metadata (the /studio/signup flow creates the studios row
    // before redirecting to Stripe). This branch sets up the shared pool at
    // 25 credits for the 30-day trial. The existing B2C branches below
    // remain in their original order and are not executed for studio flows.
    if (paymentType === "studio_subscription") {
      const studioId = session.metadata?.studio_id;
      if (!studioId) {
        console.error("Webhook: studio_subscription session missing studio_id", session.id);
        return NextResponse.json({ received: true });
      }
      const serviceClient = await createServiceClient();
      try {
        // Idempotency: if a payments row already exists for this session, skip.
        const { data: existing } = await serviceClient
          .from("payments")
          .select("id")
          .eq("stripe_session_id", session.id)
          .maybeSingle();

        if (!existing) {
          await serviceClient.from("payments").insert({
            user_id: userId,
            stripe_session_id: session.id,
            stripe_payment_intent:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
            payment_type: "studio_subscription",
            amount_cents: session.amount_total || 0,
            currency: session.currency || "usd",
            status: "completed",
            credits_granted: 25,
          }).then(({ error }) => {
            if (error && error.code !== "23505") {
              console.error("Studio payment insert error:", error);
            }
          });
        }

        // Upsert the studio_credits pool: trial starts with 25 credits, bumps
        // to 50 on first invoice.payment_succeeded (billing_reason=cycle).
        const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        const { error: upsertError } = await serviceClient
          .from("studio_credits")
          .upsert(
            {
              studio_id: studioId,
              total_credits: 25,
              used_credits: 0,
              trial_ends_at: trialEndsAt,
              subscription_status: "trial",
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "studio_id" }
          );

        if (upsertError) {
          throw new Error(`studio_credits upsert failed: ${upsertError.message}`);
        }
        console.log(
          `Webhook: Studio ${studioId} trial started (pool=25, ends ${trialEndsAt})`
        );
      } catch (err) {
        console.error("Webhook: Studio checkout processing failed:", err);
        return NextResponse.json({ error: "Studio checkout failed" }, { status: 500 });
      }
      return NextResponse.json({ received: true });
    }
    // ──────────────────────────────────────────────────────────────────────

    if (!userId) {
      console.error("Webhook: No user_id in session metadata", session.id);
      return NextResponse.json({ received: true });
    }

    // Determine credits to grant based on payment type
    // single = $8.99 = 2 credits (BOGO launch offer)
    // video_analysis / pack = $29.99 = 5 credits
    // beta_access (legacy) = 3 credits
    const isBeta = paymentType === "beta_access";
    const isPack = paymentType === "video_analysis";
    const isSingle = paymentType === "single";
    const creditsToGrant = isBeta ? BETA_CREDITS : isPack ? 5 : isSingle ? 2 : 1;

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
      const amountFallback = isPack ? 2999 : isBeta ? 999 : 899;
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
          amount_cents: session.amount_total || amountFallback,
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
      session.amount_total || (isBeta ? 999 : 899)
    ).catch((err: unknown) => console.error("Payment notification failed:", err));
  }

  return NextResponse.json({ received: true });
}
