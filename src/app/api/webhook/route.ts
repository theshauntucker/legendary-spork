import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { addPaidSession } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid") {
        addPaidSession(session.id, {
          email: session.customer_details?.email || null,
          amount: session.amount_total,
          paidAt: new Date().toISOString(),
          analysesRemaining: 3,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Webhook error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
