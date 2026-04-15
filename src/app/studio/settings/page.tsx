import { requireStudioMembership } from "@/lib/studio/auth";
import { createServiceClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function StudioSettingsPage() {
  const membership = await requireStudioMembership("/studio/settings", "owner");

  // Pull current subscription/pool snapshot for display
  const service = await createServiceClient();
  const { data: pool } = await service
    .from("studio_credits")
    .select("total_credits, used_credits, subscription_status, trial_ends_at, stripe_subscription_id")
    .eq("studio_id", membership.studioId)
    .maybeSingle();

  return (
    <SettingsClient
      studio={membership.studio}
      pool={
        pool
          ? {
              totalCredits: pool.total_credits,
              usedCredits: pool.used_credits,
              subscriptionStatus: pool.subscription_status,
              trialEndsAt: pool.trial_ends_at,
              hasStripeSubscription: !!pool.stripe_subscription_id,
            }
          : null
      }
    />
  );
}
