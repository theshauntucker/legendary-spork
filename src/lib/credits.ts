import { SupabaseClient } from "@supabase/supabase-js";
import { getStudioForUser } from "@/lib/studio/membership";

const BETA_CREDITS = 3;

// Admin emails that bypass payment — add yours here
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL?.toLowerCase(), // Set in Vercel env vars
].filter(Boolean);

export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

interface CreditStatus {
  hasCredits: boolean;
  remaining: number;
  isBetaMember: boolean;
  isAdmin: boolean;
  totalCredits: number;
  usedCredits: number;
  // ─── Studio-pool extensions (all optional, undefined for B2C users) ────
  // A non-studio user's response contains none of these fields — the object
  // returned for B2C users is byte-identical to pre-studio behavior.
  source?: "personal" | "studio";
  studioId?: string;
  studioSubscriptionStatus?: string | null;
  // ─── Subscription-pool extensions (optional, undefined for pack users) ─
  creditSource?: "pack" | "subscription" | "beta" | "admin" | "trial";
  expiresAt?: string | null;
  billingPeriodStart?: string | null;
}

/**
 * Check if a user has credits remaining to analyze a video.
 * Admins always have credits.
 */
export async function getUserCredits(
  serviceClient: SupabaseClient,
  userId: string,
  userEmail?: string
): Promise<CreditStatus> {
  // Admin bypass — behavior preserved exactly
  if (isAdmin(userEmail)) {
    return {
      hasCredits: true,
      remaining: 999,
      isBetaMember: true,
      isAdmin: true,
      totalCredits: 999,
      usedCredits: 0,
    };
  }

  // ─── Studio branch (additive) ─────────────────────────────────────────
  // If the user is a member of a studio, their balance IS the shared pool.
  // This branch only triggers for users who joined a studio; every existing
  // B2C user has zero studio_members rows and falls through to the original
  // code path below, byte-identical to pre-studio behavior.
  const studio = await getStudioForUser(serviceClient, userId);
  if (studio) {
    const studioRemaining = Math.max(0, studio.totalCredits - studio.usedCredits);
    return {
      hasCredits: studioRemaining > 0,
      remaining: studioRemaining,
      isBetaMember: false,
      isAdmin: false,
      totalCredits: studio.totalCredits,
      usedCredits: studio.usedCredits,
      source: "studio",
      studioId: studio.studioId,
      studioSubscriptionStatus: studio.subscriptionStatus,
    };
  }
  // ──────────────────────────────────────────────────────────────────────

  const { data: credits } = await serviceClient
    .from("user_credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!credits) {
    // No credit record = hasn't paid
    return {
      hasCredits: false,
      remaining: 0,
      isBetaMember: false,
      isAdmin: false,
      totalCredits: 0,
      usedCredits: 0,
    };
  }

  const remaining = credits.total_credits - credits.used_credits;

  // Subscription credits expire at end of billing period if the user cancels.
  // Pack credits have expires_at=NULL and never expire. If the subscription
  // is still active, expires_at is the current period end — also fine to
  // gate on (refresh writes new expires_at each cycle).
  const nowMs = Date.now();
  const expiresAt = credits.expires_at ? new Date(credits.expires_at).getTime() : null;
  const expired =
    credits.credit_source === "subscription" && expiresAt !== null && expiresAt < nowMs;

  return {
    hasCredits: !expired && remaining > 0,
    remaining: expired ? 0 : remaining,
    isBetaMember: credits.is_beta_member,
    isAdmin: false,
    totalCredits: credits.total_credits,
    usedCredits: credits.used_credits,
    creditSource: credits.credit_source ?? "pack",
    expiresAt: credits.expires_at ?? null,
    billingPeriodStart: credits.billing_period_start ?? null,
  };
}

/**
 * Use one credit after a successful analysis.
 */
export async function useCredit(
  serviceClient: SupabaseClient,
  userId: string,
  userEmail?: string
): Promise<void> {
  // Don't deduct from admins — behavior preserved exactly
  if (isAdmin(userEmail)) return;

  // ─── Studio branch (additive) ─────────────────────────────────────────
  // Studio members draw from the shared pool. B2C users have no
  // studio_members row and fall through to the original RPC call below.
  const studio = await getStudioForUser(serviceClient, userId);
  if (studio) {
    // Atomic conditional update: only succeeds if pool has credit left.
    // Using .select() with WHERE guards prevents under-deducting into negative.
    const { data: drained, error } = await serviceClient
      .from("studio_credits")
      .update({
        used_credits: studio.usedCredits + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("studio_id", studio.studioId)
      .eq("used_credits", studio.usedCredits)        // optimistic lock
      .lt("used_credits", studio.totalCredits)       // don't drain past total
      .select("studio_id");

    if (error) {
      throw new Error(`studio_credits update failed: ${error.message}`);
    }
    if (!drained || drained.length === 0) {
      // Either pool empty or lost the optimistic-lock race. Surface so the
      // caller can refund / show an error rather than silently do nothing.
      throw new Error("Studio credit pool exhausted or updated concurrently");
    }
    // NOTE: studio_analysis_links audit row is written by the caller in a
    // subsequent phase once process/route.ts is updated to pass video context.
    // For Phase A, the pool deduction alone is sufficient.
    return;
  }
  // ──────────────────────────────────────────────────────────────────────

  // Use RPC for atomic increment to avoid race conditions
  await serviceClient.rpc("increment_used_credits", { p_user_id: userId });
}

/**
 * Grant credits to a user after payment.
 * Uses insert-first approach to avoid read-then-write race conditions.
 * If a row already exists (unique constraint on user_id), falls back to
 * the add_credits RPC to atomically increment.
 */
export async function grantCredits(
  serviceClient: SupabaseClient,
  userId: string,
  credits: number,
  isBetaPurchase: boolean
): Promise<void> {
  // Try inserting a new credit record first (handles first-time users)
  const { error: insertError } = await serviceClient
    .from("user_credits")
    .insert({
      user_id: userId,
      total_credits: credits,
      used_credits: 0,
      is_beta_member: isBetaPurchase,
    });

  if (!insertError) {
    // New row created — done
    return;
  }

  // If error is NOT a unique constraint violation, it's a real failure
  if (insertError.code !== "23505") {
    throw new Error(`user_credits insert failed: ${insertError.message}`);
  }

  // Row already exists — add credits via atomic RPC
  const { error: rpcError } = await serviceClient.rpc("add_credits", {
    p_user_id: userId,
    p_credits: credits,
    p_is_beta: isBetaPurchase,
  });
  if (rpcError) {
    throw new Error(`add_credits RPC failed: ${rpcError.message}`);
  }
}

/**
 * Check if a user has credits in the database.
 * Used by webhook/success/dashboard to verify credits were actually granted.
 */
export async function hasCreditsInDb(
  serviceClient: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await serviceClient
    .from("user_credits")
    .select("total_credits")
    .eq("user_id", userId)
    .maybeSingle();

  return !!data && data.total_credits > 0;
}

/**
 * Refund one credit (decrement used_credits) when analysis fails after payment.
 */
export async function refundCredit(
  serviceClient: SupabaseClient,
  userId: string,
  userEmail?: string
): Promise<void> {
  if (isAdmin(userEmail)) return;

  await serviceClient.rpc("decrement_used_credits", { p_user_id: userId });
}

/**
 * Reset a user's credits for a subscription billing cycle.
 * Use-it-or-lose-it semantics — total is SET to p_credits (not added),
 * used_credits is zeroed, and expires_at is the end of the billing period.
 *
 * This is what makes the $12.99/mo tier arbitrage-proof: you can't subscribe,
 * collect 10, cancel, and use them for a year. When the period ends (either
 * because we refresh it or because cancel_at_period_end fires), unused credits
 * are gone.
 */
export async function resetSubscriptionCredits(
  serviceClient: SupabaseClient,
  userId: string,
  credits: number,
  periodStart: Date,
  periodEnd: Date
): Promise<void> {
  const { error } = await serviceClient.rpc("reset_subscription_credits", {
    p_user_id: userId,
    p_credits: credits,
    p_period_start: periodStart.toISOString(),
    p_period_end: periodEnd.toISOString(),
  });
  if (error) {
    throw new Error(`reset_subscription_credits failed: ${error.message}`);
  }
}

/**
 * Subscription billing cycle grant — anti-arbitrage aware.
 *
 * The naive flow (always call resetSubscriptionCredits) has a hole: a user
 * can subscribe on day 1 → use 3 credits → cancel → immediately resubscribe
 * and have their balance RESET to 10/0. That lets them buy 20 credits in one
 * billing period for the price of one month.
 *
 * This function closes the hole:
 *   - If the user already has a live subscription row (credit_source =
 *     'subscription' and expires_at > now), we EXTEND: new total = previous
 *     total + p_credits, used stays the same, expires_at advances to the
 *     new period end. Effectively the resubscribe is an additive top-up.
 *   - Otherwise (no row, expired row, or pack-sourced row), we RESET —
 *     identical to the original behavior.
 *
 * This means resubscribing never wipes the used_credits counter, so a user
 * can't wash away the 3 credits they already spent this month by recycling.
 * Legitimate users pay nothing in penalty: if they never used any of the 10,
 * they still end up with 10 unused after extension.
 */
export async function grantSubscriptionCycle(
  serviceClient: SupabaseClient,
  userId: string,
  credits: number,
  periodStart: Date,
  periodEnd: Date
): Promise<void> {
  const { data: existing } = await serviceClient
    .from("user_credits")
    .select("total_credits, used_credits, credit_source, expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  const now = Date.now();
  const existingExpiresAt = existing?.expires_at
    ? new Date(existing.expires_at).getTime()
    : null;
  const isLiveSubRow =
    !!existing &&
    existing.credit_source === "subscription" &&
    existingExpiresAt !== null &&
    existingExpiresAt > now;

  if (!isLiveSubRow) {
    // First-ever sub, expired sub, or pack-sourced row: reset.
    await resetSubscriptionCredits(
      serviceClient,
      userId,
      credits,
      periodStart,
      periodEnd
    );
    return;
  }

  // Resubscribe inside an active period — ADD, don't reset.
  // We use the add_credits RPC to atomically increment total, then fix the
  // period window via a direct update (safe — single row, single user).
  const { error: addErr } = await serviceClient.rpc("add_credits", {
    p_user_id: userId,
    p_credits: credits,
    p_is_beta: false,
  });
  if (addErr) {
    throw new Error(`add_credits (subscription extend) failed: ${addErr.message}`);
  }

  const { error: updErr } = await serviceClient
    .from("user_credits")
    .update({
      credit_source: "subscription",
      billing_period_start: periodStart.toISOString(),
      expires_at: periodEnd.toISOString(),
    })
    .eq("user_id", userId);
  if (updErr) {
    throw new Error(`user_credits period update failed: ${updErr.message}`);
  }
}

/**
 * Mark subscription credits as expiring at a specific time (used when a
 * subscription is canceled — expires_at = current_period_end, so the user
 * keeps what they have for the rest of the paid period, then it's gone).
 */
export async function markSubscriptionExpires(
  serviceClient: SupabaseClient,
  userId: string,
  expiresAt: Date
): Promise<void> {
  const { error } = await serviceClient.rpc("mark_subscription_expires", {
    p_user_id: userId,
    p_expires_at: expiresAt.toISOString(),
  });
  if (error) {
    throw new Error(`mark_subscription_expires failed: ${error.message}`);
  }
}

/** Monthly subscription grant — the $12.99/mo "Season Member" tier. */
export const SUBSCRIPTION_CREDITS = 10;

export { BETA_CREDITS };
