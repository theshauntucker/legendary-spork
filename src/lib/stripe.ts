import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to your .env.local file."
      );
    }
    _stripe = new Stripe(key.trim(), {
      typescript: true,
      maxNetworkRetries: 1,
      timeout: 8000,
    });
  }
  return _stripe;
}
