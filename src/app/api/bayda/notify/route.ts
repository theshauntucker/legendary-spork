import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, clientKey, escapeHtml } from "@/lib/internal-auth";

export const dynamic = "force-dynamic";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "22tucker22@comcast.net";

export async function POST(request: NextRequest) {
  try {
    // SECURITY: public endpoint that emails the founder with caller-supplied
    // text. Rate limited, and the message is ESCAPED — it was previously
    // interpolated raw into the HTML body (injection into his inbox).
    const limit = rateLimit(clientKey(request, "bayda-notify"), {
      max: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!limit.ok) {
      return NextResponse.json({ ok: true });
    }

    const { firstMessage } = await request.json();
    const now = new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    });

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.warn("RESEND_API_KEY not set — Bayda chat notification skipped");
      return NextResponse.json({ ok: true });
    }

    const resend = new Resend(key);

    await resend.emails.send({
      from: "RoutineX Alerts <notifications@routinex.org>",
      to: OWNER_EMAIL,
      subject: "Someone is chatting with Bayda!",
      html: `
        <div style="font-family: sans-serif; max-width: 500px;">
          <h2 style="color: #9333EA;">New Bayda Chat Started</h2>
          <p>Someone just started talking to Bayda on routinex.org!</p>
          <div style="background: #f3f4f6; padding: 12px 16px; border-radius: 8px; margin: 12px 0;">
            <p style="margin: 0; color: #374151;"><strong>Their first message:</strong></p>
            <p style="margin: 4px 0 0 0; color: #1f2937; font-style: italic;">"${escapeHtml(String(firstMessage || "").slice(0, 500))}"</p>
          </div>
          <p><strong>Time:</strong> ${now} PDT</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 20px;" />
          <p style="color: #6b7280; font-size: 12px;">RoutineX — Bayda Chat Notification</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Bayda notify error:", err);
    return NextResponse.json({ ok: true });
  }
}
