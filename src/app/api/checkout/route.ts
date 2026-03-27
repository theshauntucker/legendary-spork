import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";

    const body = await request.json().catch(() => ({}));
    const type = body.type || "single"; // "single" = $8.99, "pack" = $29.99
    const referralCode = body.referralCode || null;

    // Get the authenticated user — required for payment tracking
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to purchase" },
        { status: 401 }
      );
    }

    // Look up the user's referral code from their account if not passed
    let effectiveReferralCode = referralCode;
    if (!effectiveReferralCode) {
      const svc = await createServiceClient();
      const { data: creditRow } = await svc
        .from("user_credits")
        .select("referral_code")
        .eq("user_id", user.id)
        .maybeSingle();
      if (creditRow?.referral_code) {
        effectiveReferralCode = creditRow.referral_code;
      }
    }

    const isPack = type === "pack";
    const productConfig = isPack
      ? {
          name: "RoutineX — Competition Pack (5 Analyses)",
          description: "5 AI-powered dance routine analyses. Your video never leaves your device — only still-frame thumbnails are analyzed. Nothing is uploaded, stored, or seen by anyone.",
          unit_amount: 2999, // $29.99
          payment_type: "video_analysis",
        }
      : {
          name: "RoutineX — Single Analysis",
          description: "1 AI-powered dance routine analysis. Your video never leaves your device — only still-frame thumbnails are analyzed. Nothing is uploaded, stored, or seen by anyone.",
          unit_amount: 899, // $8.99
          payment_type: "single",
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        payment_type: productConfig.payment_type,
        ...(effectiveReferralCode ? { referral_code: effectiveReferralCode.toUpperCase() } : {}),
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productConfig.name,
              description: productConfig.description,
            },
            unit_amount: productConfig.unit_amount,
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
