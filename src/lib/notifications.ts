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
// cache bust Sun Mar 22 14:29:05 PDT 2026
