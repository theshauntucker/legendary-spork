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
 * a $4.99 Stripe subscription and a $4.99 Apple subscription land the
 * user in the same state.
 *
 * IMPORTANT — verify credit counts before resubmitting:
 *   The web Stripe flow grants:
 *     - "single" type ($1.99)         → 1 analysis
 *     - "bogo" type ($2.99)           → 2 analyses (buy one get one)
 *     - "pack" type ($9.99)           → 5 analyses
 *     - "subscription" ($4.99/mo)     → 4 analyses/month, resets monthly
 *     - studio "subscription" ($99/mo)→ 100 analyses/month, shared studio pool
 *
 *   App Store Connect has a separate routinex_single ($1.99) that's
 *   labeled "Single Analysis" — singular. The web app only sells the
 *   2-for-$2.99 BOGO. routinex_single grants 1 credit, routinex_bogo grants 2
 *   before sandbox testing. Recommendation: keep parity with web (2 credits)
 *   so cross-platform users see consistent value, and rename the App Store
 *   listing to "RoutineX Launch Offer" if needed.
 */

export type IapPaymentType =
  | "single"
  | "bogo"
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
    creditsGranted: 1, // $1.99 → 1 analysis
    amountCents: 199,
  },
  routinex_bogo: {
    productId: "routinex_bogo",
    name: "RoutineX BOGO Pack",
    paymentType: "bogo",
    mode: "consumable",
    creditsGranted: 2, // $2.99 → 2 analyses (buy one get one)
    amountCents: 299,
  },
  routinex_pack: {
    productId: "routinex_pack",
    name: "RoutineX Competition Pack",
    paymentType: "video_analysis",
    mode: "consumable",
    creditsGranted: 5, // $9.99 → 5 analyses
    amountCents: 999,
  },

  // ── Auto-renewable subscriptions ─────────────────────────────────────────
  routinex_monthly: {
    productId: "routinex_monthly",
    name: "RoutineX Season Member",
    paymentType: "subscription",
    mode: "subscription",
    creditsGranted: 4, // resets monthly via reset_subscription_credits
    amountCents: 499,
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
  type: "single" | "bogo" | "pack" | "subscription" | "studio_subscription"
): string {
  switch (type) {
    case "single":
      return "routinex_single";
    case "bogo":
      return "routinex_bogo";
    case "pack":
      return "routinex_pack";
    case "subscription":
      return "routinex_monthly";
    case "studio_subscription":
      return "routinex_studio";
  }
}
