import { Resend } from "resend";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "22tucker22@comcast.net";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set — skipping email notification");
    return null;
  }
  return new Resend(key);
}

async function sendEmail(subject: string, html: string) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not configured — email skipped:", subject);
    return;
  }

  try {
    const result = await resend.emails.send({
      from: "RoutineX <onboarding@resend.dev>",
      to: OWNER_EMAIL,
      subject,
      html,
    });
    console.log("Email sent:", subject, "ID:", (result as any)?.id);
  } catch (err) {
    console.error("Failed to send notification email:", subject, err);
  }
}

export async function notifyNewSignup(email: string, userIdOrName: string = "") {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  await sendEmail(
    `🎉 New Signup: ${email}`,
    `
    <div style="font-family: sans-serif; max-width: 500px;">
      <h2 style="color: #7c3aed;">New User Signed Up</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Name / ID:</strong> ${userIdOrName || "Not provided"}</p>
      <p><strong>Time:</strong> ${now} PDT</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 12px;">RoutineX Notification</p>
    </div>
    `
  );
}

export async function notifyPayment(
  email: string,
  userId: string,
  paymentType: string,
  amountCents: number
) {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const amount = (amountCents / 100).toFixed(2);
  const typeLabel =
    paymentType === "subscription"
      ? `Season Member ($${amount}/mo, 10 credits)`
      : paymentType === "subscription_renewal"
      ? `Season Member Renewal ($${amount}/mo, 10 credits reset)`
      : paymentType === "studio_subscription"
      ? `Studio Plan ($${amount}/mo, 100 pool credits)`
      : paymentType === "video_analysis"
      ? `Competition Pack ($${amount}, 5 credits)`
      : paymentType === "single"
      ? `BOGO ($${amount}, 2 credits)`
      : paymentType === "beta_access"
      ? `Legacy Beta ($${amount})`
      : `Unknown type (${paymentType}) — $${amount}`;

  await sendEmail(
    `Payment Received: $${amount} from ${email}`,
    `
    <div style="font-family: sans-serif; max-width: 500px;">
      <h2 style="color: #16a34a;">Payment Received!</h2>
      <p><strong>Customer:</strong> ${email}</p>
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Type:</strong> ${typeLabel}</p>
      <p><strong>User ID:</strong> ${userId}</p>
      <p><strong>Time:</strong> ${now} ET</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 12px;">RoutineX Notification</p>
    </div>
    `
  );
}

export async function notifyTrafficSummary(stats: {
  totalVisitors: number;
  pageViews: number;
  topPages: Array<{ page: string; views: number }>;
  period: string;
}) {
  const topPagesHtml = stats.topPages
    .map((p) => `<li>${p.page} — ${p.views} views</li>`)
    .join("");

  await sendEmail(
    `Traffic Summary: ${stats.totalVisitors} visitors (${stats.period})`,
    `
    <div style="font-family: sans-serif; max-width: 500px;">
      <h2 style="color: #7c3aed;">Traffic Summary — ${stats.period}</h2>
      <p><strong>Unique Visitors:</strong> ${stats.totalVisitors}</p>
      <p><strong>Page Views:</strong> ${stats.pageViews}</p>
      <h3>Top Pages</h3>
      <ul>${topPagesHtml || "<li>No data</li>"}</ul>
      <hr style="border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 12px;">RoutineX Daily Notification</p>
    </div>
    `
  );
}

export async function notifyAnalysisComplete(
  email: string,
  routineName: string,
  style: string,
  score: number,
  award: string
) {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  await sendEmail(
    `✅ Analysis Complete — ${routineName} (${email})`,
    `
    <div style="font-family: sans-serif; max-width: 500px;">
      <h2 style="color: #16a34a;">Analysis Complete</h2>
      <p><strong>User:</strong> ${email}</p>
      <p><strong>Routine:</strong> ${routineName}</p>
      <p><strong>Style:</strong> ${style}</p>
      <p><strong>Score:</strong> ${score} — ${award}</p>
      <p><strong>Time:</strong> ${now} PDT</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 12px;">RoutineX Notification</p>
    </div>
    `
  );
}

export async function notifyAnalysisError(
  email: string,
  error: string,
  context?: string
) {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  await sendEmail(
    `❌ Analysis Error — ${email}`,
    `
    <div style="font-family: sans-serif; max-width: 500px;">
      <h2 style="color: #dc2626;">Analysis Failed</h2>
      <p><strong>User:</strong> ${email}</p>
      <p><strong>Error:</strong> ${error}</p>
      ${context ? `<p><strong>Context:</strong> ${context}</p>` : ""}
      <p><strong>Time:</strong> ${now} PDT</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 12px;">RoutineX Notification</p>
    </div>
    `
  );
}
export async function notifyAdminReport(
  reporterEmail: string,
  targetKind: string,
  targetId: string,
  reason: string
) {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  await sendEmail(
    `🚨 New Report: ${targetKind} — ${targetId.slice(0, 12)}`,
    `
    <div style="font-family: sans-serif; max-width: 500px;">
      <h2 style="color: #dc2626;">New Moderation Report</h2>
      <p><strong>Reporter:</strong> ${reporterEmail}</p>
      <p><strong>Target:</strong> ${targetKind} / ${targetId}</p>
      <p><strong>Reason:</strong></p>
      <blockquote style="border-left: 3px solid #dc2626; padding-left: 12px; color: #374151;">
        ${reason.replace(/[<>]/g, "")}
      </blockquote>
      <p><strong>Time:</strong> ${now} PDT</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 12px;">RoutineX Moderation</p>
    </div>
    `
  );
}
export async function notifySubscriptionCanceled(
  email: string,
  userId: string,
  reason: string = "user_canceled",
  periodEnd?: string
) {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  await sendEmail(
    `⚠️ Subscription Canceled: ${email}`,
    `
    <div style="font-family: sans-serif; max-width: 500px;">
      <h2 style="color: #f97316;">Subscription Canceled</h2>
      <p><strong>Customer:</strong> ${email}</p>
      <p><strong>User ID:</strong> ${userId}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      ${periodEnd ? `<p><strong>Access ends:</strong> ${periodEnd}</p>` : ""}
      <p><strong>Time:</strong> ${now} ET</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 12px;">Consider a win-back email before access ends.</p>
    </div>
    `
  );
}

export async function notifyWebhookError(
  eventType: string,
  error: string,
  context?: string
) {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  await sendEmail(
    `🔴 Webhook Error: ${eventType}`,
    `
    <div style="font-family: sans-serif; max-width: 500px;">
      <h2 style="color: #dc2626;">Stripe Webhook Failed</h2>
      <p><strong>Event:</strong> ${eventType}</p>
      <p><strong>Error:</strong> ${error}</p>
      ${context ? `<p><strong>Context:</strong> ${context}</p>` : ""}
      <p><strong>Time:</strong> ${now} ET</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 12px;">Check Stripe webhook logs and Vercel function logs.</p>
    </div>
    `
  );
}

export async function notifyCritical(
  subject: string,
  body: string,
  context?: Record<string, string | number | null | undefined>
) {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const contextHtml = context
    ? Object.entries(context)
        .map(([k, v]) => `<p><strong>${k}:</strong> ${String(v ?? "n/a")}</p>`)
        .join("")
    : "";
  await sendEmail(
    `🚨 ${subject}`,
    `
    <div style="font-family: sans-serif; max-width: 500px;">
      <h2 style="color: #dc2626;">${subject}</h2>
      <p>${body}</p>
      ${contextHtml}
      <p><strong>Time:</strong> ${now} ET</p>
    </div>
    `
  );
}
// ---------------------------------------------------------------------------
// Customer-facing email infrastructure
// ---------------------------------------------------------------------------

const TEAM_FROM = "The RoutineX Team <hello@routinex.org>";
const TEAM_FROM_FALLBACK = "RoutineX <onboarding@resend.dev>";
const TEAM_REPLY_TO = process.env.OWNER_EMAIL || "22tucker22@comcast.net";

// Kept as aliases so existing callers (`useFounderFrom: true`) keep working.
// Voice is now the clean Team voice across all customer email.
const FOUNDER_FROM = TEAM_FROM;
const FOUNDER_FROM_FALLBACK = TEAM_FROM_FALLBACK;
const FOUNDER_REPLY_TO = TEAM_REPLY_TO;

/**
 * Send an email to a customer (not the owner). Used for welcome flows,
 * receipts, and other user-facing comms. Reply-to is always the founder
 * so customer replies come directly to Shaun's inbox.
 */
async function sendCustomerEmail(
  to: string,
  subject: string,
  html: string,
  opts?: { fromName?: string; replyTo?: string; useFounderFrom?: boolean }
) {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "RESEND_API_KEY not configured — customer email skipped:",
      subject,
      to
    );
    return;
  }

  const from = opts?.useFounderFrom
    ? process.env.RESEND_USE_FOUNDER_DOMAIN === "true"
      ? FOUNDER_FROM
      : FOUNDER_FROM_FALLBACK
    : opts?.fromName
    ? `${opts.fromName} <onboarding@resend.dev>`
    : "RoutineX <onboarding@resend.dev>";

  try {
    const result = await resend.emails.send({
      from,
      to,
      reply_to: opts?.replyTo || FOUNDER_REPLY_TO,
      subject,
      html,
    } as Parameters<typeof resend.emails.send>[0]);
    console.log(
      "Customer email sent:",
      subject,
      "to:",
      to,
      "id:",
      (result as { id?: string } | null)?.id
    );
  } catch (err) {
    console.error("Failed to send customer email:", subject, "to:", to, err);
  }
}

/**
 * VIP welcome email — sent on a customer's FIRST successful payment.
 * Clean professional Team voice. Signed "The RoutineX Team". Support routes
 * into Bayda (in-app AI) — never promises reply-to-email at paid-ad scale.
 */
export async function sendWelcomeEmail(
  customerEmail: string,
  firstName: string | null,
  paymentType: string
) {
  const firstNameClean = firstName && firstName.trim().length > 0
    ? firstName.split(" ")[0]
    : null;

  const planLine =
    paymentType === "subscription"
      ? "You're a <strong>Season Member</strong> — 10 full analyses every month, reset automatically."
      : paymentType === "video_analysis"
      ? "You grabbed the <strong>Competition Pack</strong> — 5 full analyses ready to use."
      : paymentType === "single"
      ? "You grabbed the <strong>BOGO</strong> — 2 analyses ready when you are."
      : paymentType === "beta_access"
      ? "You're in as a <strong>Legacy Beta</strong> member. Thank you for being here early."
      : "Your credits are loaded and ready to use.";

  const subject = firstNameClean
    ? `Welcome to RoutineX, ${firstNameClean} — your credits are ready`
    : "Welcome to RoutineX — your credits are ready";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Welcome to RoutineX</title>
</head>
<body style="margin:0;padding:0;background:#0a0118;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f3f4f6;">
  <div style="display:none;max-height:0;overflow:hidden;">Your RoutineX credits are ready. Here's how to run your first analysis.</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0118;padding:24px 0;">
    <tr>
      <td align="center">

        <!-- HERO CARD -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:linear-gradient(135deg,#1a0b2e 0%,#2d0b3e 50%,#0a0118 100%);border-radius:24px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.06);">
          <tr>
            <td style="padding:48px 40px 32px 40px;text-align:center;background:linear-gradient(135deg,rgba(168,85,247,0.15),rgba(236,72,153,0.15),rgba(251,191,36,0.15));">
              <!-- Sunset X mark -->
              <div style="display:inline-block;width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,#EC4899,#F97316,#FBBF24);box-shadow:0 12px 40px -8px rgba(236,72,153,0.6);line-height:72px;text-align:center;font-size:40px;font-weight:800;color:#0a0118;letter-spacing:-2px;">X</div>
              <h1 style="margin:24px 0 8px 0;font-size:32px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(to right,#C084FC,#F472B6,#FBBF24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:#F472B6;">Welcome to RoutineX</h1>
              <p style="margin:0;font-size:16px;color:#d1d5db;">The AI judge for dancers and cheerleaders.</p>
            </td>
          </tr>

          <!-- OPENER -->
          <tr>
            <td style="padding:32px 40px 8px 40px;">
              <p style="margin:0 0 16px 0;font-size:17px;line-height:1.6;color:#f3f4f6;">${firstNameClean ? `Welcome, ${firstNameClean}.` : "Welcome."}</p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#e5e7eb;">
                ${planLine}
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#e5e7eb;">
                RoutineX is built for competitive dancers and cheerleaders who want real, objective feedback on their routines. Below is exactly what you get and how to use it.
              </p>
            </td>
          </tr>

          <!-- FEATURES -->
          <tr>
            <td style="padding:24px 40px 8px 40px;">
              <h2 style="margin:0 0 16px 0;font-size:20px;font-weight:700;color:#ffffff;">What you can do with RoutineX</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#A855F7,#EC4899,#FF6B6B);line-height:32px;text-align:center;font-size:16px;">🎬</span>
                  </td>
                  <td style="padding:14px 0 14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:4px;">Upload any routine video</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.5;">Solo, duet, group, cheer, lyrical, hip-hop, jazz — up to 10 minutes. Phone video works fine.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#7C3AED,#D63384,#FF6B6B);line-height:32px;text-align:center;font-size:16px;">⭐</span>
                  </td>
                  <td style="padding:14px 0 14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:4px;">Competition-style scoring</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.5;">Three AI judges grade Technique, Performance, Choreography, and Overall Impression. You get a real score and an award level: Gold, High Gold, Platinum, or Diamond.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#FCD34D,#F59E0B,#D97706);line-height:32px;text-align:center;font-size:16px;">⏱</span>
                  </td>
                  <td style="padding:14px 0 14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:4px;">Timestamped feedback</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.5;">Specific notes tied to the exact moment in the video — toe point at 0:42, head snap at 1:17, formation drift at 2:05.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#C4B5FD,#67E8F9,#F0ABFC);line-height:32px;text-align:center;font-size:16px;">📈</span>
                  </td>
                  <td style="padding:14px 0 14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:4px;">Improvement roadmap</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.5;">The top three things to fix before your next competition — ranked by how much they'll move your score.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#EC4899,#F97316,#FBBF24);line-height:32px;text-align:center;font-size:16px;">💬</span>
                  </td>
                  <td style="padding:14px 0 14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:4px;">Bayda — your AI coach</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.5;">Ask anything about your score, about technique, or about competition prep. She's on every page.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;vertical-align:top;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#9333EA,#DB2777,#F472B6);line-height:32px;text-align:center;font-size:16px;">🏆</span>
                  </td>
                  <td style="padding:14px 0 14px 16px;vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:4px;">Trophy Wall + Coda community</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.5;">Save your best routines to your Trophy Wall, follow other dancers and cheerleaders, and celebrate scores together. No photos — just auras and results.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HOW TO GET STARTED -->
          <tr>
            <td style="padding:32px 40px 8px 40px;">
              <h2 style="margin:0 0 16px 0;font-size:20px;font-weight:700;color:#ffffff;">How to run your first analysis</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:40px;">
                    <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#EC4899,#F97316);line-height:28px;text-align:center;font-weight:800;color:#0a0118;font-size:14px;">1</span>
                  </td>
                  <td style="padding:10px 0;color:#e5e7eb;font-size:15px;line-height:1.6;">Grab a video of the routine you want scored — competition footage, practice run, anything.</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#F97316,#FBBF24);line-height:28px;text-align:center;font-weight:800;color:#0a0118;font-size:14px;">2</span>
                  </td>
                  <td style="padding:10px 0;color:#e5e7eb;font-size:15px;line-height:1.6;">Go to <a href="https://routinex.org/upload" style="color:#F472B6;text-decoration:none;font-weight:600;">routinex.org/upload</a> and drop the file in.</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#A855F7,#EC4899);line-height:28px;text-align:center;font-weight:800;color:#0a0118;font-size:14px;">3</span>
                  </td>
                  <td style="padding:10px 0;color:#e5e7eb;font-size:15px;line-height:1.6;">Pick your style (dance or cheer) and whether it's solo, duet, or group.</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#9333EA,#DB2777);line-height:28px;text-align:center;font-weight:800;color:#0a0118;font-size:14px;">4</span>
                  </td>
                  <td style="padding:10px 0;color:#e5e7eb;font-size:15px;line-height:1.6;">Let the judges run — usually 2-3 minutes. You'll get an email when it's done.</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#FBBF24,#F59E0B);line-height:28px;text-align:center;font-weight:800;color:#0a0118;font-size:14px;">5</span>
                  </td>
                  <td style="padding:10px 0;color:#e5e7eb;font-size:15px;line-height:1.6;">Read your score, scrub through the timestamped notes, then ask Bayda anything you want unpacked.</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <a href="https://routinex.org/upload" style="display:inline-block;padding:16px 36px;border-radius:14px;background:linear-gradient(135deg,#EC4899,#F97316,#FBBF24);color:#0a0118;text-decoration:none;font-weight:800;font-size:16px;letter-spacing:0.2px;box-shadow:0 16px 40px -12px rgba(236,72,153,0.5);">Upload your first routine →</a>
            </td>
          </tr>

          <!-- SIGNOFF -->
          <tr>
            <td style="padding:8px 40px 40px 40px;">
              <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#d1d5db;">
                Questions along the way? Tap <strong style="color:#F472B6;">Bayda</strong>, the coach widget in the bottom-right of every page on RoutineX. She's trained on the scoring rubric and ready 24/7.
              </p>
              <p style="margin:16px 0 0 0;font-size:16px;line-height:1.7;color:#ffffff;font-weight:700;">— The RoutineX Team</p>
            </td>
          </tr>
        </table>

        <!-- FOOTER -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:20px;">
          <tr>
            <td style="padding:16px 40px;text-align:center;color:#6b7280;font-size:12px;line-height:1.6;">
              RoutineX · AI scoring for dancers and cheerleaders<br />
              <a href="https://routinex.org" style="color:#9ca3af;text-decoration:none;">routinex.org</a>
              &nbsp;·&nbsp;
              <a href="https://routinex.org/dashboard" style="color:#9ca3af;text-decoration:none;">Your dashboard</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendCustomerEmail(customerEmail, subject, html, {
    useFounderFrom: true,
  });
}

/**
 * Owner-side copy of the welcome flow — fires alongside sendWelcomeEmail so
 * Shaun has a record of exactly what the customer received and when.
 */
export async function notifyWelcomeSent(
  customerEmail: string,
  paymentType: string
) {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  await sendEmail(
    `👋 Welcome email sent to ${customerEmail}`,
    `
    <div style="font-family: sans-serif; max-width: 500px;">
      <h2 style="color: #7c3aed;">VIP welcome email delivered</h2>
      <p><strong>Customer:</strong> ${customerEmail}</p>
      <p><strong>Plan:</strong> ${paymentType}</p>
      <p><strong>Time:</strong> ${now} ET</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 12px;">First-purchase onboarding fired automatically.</p>
    </div>
    `
  );
}

// ---------------------------------------------------------------------------
// Coda + Studio launch announcement email
// ---------------------------------------------------------------------------

/**
 * Launch-announcement email — fires once per existing user when Coda and
 * the Studio Center go live. Frames the +1 free credit as a thank-you for
 * being an early member.
 *
 * Idempotency is handled by the caller (credit_bonus_grants audit table).
 * This function just sends — the caller has already decided this user
 * should receive it.
 */
export async function sendCodaLaunchEmail(
  customerEmail: string,
  firstName: string | null,
) {
  const firstNameClean =
    firstName && firstName.trim().length > 0 ? firstName.split(" ")[0] : null;
  const greeting = firstNameClean ? `${firstNameClean},` : "Hey,";

  const subject = firstNameClean
    ? `${firstNameClean}, Coda is live — and there's a free credit on your account`
    : "Coda is live — and there's a free credit on your account";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Coda is live</title>
</head>
<body style="margin:0;padding:0;background:#0a0118;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f3f4f6;">
  <div style="display:none;max-height:0;overflow:hidden;">Coda and the Studio Center are now live on RoutineX. We added a free credit to your account so you can try them.</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0118;padding:24px 0;">
    <tr>
      <td align="center">

        <!-- HERO -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:linear-gradient(135deg,#1a0b2e 0%,#2d0b3e 50%,#0a0118 100%);border-radius:24px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.06);">
          <tr>
            <td style="padding:48px 40px 24px 40px;text-align:center;background:linear-gradient(135deg,rgba(168,85,247,0.15),rgba(236,72,153,0.15),rgba(251,191,36,0.15));">
              <div style="display:inline-block;width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,#EC4899,#F97316,#FBBF24);box-shadow:0 12px 40px -8px rgba(236,72,153,0.6);line-height:72px;text-align:center;font-size:40px;font-weight:800;color:#0a0118;letter-spacing:-2px;">X</div>
              <h1 style="margin:24px 0 8px 0;font-size:30px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(to right,#C084FC,#F472B6,#FBBF24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:#F472B6;">Coda is live.</h1>
              <p style="margin:0;font-size:16px;color:#d1d5db;">The whole community just got bigger.</p>
            </td>
          </tr>

          <!-- INTRO -->
          <tr>
            <td style="padding:32px 40px 8px 40px;">
              <p style="margin:0 0 16px 0;font-size:17px;line-height:1.6;color:#f3f4f6;">${greeting}</p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#e5e7eb;">
                From day one, we promised early members would get everything we build. Today we're making good on that promise.
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#e5e7eb;">
                <strong style="color:#ffffff;">Coda</strong> — the social home for dancers and cheerleaders — is officially live. Plus, the <strong style="color:#ffffff;">Studio Center</strong> for directors, coaches, and studio owners is open.
              </p>
              <p style="margin:0 0 0 0;font-size:16px;line-height:1.7;color:#e5e7eb;">
                And since we want every member to experience it on us, we added <strong style="color:#FBBF24;">a free credit to your account</strong> — good for one full analysis. Use it however you want.
              </p>
            </td>
          </tr>

          <!-- CODA FEATURES -->
          <tr>
            <td style="padding:28px 40px 8px 40px;">
              <h2 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:#ffffff;">What's new in Coda</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;width:48px;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#EC4899,#F97316,#FBBF24);line-height:32px;text-align:center;font-size:16px;">🏆</span>
                  </td>
                  <td style="padding:12px 0 12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:3px;">Trophy Wall</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.5;">Every Gold, High Gold, Platinum, and Diamond you earn becomes a collectible trophy on your profile.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#C4B5FD,#67E8F9,#F0ABFC);line-height:32px;text-align:center;font-size:16px;">✨</span>
                  </td>
                  <td style="padding:12px 0 12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:3px;">Auras — not photos</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.5;">Every profile is represented by a gradient aura and glyph. No dancer photos anywhere. Identity is safer and the feed is gorgeous.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#A855F7,#EC4899);line-height:32px;text-align:center;font-size:16px;">💬</span>
                  </td>
                  <td style="padding:12px 0 12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:3px;">Direct messages + Dance Bonds</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.5;">Safe messaging with built-in safeguards, plus emoji bonds for studios, teammates, and rivals.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#FCD34D,#F59E0B);line-height:32px;text-align:center;font-size:16px;">🎯</span>
                  </td>
                  <td style="padding:12px 0 12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:3px;">Fair feed</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.5;">Everyone gets reach. No pay-to-win ranking — small studios show up next to the big ones.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;vertical-align:top;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#9333EA,#DB2777,#F472B6);line-height:32px;text-align:center;font-size:16px;">🏢</span>
                  </td>
                  <td style="padding:12px 0 12px 14px;vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:3px;">Studio Center</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.5;">Shared credit pool, music-collision protection, competition schedule builder, and team dashboards — built for directors and choreographers.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CREDIT CALLOUT -->
          <tr>
            <td style="padding:24px 40px 8px 40px;">
              <div style="padding:20px;border-radius:16px;background:linear-gradient(135deg,rgba(236,72,153,0.14),rgba(249,115,22,0.12),rgba(251,191,36,0.14));border:1px solid rgba(251,191,36,0.28);">
                <div style="font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#FBBF24;margin-bottom:6px;">Thanks for being early</div>
                <div style="font-size:17px;font-weight:700;color:#ffffff;line-height:1.5;">+1 free credit is on your account right now.</div>
                <div style="font-size:14px;color:#d1d5db;margin-top:6px;line-height:1.5;">No code, no catch. Use it on a new routine, or burn it just to see your first Coda trophy land on your wall.</div>
              </div>
            </td>
          </tr>

          <!-- CTAs -->
          <tr>
            <td style="padding:28px 40px 8px 40px;text-align:center;">
              <a href="https://routinex.org/coda" style="display:inline-block;padding:16px 32px;border-radius:14px;background:linear-gradient(135deg,#EC4899,#F97316,#FBBF24);color:#0a0118;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:0.2px;box-shadow:0 16px 40px -12px rgba(236,72,153,0.5);margin:4px;">Open Coda →</a>
              <a href="https://routinex.org/upload" style="display:inline-block;padding:16px 28px;border-radius:14px;background:rgba(255,255,255,0.06);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.2px;border:1px solid rgba(255,255,255,0.12);margin:4px;">Use my free credit</a>
            </td>
          </tr>

          <!-- SIGNOFF -->
          <tr>
            <td style="padding:24px 40px 40px 40px;">
              <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#d1d5db;">
                Questions? <strong style="color:#F472B6;">Bayda</strong>, our AI coach, lives in the bottom-right on every page and knows every inch of Coda, the Studio Center, and the scoring rubric.
              </p>
              <p style="margin:16px 0 0 0;font-size:16px;line-height:1.7;color:#ffffff;font-weight:700;">— The RoutineX Team</p>
            </td>
          </tr>
        </table>

        <!-- FOOTER -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:20px;">
          <tr>
            <td style="padding:16px 40px;text-align:center;color:#6b7280;font-size:12px;line-height:1.6;">
              RoutineX · AI scoring + Coda for dancers and cheerleaders<br />
              <a href="https://routinex.org" style="color:#9ca3af;text-decoration:none;">routinex.org</a>
              &nbsp;·&nbsp;
              <a href="https://routinex.org/coda" style="color:#9ca3af;text-decoration:none;">Coda</a>
              &nbsp;·&nbsp;
              <a href="https://routinex.org/dashboard" style="color:#9ca3af;text-decoration:none;">Dashboard</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendCustomerEmail(customerEmail, subject, html, {
    useFounderFrom: true,
  });
}

// ---------------------------------------------------------------------------
// Coda welcome email — fires ~1 hour after a new user signs up
// ---------------------------------------------------------------------------

/**
 * Coda welcome email — the dedicated second-touch email for brand-new accounts
 * created AFTER Coda launched. Different from sendWelcomeEmail (which fires on
 * first purchase).
 *
 * Intent: bring a fresh sign-up into the community side of the product ~1 hour
 * after signup, once the cold-email rush is past and they're in "what is this
 * actually for" mode. This is the moment to point at Coda specifically.
 *
 * Idempotency is the caller's job (a `welcome_grants`-style audit row works
 * well, or a scheduled cron that picks users whose created_at is ~1hr old and
 * whose welcome_sent flag is false).
 */
export async function sendCodaWelcomeEmail(
  customerEmail: string,
  firstName: string | null,
) {
  const firstNameClean =
    firstName && firstName.trim().length > 0 ? firstName.split(" ")[0] : null;
  const greeting = firstNameClean ? `Welcome in, ${firstNameClean}.` : "Welcome in.";

  const subject = firstNameClean
    ? `${firstNameClean}, your Coda profile is waiting`
    : "Your Coda profile is waiting";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Welcome to Coda</title>
</head>
<body style="margin:0;padding:0;background:#0a0118;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f3f4f6;">
  <div style="display:none;max-height:0;overflow:hidden;">Your Coda profile is ready. Here's how to claim your aura, post your first routine, and find your community.</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0118;padding:24px 0;">
    <tr>
      <td align="center">

        <!-- HERO -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:linear-gradient(135deg,#1a0b2e 0%,#2d0b3e 50%,#0a0118 100%);border-radius:24px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.06);">
          <tr>
            <td style="padding:48px 40px 24px 40px;text-align:center;background:linear-gradient(135deg,rgba(168,85,247,0.15),rgba(236,72,153,0.15),rgba(251,191,36,0.15));">
              <div style="display:inline-block;width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,#EC4899,#F97316,#FBBF24);box-shadow:0 12px 40px -8px rgba(236,72,153,0.6);line-height:72px;text-align:center;font-size:40px;font-weight:800;color:#0a0118;letter-spacing:-2px;">X</div>
              <h1 style="margin:24px 0 8px 0;font-size:30px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(to right,#C084FC,#F472B6,#FBBF24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:#F472B6;">${greeting}</h1>
              <p style="margin:0;font-size:16px;color:#d1d5db;">You're in Coda — the social home for dancers and cheerleaders.</p>
            </td>
          </tr>

          <!-- INTRO -->
          <tr>
            <td style="padding:32px 40px 8px 40px;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#e5e7eb;">
                Coda is where routine scores become trophies, where studios build their community, and where dancers and cheerleaders follow each other through an entire season.
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#e5e7eb;">
                No photos of dancers — anywhere. Identity lives in auras, glyphs, and score iconography. It's safer, it's fair, and it's the prettiest feed in the space.
              </p>
            </td>
          </tr>

          <!-- 3-STEP KICKSTART -->
          <tr>
            <td style="padding:24px 40px 8px 40px;">
              <h2 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:#ffffff;">Three moves for your first day</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:14px 0;vertical-align:top;width:44px;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#EC4899,#F97316);line-height:32px;text-align:center;font-weight:800;color:#0a0118;font-size:15px;">1</span>
                  </td>
                  <td style="padding:14px 0 14px 14px;vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:3px;">Pick your aura</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.55;">Your gradient + glyph is your identity on Coda. Two taps and you're done.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;vertical-align:top;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#A855F7,#EC4899);line-height:32px;text-align:center;font-weight:800;color:#0a0118;font-size:15px;">2</span>
                  </td>
                  <td style="padding:14px 0 14px 14px;vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:3px;">Run your first analysis</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.55;">Upload any routine — comp footage, practice, doesn't matter. Your score becomes your first trophy and lands on your Trophy Wall.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;vertical-align:top;">
                    <span style="display:inline-block;width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#FBBF24,#F59E0B);line-height:32px;text-align:center;font-weight:800;color:#0a0118;font-size:15px;">3</span>
                  </td>
                  <td style="padding:14px 0 14px 14px;vertical-align:top;">
                    <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:3px;">Follow a few people</div>
                    <div style="color:#d1d5db;font-size:14px;line-height:1.55;">Studios, teammates, dancers whose style you love. Coda's feed is fair — everyone gets reach, so even small accounts show up.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- VALUE LOOP -->
          <tr>
            <td style="padding:24px 40px 8px 40px;">
              <div style="padding:20px;border-radius:16px;background:linear-gradient(135deg,rgba(168,85,247,0.12),rgba(236,72,153,0.10),rgba(251,191,36,0.12));border:1px solid rgba(255,255,255,0.08);">
                <div style="font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#C084FC;margin-bottom:6px;">How Coda feels different</div>
                <div style="font-size:15px;color:#e5e7eb;line-height:1.6;">
                  Every score you earn becomes a collectible trophy. Your followers see your wins. You can run a whole season on Coda — comp lineups, Dance Bonds with teammates, safe DMs, and a feed that actually celebrates you.
                </div>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:28px 40px 8px 40px;text-align:center;">
              <a href="https://routinex.org/coda" style="display:inline-block;padding:16px 34px;border-radius:14px;background:linear-gradient(135deg,#EC4899,#F97316,#FBBF24);color:#0a0118;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:0.2px;box-shadow:0 16px 40px -12px rgba(236,72,153,0.5);margin:4px;">Open Coda →</a>
              <a href="https://routinex.org/upload" style="display:inline-block;padding:16px 28px;border-radius:14px;background:rgba(255,255,255,0.06);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.2px;border:1px solid rgba(255,255,255,0.12);margin:4px;">Run first analysis</a>
            </td>
          </tr>

          <!-- SIGNOFF -->
          <tr>
            <td style="padding:24px 40px 40px 40px;">
              <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#d1d5db;">
                Stuck anywhere? Tap <strong style="color:#F472B6;">Bayda</strong> — she's the coach widget in the bottom-right corner and she knows every corner of Coda.
              </p>
              <p style="margin:16px 0 0 0;font-size:16px;line-height:1.7;color:#ffffff;font-weight:700;">— The RoutineX Team</p>
            </td>
          </tr>
        </table>

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:20px;">
          <tr>
            <td style="padding:16px 40px;text-align:center;color:#6b7280;font-size:12px;line-height:1.6;">
              RoutineX · AI scoring + Coda for dancers and cheerleaders<br />
              <a href="https://routinex.org" style="color:#9ca3af;text-decoration:none;">routinex.org</a>
              &nbsp;·&nbsp;
              <a href="https://routinex.org/coda" style="color:#9ca3af;text-decoration:none;">Coda</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendCustomerEmail(customerEmail, subject, html, {
    useFounderFrom: true,
  });
}

// ---------------------------------------------------------------------------
// Profile-completion nudge — fires 24h in if user hasn't finished onboarding
// ---------------------------------------------------------------------------

/**
 * Profile-completion nudge — fires 24h after signup for users who haven't
 * completed the key profile moves (handle, bio, aura, first analysis).
 *
 * The caller should only call this if the user has at least one checklist
 * item OPEN. We don't want to nag completers.
 */
export async function sendProfileCompletionNudge(
  customerEmail: string,
  firstName: string | null,
  missing: {
    needsHandle: boolean;
    needsBio: boolean;
    needsAura: boolean;
    needsAnalysis: boolean;
  },
) {
  const firstNameClean =
    firstName && firstName.trim().length > 0 ? firstName.split(" ")[0] : null;

  const items: Array<{ label: string; detail: string; cta: string; href: string }> = [];
  if (missing.needsHandle) {
    items.push({
      label: "Claim your @handle",
      detail: "Your handle is how other dancers and studios tag you on Coda.",
      cta: "Set handle",
      href: "https://routinex.org/settings/profile",
    });
  }
  if (missing.needsAura) {
    items.push({
      label: "Pick your aura",
      detail: "Two taps. Your gradient + glyph = your identity on Coda.",
      cta: "Choose aura",
      href: "https://routinex.org/settings/profile",
    });
  }
  if (missing.needsBio) {
    items.push({
      label: "Add a short bio",
      detail: "One line — where you train, what style, who you root for. 280 chars max.",
      cta: "Write bio",
      href: "https://routinex.org/settings/profile",
    });
  }
  if (missing.needsAnalysis) {
    items.push({
      label: "Run your first analysis",
      detail: "Upload any routine and watch your first trophy land on your wall.",
      cta: "Upload",
      href: "https://routinex.org/upload",
    });
  }

  if (items.length === 0) return; // nothing to nudge

  const itemsHtml = items
    .map(
      (it, i) => `
    <tr>
      <td style="padding:14px 0;vertical-align:top;width:44px;">
        <span style="display:inline-block;width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#EC4899,#F97316,#FBBF24);line-height:32px;text-align:center;font-weight:800;color:#0a0118;font-size:15px;">${i + 1}</span>
      </td>
      <td style="padding:14px 0 14px 14px;vertical-align:top;">
        <div style="font-weight:700;color:#ffffff;font-size:15px;margin-bottom:3px;">${it.label}</div>
        <div style="color:#d1d5db;font-size:14px;line-height:1.55;margin-bottom:8px;">${it.detail}</div>
        <a href="${it.href}" style="display:inline-block;padding:8px 14px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);color:#F472B6;text-decoration:none;font-weight:700;font-size:13px;">${it.cta} →</a>
      </td>
    </tr>`,
    )
    .join("");

  const subject = firstNameClean
    ? `${firstNameClean}, finish setting up your Coda profile`
    : "Finish setting up your Coda profile";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Finish your Coda profile</title>
</head>
<body style="margin:0;padding:0;background:#0a0118;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f3f4f6;">
  <div style="display:none;max-height:0;overflow:hidden;">A few steps left to finish your Coda profile.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0118;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:linear-gradient(135deg,#1a0b2e 0%,#2d0b3e 50%,#0a0118 100%);border-radius:24px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.06);">
          <tr>
            <td style="padding:44px 40px 20px 40px;text-align:center;background:linear-gradient(135deg,rgba(168,85,247,0.15),rgba(236,72,153,0.15),rgba(251,191,36,0.15));">
              <div style="display:inline-block;width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#EC4899,#F97316,#FBBF24);box-shadow:0 10px 32px -8px rgba(236,72,153,0.6);line-height:64px;text-align:center;font-size:34px;font-weight:800;color:#0a0118;letter-spacing:-2px;">X</div>
              <h1 style="margin:20px 0 6px 0;font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">${firstNameClean ? `${firstNameClean}, ` : ""}a few moves left</h1>
              <p style="margin:0;font-size:15px;color:#d1d5db;">Finish your profile so the community can find you.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 8px 40px;">
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.7;color:#e5e7eb;">
                Your Coda profile is almost there. Finishing these moves gets you a searchable presence, a Trophy Wall, and a better feed.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <a href="https://routinex.org/coda" style="display:inline-block;padding:16px 32px;border-radius:14px;background:linear-gradient(135deg,#EC4899,#F97316,#FBBF24);color:#0a0118;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:0.2px;box-shadow:0 16px 40px -12px rgba(236,72,153,0.5);">Finish on Coda →</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 40px 40px;">
              <p style="margin:16px 0 0 0;font-size:16px;line-height:1.7;color:#ffffff;font-weight:700;">— The RoutineX Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendCustomerEmail(customerEmail, subject, html, {
    useFounderFrom: true,
  });
}

// cache bust Sun Mar 22 14:29:05 PDT 2026
