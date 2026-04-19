import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  grantCredits,
  hasCreditsInDb,
  resetSubscriptionCredits,
  grantSubscriptionCycle,
  markSubscriptionExpires,
  BETA_CREDITS,
  SUBSCRIPTION_CREDITS,
} from "@/lib/credits";
import { createServiceClient } from "@/lib/supabase/server";
import {
  notifyPayment,
  notifySubscriptionCanceled,
  notifyWebhookError,
  sendWelcomeEmail,
  notifyWelcomeSent,
} from "@/lib/notifications";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fire the VIP welcome email if this is the customer's FIRST completed
 * payment. Counts rows in the payments table — relies on the calling path
 * having already inserted its payments row before invoking this helper.
 * Fire-and-forget: email failure never rolls back credits.
 */
async function maybeSendWelcomeEmail(
  serviceClient: SupabaseClient,
  userId: string,
  customerEmail: string,
  paymentType: string
) {
  try {
    const { count, error } = await serviceClient
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed");

    if (error) {
      console.error("Welcome email: payment count query failed:", error);
      return;
    }

    // Only fire on the very first completed payment. Later purchases shouldn't
    // re-trigger the welcome (they'll get upgrade/thank-you flows instead).
    if (count === 1) {
      if (!customerEmail || customerEmail === userId || !customerEmail.includes("@")) {
        // Fallback: look up the user's email via auth admin
        const { data: userRecord } = await serviceClient.auth.admin.getUserById(userId);
        customerEmail = userRecord.user?.email || "";
      }

      if (!customerEmail || !customerEmail.includes("@")) {
        console.error("Welcome email: could not resolve customer email for user", userId);
        return;
      }

      await sendWelcomeEmail(customerEmail, null, paymentType);
      notifyWelcomeSent(customerEmail, paymentType).catch(() => {});
      console.log(`Welcome email sent to ${customerEmail} (first payment: ${paymentType})`);
    }
  } catch (err) {
    console.error("Welcome email: maybeSendWelcomeEmail failed:", err);
  }
}

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

  // Entry-point breadcrumb — makes it trivial to correlate errors below with
  // the event that triggered them in Vercel logs.
  console.log(`Webhook: received ${event.type} (event_id=${event.id})`);

  // ── Subscription renewal — RESET credits to 10 each billing cycle ──────────
  // Use-it-or-lose-it semantics: monthly refresh zeros out used_credits and
  // sets total=10. Unused credits from the prior period don't roll over, so
  // a user can never accumulate credits beyond one month's allowance.
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as {
      subscription?: string;
      customer?: string;
      customer_email?: string;
      amount_paid?: number;
      billing_reason?: string;
      period_start?: number; // unix seconds
      period_end?: number;   // unix seconds
      lines?: { data?: Array<{ period?: { start: number; end: number } }> };
      subscription_details?: { metadata?: Record<string, string> };
    };

    // Only process subscription renewals (not the first invoice — that's handled by checkout.session.completed)
    if (invoice.billing_reason === "subscription_cycle") {
      const subMetadata = invoice.subscription_details?.metadata || {};
      let userId = subMetadata.user_id;

      // Best-effort period extraction: invoice.lines[0].period is the cycle
      // the credits are for; fall back to invoice.period_* then to a 30-day
      // window anchored on "now" if Stripe didn't send them (never happens
      // in practice — defensive).
      const line = invoice.lines?.data?.[0];
      const periodStartSec = line?.period?.start ?? invoice.period_start ?? Math.floor(Date.now() / 1000);
      const periodEndSec = line?.period?.end ?? invoice.period_end ?? Math.floor(Date.now() / 1000) + 30 * 86400;
      const periodStart = new Date(periodStartSec * 1000);
      const periodEnd = new Date(periodEndSec * 1000);

      // Fallback 1 — lookup by stripe_customer_id if no metadata.user_id.
      // Covers manually-reconciled subs (e.g. Jody) where Stripe never saw
      // our metadata. Fallback 2 — lookup by stripe_subscription_id if we
      // have that but no customer match.
      if (!userId && invoice.customer) {
        const serviceClient = await createServiceClient();
        const { data: match } = await serviceClient
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", invoice.customer)
          .maybeSingle();
        if (match?.user_id) {
          userId = match.user_id;
          console.log(
            `Webhook renewal: matched user ${userId} via stripe_customer_id=${invoice.customer} (no metadata)`
          );
        }
      }
      if (!userId && invoice.subscription) {
        const serviceClient = await createServiceClient();
        const { data: match } = await serviceClient
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", invoice.subscription)
          .maybeSingle();
        if (match?.user_id) {
          userId = match.user_id;
          console.log(
            `Webhook renewal: matched user ${userId} via stripe_subscription_id=${invoice.subscription}`
          );
        }
      }

      if (userId) {
        const serviceClient = await createServiceClient();
        try {
          await resetSubscriptionCredits(
            serviceClient,
            userId,
            SUBSCRIPTION_CREDITS,
            periodStart,
            periodEnd
          );
          console.log(
            `Webhook: Reset subscription credits for ${userId} → 10 (cycle ${periodStart.toISOString()} → ${periodEnd.toISOString()})`
          );

          // Sync subscription status
          await serviceClient.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_subscription_id: invoice.subscription || null,
              stripe_customer_id: invoice.customer || null,
              status: "active",
              current_period_start: periodStart.toISOString(),
              current_period_end: periodEnd.toISOString(),
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

          // Record renewal payment (no throw — ancillary)
          await serviceClient.from("payments").insert({
            user_id: userId,
            stripe_session_id: invoice.subscription
              ? `${invoice.subscription}_${periodStartSec}`
              : `renewal_${Date.now()}`,
            payment_type: "subscription_renewal",
            amount_cents: invoice.amount_paid || 1299,
            currency: "usd",
            status: "completed",
            credits_granted: SUBSCRIPTION_CREDITS,
          }).then(({ error }) => {
            if (error && error.code !== "23505") console.error("Renewal payment insert error:", error);
          });
        } catch (err) {
          console.error("Webhook: Failed to reset renewal credits:", {
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            eventId: event.id,
            userId,
            subscriptionId: invoice.subscription,
            customerId: invoice.customer,
            billingReason: invoice.billing_reason,
          });
          return NextResponse.json({ error: "Renewal credit refresh failed" }, { status: 500 });
        }
      } else {
        console.error(
          "Webhook renewal: could not resolve user_id — metadata missing and no customer/subscription match in DB",
          {
            eventId: event.id,
            subscriptionId: invoice.subscription,
            customerId: invoice.customer,
            metadataKeys: Object.keys(subMetadata),
          }
        );
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
          console.error("Webhook: Studio subscription renewal failed:", {
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            eventId: event.id,
            studioId,
            subscriptionId: invoice.subscription,
            customerId: invoice.customer,
          });
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
        console.error("Webhook: Studio checkout processing failed:", {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          eventId: event.id,
          sessionId: session.id,
          studioId,
          userId,
        });
        return NextResponse.json({ error: "Studio checkout failed" }, { status: 500 });
      }
      return NextResponse.json({ received: true });
    }
    // ──────────────────────────────────────────────────────────────────────

    if (!userId) {
      console.error("Webhook: No user_id in session metadata", session.id);
      return NextResponse.json({ received: true });
    }

    // ─── B2C subscription first-invoice branch ────────────────────────────
    // The Season Member ($12.99/mo) flow: set up the subscriptions row and
    // call resetSubscriptionCredits so the user starts with total=10, used=0,
    // and a billing period end from Stripe. Subsequent monthly renewals go
    // through invoice.payment_succeeded / subscription_cycle above.
    const isSubscription = paymentType === "subscription";
    if (isSubscription) {
      const serviceClient = await createServiceClient();
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;

      // Pull period_end from the Stripe subscription (not on the checkout session itself).
      // In recent Stripe API versions these fields moved to subscription items, so
      // check both locations to stay forward/backward compatible.
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
          console.error("Webhook: Failed to fetch subscription for period window:", err);
        }
      }

      try {
        // Idempotency: if a payment row already exists for this session, skip the rest.
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
            payment_type: "subscription",
            amount_cents: session.amount_total || 1299,
            currency: session.currency || "usd",
            status: "completed",
            credits_granted: SUBSCRIPTION_CREDITS,
            referral_code: referralCode,
          }).then(({ error }) => {
            if (error && error.code !== "23505") {
              console.error("Subscription payment insert error:", error);
            }
          });
        }

        await serviceClient.from("subscriptions").upsert(
          {
            user_id: userId,
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

        // Use the anti-arbitrage grant: extends if already in an active period,
        // resets otherwise. Prevents cancel→resubscribe-same-day credit washing.
        await grantSubscriptionCycle(
          serviceClient,
          userId,
          SUBSCRIPTION_CREDITS,
          periodStart,
          periodEnd
        );

        console.log(
          `Webhook: Season Member activated for ${userId} (+${SUBSCRIPTION_CREDITS} credits, expires ${periodEnd.toISOString()})`
        );

        if (referralCode) {
          serviceClient.rpc("attribute_affiliate_revenue", {
            p_user_id: userId,
            p_amount_cents: session.amount_total || 1299,
          }).then(({ error: affErr }) => {
            if (affErr) console.error("Affiliate attribution failed:", affErr);
          });
        }

        const customerEmail = session.customer_email || session.customer_details?.email || userId;
        notifyPayment(
          customerEmail,
          userId,
          "subscription",
          session.amount_total || 1299
        ).catch((err: unknown) => console.error("Payment notification failed:", err));

        // VIP onboarding: welcome email on first purchase only. Fire-and-forget.
        maybeSendWelcomeEmail(serviceClient, userId, customerEmail, "subscription").catch(
          (err) => console.error("Welcome email dispatch failed:", err)
        );
      } catch (err) {
        console.error("Webhook: Subscription checkout processing failed:", {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          eventId: event.id,
          sessionId: session.id,
          userId,
          subscriptionId,
          customerId,
          paymentType,
        });
        return NextResponse.json({ error: "Subscription setup failed" }, { status: 500 });
      }
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
          console.error("Webhook: Credit recovery failed:", {
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            eventId: event.id,
            sessionId: session.id,
            userId,
            paymentType,
            creditsToGrant,
          });
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
      console.error("Webhook: Failed to record payment or grant credits:", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        eventId: event.id,
        sessionId: session.id,
        userId,
        paymentType,
        creditsToGrant,
        amountTotal: session.amount_total,
      });
      notifyWebhookError(
        "checkout.session.completed",
        err instanceof Error ? err.message : String(err),
        `user_id: ${userId}, payment_type: ${paymentType}, session: ${session.id}, credits: ${creditsToGrant}`
      ).catch(() => {});
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

    // VIP onboarding: welcome email on first purchase only. Fire-and-forget.
    maybeSendWelcomeEmail(serviceClient, userId, customerEmail, paymentType).catch(
      (err) => console.error("Welcome email dispatch failed:", err)
    );
  }

  // ── Subscription lifecycle — cancellations and status updates ──────────────
  // When a user cancels, Stripe fires customer.subscription.updated with
  // cancel_at_period_end=true, then customer.subscription.deleted when the
  // period actually ends. In both cases we set expires_at so unused credits
  // disappear at period end — no arbitrage of "subscribe, collect 10, cancel,
  // use for a year."
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as {
      id: string;
      customer?: string;
      status?: string;
      current_period_start?: number;
      current_period_end?: number;
      cancel_at_period_end?: boolean;
      canceled_at?: number | null;
      metadata?: Record<string, string>;
    };

    const userId = sub.metadata?.user_id;
    if (!userId) {
      // No user_id metadata → not a B2C subscription we manage. Studio subs
      // have studio_id instead; skip silently.
      return NextResponse.json({ received: true });
    }

    const serviceClient = await createServiceClient();
    const periodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : new Date();
    const canceledAt = sub.canceled_at ? new Date(sub.canceled_at * 1000) : null;
    const newStatus = event.type === "customer.subscription.deleted" ? "canceled" : (sub.status || "active");

    try {
      await serviceClient.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer || null,
          status: newStatus,
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: !!sub.cancel_at_period_end,
          canceled_at: canceledAt ? canceledAt.toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      // If the user has canceled (either at-period-end flagged or already
      // deleted), lock in expiry. Already-expired dates make credits
      // immediately unusable; future dates let them run out the paid period.
      if (sub.cancel_at_period_end || event.type === "customer.subscription.deleted") {
        await markSubscriptionExpires(serviceClient, userId, periodEnd);
        console.log(
          `Webhook: Subscription ${sub.id} (${newStatus}) — credits expire ${periodEnd.toISOString()}`
        );

        // Alert founder so he can fire a win-back touch before access ends.
        // Lookup the user's email for the notification body.
        const { data: userRecord } = await serviceClient.auth.admin.getUserById(userId);
        const userEmail = userRecord.user?.email || userId;
        notifySubscriptionCanceled(
          userEmail,
          userId,
          event.type === "customer.subscription.deleted"
            ? "subscription_ended"
            : "cancel_at_period_end",
          periodEnd.toISOString()
        ).catch((err) => console.error("Cancel notification failed:", err));
      }
    } catch (err) {
      console.error("Webhook: subscription lifecycle handler failed:", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        eventType: event.type,
        eventId: event.id,
        subscriptionId: sub.id,
        userId,
        newStatus,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      });
      notifyWebhookError(
        event.type,
        err instanceof Error ? err.message : String(err),
        `subscription_id: ${sub.id}, user_id: ${userId}`
      ).catch(() => {});
      return NextResponse.json({ error: "Subscription update failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
