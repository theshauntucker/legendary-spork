"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Music,
  Clock,
  Gauge,
  Activity,
  Sparkles,
  Loader2,
  Save,
  Trash2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface Track {
  id: string;
  spotifyTrackId: string;
  trackName: string | null;
  artistName: string | null;
  durationMs: number | null;
  tempoBpm: number | null;
  energy: number | null;
  danceability: number | null;
  albumImageUrl: string | null;
  lyricsStatus: string | null;
  lyricsFlags: Record<string, unknown> | null;
  ageRating: string | null;
  notes: string | null;
  createdAt: string;
}

interface LinkedRoutine {
  id: string;
  routineName: string | null;
  dancerName: string | null;
  style: string | null;
  entryType: string | null;
  ageDivision: string | null;
  season: string;
  status: string;
  createdAt: string;
}

function formatDuration(ms: number | null): string {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function TrackDetailClient({
  track,
  linkedRoutines,
}: {
  track: Track;
  linkedRoutines: LinkedRoutine[];
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(track.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const dirty = (notes.trim() || null) !== (track.notes ?? null);

  const saveNotes = async () => {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/studio/music/${track.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notes.trim() }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error: apiErr } = await res.json().catch(() => ({ error: "Save failed" }));
      setError(apiErr || "Save failed");
      return;
    }
    setSavedAt(Date.now());
    router.refresh();
  };

  const removeTrack = async () => {
    if (!confirm("Remove this track from your studio library?")) return;
    setDeleting(true);
    const res = await fetch(`/api/studio/music/${track.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/studio/music");
      router.refresh();
    } else {
      setDeleting(false);
      setError("Delete failed");
    }
  };

  const spotifyUrl = `https://open.spotify.com/track/${track.spotifyTrackId}`;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-5">
          <a href="/studio/music" className="text-sm text-accent-300 hover:underline">
            ← Back to Music Hub
          </a>
        </div>

        {/* Header card */}
        <div className="glass rounded-3xl p-5 sm:p-6 mb-6 flex gap-5">
          {track.albumImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.albumImageUrl}
              alt=""
              className="h-28 w-28 sm:h-36 sm:w-36 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-xl bg-surface-900 flex-shrink-0 flex items-center justify-center">
              <Music className="h-8 w-8 text-surface-200" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-accent-400 mb-1 inline-flex items-center gap-1.5">
              <Music className="h-3 w-3" />
              Music Hub
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)] leading-tight">
              {track.trackName || "Untitled"}
            </h1>
            <p className="mt-1 text-sm text-surface-200">
              {track.artistName || "Unknown artist"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {track.tempoBpm !== null && (
                <Chip icon={<Gauge className="h-3 w-3" />} label={`${track.tempoBpm} bpm`} />
              )}
              {track.energy !== null && (
                <Chip icon={<Activity className="h-3 w-3" />} label={`energy ${Math.round(track.energy * 100)}`} />
              )}
              {track.danceability !== null && (
                <Chip
                  icon={<Sparkles className="h-3 w-3" />}
                  label={`danceability ${Math.round(track.danceability * 100)}`}
                />
              )}
              <Chip icon={<Clock className="h-3 w-3" />} label={formatDuration(track.durationMs)} />
            </div>
            <div className="mt-3">
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-surface-200 hover:text-white transition-colors"
              >
                Open in Spotify
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Lyrics check — Phase E */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-gold-300 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h2 className="font-semibold">Lyric safety check</h2>
              <p className="text-sm text-surface-200 mt-1">
                Automatic lyric screening and age-division recommendations ship
                in the next Music Hub release. For now, verify manually for
                profanity, sexual content, and age-appropriateness.
              </p>
              {track.lyricsStatus && track.lyricsStatus !== "unchecked" && (
                <p className="text-xs text-surface-200/80 mt-2">
                  Current status: <strong>{track.lyricsStatus}</strong>
                  {track.ageRating ? ` · ${track.ageRating}` : ""}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Collision check — Phase F */}
        <div className="glass rounded-2xl p-5 mb-6">
          <h2 className="font-semibold mb-1">Collision detection</h2>
          <p className="text-sm text-surface-200">
            Cross-studio collision alerts — green/yellow/red — arrive once
            routine linking ships. Until then, treat the library as a private
            shortlist for your team.
          </p>
        </div>

        {/* Notes */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Notes</h2>
            {dirty && (
              <span className="text-xs text-surface-200 italic">Unsaved changes</span>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Costume color ideas, choreo references, alternates if this song gets flagged for collision…"
            rows={4}
            maxLength={2000}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-accent-500 transition-colors resize-y"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-surface-200">{notes.length} / 2000</span>
            <div className="flex items-center gap-3">
              {savedAt && Date.now() - savedAt < 3000 && (
                <span className="text-xs text-green-400">Saved</span>
              )}
              <button
                onClick={saveNotes}
                disabled={!dirty || saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-white px-4 py-2 text-sm font-semibold transition-colors"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save notes
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>

        {/* Linked routines */}
        <div className="glass rounded-2xl p-5 mb-6">
          <h2 className="font-semibold mb-3">
            Linked routines ({linkedRoutines.length})
          </h2>
          {linkedRoutines.length === 0 ? (
            <p className="text-sm text-surface-200">
              No routines linked yet. The link-to-routine flow arrives with
              collision detection.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {linkedRoutines.map((r) => (
                <li key={r.id} className="py-3">
                  <p className="text-sm font-medium">
                    {r.routineName || "Untitled routine"}
                    {r.dancerName && (
                      <span className="text-surface-200"> · {r.dancerName}</span>
                    )}
                  </p>
                  <p className="text-xs text-surface-200 mt-0.5">
                    {[r.style, r.entryType, r.ageDivision].filter(Boolean).join(" · ")}
                    {" · "}
                    <span className="capitalize">{r.status.replace("_", " ")}</span>
                    {" · "}
                    {r.season}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Danger zone */}
        <div className="glass rounded-2xl p-5 border border-red-500/20">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-semibold text-red-300">Remove from library</h2>
              <p className="text-xs text-surface-200 mt-0.5">
                Removes this track and any routine links to it. Can&apos;t be undone.
              </p>
            </div>
            <button
              onClick={removeTrack}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 text-surface-200 px-2.5 py-1 text-xs font-medium">
      {icon}
      {label}
    </span>
  );
}
