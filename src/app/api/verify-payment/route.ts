import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getPaidSession, addPaidSession } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { verified: false, error: "Missing session ID" },
        { status: 400 }
      );
    }

    // Check in-memory cache first
    const cached = getPaidSession(sessionId);
    if (cached) {
      return NextResponse.json({
        verified: true,
        analysesRemaining: cached.analysesRemaining,
        email: cached.email,
      });
    }

    // Fall back to Stripe API verification
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Cache it for future requests in this instance
      addPaidSession(sessionId, {
        email: session.customer_details?.email || null,
        amount: session.amount_total,
        paidAt: new Date().toISOString(),
        analysesRemaining: 3,
      });

      return NextResponse.json({
        verified: true,
        analysesRemaining: 3,
        email: session.customer_details?.email || null,
      });
    }

    return NextResponse.json({ verified: false });
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { verified: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
