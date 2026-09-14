import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { grantCredits } from "@/lib/credits";
import { notifyFeedbackNote } from "@/lib/notifications";
import { clientKey, rateLimit } from "@/lib/internal-auth";

export const dynamic = "force-dynamic";

/**
 * The feedback loop.
 *
 * Every engagement prompt in the app — the "what are you hoping to fix?"
 * question during the wait, the star prompt on the report, the milestone
 * cards — posts here. One written note earns the account a free analysis,
 * once ever. The `feedback_rewards` primary key is what enforces "once".
 *
 * GET  → { rewardAvailable } so a prompt knows whether it can promise a credit.
 * POST → records the note, pays out if it qualifies, tells Shaun.
 */

const KINDS = new Set(["pre_analysis", "report_rating", "milestone", "idea"]);

/** A note has to say something real before it buys an analysis. */
const MIN_REWARDABLE = 15;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ rewardAvailable: false });

  const serviceClient = await createServiceClient();
  const { data } = await serviceClient
    .from("feedback_rewards")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ rewardAvailable: !data });
}

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, "feedback"), { max: 30, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const payload = (await request.json().catch(() => ({}))) as {
    kind?: string;
    promptKey?: string;
    choice?: string;
    body?: string;
    rating?: number;
    videoId?: string;
    analysisId?: string;
    platform?: string;
    testimonial?: { allow?: boolean; displayName?: string; role?: string };
  };

  const kind = KINDS.has(payload.kind || "") ? (payload.kind as string) : "idea";
  const note = typeof payload.body === "string" ? payload.body.slice(0, 2000).trim() : "";
  const choice = typeof payload.choice === "string" ? payload.choice.slice(0, 120).trim() : "";
  const promptKey = typeof payload.promptKey === "string" ? payload.promptKey.slice(0, 60) : null;
  const rating =
    typeof payload.rating === "number" && payload.rating >= 1 && payload.rating <= 5
      ? Math.round(payload.rating)
      : null;
  const platform = payload.platform === "ios" ? "ios" : "web";

  if (!note && !choice && rating === null) {
    return NextResponse.json({ error: "Nothing to save" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();

  const { data: inserted, error: insertError } = await serviceClient
    .from("feedback_notes")
    .insert({
      user_id: user.id,
      kind,
      prompt_key: promptKey,
      choice: choice || null,
      body: note || null,
      rating,
      video_id: payload.videoId || null,
      analysis_id: payload.analysisId || null,
      platform,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("feedback insert failed:", insertError.message);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  // ── The payout ────────────────────────────────────────────────────────
  // Insert-first, grant-second: the primary key collision is the lock, so
  // two tabs racing each other can only ever produce one free analysis.
  let creditGranted = false;
  if (note.length >= MIN_REWARDABLE) {
    const { error: rewardError } = await serviceClient
      .from("feedback_rewards")
      .insert({ user_id: user.id, credits: 1, feedback_note_id: inserted.id });

    if (!rewardError) {
      try {
        await grantCredits(serviceClient, user.id, 1, false);
        creditGranted = true;
        await serviceClient
          .from("feedback_notes")
          .update({ credit_granted: true })
          .eq("id", inserted.id);
      } catch (err) {
        // Roll the claim back so they can try again rather than losing it.
        await serviceClient.from("feedback_rewards").delete().eq("user_id", user.id);
        console.error("feedback credit grant failed:", err);
      }
    }
    // rewardError with code 23505 = already claimed. Silent, by design.
  }

  // ── Publishable social proof ──────────────────────────────────────────
  if (payload.testimonial?.allow && note && (rating === null || rating >= 4)) {
    await serviceClient
      .from("testimonials")
      .insert({
        user_id: user.id,
        display_name: (payload.testimonial.displayName || "").slice(0, 80).trim() || null,
        role: (payload.testimonial.role || "").slice(0, 60).trim() || null,
        quote: note,
        rating,
        approved: false,
      })
      .then(({ error }) => {
        if (error) console.error("testimonial insert failed:", error.message);
      });
  }

  // Shaun hears about anything with words in it, and about every miss.
  if (note || (rating !== null && rating <= 3)) {
    notifyFeedbackNote({
      userEmail: user.email || "unknown",
      kind,
      promptKey,
      choice,
      body: note,
      rating,
      analysisId: payload.analysisId,
      platform,
      creditGranted,
    }).catch((err) => console.error("notifyFeedbackNote failed:", err));
  }

  return NextResponse.json({ ok: true, creditGranted });
}
