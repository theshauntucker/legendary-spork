import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyReportFeedback } from "@/lib/notifications";
import { clientKey, rateLimit } from "@/lib/internal-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/review-prompt
 *
 * Records the outcome of the one-time "rate your report" prompt so it never
 * shows again for this account, and forwards low ratings / written feedback
 * to the founder's inbox.
 *
 * Body: { analysisId?, rating?: 1–5 | null, feedback?, platform?: "ios"|"web",
 *         clickedStore?: boolean, dismissed?: boolean }
 */
export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, "review-prompt"), { max: 20, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    analysisId?: string;
    rating?: number | null;
    feedback?: string;
    platform?: string;
    clickedStore?: boolean;
    dismissed?: boolean;
  };

  const rating =
    typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5
      ? Math.round(body.rating)
      : null;
  const feedback = typeof body.feedback === "string" ? body.feedback.slice(0, 1500).trim() : "";
  const platform = body.platform === "ios" ? "ios" : "web";

  const serviceClient = await createServiceClient();

  const { data: existing } = await serviceClient
    .from("review_prompts")
    .select("rating, feedback, clicked_store")
    .eq("user_id", user.id)
    .maybeSingle();

  const row = {
    user_id: user.id,
    rating: rating ?? existing?.rating ?? null,
    feedback: feedback || existing?.feedback || null,
    platform,
    clicked_store: !!body.clickedStore || !!existing?.clicked_store,
    updated_at: new Date().toISOString(),
  };

  const { error } = await serviceClient.from("review_prompts").upsert(row, { onConflict: "user_id" });
  if (error) {
    console.error("review-prompt upsert failed:", error.message);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  // Only the founder needs to hear about the misses and the written notes.
  const isNewFeedback = feedback && feedback !== existing?.feedback;
  const isLowRating = rating !== null && rating <= 3 && existing?.rating == null;
  if (isNewFeedback || isLowRating) {
    notifyReportFeedback({
      userEmail: user.email || "unknown",
      rating,
      feedback,
      analysisId: body.analysisId,
      platform,
    }).catch((err) => console.error("notifyReportFeedback failed:", err));
  }

  return NextResponse.json({ ok: true });
}
