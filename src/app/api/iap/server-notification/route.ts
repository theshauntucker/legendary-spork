import { NextRequest, NextResponse } from "next/server";
import { X509Certificate, createPublicKey, createVerify } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { getIapProduct } from "@/lib/iap-products";
import {
  grantCredits,
  grantSubscriptionCycle,
  markSubscriptionExpires,
  SUBSCRIPTION_CREDITS,
} from "@/lib/credits";
import { notifyCritical, notifyPayment } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * App Store Server Notifications V2 — the server-side fulfillment backstop.
 *
 * WHY THIS EXISTS (rewritten 2026-08-10)
 * --------------------------------------
 * Between Aug 3–9 2026, five App Store purchases charged customers and
 * granted zero credits. The client read the StoreKit receipt from a
 * field that doesn't exist in cdv-purchase v13, so the purchase resolved
 * as a failure and /api/iap/validate-receipt was never called — not
 * once. Nothing caught it: the owner payment email only fires AFTER
 * successful fulfillment, so silence looked exactly like no sales.
 *
 * The client bug is fixed in src/lib/native-iap.ts. This route is the
 * belt to that pair of braces: Apple tells us about every purchase
 * server-to-server, so fulfillment no longer depends on the app
 * behaving correctly. If the client ever breaks again, credits still
 * land and Shaun still gets told.
 *
 * WIRING (must be done once in App Store Connect)
 * -----------------------------------------------
 *   My Apps → RoutineX → General → App Information →
 *   App Store Server Notifications:
 *     Production Server URL: https://routinex.org/api/iap/server-notification
 *     Sandbox Server URL:    https://routinex.org/api/iap/server-notification
 *     Version: Version 2 Notifications
 *
 * SECURITY MODEL
 * --------------
 * Everything below has to hold before a single credit is granted:
 *   1. The payload is a well-formed JWS with an x5c certificate chain.
 *   2. The chain is internally consistent — each certificate is signed
 *      by the next one up, terminating in a self-signed root.
 *   3. The root is self-signed and its subject identifies Apple. If
 *      APPLE_ROOT_CA_SHA256 is set we additionally pin the root's
 *      fingerprint (strongly recommended — see below).
 *   4. The JWS signature verifies against the leaf certificate's key.
 *   5. The payload's bundleId is ours.
 *   6. The transaction resolves to a real RoutineX user, either via
 *      appAccountToken (a Supabase user UUID we stamped on at purchase
 *      time) or via an existing payments row for this Apple customer.
 *      We never mint credits for an unresolvable account.
 *   7. The Apple transaction id has not already been fulfilled — the
 *      unique index on payments.apple_transaction_id is the guard.
 *
 * TO HARDEN FURTHER: download Apple Root CA - G3 from
 * https://www.apple.com/certificateauthority/ , run
 * `openssl x509 -inform der -in AppleRootCA-G3.cer -noout -fingerprint -sha256`
 * and set the colon-free lowercase hex as APPLE_ROOT_CA_SHA256 in Vercel.
 * Until that's set we log a warning on every request but still enforce
 * checks 1–7, which is why unresolvable users are refused rather than
 * guessed at.
 */

const EXPECTED_BUNDLE_ID = "com.routinex.app";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ─── JWS verification ───────────────────────────────────────────────────────

interface JwsHeader {
  alg?: string;
  x5c?: string[];
}

interface SignedTransactionInfo {
  transactionId?: string;
  originalTransactionId?: string;
  productId?: string;
  bundleId?: string;
  purchaseDate?: number;
  expiresDate?: number;
  appAccountToken?: string;
  type?: string;
  quantity?: number;
}

interface NotificationPayload {
  notificationType?: string;
  subtype?: string;
  notificationUUID?: string;
  data?: {
    bundleId?: string;
    signedTransactionInfo?: string;
    signedRenewalInfo?: string;
  };
}

function b64urlToBuffer(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

function decodeJwsSegment<T>(jws: string, index: number): T | null {
  try {
    const parts = jws.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(b64urlToBuffer(parts[index]).toString("utf-8")) as T;
  } catch {
    return null;
  }
}

/**
 * Verify a JWS produced by Apple and return its decoded payload.
 * Returns null when anything about the signature or chain is wrong —
 * the caller must treat null as "reject", never as "probably fine".
 */
function verifyAppleJws<T>(jws: string): T | null {
  const parts = jws.split(".");
  if (parts.length !== 3) {
    console.error("[iap-notification] JWS malformed (expected 3 segments)");
    return null;
  }

  const header = decodeJwsSegment<JwsHeader>(jws, 0);
  const x5c = header?.x5c;
  if (!x5c || x5c.length < 2) {
    console.error("[iap-notification] JWS header missing x5c chain");
    return null;
  }
  if (header?.alg !== "ES256") {
    console.error(`[iap-notification] unexpected JWS alg: ${header?.alg}`);
    return null;
  }

  let certs: X509Certificate[];
  try {
    certs = x5c.map((c) => new X509Certificate(Buffer.from(c, "base64")));
  } catch (err) {
    console.error("[iap-notification] could not parse x5c certificates:", err);
    return null;
  }

  // Chain consistency: cert[i] must be signed by cert[i+1].
  for (let i = 0; i < certs.length - 1; i++) {
    if (!certs[i].verify(certs[i + 1].publicKey)) {
      console.error(`[iap-notification] x5c chain broken at index ${i}`);
      return null;
    }
  }

  // The chain must terminate in a self-signed Apple root.
  const root = certs[certs.length - 1];
  if (!root.verify(root.publicKey)) {
    console.error("[iap-notification] x5c root is not self-signed");
    return null;
  }
  if (!/Apple/i.test(root.subject)) {
    console.error("[iap-notification] x5c root is not an Apple certificate:", root.subject);
    return null;
  }

  const pinnedFingerprint = process.env.APPLE_ROOT_CA_SHA256?.toLowerCase().replace(/:/g, "");
  if (pinnedFingerprint) {
    const actual = root.fingerprint256.toLowerCase().replace(/:/g, "");
    if (actual !== pinnedFingerprint) {
      console.error(
        `[iap-notification] Apple root fingerprint mismatch. expected=${pinnedFingerprint} actual=${actual}`
      );
      return null;
    }
  } else {
    console.warn(
      "[iap-notification] APPLE_ROOT_CA_SHA256 not set — root is validated by self-signature and Apple subject only. Set it to pin the root."
    );
  }

  // Certificates must be currently valid.
  const now = Date.now();
  for (const cert of certs) {
    if (Date.parse(cert.validFrom) > now || Date.parse(cert.validTo) < now) {
      console.error("[iap-notification] certificate outside validity window:", cert.subject);
      return null;
    }
  }

  // Verify the signature over "header.payload" with the leaf's key.
  // ES256 JWS signatures are raw r||s; Node expects that with dsaEncoding
  // set to "ieee-p1363".
  try {
    const signingInput = `${parts[0]}.${parts[1]}`;
    const signature = b64urlToBuffer(parts[2]);
    const verifier = createVerify("SHA256");
    verifier.update(signingInput);
    verifier.end();
    const ok = verifier.verify(
      {
        key: createPublicKey(certs[0].publicKey),
        dsaEncoding: "ieee-p1363",
      },
      signature
    );
    if (!ok) {
      console.error("[iap-notification] JWS signature did not verify");
      return null;
    }
  } catch (err) {
    console.error("[iap-notification] JWS signature verification threw:", err);
    return null;
  }

  return decodeJwsSegment<T>(jws, 1);
}

// ─── User resolution ────────────────────────────────────────────────────────

/**
 * Map an Apple transaction to a RoutineX user.
 *
 * Preferred path is appAccountToken, which the app stamps onto every
 * purchase (see getCurrentUserId in src/lib/native-iap.ts). Purchases
 * made by older builds don't carry one, so we fall back to matching an
 * existing payments row for the same Apple customer.
 *
 * Returns null when we genuinely don't know who this is — the caller
 * must alert rather than guess.
 */
async function resolveUserId(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  txn: SignedTransactionInfo
): Promise<string | null> {
  const token = txn.appAccountToken;
  if (token && UUID_RE.test(token)) {
    const { data } = await serviceClient.auth.admin.getUserById(token);
    if (data?.user?.id) return data.user.id;
    console.warn(`[iap-notification] appAccountToken ${token} is not a known user`);
  }

  const ids = [txn.originalTransactionId, txn.transactionId].filter(Boolean) as string[];
  if (ids.length === 0) return null;

  const filters = ids
    .flatMap((id) => [
      `apple_original_transaction_id.eq.${id}`,
      `apple_transaction_id.eq.${id}`,
    ])
    .join(",");

  const { data: payment } = await serviceClient
    .from("payments")
    .select("user_id")
    .or(filters)
    .limit(1)
    .maybeSingle();

  return payment?.user_id ?? null;
}

// ─── Route ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Apple retries any non-2xx for up to several days. We therefore return
  // 200 for anything we've consciously decided not to act on, and reserve
  // non-2xx for "we failed, please retry".
  let body: { signedPayload?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.signedPayload) {
    console.warn("[iap-notification] request had no signedPayload — ignoring");
    return NextResponse.json({ ok: true, ignored: "no signedPayload" }, { status: 200 });
  }

  const payload = verifyAppleJws<NotificationPayload>(body.signedPayload);
  if (!payload) {
    // Verification failure is either an attack or a bug in our checks.
    // Either way we must not act on it, and 401 stops Apple retrying a
    // payload we will never accept.
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  const notificationType = payload.notificationType ?? "UNKNOWN";
  const subtype = payload.subtype ?? "";

  const txn = payload.data?.signedTransactionInfo
    ? verifyAppleJws<SignedTransactionInfo>(payload.data.signedTransactionInfo)
    : null;

  if (!txn) {
    console.warn(`[iap-notification] ${notificationType}: no verifiable transaction info`);
    return NextResponse.json({ ok: true, ignored: "no transaction info" }, { status: 200 });
  }

  const bundleId = txn.bundleId ?? payload.data?.bundleId;
  if (bundleId && bundleId !== EXPECTED_BUNDLE_ID) {
    console.error(`[iap-notification] bundleId mismatch: ${bundleId}`);
    return NextResponse.json({ ok: true, ignored: "wrong bundle" }, { status: 200 });
  }

  console.log(
    `[iap-notification] ${notificationType}${subtype ? `/${subtype}` : ""} product=${txn.productId} txn=${txn.transactionId} originalTxn=${txn.originalTransactionId}`
  );

  try {
    return await handleNotification(notificationType, subtype, txn);
  } catch (err) {
    // A genuine server-side failure. Return 500 so Apple retries and the
    // purchase eventually lands rather than being lost.
    console.error("[iap-notification] handler threw:", err);
    return NextResponse.json({ error: "Fulfillment error" }, { status: 500 });
  }
}

async function handleNotification(
  notificationType: string,
  subtype: string,
  txn: SignedTransactionInfo
): Promise<NextResponse> {
  const serviceClient = await createServiceClient();

  const product = txn.productId
    ? (() => {
        try {
          return getIapProduct(txn.productId!);
        } catch {
          return null;
        }
      })()
    : null;

  switch (notificationType) {
    // ── Money in ────────────────────────────────────────────────────────
    case "ONE_TIME_CHARGE": // consumables (Single / BOGO / Competition Pack)
    case "SUBSCRIBED": // first subscription purchase or resubscribe
    case "DID_RENEW": // monthly renewal — no client is involved at all
    case "OFFER_REDEEMED": {
      if (!product) {
        await alertUnfulfilled(notificationType, txn, "unknown product id");
        return NextResponse.json({ ok: true, ignored: "unknown product" }, { status: 200 });
      }

      const userId = await resolveUserId(serviceClient, txn);
      if (!userId) {
        await alertUnfulfilled(notificationType, txn, "could not map purchase to a user");
        return NextResponse.json({ ok: true, ignored: "unresolved user" }, { status: 200 });
      }

      const appleTxnId = txn.transactionId ?? txn.originalTransactionId!;

      // Idempotency: if we've already recorded this exact Apple
      // transaction, the client path (or a previous retry) beat us here.
      const { data: existing } = await serviceClient
        .from("payments")
        .select("id")
        .eq("apple_transaction_id", appleTxnId)
        .maybeSingle();
      if (existing) {
        console.log(`[iap-notification] ${appleTxnId} already fulfilled — no-op`);
        return NextResponse.json({ ok: true, alreadyFulfilled: true }, { status: 200 });
      }

      // Grant. Consumables add credits; subscriptions refresh the cycle.
      if (product.mode === "subscription" && product.paymentType === "subscription") {
        const start = txn.purchaseDate ? new Date(txn.purchaseDate) : new Date();
        const end = txn.expiresDate
          ? new Date(txn.expiresDate)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await grantSubscriptionCycle(
          serviceClient,
          userId,
          SUBSCRIPTION_CREDITS,
          start,
          end
        );
      } else if (product.paymentType === "studio_subscription") {
        await grantStudioCycle(serviceClient, userId);
      } else {
        await grantCredits(serviceClient, userId, product.creditsGranted, false);
      }

      // Record it. The unique index on apple_transaction_id makes this the
      // real idempotency guard against a concurrent client submission.
      const isRenewal = notificationType === "DID_RENEW";
      const { error: payErr } = await serviceClient.from("payments").insert({
        user_id: userId,
        stripe_session_id: `apple:${appleTxnId}`,
        apple_transaction_id: appleTxnId,
        apple_original_transaction_id: txn.originalTransactionId ?? appleTxnId,
        payment_type: isRenewal && product.paymentType === "subscription"
          ? "subscription_renewal"
          : product.paymentType,
        amount_cents: product.amountCents,
        currency: "usd",
        status: "completed",
        credits_granted: product.creditsGranted,
      });
      if (payErr && payErr.code === "23505") {
        // Client won the race between our SELECT and INSERT. Credits may
        // now be double-granted, so undo ours to keep the books honest.
        console.warn(
          `[iap-notification] race on ${appleTxnId} — client fulfilled concurrently, reversing our grant`
        );
        await reverseGrant(serviceClient, userId, product.creditsGranted);
        return NextResponse.json({ ok: true, alreadyFulfilled: true }, { status: 200 });
      }
      if (payErr) {
        throw new Error(`payments insert failed: ${payErr.message}`);
      }

      console.log(
        `[iap-notification] fulfilled ${product.productId} (${product.creditsGranted} credits) for user ${userId} via server notification`
      );

      // Tell Shaun. This is the alert that was missing — an App Store sale
      // now produces an email whether or not the app behaved.
      try {
        const { data: userRow } = await serviceClient.auth.admin.getUserById(userId);
        await notifyPayment(
          userRow?.user?.email ?? userId,
          userId,
          isRenewal && product.paymentType === "subscription"
            ? "subscription_renewal"
            : product.paymentType,
          product.amountCents
        );
      } catch (err) {
        console.warn("[iap-notification] owner notification failed:", err);
      }

      return NextResponse.json({ ok: true, fulfilled: true }, { status: 200 });
    }

    // ── Subscription winding down ───────────────────────────────────────
    case "EXPIRED":
    case "DID_FAIL_TO_RENEW":
    case "GRACE_PERIOD_EXPIRED": {
      const userId = await resolveUserId(serviceClient, txn);
      if (!userId) {
        return NextResponse.json({ ok: true, ignored: "unresolved user" }, { status: 200 });
      }
      const expiresAt = txn.expiresDate ? new Date(txn.expiresDate) : new Date();
      await markSubscriptionExpires(serviceClient, userId, expiresAt);
      console.log(`[iap-notification] marked subscription expiring for user ${userId}`);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // ── Money back out ──────────────────────────────────────────────────
    case "REFUND":
    case "REVOKE": {
      const userId = await resolveUserId(serviceClient, txn);
      await notifyCritical(
        "App Store refund issued",
        "Apple refunded a RoutineX purchase. Credits already granted are not automatically clawed back — reconcile in /admin if the balance matters.",
        {
          user: userId ?? "unresolved",
          product: txn.productId ?? "unknown",
          transactionId: txn.transactionId ?? "unknown",
        }
      );
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    default:
      console.log(`[iap-notification] ${notificationType} — no action needed`);
      return NextResponse.json({ ok: true }, { status: 200 });
  }
}

/** Studio pool top-up, mirroring the Stripe webhook's additive +50. */
async function grantStudioCycle(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  userId: string
): Promise<void> {
  const { data: admin } = await serviceClient
    .from("studio_admins")
    .select("studio_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!admin?.studio_id) return;

  const { data: pool } = await serviceClient
    .from("studio_credits")
    .select("total_credits")
    .eq("studio_id", admin.studio_id)
    .maybeSingle();

  if (!pool) {
    await serviceClient.from("studio_credits").insert({
      studio_id: admin.studio_id,
      total_credits: 50,
      used_credits: 0,
      subscription_status: "active",
    });
    return;
  }

  await serviceClient
    .from("studio_credits")
    .update({
      total_credits: pool.total_credits + 50,
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("studio_id", admin.studio_id);
}

/** Undo a credit grant after losing an idempotency race. */
async function reverseGrant(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  userId: string,
  credits: number
): Promise<void> {
  try {
    const { data: row } = await serviceClient
      .from("user_credits")
      .select("total_credits")
      .eq("user_id", userId)
      .maybeSingle();
    if (!row) return;
    await serviceClient
      .from("user_credits")
      .update({
        total_credits: Math.max(0, row.total_credits - credits),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } catch (err) {
    console.error("[iap-notification] could not reverse duplicate grant:", err);
  }
}

/**
 * Apple charged someone and we could not turn that into credits.
 * This is the single most expensive failure mode this system has, so it
 * pages Shaun rather than sitting in a log nobody reads.
 */
async function alertUnfulfilled(
  notificationType: string,
  txn: SignedTransactionInfo,
  reason: string
): Promise<void> {
  console.error(`[iap-notification] UNFULFILLED (${reason}):`, txn);
  try {
    await notifyCritical(
      "App Store purchase could not be fulfilled",
      `Apple reported a purchase that RoutineX could not turn into credits: ${reason}. The customer has been charged. Grant credits manually in /admin.`,
      {
        notificationType,
        product: txn.productId ?? "unknown",
        transactionId: txn.transactionId ?? "unknown",
        originalTransactionId: txn.originalTransactionId ?? "unknown",
        appAccountToken: txn.appAccountToken ?? "not set (older app build)",
      }
    );
  } catch (err) {
    console.error("[iap-notification] could not send unfulfilled alert:", err);
  }
}
