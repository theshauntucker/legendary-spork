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

const FOUNDER_FROM = "Shaun Tucker <shaun@routinex.org>";
const FOUNDER_FROM_FALLBACK = "Shaun at RoutineX <onboarding@resend.dev>";
const FOUNDER_REPLY_TO = process.env.OWNER_EMAIL || "22tucker22@comcast.net";

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
 * Personal tone from Shaun, branded with the RoutineX sunset gradient,
 * features grid, and onboarding steps.
 */
export async function sendWelcomeEmail(
  customerEmail: string,
  firstName: string | null,
  paymentType: string
) {
  const greeting = firstName && firstName.trim().length > 0
    ? `Hey ${firstName.split(" ")[0]},`
    : "Hey,";

  const creditsLine =
    paymentType === "subscription"
      ? "You just activated <strong>Season Member</strong> — 10 analyses every month."
      : paymentType === "video_analysis"
      ? "You just grabbed the <strong>Competition Pack</strong> — 5 full analyses loaded up."
      : paymentType === "single"
      ? "You just grabbed the <strong>BOGO</strong> — 2 analyses ready when you are."
      : paymentType === "beta_access"
      ? "You're in as a <strong>Legacy Beta</strong> member — thank you for believing early."
      : "Your credits are loaded and ready.";

  const subject = "Welcome to RoutineX — let's score your first routine";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Welcome to RoutineX</title>
</head>
<body style="margin:0;padding:0;background:#0a0118;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f3f4f6;">
  <div style="display:none;max-height:0;overflow:hidden;">Shaun here. You're in — let me show you how to get the most out of RoutineX.</div>

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

          <!-- PERSONAL NOTE -->
          <tr>
            <td style="padding:32px 40px 8px 40px;">
              <p style="margin:0 0 16px 0;font-size:17px;line-height:1.6;color:#f3f4f6;">${greeting}</p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#e5e7eb;">
                I'm Shaun — I built RoutineX. I wanted to send this personally because you joining actually means something to me.
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#e5e7eb;">
                ${creditsLine}
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#e5e7eb;">
                We're growing fast right now — new families, studios, and competitive programs are joining every day. My team and I read every piece of feedback that comes in and reply personally. If something feels off, if you want a feature, or if you just want to tell us how your last competition went, <strong style="color:#F472B6;">just hit reply to this email</strong>. It lands in my inbox.
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
              <p style="margin:0 0 8px 0;font-size:16px;line-height:1.7;color:#e5e7eb;">Seriously — reply to this email anytime. I read every one.</p>
              <p style="margin:0 0 4px 0;font-size:16px;line-height:1.7;color:#e5e7eb;">Thanks for being here.</p>
              <p style="margin:16px 0 0 0;font-size:16px;line-height:1.7;color:#ffffff;font-weight:700;">— Shaun</p>
              <p style="margin:2px 0 0 0;font-size:14px;color:#9ca3af;">Founder, RoutineX</p>
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

// cache bust Sun Mar 22 14:29:05 PDT 2026
