import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyReferralSuccess } from "@/lib/notifications";

/**
 * Referral reward: when a referred friend completes their first paid
 * purchase, the friend AND the referrer each get +1 analysis credit
 * (referrer capped at 10 per month). Promised on /referrals.
 *
 * Idempotent — the RPC flips credit_granted_referrer on the referrals row, so
 * calling this on every payment (webhook retries, Apple re-deliveries) is safe.
 * Never throws: a referral hiccup must never fail a customer's payment.
 *
 * Restored 2026-09-11. It was removed 2026-06-30 along with the free credit;
 * the free credit came back 2026-09-09 and the page kept promising this.
 */
export async function fulfillReferralOnPayment(
  serviceClient: SupabaseClient,
  payingUserId: string,
  paymentId: string,
  amountCents: number
): Promise<void> {
  try {
    const { data, error } = await serviceClient.rpc("fulfill_referral_on_payment", {
      p_paying_user_id: payingUserId,
      p_payment_id: paymentId,
      p_amount_cents: amountCents,
    });
    if (error) {
      console.error("Referral fulfillment failed:", error.message);
      return;
    }
    const result = data as { status?: string; referrer_user_id?: string } | null;
    if (result?.status === "credited" && result.referrer_user_id) {
      console.log(`Referral credited: referrer ${result.referrer_user_id} + referred ${payingUserId}`);
      notifyReferralSuccess(serviceClient, result.referrer_user_id).catch((err) =>
        console.error("Referral notify failed:", err)
      );
    }
  } catch (err) {
    console.error("Referral fulfillment exception:", err);
  }
}
