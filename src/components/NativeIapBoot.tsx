"use client";

import { useEffect } from "react";
import { bootNativeIap, isIosShell, recoverPendingPurchases } from "@/lib/native-iap";

/**
 * Pre-warms the StoreKit (cdv-purchase) store at app boot so the
 * first time the user taps Buy, every product is already loaded.
 *
 * Why this exists (Apple App Store rejection 2026-05-06, submission
 * 9cc8cfd3-741d-42c5-b1b0-14f2b41ee789, guideline 2.1(b)):
 *
 * Previously we called `ensureStoreInitialized()` lazily on the first
 * Buy click. That had two failure modes that the reviewer hit:
 *
 *   1. The StoreKit adapter checks `window.Capacitor.getPlatform()`
 *      on each `store.initialize()` call. If the click happened
 *      before Capacitor's bridge fully attached, the adapter was
 *      marked "not supported" and the whole iOS platform was
 *      silently skipped — no products ever loaded for the rest of
 *      the session.
 *
 *   2. `store.initialize()` returns an IError[]. If Apple rejects a
 *      product (INVALID_PRODUCT_ID — common while products are
 *      still propagating, before the Paid Apps Agreement is fully
 *      live, or in sandbox with the wrong region account), the
 *      error was silently swallowed and the user just saw a
 *      misleading "Apple hasn't returned product" message.
 *
 * Booting at mount fixes #1 (we wait for the bridge before
 * initializing) and the new error reporting in `native-iap.ts`
 * fixes #2 (initialize errors are captured and surfaced).
 */
export default function NativeIapBoot() {
  useEffect(() => {
    if (!isIosShell()) return;
    // Fire and forget — bootNativeIap never throws, only logs. It also
    // runs the pending-purchase recovery sweep once the store is up.
    void bootNativeIap();

    /**
     * Re-run recovery when the app comes back to the foreground.
     *
     * Two reasons this matters, both of them money:
     *   1. On a cold boot the user often isn't signed in yet, so
     *        /api/iap/validate-receipt 401s and the purchase stays
     *        queued. By the time they've logged in and switched back,
     *        this fires and fulfils it.
     *   2. StoreKit sometimes delivers a pending transaction slightly
     *        after launch. The boot sweep would have already run; this
     *        catches the late arrival.
     *
     * Recovery is idempotent server-side and no-ops when the queue is
     * empty, so running it often is cheap and safe.
     */
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void recoverPendingPurchases();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return null;
}
