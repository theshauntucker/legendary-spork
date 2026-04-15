import { notFound } from "next/navigation";
import { requireStudioMembership } from "@/lib/studio/auth";
import { createServiceClient } from "@/lib/supabase/server";
import CompetitionDetailClient from "./CompetitionDetailClient";

export const dynamic = "force-dynamic";

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ competitionId: string }>;
}) {
  const { competitionId } = await params;
  const membership = await requireStudioMembership(`/studio/schedule/${competitionId}`);
  const service = await createServiceClient();

  const { data: competition } = await service
    .from("studio_competitions")
    .select("id, name, competition_date, location, notes, created_at")
    .eq("id", competitionId)
    .eq("studio_id", membership.studioId)
    .maybeSingle();
  if (!competition) notFound();

  // All studio routines (with track info) so we can show "Add entry" selector.
  const { data: routines } = await service
    .from("studio_routine_music")
    .select(
      "id, routine_name, dancer_name, style, entry_type, age_division, status, season, music_track_id, studio_music_tracks(track_name, artist_name, album_image_url)"
    )
    .eq("studio_id", membership.studioId)
    .order("created_at", { ascending: false });

  const { data: entries } = await service
    .from("studio_competition_entries")
    .select("id, routine_music_id, created_at")
    .eq("competition_id", competitionId);

  const entryRoutineIds = new Set((entries ?? []).map((e) => e.routine_music_id as string));

  type RoutineRow = {
    id: string;
    routine_name: string | null;
    dancer_name: string | null;
    style: string | null;
    entry_type: string | null;
    age_division: string | null;
    status: string;
    season: string;
    music_track_id: string;
    studio_music_tracks?:
      | { track_name: string | null; artist_name: string | null; album_image_url: string | null }
      | { track_name: string | null; artist_name: string | null; album_image_url: string | null }[]
      | null;
  };

  const routineList = ((routines ?? []) as RoutineRow[]).map((r) => {
    const track = Array.isArray(r.studio_music_tracks)
      ? r.studio_music_tracks[0]
      : r.studio_music_tracks;
    return {
      id: r.id,
      routineName: r.routine_name,
      dancerName: r.dancer_name,
      style: r.style,
      entryType: r.entry_type,
      ageDivision: r.age_division,
      status: r.status,
      season: r.season,
      musicTrackId: r.music_track_id,
      trackName: track?.track_name ?? null,
      artistName: track?.artist_name ?? null,
      albumImageUrl: track?.album_image_url ?? null,
    };
  });

  const attachedRoutines = routineList.filter((r) => entryRoutineIds.has(r.id));
  const availableRoutines = routineList.filter((r) => !entryRoutineIds.has(r.id));

  return (
    <CompetitionDetailClient
      competition={{
        id: competition.id,
        name: competition.name,
        competitionDate: competition.competition_date,
        location: competition.location,
        notes: competition.notes,
      }}
      attachedRoutines={attachedRoutines}
      availableRoutines={availableRoutines}
    />
  );
}
