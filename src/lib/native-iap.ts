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

/**
 * Load `capacitor-plugin-cdv-purchase` at runtime.
 *
 * The package is now declared in the root web package.json (line 24) so
 * Turbopack DOES bundle it into a web chunk. A plain dynamic `import()`
 * works in two ways at the same time:
 *   1. Build time — Turbopack resolves the specifier against node_modules,
 *      bundles the plugin into a separate chunk, and emits a chunk URL.
 *   2. Run time — the browser/WebView fetches that chunk URL, NOT the
 *      bare specifier (which browsers can't resolve).
 *
 * Earlier we wrapped this in `new Function("return import(...)")` to
 * defeat static analysis when the package was iOS-only. That backfired:
 * the bundler skipped the package entirely, so at runtime the WebView
 * tried to resolve a bare module specifier and threw — which is exactly
 * what Apple's reviewer saw as "capacitor-plugin-cdv-purchase failed to
 * load". Now that the package is in root deps, the static-analysable
 * import is correct.
 */
async function importCdvPurchase(): Promise<any> {
  return import("capacitor-plugin-cdv-purchase");
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
 * Track which product IDs have actually been loaded (StoreKit returned
 * them as valid). store.get() can return null for two distinct reasons:
 *   (1) the iOS adapter was skipped because window.Capacitor wasn't
 *       ready when initialize() ran, OR
 *   (2) Apple returned the product as INVALID (not approved, missing
 *       metadata, agreement issue, sandbox account region, etc.).
 * We need to distinguish these so the user gets a useful message.
 */
const loadedProductIds = new Set<string>();
let lastInitializeErrors: any[] = [];
let iosAdapterRanAtInit = false;

/**
 * Wait up to `timeoutMs` for window.Capacitor to be present and report
 * iOS as the platform. Capacitor injects the bridge synchronously when
 * the WebView boots, but on cold-start there's a brief window where
 * the JS bundle has loaded but Capacitor.getPlatform() isn't yet
 * available. If we call store.initialize() during that window, the
 * Apple adapter's `isSupported` getter returns false (because it
 * checks `window.Capacitor.getPlatform() === 'ios'`), so the adapter
 * is silently skipped and no products ever load — leaving every
 * subsequent purchase to fail with the misleading "product not
 * returned" error. Block until Capacitor is actually ready.
 */
async function waitForCapacitorReady(timeoutMs = 4000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const cap = getCapacitor() as any;
    if (cap?.getPlatform?.() === "ios" || cap?.isNativePlatform?.()) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 75));
  }
  return false;
}

/**
 * Wait for the native PurchasePlugin bridge to be registered on
 * window.Capacitor.Plugins. The plugin's JS registers itself via
 * `registerPlugin('PurchasePlugin')` at import-time, but that only
 * succeeds if Capacitor's runtime has finished injecting plugin
 * proxies. If we proceed before this, store.initialize() returns
 * `{code: SETUP, message: 'Capacitor PurchasePlugin not available'}`
 * — which is exactly the failure mode that produces the misleading
 * "Apple hasn't returned product" message we showed Apple's reviewer.
 *
 * Returning false here means the native pod isn't installed (build
 * was sync'd without `npx cap sync ios`) or Capacitor's runtime
 * hasn't finished loading. Either case, we surface a specific message.
 */
async function waitForPurchasePluginBridge(timeoutMs = 4000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const cap: any = (typeof window !== "undefined" && (window as any).Capacitor) || null;
    if (cap?.Plugins?.PurchasePlugin) return true;
    await new Promise((r) => setTimeout(r, 75));
  }
  return false;
}

/**
 * Initialize cdv-purchase's store, register the 5 RoutineX products,
 * and wait for them to load from Apple. Idempotent — safe to call
 * multiple times. Should be invoked at app boot (see useNativeIapBoot
 * hook) so by the time a user taps Buy, every product is already
 * loaded and no race exists.
 */
async function ensureStoreInitialized(): Promise<void> {
  if (storeInitialized) return storeInitialized;

  storeInitialized = (async () => {
    // CRITICAL: Capacitor's bridge must be present before we initialize
    // the StoreKit adapter, otherwise the adapter's isSupported check
    // returns false and the whole platform is skipped. See note above.
    const capacitorReady = await waitForCapacitorReady();
    if (!capacitorReady) {
      console.error(
        "[native-iap] Capacitor.getPlatform() never reported 'ios'. Either we're not in the iOS shell or the bridge failed to inject."
      );
      throw new Error(
        "The native bridge isn't ready yet. Close the app fully and re-open it, then try again."
      );
    }

    // Importing the package executes its top-level
    // `registerPlugin('PurchasePlugin')` side-effect which registers
    // the JS proxy that bridges to the native pod. Must happen AFTER
    // window.Capacitor is ready (above) so the registration takes.
    const mod: any = await importCdvPurchase();
    const CdvPurchase = mod.CdvPurchase ?? mod.default?.CdvPurchase ?? mod;
    const { store, ProductType, Platform } = CdvPurchase;

    // Now confirm the native bridge is actually present. If the pod
    // wasn't installed (`npx cap sync ios` wasn't run for this build)
    // OR Capacitor's plugin registry hasn't finished setup, the
    // PurchasePlugin proxy will be missing and store.initialize() will
    // fail with a SETUP error that's invisible to users.
    const pluginBridgeReady = await waitForPurchasePluginBridge();
    if (!pluginBridgeReady) {
      console.error(
        "[native-iap] window.Capacitor.Plugins.PurchasePlugin missing — pod likely not installed. Run `cd mobile && npm install && npx cap sync ios` and rebuild."
      );
      throw new Error(
        "The In-App Purchase plugin isn't registered with the native bridge. Please update the app from the App Store and try again."
      );
    }

    if (!store || !Platform?.APPLE_APPSTORE) {
      console.error("[native-iap] cdv-purchase loaded but store/Platform missing:", {
        hasStore: !!store,
        hasPlatform: !!Platform,
        keys: Object.keys(mod || {}),
      });
      throw new Error(
        "In-app purchase plugin loaded incorrectly. Please update the app and try again."
      );
    }

    // Surface every plugin event to the device console so reviewer logs
    // give us a complete trail if anything still goes wrong.
    if (typeof store.verbosity !== "undefined") {
      try {
        store.verbosity = CdvPurchase.LogLevel?.DEBUG ?? 4;
      } catch {
        /* older versions don't expose verbosity setter */
      }
    }

    // Wire up listeners BEFORE register/initialize so we don't miss
    // the productUpdated events that fire during the load.
    store
      .when()
      .productUpdated((product: any) => {
        if (product?.id) {
          loadedProductIds.add(product.id);
          console.info("[native-iap] productUpdated:", product.id, {
            valid: product.valid,
            canPurchase: product.canPurchase,
          });
        }
      });

    store.error((err: any) => {
      console.error("[native-iap] store error:", err);
    });

    // Register every product we know about. The plugin needs all of
    // them registered up-front so Apple returns their pricing/state.
    const products = Object.values(IAP_PRODUCTS).map((p) => ({
      id: p.productId,
      type:
        p.mode === "subscription"
          ? ProductType.PAID_SUBSCRIPTION
          : ProductType.CONSUMABLE,
      platform: Platform.APPLE_APPSTORE,
    }));
    store.register(products);
    console.info("[native-iap] registered products:", products.map((p) => p.id));

    // initialize() returns an IError[] — collect and inspect it. An
    // empty array means everything loaded; a non-empty array means at
    // least one product was rejected (most commonly INVALID_PRODUCT_ID
    // when Apple doesn't recognize the ID, which happens if the
    // product isn't yet "Waiting for Review" or the Paid Apps
    // Agreement isn't active).
    const initResult = await store.initialize([Platform.APPLE_APPSTORE]);
    iosAdapterRanAtInit = true;
    lastInitializeErrors = Array.isArray(initResult) ? initResult : initResult ? [initResult] : [];
    if (lastInitializeErrors.length > 0) {
      console.error(
        "[native-iap] store.initialize() returned errors:",
        lastInitializeErrors
      );
    }
    console.info(
      "[native-iap] initialize complete. loaded:",
      Array.from(loadedProductIds),
      "errors:",
      lastInitializeErrors.length
    );
  })();

  try {
    await storeInitialized;
  } catch (err) {
    // Clear cache so next attempt can retry — a single transient
    // failure shouldn't permanently brick IAP for the session.
    storeInitialized = null;
    console.error("[native-iap] store.initialize() failed:", err);
    throw err;
  }
}

/**
 * Eagerly boot the StoreKit store on app load so by the time a user
 * taps Buy, everything is already loaded. Called from a client-side
 * mount effect in src/components/NativeIapBoot.tsx.
 *
 * Returns true if initialization completed without errors, false if
 * Apple rejected any product or if Capacitor wasn't ready in time.
 * Either outcome is logged but never thrown — boot must not crash
 * the app.
 */
export async function bootNativeIap(): Promise<boolean> {
  if (!isIosShell()) return false;
  try {
    await ensureStoreInitialized();
    return lastInitializeErrors.length === 0;
  } catch (err) {
    console.error("[native-iap] bootNativeIap failed:", err);
    return false;
  }
}

/** Diagnostic snapshot — used by the purchase flow to build a
 *  user-readable error when store.get() returns null. */
function describeStoreState(productId: string): string {
  if (!iosAdapterRanAtInit) {
    return "the App Store connection didn't initialize on this device";
  }
  if (loadedProductIds.size === 0) {
    return "Apple didn't return any products — confirm you're signed into the App Store with the country set to United States, then re-open the app";
  }
  // Filter init errors to ones tied to THIS productId. An IError can
  // carry a productId (when Apple rejected a specific SKU as
  // INVALID_PRODUCT_ID); errors without one are global setup failures.
  const productErrors = lastInitializeErrors.filter(
    (e: any) => e?.productId === productId || !e?.productId
  );
  if (productErrors.length > 0) {
    const codes = productErrors
      .map((e: any) => e?.code ?? e?.message ?? String(e))
      .filter(Boolean)
      .join(", ");
    return `Apple rejected this product (${codes}). The product may still be propagating after our latest update — please try again in a few minutes`;
  }
  return `Apple returned ${loadedProductIds.size} other products but not "${productId}". Confirm "${productId}" is approved in App Store Connect and try again`;
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
    const mod: any = await importCdvPurchase();
    CdvPurchase = mod.CdvPurchase ?? mod.default?.CdvPurchase ?? mod;
    await ensureStoreInitialized();
  } catch (err) {
    const detail = extractErrorMessage(err, "StoreKit could not start.");
    console.error("[native-iap] init failed:", err);
    // ensureStoreInitialized() throws Error instances with already
    // user-friendly messages (e.g. "The native bridge isn't ready
    // yet..."). Pass those through as-is rather than double-wrapping.
    // For unrecognised failures, prefix with the connect-to-App-Store
    // framing so users know it's a network/StoreKit problem.
    const isFriendly =
      err instanceof Error && /try again|App Store|update the app/i.test(err.message);
    return {
      ok: false,
      error: isFriendly
        ? detail
        : `Couldn't connect to the App Store: ${detail}. Please check your connection, sign into the App Store, and try again.`,
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
      // If the product hasn't loaded yet (e.g. user clicked Buy before
      // initialize completed), give it a short window to show up via
      // the productUpdated event we've been listening for.
      let product = store.get(productId);
      if (!product) {
        const waitStart = Date.now();
        while (!product && Date.now() - waitStart < 3000) {
          await new Promise((r) => setTimeout(r, 100));
          if (loadedProductIds.has(productId)) {
            product = store.get(productId);
          }
        }
      }
      if (!product) {
        const reason = describeStoreState(productId);
        const error = `This in-app purchase isn't available right now: ${reason}.`;
        console.error("[native-iap] store.get returned null for", productId, {
          loaded: Array.from(loadedProductIds),
          initErrors: lastInitializeErrors,
          iosAdapterRanAtInit,
        });
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
    const mod: any = await importCdvPurchase();
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
    const mod: any = await importCdvPurchase();
    CdvPurchase = mod.CdvPurchase ?? mod.default?.CdvPurchase ?? mod;
    await ensureStoreInitialized();
  } catch (err) {
    const detail = extractErrorMessage(err, "StoreKit could not start.");
    console.error("[native-iap] restore init failed:", err);
    const isFriendly =
      err instanceof Error && /try again|App Store|update the app/i.test(err.message);
    return {
      ok: false,
      error: isFriendly
        ? detail
        : `Couldn't connect to the App Store: ${detail}. Please check your connection and try again.`,
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
