import { requireStudioMembership } from "@/lib/studio/auth";
import { createServiceClient } from "@/lib/supabase/server";
import StudioDashboardClient from "./StudioDashboardClient";

export const dynamic = "force-dynamic";

export default async function StudioDashboardPage() {
  const membership = await requireStudioMembership("/studio/dashboard");
  const service = await createServiceClient();

  // Pool snapshot
  const { data: pool } = await service
    .from("studio_credits")
    .select("total_credits, used_credits, subscription_status, trial_ends_at")
    .eq("studio_id", membership.studioId)
    .maybeSingle();

  // Member count
  const { count: memberCount } = await service
    .from("studio_members")
    .select("id", { count: "exact", head: true })
    .eq("studio_id", membership.studioId);

  // Pending invites count
  const { count: pendingInviteCount } = await service
    .from("studio_invites")
    .select("id", { count: "exact", head: true })
    .eq("studio_id", membership.studioId)
    .eq("status", "pending");

  // Analysis activity: count how many times the pool has been drained
  const { count: analysisCount } = await service
    .from("studio_analysis_links")
    .select("id", { count: "exact", head: true })
    .eq("studio_id", membership.studioId);

  // Music-hub activity (Phase D will populate this table)
  const { count: musicTrackCount } = await service
    .from("studio_music_tracks")
    .select("id", { count: "exact", head: true })
    .eq("studio_id", membership.studioId);

  // Schedule activity (Phase G will populate schedule-related rows via
  // studio_routine_music.competition_names; fall back to counting any row)
  const { count: scheduleRowCount } = await service
    .from("studio_routine_music")
    .select("id", { count: "exact", head: true })
    .eq("studio_id", membership.studioId);

  const remaining = pool ? Math.max(0, pool.total_credits - pool.used_credits) : 0;
  const subscriptionStatus = pool?.subscription_status ?? null;

  // Dashboard banner: show when Stripe hasn't confirmed the trial yet.
  // Per spec: "missing, null, or 'pending'" all trigger the banner.
  const needsSubscriptionSetup =
    !pool || !subscriptionStatus || subscriptionStatus === "pending";

  return (
    <StudioDashboardClient
      studio={membership.studio}
      role={membership.role}
      pool={
        pool
          ? {
              total: pool.total_credits,
              used: pool.used_credits,
              remaining,
              status: subscriptionStatus,
              trialEndsAt: pool.trial_ends_at,
            }
          : null
      }
      needsSubscriptionSetup={needsSubscriptionSetup}
      checklist={{
        inviteTeam: (memberCount ?? 0) > 1 || (pendingInviteCount ?? 0) > 0,
        loadSchedule: (scheduleRowCount ?? 0) > 0,
        searchMusic: (musicTrackCount ?? 0) > 0,
        uploadRoutine: (analysisCount ?? 0) > 0,
      }}
    />
  );
}
