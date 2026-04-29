import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getIapProduct } from "@/lib/iap-products";
import {
  grantSubscriptionCycle,
  markSubscriptionExpires,
  SUBSCRIPTION_CREDITS,
} from "@/lib/credits";

export const dynamic = "force-dynamic";

/**
 * App Store Server Notifications V2 webhook handler.
 *
 * Apple posts JWS-signed notifications here when subscription state
 * changes (renewal, cancellation, refund, etc.). Without this endpoint,
 * Season Members and Studio subscribers will lose access on first renewal
 * because StoreKit auto-renews silently — there's no client receipt to
 * submit, so /api/iap/validate-receipt never fires for renewals.
 *
 * Wiring:
 *   1. App Store Connect → My Apps → RoutineX → App Information →
 *      App Store Server Notifications → Production URL = this route's
 *      public URL (e.g., https://routinex.org/api/iap/server-notification).
 *   2. Set Sandbox URL to the same path (or a Vercel preview).
 *   3. Apple recommends V2 (signedPayload as JWS) — handle both V1 and V2
 *      formats for robustness. V1 is plaintext JSON, V2 is signed.
 *
 * V2 notification types we care about:
 *   - SUBSCRIBED (initial)              → credit grant (also handled by validate-receipt on first purchase)
 *   - DID_RENEW                         → renewal credit refresh
 *   - DID_FAIL_TO_RENEW                 → grace period; mark expires_at
 *   - EXPIRED                           → subscription ended; clear access
 *   - REFUND / REFUND_REVERSED          → claw back / restore credits
 *   - DID_CHANGE_RENEWAL_STATUS         → user toggled auto-renew
 *
 * Idempotency: Apple may retry. Dedup via notification UUID stored in a
 * dedicated table (or repurpose payments.apple_transaction_id with a
 * separate notification_id index).
 *
 * Security: in production, verify the JWS signature against Apple's
 * public keys (https://api.storekit.itunes.apple.com/inApps/v1/...).
 * For v1.0.0 of this handler we accept unsigned payloads BUT reject
 * if originalTransactionId doesn't resolve to a known user — that's
 * defense in depth without full JWS verification.
 *
 * STATUS: Skeleton handler. JWS verification, refund handling, and the
 * full notification taxonomy need flesh in a follow-up session.
 */

interface ASN_V1 {
  notificationType?: string;
  notification_type?: string;
  unified_receipt?: {
    latest_receipt_info?: Array<{
      product_id: string;
      original_transaction_id: string;
      transaction_id: string;
      expires_date_ms?: string;
      purchase_date_ms?: string;
    }>;
  };
}

interface ASN_V2 {
  signedPayload?: string;
}

export async function POST(request: NextRequest) {
  let body: ASN_V1 & ASN_V2;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── V2 path (signedPayload JWS) ──────────────────────────────────────────
  if (body.signedPayload) {
    // TODO — verify JWS signature against Apple's public keys before trusting
    // the payload. For initial implementation we decode and trust; flag for
    // hardening before high-volume production use.
    const payload = decodeJwsPayloadUnsafe(body.signedPayload);
    if (!payload) {
      return NextResponse.json({ error: "Could not decode JWS payload" }, { status: 400 });
    }
    return handleNotification({
      type: payload.notificationType,
      productId: payload.data?.signedTransactionInfo
        ? decodeJwsPayloadUnsafe(payload.data.signedTransactionInfo)?.productId
        : undefined,
      originalTransactionId: payload.data?.signedTransactionInfo
        ? decodeJwsPayloadUnsafe(payload.data.signedTransactionInfo)?.originalTransactionId
        : undefined,
      expiresMs: payload.data?.signedTransactionInfo
        ? Number(decodeJwsPayloadUnsafe(payload.data.signedTransactionInfo)?.expiresDate)
        : undefined,
      purchaseMs: payload.data?.signedTransactionInfo
        ? Number(decodeJwsPayloadUnsafe(payload.data.signedTransactionInfo)?.purchaseDate)
        : undefined,
    });
  }

  // ── V1 path (plaintext JSON, deprecated but still active for some apps) ──
  const v1Type = body.notificationType ?? body.notification_type;
  const latest = body.unified_receipt?.latest_receipt_info?.[0];
  return handleNotification({
    type: v1Type,
    productId: latest?.product_id,
    originalTransactionId: latest?.original_transaction_id,
    expiresMs: latest?.expires_date_ms ? Number(latest.expires_date_ms) : undefined,
    purchaseMs: latest?.purchase_date_ms ? Number(latest.purchase_date_ms) : undefined,
  });
}

interface DecodedJws {
  notificationType?: string;
  data?: {
    signedTransactionInfo?: string;
  };
  productId?: string;
  originalTransactionId?: string;
  expiresDate?: number;
  purchaseDate?: number;
}

/**
 * Base64-decode the middle section of a JWS without verifying the
 * signature. Treats the result as untrusted — caller must NOT grant
 * credits based on this alone in a production-hardened build.
 */
function decodeJwsPayloadUnsafe(jws: string): DecodedJws | null {
  try {
    const parts = jws.split(".");
    if (parts.length !== 3) return null;
    const json = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function handleNotification(args: {
  type?: string;
  productId?: string;
  originalTransactionId?: string;
  expiresMs?: number;
  purchaseMs?: number;
}): Promise<NextResponse> {
  const { type, productId, originalTransactionId, expiresMs, purchaseMs } = args;

  if (!type) {
    return NextResponse.json({ error: "Missing notification type" }, { status: 400 });
  }
  if (!originalTransactionId) {
    return NextResponse.json({ ok: true, ignored: "no original_transaction_id" }, { status: 200 });
  }

  console.log(
    `IAP server-notification: type=${type} product=${productId} originalTxn=${originalTransactionId}`
  );

  // Resolve original_transaction_id → user_id by looking at the first
  // payments row that mentions this transaction. validate-receipt records
  // apple_transaction_id; for renewals the original_transaction_id matches
  // the FIRST purchase's transaction_id. Schema-level: store
  // apple_original_transaction_id alongside apple_transaction_id (add to
  // the migration in validate-receipt route) for fast lookup.
  const serviceClient = await createServiceClient();
  const { data: payment } = await serviceClient
    .from("payments")
    .select("user_id")
    .or(
      `apple_transaction_id.eq.${originalTransactionId},apple_original_transaction_id.eq.${originalTransactionId}`
    )
    .maybeSingle();
  if (!payment?.user_id) {
    console.warn(
      `IAP server-notification: original_transaction_id ${originalTransactionId} not found in payments — ignoring`
    );
    return NextResponse.json({ ok: true, ignored: "user not found" }, { status: 200 });
  }

  // ── Branch on notification type ──────────────────────────────────────────
  switch (type) {
    case "DID_RENEW":
    case "INTERACTIVE_RENEWAL":
    case "DID_RECOVER": {
      // Subscription renewed successfully. Refresh the cycle's credits.
      if (!productId) break;
      const product = (() => {
        try {
          return getIapProduct(productId);
        } catch {
          return null;
        }
      })();
      if (!product || product.mode !== "subscription") break;
      const start = purchaseMs ? new Date(purchaseMs) : new Date();
      const end = expiresMs
        ? new Date(expiresMs)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      if (product.paymentType === "subscription") {
        await grantSubscriptionCycle(
          serviceClient,
          payment.user_id,
          SUBSCRIPTION_CREDITS,
          start,
          end
        );
      } else if (product.paymentType === "studio_subscription") {
        // Studio renewals: same +50 additive logic as the Stripe webhook.
        const { data: admin } = await serviceClient
          .from("studio_admins")
          .select("studio_id")
          .eq("user_id", payment.user_id)
          .maybeSingle();
        if (admin?.studio_id) {
          const { data: pool } = await serviceClient
            .from("studio_credits")
            .select("total_credits")
            .eq("studio_id", admin.studio_id)
            .maybeSingle();
          if (pool) {
            await serviceClient
              .from("studio_credits")
              .update({
                total_credits: pool.total_credits + 50,
                subscription_status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("studio_id", admin.studio_id);
          }
        }
      }
      // Record renewal payment row
      await serviceClient.from("payments").insert({
        user_id: payment.user_id,
        stripe_session_id: `apple:renewal:${originalTransactionId}:${purchaseMs ?? Date.now()}`,
        apple_transaction_id: `${originalTransactionId}:${purchaseMs ?? Date.now()}`,
        apple_original_transaction_id: originalTransactionId,
        payment_type:
          product.paymentType === "studio_subscription"
            ? "studio_subscription"
            : "subscription_renewal",
        amount_cents: product.amountCents,
        currency: "usd",
        status: "completed",
        credits_granted: product.creditsGranted,
      });
      break;
    }
    case "EXPIRED":
    case "DID_FAIL_TO_RENEW": {
      // Mark the subscription as ending; existing credits remain usable
      // until expires_at is past. Mirrors how Stripe sub cancels work.
      const expiresAt = expiresMs ? new Date(expiresMs) : new Date();
      await markSubscriptionExpires(serviceClient, payment.user_id, expiresAt);
      break;
    }
    case "REFUND":
    case "REVOKE":
    case "CONSUMPTION_REQUEST": {
      // Apple refunded the user. Best practice: zero credits granted by this
      // transaction, but we currently can't easily reverse credits already
      // consumed. Log loudly so Shaun can manually reconcile in admin.
      console.warn(
        `IAP server-notification: REFUND/REVOKE for user ${payment.user_id} originalTxn ${originalTransactionId} — manual reconciliation may be needed`
      );
      break;
    }
    case "DID_CHANGE_RENEWAL_STATUS":
    case "RENEWAL":
    case "PRICE_INCREASE":
    case "OFFER_REDEEMED":
    default:
      // No-op for unhandled types — log and move on so we always 200.
      console.log(`IAP server-notification: type ${type} — no action`);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
