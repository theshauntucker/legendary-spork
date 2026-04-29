/**
 * Unified checkout entry point. All buy-buttons across the app call
 * `startCheckout(type)` instead of hitting /api/checkout directly.
 *
 * On the web → opens Stripe Checkout in a redirect (existing behavior).
 * Inside the iOS Capacitor shell → triggers native StoreKit IAP and
 * submits the receipt to /api/iap/validate-receipt for fulfillment.
 *
 * Why one helper:
 *   - The buy buttons live in 4+ places (Hero, Pricing, Dashboard, upload).
 *   - We want both flows to land users in the same Supabase state, with
 *     the same credit-grant logic, fired from a single audited code path.
 *   - Apple guideline 2.1(b) requires iOS purchases to use StoreKit;
 *     calling Stripe Checkout from inside the iOS WebView is a hard reject.
 *
 * Usage in components:
 *   const result = await startCheckout("subscription");
 *   if (!result.ok) showError(result.error);
 *   // Web flow redirects to Stripe; iOS flow returns { ok: true } once
 *   // the receipt is validated server-side and credits are granted.
 */

import { isIosShell, purchaseNative, submitReceiptToServer } from "./native-iap";
import { webTypeToIapProductId } from "./iap-products";

export type CheckoutType =
  | "single"
  | "pack"
  | "subscription"
  | "studio_subscription";

export type CheckoutResult =
  | { ok: true; redirected: boolean }
  | { ok: false; error: string; cancelled?: boolean };

export async function startCheckout(
  type: CheckoutType,
  options?: { referralCode?: string }
): Promise<CheckoutResult> {
  // ── iOS native path ──────────────────────────────────────────────────────
  if (isIosShell()) {
    const productId = webTypeToIapProductId(type);
    const purchase = await purchaseNative(productId);
    if (!purchase.ok) {
      return { ok: false, error: purchase.error, cancelled: purchase.cancelled };
    }
    const fulfilled = await submitReceiptToServer({
      receipt: purchase.receipt,
      transactionId: purchase.transactionId,
      productId: purchase.productId,
    });
    if (!fulfilled.ok) {
      return { ok: false, error: fulfilled.error };
    }
    return { ok: true, redirected: false };
  }

  // ── Web Stripe path (unchanged) ─────────────────────────────────────────
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        ...(options?.referralCode ? { referralCode: options.referralCode } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data?.error ?? `HTTP ${res.status}` };
    }
    if (data.url) {
      window.location.href = data.url;
      return { ok: true, redirected: true };
    }
    return { ok: false, error: "Stripe didn't return a checkout URL" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error during checkout",
    };
  }
}
