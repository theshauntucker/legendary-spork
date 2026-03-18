import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { grantCredits, BETA_CREDITS } from "@/lib/credits";
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

    if (!userId) {
      console.error("Webhook: No user_id in session metadata", session.id);
      return NextResponse.json({ received: true });
    }

    const serviceClient = await createServiceClient();

    // Check for duplicate — idempotency
    const { data: existingPayment } = await serviceClient
      .from("payments")
      .select("id")
      .eq("stripe_session_id", session.id)
      .single();

    if (existingPayment) {
      console.log("Webhook: Duplicate session, skipping", session.id);
      return NextResponse.json({ received: true });
    }

    // Determine credits to grant
    const isBeta = paymentType === "beta_access";
    const creditsToGrant = isBeta ? BETA_CREDITS : 1;

    // Record payment and grant credits — both must succeed or Stripe retries
    try {
      await serviceClient.from("payments").insert({
        user_id: userId,
        stripe_session_id: session.id,
        stripe_payment_intent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        payment_type: paymentType,
        amount_cents: session.amount_total || (isBeta ? 999 : 299),
        currency: session.currency || "usd",
        status: "completed",
        credits_granted: creditsToGrant,
      });

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

    // Send payment notification email (non-blocking, ok to fail)
    const customerEmail = session.customer_email || session.customer_details?.email || userId;
    notifyPayment(
      customerEmail,
      userId,
      paymentType,
      session.amount_total || (isBeta ? 999 : 299)
    ).catch((err) => console.error("Payment notification failed:", err));
  }

  return NextResponse.json({ received: true });
}
