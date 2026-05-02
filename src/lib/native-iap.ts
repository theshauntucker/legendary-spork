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
 *
 * Apple-rejection hardening (2026-05-02 — submission 9cc8cfd3 second pass):
 *   - Every error path returns a SPECIFIC, user-readable message. Apple's
 *     reviewer reported "unknown message" — that's their term for "the
 *     alert popped but the text was unhelpful." Now every catch carries
 *     a concrete description of what failed and what the user can try.
 *   - Console-error logging on every failure path so logs from the
 *     reviewer's device tell us exactly what blew up.
 *   - New `restoreNativePurchases()` for guideline 3.1.1 compliance —
 *     surfaced via the "Restore Purchases" button in Settings.
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

/** Outcome of a native IAP restore attempt. */
export type IapRestoreResult =
  | { ok: true; restored: number; message: string }
  | { ok: false; error: string };

// Module-level state — the store can only be initialized once per
// app session. We track init status so subsequent purchases reuse the
// same store instance.
let storeInitialized: Promise<void> | null = null;

/**
 * Pull a useful error message out of an arbitrary thrown value. cdv-purchase
 * sometimes hands us a string, sometimes an Error, sometimes a plain object
 * with `code` + `message`. Apple treats any blank/missing message as an
 * "unknown message" reject, so we fall back to a description of the code.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object" && err !== null) {
    const e = err as { message?: unknown; code?: unknown };
    if (typeof e.message === "string" && e.message.trim()) return e.message.trim();
    if (typeof e.code === "string" || typeof e.code === "number") {
      return `${fallback} (code: ${e.code})`;
    }
  }
  return fallback;
}

/** True when the error/code looks like a user cancellation. */
function isCancelError(err: any): boolean {
  if (!err) return false;
  const message = typeof err === "string" ? err : err?.message;
  return (
    err?.code === "SKErrorPaymentCancelled" ||
    err?.code === 2 ||
    (typeof message === "string" && /cancel/i.test(message))
  );
}

/**
 * Initialize cdv-purchase's store, register the 5 RoutineX products,
 * and wait for them to load from Apple. Idempotent — safe to call
 * multiple times.
 */
async function ensureStoreInitialized(): Promise<void> {
  if (storeInitialized) return storeInitialized;

  storeInitialized = (async () => {
    // Lazy import — webpack bundles cdv-purchase into a separate chunk
    // that only loads when isIosShell() is true. The package is in the
    // main package.json so the deployed Vercel build includes it.
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

  // If the init promise rejects we MUST clear the cache so the next
  // attempt can retry — otherwise a single network blip on app launch
  // permanently bricks IAP for that session.
  try {
    await storeInitialized;
  } catch (err) {
    storeInitialized = null;
    console.error("[native-iap] store.initialize() failed:", err);
    throw err;
  }
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
    return {
      ok: false,
      error: "In-app purchases are only available inside the RoutineX iOS app.",
      cancelled: false,
    };
  }

  // Validate the productId against our known catalog before invoking
  // the plugin — catches typos and unmapped products fast.
  try {
    getIapProduct(productId);
  } catch (err) {
    const error = extractErrorMessage(err, `Unknown product "${productId}"`);
    console.error("[native-iap] productId validation failed:", error);
    return { ok: false, error, cancelled: false };
  }

  let CdvPurchase: any;
  try {
    const mod: any = await import("capacitor-plugin-cdv-purchase");
    CdvPurchase = mod.CdvPurchase ?? mod.default?.CdvPurchase ?? mod;
    await ensureStoreInitialized();
  } catch (err) {
    const detail = extractErrorMessage(err, "StoreKit could not start.");
    console.error("[native-iap] init failed:", err);
    return {
      ok: false,
      error: `Couldn't connect to the App Store: ${detail}. Please check your connection, sign into the App Store, and try again.`,
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
        const error = `This in-app purchase isn't available right now. Apple hasn't returned product "${productId}" — make sure you're signed into the App Store and try again.`;
        console.error("[native-iap] store.get returned null for", productId);
        safeResolve({ ok: false, error, cancelled: false });
        return;
      }
      const offer = product.getOffer();
      if (!offer) {
        const error = `No offer is available for "${productId}". Please try again in a moment.`;
        console.error("[native-iap] no offer for", productId);
        safeResolve({ ok: false, error, cancelled: false });
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
              console.error("[native-iap] approved but missing receipt/txnId:", transaction);
              safeResolve({
                ok: false,
                error: "Purchase was approved but we couldn't read the receipt. Please try Restore Purchases from Settings.",
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
          const error = extractErrorMessage(err, "Couldn't finish processing your purchase.");
          console.error("[native-iap] approved handler threw:", err);
          safeResolve({ ok: false, error, cancelled: false });
          cleanup();
        }
      };

      const errorHandler = (err: any) => {
        const cancelled = isCancelError(err);
        const error = cancelled
          ? "Purchase cancelled."
          : extractErrorMessage(err, "Apple couldn't complete the purchase. Please try again.");
        if (!cancelled) console.error("[native-iap] purchase error:", err);
        safeResolve({ ok: false, error, cancelled });
        cleanup();
      };

      // Subscribe to events. cdv-purchase v13 uses `store.when()` chains.
      const subscription = store.when().approved(approvedHandler);
      const errorSub = store.error(errorHandler);
      offHandlers.push(() => subscription?.unregister?.());
      offHandlers.push(() => errorSub?.unregister?.());

      await offer.order();
    } catch (err: any) {
      const cancelled = isCancelError(err);
      const error = cancelled
        ? "Purchase cancelled."
        : extractErrorMessage(err, "Couldn't start the purchase. Please try again.");
      if (!cancelled) console.error("[native-iap] order() threw:", err);
      safeResolve({ ok: false, error, cancelled });
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
  } catch (err) {
    // Non-fatal — the transaction will get redelivered on next launch
    // and the idempotency check on apple_transaction_id will short-circuit.
    console.warn("[native-iap] finishTransaction soft-failed:", err);
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
      error: extractErrorMessage(err, "Network error during receipt validation"),
    };
  }
}

/**
 * Restore previously purchased In-App Purchases.
 *
 * Required by Apple App Store Review Guideline 3.1.1: any app that sells
 * IAPs that can be restored MUST expose a distinct user-initiated
 * "Restore Purchases" action. Auto-restoring on launch does NOT satisfy
 * this — the user has to be able to tap a button.
 *
 * Flow:
 *   1. Initialize the store (same path as a fresh purchase).
 *   2. Call store.restorePurchases() — Apple returns every prior
 *      transaction tied to the signed-in Apple ID.
 *   3. cdv-purchase fires `approved` for each restored transaction; we
 *      collect them, POST each receipt to /api/iap/validate-receipt for
 *      idempotent server-side fulfillment (the apple_transaction_id
 *      uniqueness constraint short-circuits duplicates), and report a
 *      summary back to the UI.
 *
 * The user sees a single message: "Restored N purchases" or
 * "Nothing to restore." If anything fails partway, we still report
 * what we restored.
 */
export async function restoreNativePurchases(): Promise<IapRestoreResult> {
  if (!isIosShell()) {
    return {
      ok: false,
      error: "Restore Purchases is only available inside the RoutineX iOS app.",
    };
  }

  let CdvPurchase: any;
  try {
    const mod: any = await import("capacitor-plugin-cdv-purchase");
    CdvPurchase = mod.CdvPurchase ?? mod.default?.CdvPurchase ?? mod;
    await ensureStoreInitialized();
  } catch (err) {
    const detail = extractErrorMessage(err, "StoreKit could not start.");
    console.error("[native-iap] restore init failed:", err);
    return {
      ok: false,
      error: `Couldn't connect to the App Store: ${detail}. Please check your connection and try again.`,
    };
  }

  const { store } = CdvPurchase;

  return new Promise<IapRestoreResult>(async (resolve) => {
    let resolved = false;
    const safeResolve = (r: IapRestoreResult) => {
      if (resolved) return;
      resolved = true;
      resolve(r);
    };

    const restored: string[] = [];
    const offHandlers: Array<() => void> = [];
    const cleanup = () => offHandlers.forEach((fn) => fn());

    // While restoring, every approved event represents a previously-owned
    // entitlement. POST each receipt for idempotent server-side fulfillment.
    const approvedHandler = async (transaction: any) => {
      try {
        const productId =
          transaction.products?.[0]?.id ??
          transaction.productId ??
          "";
        const receipt =
          transaction.transactionReceipt ??
          transaction.appStoreReceipt ??
          "";
        const txnId =
          transaction.transactionId ??
          transaction.id ??
          "";
        if (!productId || !receipt || !txnId) return;
        // Server-side validate-receipt is idempotent — duplicates short
        // out via the apple_transaction_id unique constraint.
        await submitReceiptToServer({ receipt, transactionId: String(txnId), productId });
        restored.push(productId);
      } catch (err) {
        console.warn("[native-iap] restore: per-txn fulfillment failed:", err);
      }
    };

    const errorHandler = (err: any) => {
      const message = extractErrorMessage(err, "Restore failed.");
      // Don't blow up the whole restore on a single error — still resolve
      // with what we got, but flag the failure if NOTHING was restored.
      if (restored.length === 0) {
        console.error("[native-iap] restore error:", err);
        safeResolve({ ok: false, error: message });
        cleanup();
      }
    };

    try {
      const subscription = store.when().approved(approvedHandler);
      const errorSub = store.error(errorHandler);
      offHandlers.push(() => subscription?.unregister?.());
      offHandlers.push(() => errorSub?.unregister?.());

      // Kick off the restore. cdv-purchase awaits Apple's response and
      // fires `approved` for each prior transaction.
      await store.restorePurchases();

      // Apple's restorePurchases() resolves once all transactions have
      // been delivered. Give a tick for the approved handlers to flush
      // the server fulfillment calls before reporting back to the UI.
      setTimeout(() => {
        const count = new Set(restored).size;
        const message =
          count === 0
            ? "No previous purchases were found to restore."
            : count === 1
              ? "Restored 1 purchase."
              : `Restored ${count} purchases.`;
        safeResolve({ ok: true, restored: count, message });
        cleanup();
      }, 1500);
    } catch (err) {
      const error = extractErrorMessage(err, "Restore failed. Please try again.");
      console.error("[native-iap] restorePurchases() threw:", err);
      safeResolve({ ok: false, error });
      cleanup();
    }
  });
}
