import type { SupabaseClient } from "@supabase/supabase-js";

export const SPOTLIGHT_PRICE_CENTS = 1499;
export const SPOTLIGHT_PAYMENT_TYPE = "spotlight";

/**
 * Record a Spotlight purchase and grant exactly one Spotlight credit.
 *
 * Exactly-once is enforced by the unique stripe_session_id on payments:
 * whichever caller (webhook, /api/spotlight/verify, IAP) inserts the row
 * first does the grant; everyone else sees 23505 and does nothing. The
 * row carries credits_granted 0 / credits_applied true so the analysis-
 * credit machinery (apply_payment_credits) never touches it.
 */
export async function fulfillSpotlightPurchase(
  svc: SupabaseClient,
  p: {
    userId: string;
    sessionKey: string; // stripe session id, or `apple:<txn>`
    paymentIntent?: string | null;
    amountCents?: number | null;
    currency?: string | null;
    referralCode?: string | null;
    appleTransactionId?: string | null;
    appleOriginalTransactionId?: string | null;
  }
): Promise<{ granted: boolean; alreadyProcessed: boolean }> {
  const { error } = await svc.from("payments").insert({
    user_id: p.userId,
    stripe_session_id: p.sessionKey,
    stripe_payment_intent: p.paymentIntent ?? null,
    payment_type: SPOTLIGHT_PAYMENT_TYPE,
    amount_cents: p.amountCents || SPOTLIGHT_PRICE_CENTS,
    currency: p.currency || "usd",
    status: "completed",
    credits_granted: 0,
    credits_applied: true,
    referral_code: p.referralCode ?? null,
    ...(p.appleTransactionId ? { apple_transaction_id: p.appleTransactionId } : {}),
    ...(p.appleOriginalTransactionId ? { apple_original_transaction_id: p.appleOriginalTransactionId } : {}),
  });
  if (error) {
    if (error.code === "23505") return { granted: false, alreadyProcessed: true };
    throw new Error(`spotlight payment insert failed: ${error.message}`);
  }
  const { error: grantErr } = await svc.rpc("spotlight_grant", { p_user: p.userId, p_amount: 1 });
  if (grantErr) throw new Error(`spotlight_grant failed: ${grantErr.message}`);
  return { granted: true, alreadyProcessed: false };
}

export async function getSpotlightCredits(svc: SupabaseClient, userId: string): Promise<{ total: number; used: number; remaining: number }> {
  const { data } = await svc.from("spotlight_credits").select("total, used").eq("user_id", userId).maybeSingle();
  const total = data?.total ?? 0, used = data?.used ?? 0;
  return { total, used, remaining: Math.max(0, total - used) };
}

export async function consumeSpotlightCredit(svc: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await svc.rpc("spotlight_consume", { p_user: userId });
  if (error) throw new Error(`spotlight_consume failed: ${error.message}`);
  return data === true;
}

export async function refundSpotlightCredit(svc: SupabaseClient, userId: string): Promise<void> {
  const { data } = await svc.from("spotlight_credits").select("used").eq("user_id", userId).maybeSingle();
  if (data && data.used > 0) {
    await svc.from("spotlight_credits").update({ used: data.used - 1, updated_at: new Date().toISOString() }).eq("user_id", userId);
  }
}
