import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Try to get the authenticated user's email for Stripe
    let customerEmail: string | undefined;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        customerEmail = user.email;
      }
    } catch {
      // Not logged in — that's fine, checkout still works
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      ...(customerEmail && { customer_email: customerEmail }),
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "RoutineX Beta — Early Access Pass",
              description:
                "One-time join fee. Includes priority access, 3 free video analyses, and founding member status.",
            },
            unit_amount: 999, // $9.99 in cents
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
