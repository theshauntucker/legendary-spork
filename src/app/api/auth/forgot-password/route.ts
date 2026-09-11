import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/notifications";
import { clientKey, rateLimit } from "@/lib/internal-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/forgot-password  { email }
 *
 * Generates a one-time Supabase recovery token server-side and emails a link
 * to /reset-password through our own Resend sender (the same verified domain
 * every other RoutineX email uses), so it doesn't depend on Supabase's
 * built-in mailer or its redirect allow-list.
 *
 * Always answers { ok: true } — never reveals whether an email has an account.
 */
export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, "forgot-password"), { max: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests — try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  let email = "";
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    /* fall through */
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const service = await createServiceClient();
    const { data, error } = await service.auth.admin.generateLink({ type: "recovery", email });
    const tokenHash = data?.properties?.hashed_token;
    if (error || !tokenHash) {
      // Unknown email (or Supabase hiccup) — log, but answer the same way.
      console.log("forgot-password: no recovery link generated", error?.message);
      return NextResponse.json({ ok: true });
    }
    const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://routinex.org").replace(/\/$/, "");
    const resetUrl = `${site}/reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`;
    await sendPasswordResetEmail(email, resetUrl);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("forgot-password error:", err);
    return NextResponse.json({ ok: true });
  }
}
