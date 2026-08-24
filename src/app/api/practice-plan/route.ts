import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { isSeasonMember, generateAndSavePlan } from "@/lib/practice-plan";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // plan generation runs inline for members

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "22tucker22@comcast.net";

/**
 * GET /api/practice-plan?videoId=... — status poll for the plan viewer.
 */
export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId");
  if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const serviceClient = await createServiceClient();
  const { data: plan } = await serviceClient
    .from("practice_plans")
    .select("id, status, content, error")
    .eq("video_id", videoId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!plan) return NextResponse.json({ status: "none" });
  return NextResponse.json({
    status: plan.status,
    content: plan.status === "ready" ? plan.content : null,
  });
}

/**
 * POST /api/practice-plan { videoId }
 *
 * Season Members + admin: generate immediately (included in membership).
 * Everyone else: create a $4.99 Stripe checkout; the webhook queues generation
 * after payment. Never grants analysis credits — this is a content purchase.
 */
export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();
    if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const serviceClient = await createServiceClient();

    // The video must belong to this user and be analyzed
    const { data: video } = await serviceClient
      .from("videos")
      .select("id, user_id, status, dancer_id")
      .eq("id", videoId)
      .eq("user_id", user.id)
      .single();

    if (!video) return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    if (video.status !== "analyzed") {
      return NextResponse.json({ error: "Analysis not finished yet" }, { status: 400 });
    }

    // Existing plan?
    const { data: existing } = await serviceClient
      .from("practice_plans")
      .select("id, status")
      .eq("video_id", videoId)
      .maybeSingle();

    if (existing?.status === "ready") {
      return NextResponse.json({ status: "ready" });
    }
    if (existing?.status === "generating") {
      return NextResponse.json({ status: "generating" });
    }
    // "queued" means the webhook already confirmed payment (or a member run
    // was interrupted) — generate now, no further payment gate.
    if (existing?.status === "queued") {
      const result = await generateAndSavePlan(serviceClient, existing.id);
      return NextResponse.json(
        result.ok ? { status: "ready" } : { status: "error", error: result.error },
        result.ok ? undefined : { status: 500 }
      );
    }

    const isAdmin = user.email === ADMIN_EMAIL;
    const member = isAdmin || (await isSeasonMember(serviceClient, user.id));

    // ── Included for Season Members: generate right now ─────────────────────
    if (member) {
      let planId = existing?.id as string | undefined;
      if (planId) {
        await serviceClient
          .from("practice_plans")
          .update({
            status: "queued",
            source: isAdmin ? "admin" : "subscription",
            error: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", planId);
      } else {
        const { data: created, error: insErr } = await serviceClient
          .from("practice_plans")
          .insert({
            user_id: user.id,
            video_id: videoId,
            dancer_id: video.dancer_id ?? null,
            status: "queued",
            source: isAdmin ? "admin" : "subscription",
          })
          .select("id")
          .single();
        if (insErr || !created) throw insErr || new Error("Plan insert failed");
        planId = created.id;
      }

      const result = await generateAndSavePlan(serviceClient, planId!);
      if (!result.ok) {
        return NextResponse.json({ status: "error", error: result.error }, { status: 500 });
      }
      return NextResponse.json({ status: "ready" });
    }

    // ── À la carte: $4.99 through Stripe ────────────────────────────────────
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        payment_type: "practice_plan",
        video_id: videoId,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "RoutineX — Personalized Practice Plan",
              description:
                "A 2-week home practice plan built from this routine's judge report — every drill traces to a specific judge's note. Included free with Season Membership.",
            },
            unit_amount: 499, // $4.99
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/practice-plan/${videoId}?paid=1`,
      cancel_url: `${baseUrl}/analysis/${videoId}`,
    });

    // Track the pending purchase so the webhook can find and queue it
    if (existing?.id) {
      await serviceClient
        .from("practice_plans")
        .update({
          status: "pending_payment",
          source: "purchase",
          stripe_session_id: session.id,
          error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await serviceClient.from("practice_plans").insert({
        user_id: user.id,
        video_id: videoId,
        dancer_id: video.dancer_id ?? null,
        status: "pending_payment",
        source: "purchase",
        stripe_session_id: session.id,
      });
    }

    return NextResponse.json({ status: "checkout", url: session.url });
  } catch (err) {
    console.error("Practice plan route error:", err);
    return NextResponse.json({ error: "Failed to start practice plan" }, { status: 500 });
  }
}
