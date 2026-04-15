import { requireStudioMembership } from "@/lib/studio/auth";
import { createServiceClient } from "@/lib/supabase/server";
import MusicClient from "./MusicClient";

export const dynamic = "force-dynamic";

export default async function StudioMusicPage() {
  const membership = await requireStudioMembership("/studio/music");
  const service = await createServiceClient();

  const { data: tracks } = await service
    .from("studio_music_tracks")
    .select(
      "id, spotify_track_id, track_name, artist_name, duration_ms, tempo_bpm, energy, album_image_url, lyrics_status, age_rating, notes, created_at"
    )
    .eq("studio_id", membership.studioId)
    .order("created_at", { ascending: false });

  return (
    <MusicClient
      studio={membership.studio}
      library={(tracks ?? []).map((t) => ({
        id: t.id,
        spotifyTrackId: t.spotify_track_id,
        trackName: t.track_name,
        artistName: t.artist_name,
        durationMs: t.duration_ms,
        tempoBpm: t.tempo_bpm,
        energy: t.energy,
        albumImageUrl: t.album_image_url,
        lyricsStatus: t.lyrics_status,
        ageRating: t.age_rating,
        notes: t.notes,
        createdAt: t.created_at,
      }))}
    />
  );
}
