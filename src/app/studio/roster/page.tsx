import { requireStudioMembership } from "@/lib/studio/auth";
import { createServiceClient } from "@/lib/supabase/server";
import RosterClient from "./RosterClient";

export const dynamic = "force-dynamic";

export default async function StudioRosterPage() {
  const membership = await requireStudioMembership("/studio/roster");
  const service = await createServiceClient();

  // Pull active roster + routine counts per dancer in two queries
  const { data: dancers } = await service
    .from("studio_dancers")
    .select(
      "id, name, nickname, date_of_birth, age_group, level, primary_style, notes, is_active, archived_at, created_at",
    )
    .eq("studio_id", membership.studioId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  const dancerIds = (dancers ?? []).map((d) => d.id);

  let videosByDancer: Record<
    string,
    { routineCount: number; bestScore: number | null; latestScore: number | null }
  > = {};
  if (dancerIds.length > 0) {
    const { data: vids } = await service
      .from("videos")
      .select("id, studio_dancer_id, created_at, analyses(total_score)")
      .in("studio_dancer_id", dancerIds)
      .eq("status", "analyzed")
      .order("created_at", { ascending: false });

    for (const v of vids ?? []) {
      if (!v.studio_dancer_id) continue;
      const aArr = Array.isArray(v.analyses) ? v.analyses : v.analyses ? [v.analyses] : [];
      const score: number | null = aArr[0]?.total_score ?? null;
      const bucket = videosByDancer[v.studio_dancer_id] ?? {
        routineCount: 0,
        bestScore: null,
        latestScore: null,
      };
      bucket.routineCount += 1;
      if (bucket.latestScore === null && score != null) bucket.latestScore = score;
      if (score != null && (bucket.bestScore == null || score > bucket.bestScore)) {
        bucket.bestScore = score;
      }
      videosByDancer[v.studio_dancer_id] = bucket;
    }
  }

  const roster = (dancers ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    nickname: d.nickname,
    dateOfBirth: d.date_of_birth,
    ageGroup: d.age_group,
    level: d.level,
    primaryStyle: d.primary_style,
    notes: d.notes,
    createdAt: d.created_at,
    routineCount: videosByDancer[d.id]?.routineCount ?? 0,
    bestScore: videosByDancer[d.id]?.bestScore ?? null,
    latestScore: videosByDancer[d.id]?.latestScore ?? null,
  }));

  return (
    <RosterClient
      studio={membership.studio}
      role={membership.role}
      initialRoster={roster}
    />
  );
}
