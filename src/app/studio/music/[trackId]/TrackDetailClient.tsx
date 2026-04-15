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
  CheckCircle2,
  ShieldAlert,
  ExternalLink,
  Plus,
  Check,
  Wand2,
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

interface LyricFlags {
  profanity?: boolean;
  sexual_content?: boolean;
  drug_references?: boolean;
  violence?: boolean;
  religious_conflict?: boolean;
}

interface SimilarTrack {
  spotifyTrackId: string;
  name: string;
  artists: string[];
  albumImageUrl: string | null;
  durationMs: number;
  explicit: boolean;
  tempoBpm: number | null;
  energy: number | null;
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

  // ─── Lyric-check state ─────────────────────────────────────────────
  const [lyricsStatus, setLyricsStatus] = useState<string | null>(track.lyricsStatus);
  const [lyricsFlags, setLyricsFlags] = useState<LyricFlags | null>(
    (track.lyricsFlags as LyricFlags | null) ?? null
  );
  const [ageRating, setAgeRating] = useState<string | null>(track.ageRating);
  const [lyricsNote, setLyricsNote] = useState<string>("");
  const [lyricsConfidence, setLyricsConfidence] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // ─── Similar-songs state ───────────────────────────────────────────
  const [similar, setSimilar] = useState<SimilarTrack[] | null>(null);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState("");
  const [savedSpotifyIds, setSavedSpotifyIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  // Filters for similar-songs query
  const [filterMinBpm, setFilterMinBpm] = useState<string>("");
  const [filterMaxBpm, setFilterMaxBpm] = useState<string>("");
  const [filterEnergy, setFilterEnergy] = useState<string>("");

  const dirty = (notes.trim() || null) !== (track.notes ?? null);
  const isChecked = lyricsStatus && lyricsStatus !== "unchecked";

  const checkLyrics = async () => {
    setChecking(true);
    setError("");
    const res = await fetch("/api/studio/music/check-lyrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: track.id }),
    });
    setChecking(false);
    if (!res.ok) {
      const { error: apiErr } = await res.json().catch(() => ({ error: "Check failed" }));
      setError(apiErr || "Check failed");
      return;
    }
    const data = await res.json();
    setLyricsStatus(data.lyrics_status ?? null);
    setLyricsFlags((data.lyrics_flags as LyricFlags | null) ?? null);
    setAgeRating(data.age_rating ?? null);
    setLyricsConfidence(data.confidence ?? null);
    setLyricsNote(data.notes ?? "");
    router.refresh();
  };

  const loadSimilar = async () => {
    setSimilarLoading(true);
    setSimilarError("");
    const params = new URLSearchParams({ trackId: track.id, limit: "20" });
    if (filterMinBpm.trim()) params.set("minBpm", filterMinBpm.trim());
    if (filterMaxBpm.trim()) params.set("maxBpm", filterMaxBpm.trim());
    if (filterEnergy.trim()) params.set("targetEnergy", filterEnergy.trim());
    const res = await fetch(`/api/studio/music/similar?${params.toString()}`);
    setSimilarLoading(false);
    if (!res.ok) {
      const { error: apiErr } = await res.json().catch(() => ({ error: "Similar failed" }));
      setSimilarError(apiErr || "Similar failed");
      setSimilar([]);
      return;
    }
    const data = (await res.json()) as { results: SimilarTrack[] };
    setSimilar(data.results);
  };

  const saveSimilar = async (spotifyTrackId: string) => {
    setSavingId(spotifyTrackId);
    const res = await fetch("/api/studio/music/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotifyTrackId }),
    });
    setSavingId(null);
    if (res.ok) {
      setSavedSpotifyIds((prev) => new Set(prev).add(spotifyTrackId));
    }
  };

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

        {/* Lyric safety check */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-gold-300" />
              Lyric safety check
            </h2>
            {!isChecked ? (
              <button
                onClick={checkLyrics}
                disabled={checking}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-surface-950 px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {checking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Check lyrics
                  </>
                )}
              </button>
            ) : (
              <AgeRatingBadge rating={ageRating} />
            )}
          </div>

          {!isChecked && (
            <p className="text-sm text-surface-200">
              We&apos;ll run this song through Claude to flag profanity, sexual
              content, drug references, violence, and religious conflict —
              plus suggest safe age divisions. One click.
            </p>
          )}

          {isChecked && lyricsStatus === "unavailable" && (
            <div className="flex items-start gap-2 text-sm text-surface-200">
              <AlertCircle className="h-4 w-4 text-gold-300 flex-shrink-0 mt-0.5" />
              <p>
                Unable to verify lyrics automatically.{" "}
                {lyricsNote || "Please review manually before competition."}
              </p>
            </div>
          )}

          {isChecked && lyricsStatus !== "unavailable" && (
            <div className="space-y-3">
              {lyricsFlags && (
                <ul className="flex flex-wrap gap-1.5">
                  <FlagPill label="Profanity" on={!!lyricsFlags.profanity} />
                  <FlagPill label="Sexual" on={!!lyricsFlags.sexual_content} />
                  <FlagPill label="Drugs" on={!!lyricsFlags.drug_references} />
                  <FlagPill label="Violence" on={!!lyricsFlags.violence} />
                  <FlagPill label="Religious" on={!!lyricsFlags.religious_conflict} />
                </ul>
              )}
              {lyricsNote && (
                <p className="text-sm text-surface-200">{lyricsNote}</p>
              )}
              {lyricsConfidence && lyricsConfidence !== "high" && (
                <p className="text-xs text-surface-200 italic">
                  Confidence: <strong>{lyricsConfidence}</strong> — double-check
                  if the song matters.
                </p>
              )}
            </div>
          )}
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

        {/* Similar songs */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-accent-300" />
                Find me something like this
              </h2>
              <p className="text-xs text-surface-200 mt-1">
                Seeded from this track&apos;s audio features. Tune the filters
                to narrow the mood.
              </p>
            </div>
            <button
              onClick={loadSimilar}
              disabled={similarLoading}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-white px-4 py-2 text-sm font-semibold transition-colors"
            >
              {similarLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Suggest songs</>
              )}
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs text-surface-200 mb-1">Min BPM</label>
              <input
                type="number"
                value={filterMinBpm}
                onChange={(e) => setFilterMinBpm(e.target.value)}
                placeholder={track.tempoBpm ? String(Math.max(60, Math.round(track.tempoBpm - 15))) : "60"}
                min={40}
                max={220}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs text-surface-200 mb-1">Max BPM</label>
              <input
                type="number"
                value={filterMaxBpm}
                onChange={(e) => setFilterMaxBpm(e.target.value)}
                placeholder={track.tempoBpm ? String(Math.round(track.tempoBpm + 15)) : "150"}
                min={40}
                max={220}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs text-surface-200 mb-1">
                Target energy (0 – 1)
              </label>
              <input
                type="number"
                value={filterEnergy}
                onChange={(e) => setFilterEnergy(e.target.value)}
                placeholder={track.energy !== null ? String(track.energy) : "0.65"}
                step={0.05}
                min={0}
                max={1}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
              />
            </div>
          </div>

          {similarError && <p className="text-sm text-red-400 mb-3">{similarError}</p>}

          {similar && similar.length === 0 && !similarLoading && (
            <p className="text-sm text-surface-200 text-center py-4">
              No suggestions matched those filters.
            </p>
          )}

          {similar && similar.length > 0 && (
            <ul className="space-y-2">
              {similar.map((s) => {
                const saved = savedSpotifyIds.has(s.spotifyTrackId);
                return (
                  <li
                    key={s.spotifyTrackId}
                    className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3"
                  >
                    {s.albumImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.albumImageUrl}
                        alt=""
                        className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-surface-900 flex-shrink-0 flex items-center justify-center">
                        <Music className="h-4 w-4 text-surface-200" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {s.name}
                        {s.explicit && (
                          <span className="ml-2 text-[10px] font-bold bg-white/10 text-surface-200 px-1.5 py-0.5 rounded">
                            E
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-surface-200 truncate">
                        {s.artists.join(", ")}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {s.tempoBpm !== null && (
                          <Chip icon={<Gauge className="h-3 w-3" />} label={`${s.tempoBpm} bpm`} />
                        )}
                        {s.energy !== null && (
                          <Chip
                            icon={<Activity className="h-3 w-3" />}
                            label={`energy ${Math.round(s.energy * 100)}`}
                          />
                        )}
                        <Chip icon={<Clock className="h-3 w-3" />} label={formatDuration(s.durationMs)} />
                      </div>
                    </div>
                    <button
                      onClick={() => saveSimilar(s.spotifyTrackId)}
                      disabled={saved || savingId === s.spotifyTrackId}
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        saved
                          ? "bg-green-500/20 text-green-300 cursor-default"
                          : savingId === s.spotifyTrackId
                          ? "bg-white/10 text-surface-200"
                          : "bg-accent-500 hover:bg-accent-400 text-white"
                      }`}
                    >
                      {saved ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Saved
                        </>
                      ) : savingId === s.spotifyTrackId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" /> Add
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
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

function FlagPill({ label, on }: { label: string; on: boolean }) {
  if (on) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 px-2.5 py-0.5 text-xs font-medium">
        <AlertCircle className="h-3 w-3" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-300/80 border border-green-500/20 px-2.5 py-0.5 text-xs font-medium">
      <CheckCircle2 className="h-3 w-3" />
      {label}
    </span>
  );
}

function AgeRatingBadge({ rating }: { rating: string | null }) {
  const map: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    all_ages: {
      label: "All Ages",
      className: "bg-green-500/15 text-green-300 border-green-500/40",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    teen_plus: {
      label: "Teen+",
      className: "bg-yellow-500/15 text-yellow-200 border-yellow-500/40",
      icon: <ShieldAlert className="h-3.5 w-3.5" />,
    },
    senior_only: {
      label: "Senior Only",
      className: "bg-orange-500/15 text-orange-200 border-orange-500/40",
      icon: <ShieldAlert className="h-3.5 w-3.5" />,
    },
    flagged: {
      label: "Flagged",
      className: "bg-red-500/15 text-red-300 border-red-500/40",
      icon: <AlertCircle className="h-3.5 w-3.5" />,
    },
  };
  if (!rating || !map[rating]) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 text-surface-200 border border-white/10 px-3 py-1 text-xs font-semibold">
        Unrated
      </span>
    );
  }
  const cfg = map[rating];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
