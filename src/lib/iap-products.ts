/**
 * Mapping between Apple App Store IAP product IDs and RoutineX's internal
 * payment_type / credits_granted semantics.
 *
 * Product IDs are the literal identifiers configured in App Store Connect
 * for the RoutineX iOS app. Source of truth is App Store Connect →
 * Distribution → In-App Purchases / Subscriptions. Pulled 2026-04-28.
 *
 * The webhook fulfillment logic in src/app/api/webhook/route.ts decides
 * how to grant credits based on payment_type. The IAP receipt validator
 * (src/app/api/iap/validate-receipt/route.ts) mirrors that exact logic so
 * a $12.99 Stripe subscription and a $12.99 Apple subscription land the
 * user in the same state.
 *
 * IMPORTANT — verify credit counts before resubmitting:
 *   The web Stripe flow grants:
 *     - "single" type ($8.99)         → 2 analyses (BOGO launch offer)
 *     - "pack" type ($29.99)          → 5 analyses
 *     - "subscription" ($12.99/mo)    → 10 analyses/month, resets monthly
 *     - studio "subscription" ($99/mo)→ 100 analyses/month, shared studio pool
 *
 *   App Store Connect has a separate routinex_single ($8.99) that's
 *   labeled "Single Analysis" — singular. The web app only sells the
 *   2-for-$8.99 BOGO. Decide whether routinex_single grants 1 or 2 credits
 *   before sandbox testing. Recommendation: keep parity with web (2 credits)
 *   so cross-platform users see consistent value, and rename the App Store
 *   listing to "RoutineX Launch Offer" if needed.
 */

export type IapPaymentType =
  | "single"
  | "video_analysis"
  | "subscription"
  | "studio_subscription";

export interface IapProduct {
  /** Apple product identifier — must match App Store Connect exactly. */
  productId: string;
  /** Display name for logs / admin UI. */
  name: string;
  /** Stripe-equivalent payment_type — used by fulfillment to mirror the web path. */
  paymentType: IapPaymentType;
  /** "consumable" = one-time grant; "subscription" = recurring monthly. */
  mode: "consumable" | "subscription";
  /** Credits granted on a single successful purchase / billing cycle. */
  creditsGranted: number;
  /** Price in cents (USD) — for logging / payments table parity with Stripe rows. */
  amountCents: number;
}

export const IAP_PRODUCTS: Record<string, IapProduct> = {
  // ── Consumables (one-time analysis credits) ───────────────────────────────
  routinex_single: {
    productId: "routinex_single",
    name: "RoutineX Single Analysis",
    paymentType: "single",
    mode: "consumable",
    creditsGranted: 2, // PARITY WITH WEB: web "single" type is the BOGO 2-for-$8.99 offer
    amountCents: 899,
  },
  routinex_bogo: {
    productId: "routinex_bogo",
    name: "RoutineX BOGO Pack",
    paymentType: "single",
    mode: "consumable",
    creditsGranted: 2,
    amountCents: 899,
  },
  routinex_pack: {
    productId: "routinex_pack",
    name: "RoutineX Competition Pack",
    paymentType: "video_analysis",
    mode: "consumable",
    creditsGranted: 5,
    amountCents: 2999,
  },

  // ── Auto-renewable subscriptions ─────────────────────────────────────────
  routinex_monthly: {
    productId: "routinex_monthly",
    name: "RoutineX Season Member",
    paymentType: "subscription",
    mode: "subscription",
    creditsGranted: 10, // resets monthly via reset_subscription_credits
    amountCents: 1299,
  },
  routinex_studio: {
    productId: "routinex_studio",
    name: "RoutineX Studio & Academy",
    paymentType: "studio_subscription",
    mode: "subscription",
    creditsGranted: 100, // shared studio pool, resets monthly
    amountCents: 9900,
  },
};

/** Resolve a product ID to its IapProduct config. Throws on unknown IDs. */
export function getIapProduct(productId: string): IapProduct {
  const product = IAP_PRODUCTS[productId];
  if (!product) {
    throw new Error(
      `Unknown IAP product id: "${productId}". Add it to IAP_PRODUCTS in src/lib/iap-products.ts.`
    );
  }
  return product;
}

/**
 * Map web checkout type → Apple product ID. Used by the unified
 * startCheckout() to know which IAP to invoke for a given type the
 * existing Pricing/Hero/Dashboard components pass.
 */
export function webTypeToIapProductId(
  type: "single" | "pack" | "subscription" | "studio_subscription"
): string {
  switch (type) {
    case "single":
      return "routinex_bogo"; // web "single" type is the BOGO 2-for-$8.99 offer
    case "pack":
      return "routinex_pack";
    case "subscription":
      return "routinex_monthly";
    case "studio_subscription":
      return "routinex_studio";
  }
}
