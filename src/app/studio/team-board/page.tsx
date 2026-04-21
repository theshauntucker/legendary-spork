import { requireStudioMembership } from "@/lib/studio/auth";
import { createServiceClient } from "@/lib/supabase/server";
import TeamBoardClient from "./TeamBoardClient";

export const dynamic = "force-dynamic";

export default async function TeamBoardPage() {
  const membership = await requireStudioMembership("/studio/team-board");
  const service = await createServiceClient();

  // Fetch all dancers in the studio
  const { data: dancers } = await service
    .from("studio_dancers")
    .select("id, name")
    .eq("studio_id", membership.studioId)
    .eq("is_active", true);

  const dancerIds = (dancers ?? []).map((d) => d.id);

  // If no dancers, return empty state
  if (!dancerIds.length) {
    return (
      <TeamBoardClient
        studio={membership.studio}
        role={membership.role}
        routines={[]}
      />
    );
  }

  // Fetch all routines for these dancers with their latest score
  const { data: videos } = await service
    .from("videos")
    .select(
      "id, routine_name, style, entry_type, studio_dancer_id, created_at, status, analyses(id, total_score, award_level)"
    )
    .in("studio_dancer_id", dancerIds)
    .order("created_at", { ascending: false });

  // Enrich with dancer names and build routine objects
  const dancerNameMap = Object.fromEntries(
    (dancers ?? []).map((d) => [d.id, d.name])
  );

  const routines = (videos ?? [])
    .map((v) => {
      const aArr = Array.isArray(v.analyses)
        ? v.analyses
        : v.analyses
        ? [v.analyses]
        : [];
      const analysis = aArr[0];

      return {
        id: v.id,
        routineName: (v.routine_name as string) ?? "Untitled",
        style: (v.style as string) ?? null,
        entryType: (v.entry_type as string) ?? null,
        dancerId: v.studio_dancer_id,
        dancerName: dancerNameMap[v.studio_dancer_id] ?? "Unknown",
        createdAt: v.created_at,
        status: v.status,
        totalScore: (analysis?.total_score as number) ?? null,
        awardLevel: (analysis?.award_level as string) ?? null,
        analysisId: (analysis?.id as string) ?? null,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <TeamBoardClient
      studio={membership.studio}
      role={membership.role}
      routines={routines}
    />
  );
}
