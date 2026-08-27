import { NextRequest } from "next/server";

/**
 * Shared secret for server-to-server route calls.
 *
 * WHY THIS EXISTS
 * ---------------
 * Two internal routes were effectively public:
 *
 *   /api/process     — no auth at all. Accepted {videoId, userId} from anyone.
 *                      Every call burns one of that user's paid credits AND
 *                      spends real Anthropic API money. A third party who
 *                      learned any videoId could drain a customer's balance.
 *
 *   /api/preprocess  — "authenticated" with SUPABASE_SERVICE_ROLE_KEY.slice(0,20).
 *                      That is the first 20 characters of a JWT, i.e. the base64
 *                      of the standard {"alg":"HS256","typ":"JWT"} header — the
 *                      SAME STRING for every Supabase project in existence.
 *                      Verified bypassable in production on 2026-08-27 by
 *                      sending the literal "eyJhbGciOiJIUzI1NiIs".
 *
 * Both are only ever invoked server-to-server (from /api/analyze,
 * /api/videos/[id]/retry, /api/videos/[id]/status and /api/upload/complete),
 * so requiring a real shared secret costs nothing and closes both holes.
 *
 * SECRET SOURCE
 * -------------
 * Prefers a dedicated INTERNAL_API_SECRET, and falls back to CRON_SECRET, which
 * is already configured in production (verified: /api/cron/* returns 401 without
 * it). The fallback means this works with no new environment variables.
 */
function internalSecret(): string | null {
  return process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET || null;
}

/** The header internal callers must send. */
export const INTERNAL_HEADER = "x-routinex-internal";

/** Headers to attach to an internal server-to-server fetch. */
export function internalHeaders(): Record<string, string> {
  const secret = internalSecret();
  return {
    "Content-Type": "application/json",
    ...(secret ? { [INTERNAL_HEADER]: secret } : {}),
  };
}

/**
 * Returns true when the request carries the correct internal secret.
 *
 * Fails CLOSED when a secret is configured. If NO secret is configured at all
 * we allow the request but log loudly — taking the analysis pipeline offline
 * because an env var went missing would be a worse outage than the exposure,
 * and the loud log makes the misconfiguration obvious.
 */
export function isInternalRequest(request: NextRequest, bodySecret?: string): boolean {
  const secret = internalSecret();

  if (!secret) {
    console.error(
      "SECURITY: neither INTERNAL_API_SECRET nor CRON_SECRET is set — internal route auth is DISABLED. Set one in Vercel immediately."
    );
    return true;
  }

  const headerSecret = request.headers.get(INTERNAL_HEADER);
  if (headerSecret && timingSafeEqual(headerSecret, secret)) return true;

  // Body-based secret kept for callers that cannot set headers.
  if (bodySecret && timingSafeEqual(bodySecret, secret)) return true;

  return false;
}

/** Constant-time compare so the secret can't be recovered by timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Very small in-memory rate limiter for public endpoints that cost money
 * (Anthropic calls) or reach the founder's inbox (email).
 *
 * Per-instance only — serverless means several instances, so treat this as a
 * blunt abuse brake, not a precise quota. It exists to stop one script from
 * running up the Anthropic bill or flooding the inbox, which it does fine.
 */
const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  opts: { max: number; windowMs: number }
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - opts.windowMs;

  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= opts.max) {
    const oldest = recent[0];
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((oldest + opts.windowMs - now) / 1000)),
    };
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => t <= cutoff)) hits.delete(k);
    }
  }

  return { ok: true, retryAfterSec: 0 };
}

/** Best-effort client identity for rate limiting. */
export function clientKey(request: NextRequest, prefix: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${prefix}:${ip}`;
}

/** Escape untrusted text before interpolating it into an HTML email body. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
