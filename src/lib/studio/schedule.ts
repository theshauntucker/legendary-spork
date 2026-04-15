import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Rebuild studio_routine_music.competition_names[] for one routine row.
 *
 * Called whenever the set of studio_competition_entries that references
 * this routine_music_id changes (insert / delete / edit of owning
 * competition's name). The column is intentionally denormalized so
 * the collision RPC and the music-library UI can read a simple text[]
 * without a JOIN.
 */
export async function rebuildCompetitionNames(
  service: SupabaseClient,
  routineMusicId: string
): Promise<void> {
  const { data } = await service
    .from("studio_competition_entries")
    .select("studio_competitions(name)")
    .eq("routine_music_id", routineMusicId);

  const names = (data ?? [])
    .map((row) => {
      const c = (row as unknown as { studio_competitions?: { name?: string } })
        .studio_competitions;
      return c?.name ?? null;
    })
    .filter((n): n is string => typeof n === "string" && n.length > 0);

  await service
    .from("studio_routine_music")
    .update({ competition_names: names.length > 0 ? names : null })
    .eq("id", routineMusicId);
}

/**
 * Rebuild competition_names[] across every routine currently linked to a
 * given competition. Used when the competition's name changes.
 */
export async function rebuildForCompetition(
  service: SupabaseClient,
  competitionId: string
): Promise<void> {
  const { data: entries } = await service
    .from("studio_competition_entries")
    .select("routine_music_id")
    .eq("competition_id", competitionId);
  const ids = (entries ?? []).map((e) => e.routine_music_id as string);
  for (const id of ids) {
    await rebuildCompetitionNames(service, id);
  }
}
