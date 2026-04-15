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

  return {
    hasCredits: remaining > 0,
    remaining,
    isBetaMember: credits.is_beta_member,
    isAdmin: false,
    totalCredits: credits.total_credits,
    usedCredits: credits.used_credits,
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

export { BETA_CREDITS };
