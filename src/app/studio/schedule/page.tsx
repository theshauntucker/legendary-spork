import { requireStudioMembership } from "@/lib/studio/auth";
import { createServiceClient } from "@/lib/supabase/server";
import ScheduleListClient from "./ScheduleListClient";

export const dynamic = "force-dynamic";

export default async function StudioSchedulePage() {
  const membership = await requireStudioMembership("/studio/schedule");
  const service = await createServiceClient();

  const { data: competitions } = await service
    .from("studio_competitions")
    .select("id, name, competition_date, location, notes, created_at")
    .eq("studio_id", membership.studioId)
    .order("competition_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  // Entry counts per competition in one query, then group.
  const competitionIds = (competitions ?? []).map((c) => c.id);
  const countsByCompetition: Record<string, number> = {};
  if (competitionIds.length > 0) {
    const { data: entries } = await service
      .from("studio_competition_entries")
      .select("competition_id")
      .in("competition_id", competitionIds);
    for (const e of entries ?? []) {
      const id = e.competition_id as string;
      countsByCompetition[id] = (countsByCompetition[id] ?? 0) + 1;
    }
  }

  return (
    <ScheduleListClient
      studio={membership.studio}
      competitions={(competitions ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        competitionDate: c.competition_date,
        location: c.location,
        notes: c.notes,
        createdAt: c.created_at,
        entryCount: countsByCompetition[c.id] ?? 0,
      }))}
    />
  );
}
