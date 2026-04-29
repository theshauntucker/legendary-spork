import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getIapProduct } from "@/lib/iap-products";
import {
  grantCredits,
  grantSubscriptionCycle,
  SUBSCRIPTION_CREDITS,
} from "@/lib/credits";

export const dynamic = "force-dynamic";

/**
 * Validate an Apple StoreKit receipt and grant credits / activate
 * subscription on success. Mirrors the fulfillment logic in
 * src/app/api/webhook/route.ts so the same purchase produces the same
 * Supabase state regardless of whether it came via Stripe (web) or
 * StoreKit (iOS).
 *
 * Request body:
 *   {
 *     receipt: string;        // base64 receipt-data from StoreKit
 *     transactionId: string;  // Apple transaction id (for idempotency)
 *     productId: string;      // must match an entry in IAP_PRODUCTS
 *   }
 *
 * Response:
 *   200  → { ok: true, creditsGranted: number, paymentType: string }
 *   400  → invalid input or product
 *   401  → not authenticated
 *   402  → Apple rejected the receipt
 *   409  → transactionId already processed (idempotent reject)
 *   500  → server error during fulfillment
 *
 * Required env: APPLE_SHARED_SECRET (App Store Connect → My Apps →
 * RoutineX → In-App Purchases → App-Specific Shared Secret).
 *
 * Apple verifyReceipt notes:
 *   - Always POST to production URL first; on status 21007 retry sandbox.
 *   - Status 0 means valid. Anything else = reject with details.
 *   - For subscriptions, latest_receipt_info[] holds renewal history;
 *     the current period is the entry with the highest expires_date_ms.
 *   - bundle_id must match com.routinex.app or we reject (defense against
 *     receipts from other apps being replayed).
 */

const APPLE_VERIFY_PROD = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_VERIFY_SANDBOX = "https://sandbox.itunes.apple.com/verifyReceipt";
const EXPECTED_BUNDLE_ID = "com.routinex.app";

interface AppleReceiptResponse {
  status: number;
  receipt?: {
    bundle_id?: string;
    in_app?: AppleInAppPurchase[];
  };
  latest_receipt?: string;
  latest_receipt_info?: AppleInAppPurchase[];
  pending_renewal_info?: Array<{
    product_id: string;
    auto_renew_status: "0" | "1";
    expiration_intent?: string;
  }>;
}

interface AppleInAppPurchase {
  transaction_id: string;
  original_transaction_id: string;
  product_id: string;
  purchase_date_ms: string;
  expires_date_ms?: string; // subscriptions only
  cancellation_date_ms?: string;
}

async function callAppleVerify(
  url: string,
  receipt: string
): Promise<AppleReceiptResponse> {
  const sharedSecret = process.env.APPLE_IAP_SHARED_SECRET;
  if (!sharedSecret) {
    throw new Error(
      "APPLE_IAP_SHARED_SECRET env var not set — get it from App Store Connect → My Apps → RoutineX → App Information → App-Specific Shared Secret"
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "receipt-data": receipt,
      password: sharedSecret,
      // For consumables we don't need the renewal history; for subscriptions
      // we do. Always asking is cheap and harmless.
      "exclude-old-transactions": false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Apple verifyReceipt HTTP ${res.status}`);
  }
  return (await res.json()) as AppleReceiptResponse;
}

/**
 * Production-first verification with sandbox fallback per Apple's docs.
 * Status 21007 → "this receipt is from sandbox" → retry against sandbox URL.
 */
async function verifyReceiptWithApple(
  receipt: string
): Promise<AppleReceiptResponse> {
  let response = await callAppleVerify(APPLE_VERIFY_PROD, receipt);
  if (response.status === 21007) {
    response = await callAppleVerify(APPLE_VERIFY_SANDBOX, receipt);
  }
  return response;
}

export async function POST(request: NextRequest) {
  // ── Authn ─────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ── Input validation ──────────────────────────────────────────────────────
  const body = await request.json().catch(() => ({}));
  const { receipt, transactionId, productId } = body as {
    receipt?: string;
    transactionId?: string;
    productId?: string;
  };
  if (!receipt || !transactionId || !productId) {
    return NextResponse.json(
      { error: "receipt, transactionId, and productId are required" },
      { status: 400 }
    );
  }

  let product;
  try {
    product = getIapProduct(productId);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown product" },
      { status: 400 }
    );
  }

  // ── Idempotency ───────────────────────────────────────────────────────────
  // We dedupe via the apple_transaction_id column on payments. Add a unique
  // index in a Supabase migration before this ships:
  //
  //   ALTER TABLE payments ADD COLUMN apple_transaction_id text;
  //   CREATE UNIQUE INDEX payments_apple_transaction_id_uniq
  //     ON payments(apple_transaction_id) WHERE apple_transaction_id IS NOT NULL;
  //
  // Until that migration runs, this dedup check is best-effort.
  const serviceClient = await createServiceClient();
  const { data: existing } = await serviceClient
    .from("payments")
    .select("id")
    .eq("apple_transaction_id", transactionId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      {
        ok: true,
        alreadyProcessed: true,
        creditsGranted: product.creditsGranted,
        paymentType: product.paymentType,
      },
      { status: 200 }
    );
  }

  // ── Verify with Apple ─────────────────────────────────────────────────────
  let appleResponse: AppleReceiptResponse;
  try {
    appleResponse = await verifyReceiptWithApple(receipt);
  } catch (err) {
    console.error("validate-receipt: Apple verifyReceipt threw", err);
    return NextResponse.json(
      { error: "Could not reach Apple — try again" },
      { status: 502 }
    );
  }

  if (appleResponse.status !== 0) {
    console.error(
      `validate-receipt: Apple rejected receipt with status ${appleResponse.status} for user ${user.id} product ${productId}`
    );
    return NextResponse.json(
      { error: `Apple rejected the receipt (status ${appleResponse.status})` },
      { status: 402 }
    );
  }

  // Bundle id sanity check — defends against receipts from other apps being
  // replayed against our endpoint.
  const bundleId = appleResponse.receipt?.bundle_id;
  if (bundleId && bundleId !== EXPECTED_BUNDLE_ID) {
    console.error(
      `validate-receipt: bundle_id mismatch (got ${bundleId}, expected ${EXPECTED_BUNDLE_ID})`
    );
    return NextResponse.json(
      { error: "Receipt is for a different app" },
      { status: 400 }
    );
  }

  // Verify the productId in the request matches what's actually in the receipt.
  // This catches a malicious client that hands us a routinex_pack receipt and
  // claims it's a routinex_studio purchase to get more credits.
  const purchasesInReceipt = [
    ...(appleResponse.latest_receipt_info ?? []),
    ...(appleResponse.receipt?.in_app ?? []),
  ];
  const matchingPurchase = purchasesInReceipt.find(
    (p) => p.transaction_id === transactionId && p.product_id === productId
  );
  if (!matchingPurchase) {
    console.error(
      `validate-receipt: transactionId ${transactionId} not found in receipt for productId ${productId}`
    );
    return NextResponse.json(
      { error: "Transaction not found in receipt — possible tampering" },
      { status: 402 }
    );
  }

  // ── Fulfillment ───────────────────────────────────────────────────────────
  try {
    if (product.mode === "consumable") {
      // One-time purchase. Grant credits, write payment row.
      await grantCredits(serviceClient, user.id, product.creditsGranted, false);
    } else if (product.paymentType === "subscription") {
      // Season Member ($12.99/mo). Use grantSubscriptionCycle which handles
      // first-purchase, renewal, and resubscribe-without-arbitrage cases.
      const startMs = parseInt(matchingPurchase.purchase_date_ms, 10);
      const expiresMs = matchingPurchase.expires_date_ms
        ? parseInt(matchingPurchase.expires_date_ms, 10)
        : startMs + 30 * 24 * 60 * 60 * 1000;
      await grantSubscriptionCycle(
        serviceClient,
        user.id,
        SUBSCRIPTION_CREDITS, // 10
        new Date(startMs),
        new Date(expiresMs)
      );
    } else if (product.paymentType === "studio_subscription") {
      // Studio & Academy ($99/mo). Look up the studio this user admins.
      // First-time purchase: trial → active, pool 25 → 50. Renewal: additive +50.
      // Mirrors the Stripe webhook's studio block exactly.
      const { data: adminRow } = await serviceClient
        .from("studio_admins")
        .select("studio_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!adminRow?.studio_id) {
        return NextResponse.json(
          {
            error:
              "User is not registered as a Studio admin. Studio subscriptions must be purchased after creating a Studio at /studio/signup.",
          },
          { status: 400 }
        );
      }
      const studioId = adminRow.studio_id;
      const { data: pool } = await serviceClient
        .from("studio_credits")
        .select("total_credits, subscription_status")
        .eq("studio_id", studioId)
        .maybeSingle();
      if (!pool) {
        // Bootstrap: create the pool fresh at 50 active credits
        await serviceClient.from("studio_credits").insert({
          studio_id: studioId,
          total_credits: 50,
          used_credits: 0,
          subscription_status: "active",
        });
      } else if (pool.subscription_status === "trial") {
        await serviceClient
          .from("studio_credits")
          .update({
            total_credits: 50,
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("studio_id", studioId);
      } else {
        // Active → additive +50, used_credits untouched
        await serviceClient
          .from("studio_credits")
          .update({
            total_credits: pool.total_credits + 50,
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("studio_id", studioId);
      }
    } else {
      // video_analysis path = same as consumable for our table semantics
      await grantCredits(serviceClient, user.id, product.creditsGranted, false);
    }

    // ── Record the payment row ─────────────────────────────────────────────
    // Same shape as Stripe webhook inserts so admin dashboard counters
    // tally iOS purchases alongside web purchases automatically.
    const { error: paymentErr } = await serviceClient.from("payments").insert({
      user_id: user.id,
      // Reuse the stripe_session_id slot for Apple txn id so admin queries
      // that filter on it still find the row. Actual Apple-specific column
      // is apple_transaction_id (added in the migration above).
      stripe_session_id: `apple:${transactionId}`,
      apple_transaction_id: transactionId,
      payment_type: product.paymentType,
      amount_cents: product.amountCents,
      currency: "usd",
      status: "completed",
      credits_granted: product.creditsGranted,
    });
    if (paymentErr && paymentErr.code !== "23505") {
      // Non-uniqueness errors are real failures. Uniqueness means another
      // request already inserted this row (race/idempotency) — safe to ignore.
      console.error("validate-receipt: payment insert failed", paymentErr);
    }

    return NextResponse.json(
      {
        ok: true,
        creditsGranted: product.creditsGranted,
        paymentType: product.paymentType,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("validate-receipt: fulfillment error", {
      err: err instanceof Error ? err.message : err,
      userId: user.id,
      productId,
      transactionId,
    });
    return NextResponse.json(
      { error: "Fulfillment failed — please contact support with this transaction id: " + transactionId },
      { status: 500 }
    );
  }
}
