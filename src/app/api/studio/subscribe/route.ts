import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/studio/subscribe
 *
 * Creates a Stripe subscription checkout session for the caller's studio
 * ($99/mo with 30-day trial). Returns { url } for client-side redirect.
 *
 * Metadata is stamped on BOTH the session AND subscription_data so the
 * webhook can discriminate both checkout.session.completed and
 * invoice.payment_succeeded events without hitting Stripe again:
 *   - payment_type: "studio_subscription"
 *   - studio_id: <uuid>
 *   - user_id: <owner id>  (session only; renewals intentionally omit it
 *     so the Season-Member renewal block silently no-ops)
 *
 * Owner-only: the subscription is paid by the studio owner. Choreographers
 * get 403.
 */
export async function POST(request: NextRequest) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const membership = await loadStudioMembership(supabase, user.id);
    if (!membership || membership.role !== "owner") {
      return NextResponse.json({ error: "Owner only" }, { status: 403 });
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        studio_id: membership.studioId,
        payment_type: "studio_subscription",
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "RoutineX Studio — Beta",
              description:
                "Shared 50-analysis monthly pool for your whole studio, Music Hub with collision detection, team board, and season schedule. 30-day free trial.",
            },
            unit_amount: 9900, // $99.00/month — beta placeholder pricing
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          studio_id: membership.studioId,
          payment_type: "studio_subscription",
        },
      },
      success_url: `${baseUrl}/studio/dashboard?subscribed=1`,
      cancel_url: `${baseUrl}/studio/settings?subscribe=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Studio subscribe error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
