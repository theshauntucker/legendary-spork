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
 */
export async function grantCredits(
  serviceClient: SupabaseClient,
  userId: string,
  credits: number,
  isBetaPurchase: boolean
): Promise<void> {
  const { data: existing } = await serviceClient
    .from("user_credits")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    // Add credits to existing record
    await serviceClient.rpc("add_credits", {
      p_user_id: userId,
      p_credits: credits,
      p_is_beta: isBetaPurchase,
    });
  } else {
    // Create new record
    await serviceClient.from("user_credits").insert({
      user_id: userId,
      total_credits: credits,
      used_credits: 0,
      is_beta_member: isBetaPurchase,
    });
  }
}

export { BETA_CREDITS };
