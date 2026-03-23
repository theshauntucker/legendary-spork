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
    const type = body.type || "trial"; // "trial" = $4.99, "pack" = $24.99

    // Get the authenticated user — required for payment tracking
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Block trial if already used — only one $4.99 trial per account ever
    if (type === "trial") {
      const serviceClient = await createServiceClient();
      const { data: existingTrial } = await serviceClient
        .from("payments")
        .select("id")
        .eq("user_id", user.id)
        .eq("payment_type", "trial")
        .eq("status", "completed")
        .maybeSingle();

      if (existingTrial) {
        // Trial already used — force them to the pack
        return NextResponse.json({
          error: "trial_used",
          message: "You've already used your $4.99 trial. Get 5 analyses for $24.99.",
          redirect: "pack",
        }, { status: 403 });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to purchase" },
        { status: 401 }
      );
    }

    const isPack = type === "pack";
    const productConfig = isPack
      ? {
          name: "RoutineX — Competition Pack",
          description: "5 AI-powered dance routine analyses. Your video never leaves your device — only still-frame thumbnails are analyzed. Nothing is uploaded, stored, or seen by anyone.",
          unit_amount: 2499, // $24.99
          payment_type: "video_analysis",
        }
      : {
          name: "RoutineX — First Analysis",
          description: "Your first AI analysis. Your video never leaves your device — only still-frame thumbnails are analyzed. Nothing is uploaded, stored, or seen by anyone.",
          unit_amount: 499, // $4.99
          payment_type: "trial",
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        payment_type: productConfig.payment_type,
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
