import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing-portal
 * Creates a Stripe Billing Portal session so the authenticated user can
 * manage or cancel their Season Member subscription on the web.
 *
 * Resolves the Stripe customer id from our own records:
 *   1. subscriptions.stripe_customer_id (set when a sub is created)
 *   2. fallback — the most recent payments row's stripe_session_id, from
 *      which we retrieve the Stripe Checkout session to read its customer.
 * Returns 404 if no Stripe customer can be found for the user (e.g. their
 * only purchases were iOS in-app, which Apple manages).
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const serviceClient = await createServiceClient();
    const stripe = getStripe();

    let customerId: string | null = null;

    // 1. Prefer the subscriptions table — it stores the customer id directly.
    const { data: sub } = await serviceClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (sub?.stripe_customer_id) {
      customerId = sub.stripe_customer_id;
    }

    // 2. Fallback — resolve the customer id from the most recent payment's
    //    Stripe Checkout session.
    if (!customerId) {
      const { data: payment } = await serviceClient
        .from("payments")
        .select("stripe_session_id")
        .eq("user_id", user.id)
        .not("stripe_session_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (payment?.stripe_session_id) {
        try {
          const session = await stripe.checkout.sessions.retrieve(
            payment.stripe_session_id
          );
          customerId =
            typeof session.customer === "string" ? session.customer : null;
        } catch (err) {
          console.error("Billing portal: session retrieve failed:", err);
        }
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://routinex.org"}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
