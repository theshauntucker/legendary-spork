import { notFound } from "next/navigation";
import { requireStudioMembership } from "@/lib/studio/auth";
import { createServiceClient } from "@/lib/supabase/server";
import TrackDetailClient from "./TrackDetailClient";

export const dynamic = "force-dynamic";

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const membership = await requireStudioMembership(`/studio/music/${trackId}`);
  const service = await createServiceClient();

  const { data: track } = await service
    .from("studio_music_tracks")
    .select("*")
    .eq("id", trackId)
    .eq("studio_id", membership.studioId)
    .maybeSingle();

  if (!track) notFound();

  // Routines linked to this track (Phase F will populate via the
  // link-routine endpoint; for now may be empty).
  const { data: linkedRoutines } = await service
    .from("studio_routine_music")
    .select("id, routine_name, dancer_name, style, entry_type, age_division, season, status, created_at")
    .eq("studio_id", membership.studioId)
    .eq("music_track_id", trackId)
    .order("created_at", { ascending: false });

  return (
    <TrackDetailClient
      track={{
        id: track.id,
        spotifyTrackId: track.spotify_track_id,
        trackName: track.track_name,
        artistName: track.artist_name,
        durationMs: track.duration_ms,
        tempoBpm: track.tempo_bpm,
        energy: track.energy,
        danceability: track.danceability,
        albumImageUrl: track.album_image_url,
        lyricsStatus: track.lyrics_status,
        lyricsFlags: track.lyrics_flags,
        ageRating: track.age_rating,
        notes: track.notes,
        createdAt: track.created_at,
      }}
      linkedRoutines={(linkedRoutines ?? []).map((r) => ({
        id: r.id,
        routineName: r.routine_name,
        dancerName: r.dancer_name,
        style: r.style,
        entryType: r.entry_type,
        ageDivision: r.age_division,
        season: r.season,
        status: r.status,
        createdAt: r.created_at,
      }))}
    />
  );
}
