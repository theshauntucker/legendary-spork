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

  // Schedule activity: Phase G added studio_competitions; checklist now
  // auto-completes as soon as the owner adds one competition row.
  const { count: scheduleRowCount } = await service
    .from("studio_competitions")
    .select("id", { count: "exact", head: true })
    .eq("studio_id", membership.studioId);

  // Roster snapshot — count + top-performing preview for the My Roster strip
  const { count: rosterCount } = await service
    .from("studio_dancers")
    .select("id", { count: "exact", head: true })
    .eq("studio_id", membership.studioId)
    .eq("is_active", true);

  let rosterPreview: Array<{
    id: string;
    name: string;
    nickname: string | null;
    routineCount: number;
    bestScore: number | null;
  }> = [];
  if ((rosterCount ?? 0) > 0) {
    const { data: rosterRows } = await service
      .from("studio_dancers")
      .select("id, name, nickname")
      .eq("studio_id", membership.studioId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(24);

    const ids = (rosterRows ?? []).map((r) => r.id);
    const statsByDancer: Record<string, { routineCount: number; bestScore: number | null }> = {};
    if (ids.length > 0) {
      const { data: vids } = await service
        .from("videos")
        .select("studio_dancer_id, analyses(total_score)")
        .in("studio_dancer_id", ids)
        .eq("status", "analyzed");
      for (const v of vids ?? []) {
        if (!v.studio_dancer_id) continue;
        const aArr = Array.isArray(v.analyses) ? v.analyses : v.analyses ? [v.analyses] : [];
        const score: number | null = aArr[0]?.total_score ?? null;
        const bucket = statsByDancer[v.studio_dancer_id] ?? { routineCount: 0, bestScore: null };
        bucket.routineCount += 1;
        if (score != null && (bucket.bestScore == null || score > bucket.bestScore)) {
          bucket.bestScore = score;
        }
        statsByDancer[v.studio_dancer_id] = bucket;
      }
    }

    rosterPreview = (rosterRows ?? [])
      .map((r) => ({
        id: r.id,
        name: r.name,
        nickname: r.nickname,
        routineCount: statsByDancer[r.id]?.routineCount ?? 0,
        bestScore: statsByDancer[r.id]?.bestScore ?? null,
      }))
      // Surface dancers who've actually been analyzed first, then by best score
      .sort((a, b) => {
        if ((b.routineCount > 0 ? 1 : 0) !== (a.routineCount > 0 ? 1 : 0)) {
          return (b.routineCount > 0 ? 1 : 0) - (a.routineCount > 0 ? 1 : 0);
        }
        return (b.bestScore ?? -1) - (a.bestScore ?? -1);
      })
      .slice(0, 8);
  }

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
        buildRoster: (rosterCount ?? 0) > 0,
      }}
      roster={{
        count: rosterCount ?? 0,
        preview: rosterPreview,
      }}
    />
  );
}
