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

    // Determine payment type from request body
    let paymentType = "beta_access";
    try {
      const body = await request.json();
      if (body.type === "video_analysis") {
        paymentType = "video_analysis";
      }
    } catch {
      // Default to beta_access if no body
    }

    const isBeta = paymentType === "beta_access";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        payment_type: paymentType,
      },
      line_items: [
        isBeta
          ? {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "RoutineX Beta — Early Access Pass",
                  description:
                    "One-time join fee. Includes priority access, 3 free video analyses, and founding member status.",
                },
                unit_amount: 999, // $9.99
              },
              quantity: 1,
            }
          : {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "RoutineX — Video Analysis",
                  description:
                    "AI-powered competition-standard analysis for one routine video.",
                },
                unit_amount: 299, // $2.99
              },
              quantity: 1,
            },
      ],
      success_url: isBeta
        ? `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`
        : `${baseUrl}/dashboard?purchased=video&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: isBeta ? `${baseUrl}/#pricing` : `${baseUrl}/dashboard`,
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
