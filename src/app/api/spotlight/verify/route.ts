import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { fulfillSpotlightPurchase, getSpotlightCredits } from "@/lib/spotlight/fulfill";

export const dynamic = "force-dynamic";

/**
 * POST /api/spotlight/verify { session_id }
 * Called by /spotlight/new when the customer lands back from Stripe. Settles
 * the purchase exactly once (the webhook may already have) and returns the
 * Spotlight credit balance so the upload flow can open immediately.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { session_id } = await request.json().catch(() => ({}));
    if (!session_id || typeof session_id !== "string") {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }
    if (session.metadata?.user_id !== user.id) {
      return NextResponse.json({ error: "Session mismatch" }, { status: 403 });
    }
    if (session.metadata?.payment_type !== "spotlight") {
      return NextResponse.json({ error: "Not a Spotlight purchase" }, { status: 400 });
    }

    const svc = await createServiceClient();
    await fulfillSpotlightPurchase(svc, {
      userId: user.id,
      sessionKey: session.id,
      paymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : null,
      amountCents: session.amount_total,
      currency: session.currency,
      referralCode: session.metadata?.referral_code || null,
    });
    const credits = await getSpotlightCredits(svc, user.id);
    return NextResponse.json({ verified: true, credits });
  } catch (err) {
    console.error("spotlight/verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
