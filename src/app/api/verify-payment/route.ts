import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { grantCredits, BETA_CREDITS } from "@/lib/credits";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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

    // Verify payment is actually completed
    if (session.payment_status !== "paid") {
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

    // Check if already processed (idempotency — same check as webhook)
    const { data: existingPayment } = await serviceClient
      .from("payments")
      .select("id")
      .eq("stripe_session_id", session_id)
      .single();

    if (existingPayment) {
      // Already processed — credits should be there
      return NextResponse.json({ verified: true, already_processed: true });
    }

    // Webhook hasn't processed yet — grant credits now
    const paymentType = session.metadata?.payment_type || "beta_access";
    const isBeta = paymentType === "beta_access";
    const creditsToGrant = isBeta ? BETA_CREDITS : 1;

    await serviceClient.from("payments").insert({
      user_id: user.id,
      stripe_session_id: session_id,
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

    await grantCredits(serviceClient, user.id, creditsToGrant, isBeta);

    console.log(
      `Verify-payment: Granted ${creditsToGrant} credits to ${user.id} (${paymentType}) — webhook fallback`
    );

    return NextResponse.json({ verified: true, credits_granted: creditsToGrant });
  } catch (err) {
    console.error("Verify-payment error:", err);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
