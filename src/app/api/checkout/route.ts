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
    const isSubscription = type === "subscription";

    // ── Season Member subscription — $12.99/month, 10 analyses ───────────────
    if (isSubscription) {
      const subSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: user.email,
        metadata: {
          user_id: user.id,
          payment_type: "subscription",
          ...(effectiveReferralCode ? { referral_code: effectiveReferralCode.toUpperCase() } : {}),
        },
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "RoutineX — Season Member",
                description: "10 AI-powered dance analyses per month. Introductory rate — locked in for as long as you stay subscribed.",
              },
              unit_amount: 1299, // $12.99/month
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          metadata: {
            user_id: user.id,
            payment_type: "subscription",
          },
        },
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
        cancel_url: `${baseUrl}/#pricing`,
      });
      return NextResponse.json({ url: subSession.url });
    }

    // ── One-time purchases ────────────────────────────────────────────────────
    const productConfig = isPack
      ? {
          name: "RoutineX — Competition Pack (5 Analyses)",
          description: "5 AI-powered dance routine analyses. Your video never leaves your device — only still-frame thumbnails are analyzed. Nothing is uploaded, stored, or seen by anyone.",
          unit_amount: 2999, // $29.99
          payment_type: "video_analysis",
        }
      : {
          name: "RoutineX — Launch Offer: 2 Analyses for $8.99",
          description: "BOGO launch offer — get 2 full AI-powered dance routine analyses for $8.99. Your video never leaves your device — only still-frame thumbnails are analyzed. Nothing is uploaded, stored, or seen by anyone.",
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
