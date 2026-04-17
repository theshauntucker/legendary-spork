/**
 * Web Push helpers — VAPID-signed notifications via the Push API.
 *
 * The public VAPID key is committed here so the client can advertise it.
 * The private key MUST be provided via VAPID_PRIVATE_KEY at runtime; if
 * missing, every push call becomes a no-op so dev envs don't explode.
 */

import webpush from "web-push";

export const VAPID_PUBLIC_KEY =
  "BNB32Dovf7PhngIVYFB7Z4q71rFK4ALpnx77YizDf84V8ey0SQZfQj61ZxH6vKtp-ykGgzuZjADGtAaKdoopXF4";

const PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:22tucker22@comcast.net";

let configured = false;
function ensureConfigured() {
  if (configured) return true;
  if (!PRIVATE) return false;
  try {
    webpush.setVapidDetails(SUBJECT, VAPID_PUBLIC_KEY, PRIVATE);
    configured = true;
    return true;
  } catch (err) {
    console.error("VAPID configure failed:", err);
    return false;
  }
}

export interface PushPayload {
  title: string;
  body?: string;
  href?: string;
  tag?: string;
}

export interface StoredSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Send a web push. Returns { ok, gone } — `gone` means the subscription
 * should be deleted (endpoint returned 404 or 410).
 */
export async function sendPush(
  sub: StoredSubscription,
  payload: PushPayload
): Promise<{ ok: boolean; gone: boolean; error?: string }> {
  if (!ensureConfigured()) {
    return { ok: false, gone: false, error: "VAPID_PRIVATE_KEY not set" };
  }
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 }
    );
    return { ok: true, gone: false };
  } catch (err) {
    const status = (err as { statusCode?: number } | undefined)?.statusCode;
    const gone = status === 404 || status === 410;
    return {
      ok: false,
      gone,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
