import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";

    // Get the authenticated user — required for payment tracking
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to purchase" },
        { status: 401 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        payment_type: "beta_access",
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "RoutineX — Founding Member Pass",
              description:
                "One-time membership. Includes full access, 3 video analyses, and founding member status.",
            },
            unit_amount: 999, // $9.99
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
