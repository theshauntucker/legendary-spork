import { SupabaseClient } from "@supabase/supabase-js";

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
  // Admin bypass
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
  // Don't deduct from admins
  if (isAdmin(userEmail)) return;

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
