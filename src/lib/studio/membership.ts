import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Minimal helper used by credits.ts to decide whether a user's analysis
 * should be paid from a studio pool or from their personal credit balance.
 *
 * Returns the user's active studio (if any) along with the current pool
 * snapshot. Called on the hot path — must be fast and never throw on a
 * missing row (brand-new B2C users have no studio membership, which is the
 * overwhelmingly common case).
 */

export interface StudioContext {
  studioId: string;
  role: string;
  totalCredits: number;
  usedCredits: number;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
}

export async function getStudioForUser(
  serviceClient: SupabaseClient,
  userId: string
): Promise<StudioContext | null> {
  // 1. Find membership (expected zero rows for non-studio users)
  const { data: member } = await serviceClient
    .from("studio_members")
    .select("studio_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!member) return null;

  // 2. Load the studio's shared credit pool
  const { data: pool } = await serviceClient
    .from("studio_credits")
    .select(
      "total_credits, used_credits, subscription_status, trial_ends_at"
    )
    .eq("studio_id", member.studio_id)
    .maybeSingle();

  // Studio exists but pool row missing (shouldn't happen after signup webhook
  // runs, but be defensive). Treat as a studio with zero credits so the
  // caller falls through to personal credits.
  if (!pool) {
    return {
      studioId: member.studio_id,
      role: member.role,
      totalCredits: 0,
      usedCredits: 0,
      subscriptionStatus: null,
      trialEndsAt: null,
    };
  }

  return {
    studioId: member.studio_id,
    role: member.role,
    totalCredits: pool.total_credits,
    usedCredits: pool.used_credits,
    subscriptionStatus: pool.subscription_status,
    trialEndsAt: pool.trial_ends_at,
  };
}
