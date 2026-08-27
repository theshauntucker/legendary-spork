import { NextRequest, NextResponse } from "next/server";
import { notifyNewSignup } from "@/lib/notifications";
import { rateLimit, clientKey, escapeHtml } from "@/lib/internal-auth";

export const dynamic = "force-dynamic";

/**
 * Generic admin notification endpoint — called client-side from the signup
 * flow, where a server-side notification isn't possible (email/password
 * signup completes in the browser).
 *
 * SECURITY: this has to stay public, but it reaches the founder's inbox with
 * caller-supplied content. Unprotected it is a free inbox-flooding tool and an
 * HTML-injection vector. So: rate limited per IP, field lengths capped, and all
 * values escaped before they reach an email body.
 */
export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(clientKey(request, "notify-admin"), {
      max: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!limit.ok) {
      // Never reveal the limit to a prospective abuser — look like a success.
      console.warn("Rate-limited /api/notify-admin from", clientKey(request, "notify-admin"));
      return NextResponse.json({ ok: true });
    }

    const { type, email, name } = await request.json();

    if (type === "signup" && typeof email === "string" && email.includes("@")) {
      const safeEmail = escapeHtml(email.slice(0, 200));
      const safeName = escapeHtml(String(name ?? "Unknown").slice(0, 120));
      await notifyNewSignup(safeEmail, safeName);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never fail the signup flow
  }
}
