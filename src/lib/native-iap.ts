/**
 * Client-side helper for native iOS in-app purchases via
 * capacitor-plugin-cdv-purchase (StoreKit 2 wrapper, same maintainer
 * as the long-standing cordova-plugin-purchase).
 *
 * Server-only callers should NOT import this — it touches `window` and
 * the Capacitor runtime, which only exists inside the iOS WebView shell.
 *
 * Detection strategy:
 *   1. Capacitor sets `window.Capacitor.isNativePlatform()` → true inside
 *      the native shell. This is the gold-standard signal.
 *   2. As a SSR-friendly secondary signal, we check `data-native-shell`
 *      on `<html>` (set server-side from the User-Agent sniff in
 *      src/lib/native-shell.ts based on the `RoutineXiOS/1.0` token in
 *      mobile/capacitor.config.ts).
 *
 * If either signal indicates native, route purchases through StoreKit.
 * Otherwise fall through to the regular Stripe Checkout web flow.
 *
 * Plugin API note — cdv-purchase is event-driven. We initialize the
 * store on first call (lazily), register all 5 products, and wrap a
 * single purchase attempt in a Promise that resolves on the first
 * `approved` event for that product. This matches the rest of the
 * codebase, which expects a promise-shaped checkout call.
 */

import { getIapProduct, IAP_PRODUCTS } from "./iap-products";

// Capacitor's runtime check — only present inside the native WebView.
function getCapacitor(): { isNativePlatform: () => boolean } | null {
  if (typeof window === "undefined") return null;
  // @ts-expect-error — Capacitor injects this global at runtime
  return window.Capacitor ?? null;
}

/** True when this code is running inside the RoutineX iOS Capacitor shell. */
export function isIosShell(): boolean {
  const cap = getCapacitor();
  if (cap?.isNativePlatform()) return true;

  // Fallback for SSR-hydrated client code where Capacitor hasn't initialized
  // yet — the layout sets data-native-shell="ios" on <html>.
  if (typeof document !== "undefined") {
    const flag = document.documentElement.dataset.nativeShell;
    return flag === "ios" || flag === "true";
  }
  return false;
}

/** Outcome of a native IAP purchase attempt. */
export type IapPurchaseResult =
  | { ok: true; receipt: string; transactionId: string; productId: string }
  | { ok: false; error: string; cancelled: boolean };

// Module-level state — the store can only be initialized once per
// app session. We track init status so subsequent purchases reuse the
// same store instance.
let storeInitialized: Promise<void> | null = null;

/**
 * Initialize cdv-purchase's store, register the 5 RoutineX products,
 * and wait for them to load from Apple. Idempotent — safe to call
 * multiple times.
 */
async function ensureStoreInitialized(): Promise<void> {
  if (storeInitialized) return storeInitialized;

  storeInitialized = (async () => {
    const mod: any = await import("capacitor-plugin-cdv-purchase");
    const CdvPurchase = mod.CdvPurchase ?? mod.default?.CdvPurchase ?? mod;
    const { store, ProductType, Platform } = CdvPurchase;

    // Register every product we know about. Even if a Buy button only
    // ever invokes one, the plugin needs all of them registered before
    // Apple can return their pricing/state.
    const products = Object.values(IAP_PRODUCTS).map((p) => ({
      id: p.productId,
      type:
        p.mode === "subscription"
          ? ProductType.PAID_SUBSCRIPTION
          : ProductType.CONSUMABLE,
      platform: Platform.APPLE_APPSTORE,
    }));
    store.register(products);

    await store.initialize([Platform.APPLE_APPSTORE]);
  })();

  return storeInitialized;
}

/**
 * Initiate a native iOS in-app purchase via StoreKit (cdv-purchase).
 *
 * Caller responsibilities:
 *   - Only call when isIosShell() === true.
 *   - On {ok:true}, POST the receipt to /api/iap/validate-receipt for
 *     server-side validation + credit fulfillment. Do NOT grant credits
 *     client-side.
 *   - On {ok:false, cancelled:true}, treat as user-cancelled and stay
 *     on the pricing screen. Don't show an error toast.
 */
export async function purchaseNative(
  productId: string
): Promise<IapPurchaseResult> {
  if (!isIosShell()) {
    return { ok: false, error: "Native IAP only available in iOS app", cancelled: false };
  }

  // Validate the productId against our known catalog before invoking
  // the plugin — catches typos and unmapped products fast.
  try {
    getIapProduct(productId);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Invalid productId",
      cancelled: false,
    };
  }

  let CdvPurchase: any;
  try {
    const mod: any = await import("capacitor-plugin-cdv-purchase");
    CdvPurchase = mod.CdvPurchase ?? mod.default?.CdvPurchase ?? mod;
    await ensureStoreInitialized();
  } catch (err) {
    return {
      ok: false,
      error:
        "capacitor-plugin-cdv-purchase failed to load — run `cd mobile && npm install && npx cap sync ios`",
      cancelled: false,
    };
  }

  const { store } = CdvPurchase;

  // Wrap the event-driven purchase flow in a Promise. cdv-purchase fires
  // `approved` when the user completes the StoreKit dialog and Apple has
  // accepted the transaction; `cancelled` when the user dismisses; and
  // `error` for everything else.
  return new Promise<IapPurchaseResult>(async (resolve) => {
    let resolved = false;
    const safeResolve = (r: IapPurchaseResult) => {
      if (resolved) return;
      resolved = true;
      resolve(r);
    };

    const offHandlers: Array<() => void> = [];
    const cleanup = () => offHandlers.forEach((fn) => fn());

    try {
      const product = store.get(productId);
      if (!product) {
        safeResolve({
          ok: false,
          error: `StoreKit didn't return product ${productId} — verify it's approved in App Store Connect`,
          cancelled: false,
        });
        return;
      }
      const offer = product.getOffer();
      if (!offer) {
        safeResolve({
          ok: false,
          error: `No offer available for ${productId}`,
          cancelled: false,
        });
        return;
      }

      // Wire up the result handlers BEFORE calling order().
      const approvedHandler = (transaction: any) => {
        try {
          if (
            transaction.products?.some((p: any) => p.id === productId) ||
            transaction.products?.[0]?.id === productId
          ) {
            // Pull the latest receipt + transactionId out of the event.
            // cdv-purchase exposes the StoreKit receipt as
            // transaction.transactionReceipt OR via the verify() flow.
            const receipt =
              transaction.transactionReceipt ??
              transaction.appStoreReceipt ??
              "";
            const txnId =
              transaction.transactionId ??
              transaction.id ??
              "";
            if (!receipt || !txnId) {
              safeResolve({
                ok: false,
                error: "Transaction approved but receipt is missing — try again",
                cancelled: false,
              });
              cleanup();
              return;
            }
            safeResolve({
              ok: true,
              receipt,
              transactionId: String(txnId),
              productId,
            });
            // Note: we DO NOT call transaction.finish() here. Server-side
            // validate-receipt confirms with Apple, then the caller calls
            // finishTransaction() once credits are persisted.
            cleanup();
          }
        } catch (err) {
          safeResolve({
            ok: false,
            error: err instanceof Error ? err.message : "Approved handler failed",
            cancelled: false,
          });
          cleanup();
        }
      };

      const errorHandler = (err: any) => {
        // cdv-purchase emits errors with code + message. SKErrorPaymentCancelled
        // is what we get when the user dismisses the StoreKit dialog.
        const message = err?.message ?? "Purchase failed";
        const cancelled =
          err?.code === "SKErrorPaymentCancelled" ||
          err?.code === 2 ||
          /cancel/i.test(message);
        safeResolve({ ok: false, error: message, cancelled });
        cleanup();
      };

      // Subscribe to events. cdv-purchase v13 uses `store.when()` chains.
      const subscription = store.when().approved(approvedHandler);
      const errorSub = store.error(errorHandler);
      offHandlers.push(() => subscription?.unregister?.());
      offHandlers.push(() => errorSub?.unregister?.());

      await offer.order();
    } catch (err: any) {
      const message = err?.message ?? "Purchase failed";
      const cancelled =
        err?.code === "SKErrorPaymentCancelled" ||
        err?.code === 2 ||
        /cancel/i.test(message);
      safeResolve({ ok: false, error: message, cancelled });
      cleanup();
    }
  });
}

/**
 * Tell StoreKit a transaction is fully consumed. Call this AFTER the
 * server has confirmed the receipt and credits are in Supabase. If you
 * skip it, Apple will keep redelivering the transaction on every app
 * launch until the user reinstalls — bad UX.
 */
export async function finishTransaction(transactionId: string): Promise<void> {
  if (!isIosShell()) return;
  try {
    const mod: any = await import("capacitor-plugin-cdv-purchase");
    const CdvPurchase = mod.CdvPurchase ?? mod.default?.CdvPurchase ?? mod;
    const { store } = CdvPurchase;
    // cdv-purchase exposes finish() on the transaction object found via
    // localTransactions. Iterate to find the one we just processed.
    const all = (store.localTransactions ?? []) as any[];
    const txn = all.find((t) => t.transactionId === transactionId || t.id === transactionId);
    if (txn?.finish) {
      await txn.finish();
    }
  } catch {
    // Non-fatal — the transaction will get redelivered on next launch
    // and the idempotency check on apple_transaction_id will short-circuit.
  }
}

/** POST the receipt to our server for validation + fulfillment. */
export async function submitReceiptToServer(args: {
  receipt: string;
  transactionId: string;
  productId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/iap/validate-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { ok: false, error: data?.error ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error during receipt validation",
    };
  }
}
