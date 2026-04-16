"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Music,
  Loader2,
  Plus,
  Check,
  ArrowRight,
  Clock,
  Activity,
  Gauge,
  Play,
  Pause,
  VolumeX,
} from "lucide-react";

interface Studio {
  id: string;
  name: string;
}

interface LibraryTrack {
  id: string;
  spotifyTrackId: string;
  trackName: string | null;
  artistName: string | null;
  durationMs: number | null;
  tempoBpm: number | null;
  energy: number | null;
  albumImageUrl: string | null;
  lyricsStatus: string | null;
  ageRating: string | null;
  notes: string | null;
  createdAt: string;
}

interface SearchResult {
  spotifyTrackId: string;
  name: string;
  artists: string[];
  albumName: string;
  albumImageUrl: string | null;
  durationMs: number;
  explicit: boolean;
  previewUrl: string | null;
  tempoBpm: number | null;
  energy: number | null;
  danceability: number | null;
}

function formatDuration(ms: number | null): string {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function MusicClient({
  studio,
  library,
}: {
  studio: Studio;
  library: LibraryTrack[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(library.map((t) => t.spotifyTrackId))
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  // ── Preview playback state ──
  // Which track's 30-second preview is currently playing (or null).
  const [playingId, setPlayingId] = useState<string | null>(null);
  // Track id whose audio we've already tried and is missing a preview_url.
  // We use this to briefly flash a "no preview available" hint next to
  // the track's play button.
  const [noPreviewId, setNoPreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop any in-flight playback on unmount or when navigating away.
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Also stop whatever is playing when the user starts a new search —
  // feels weird to have a track from the previous query keep going.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
  }, [query]);

  const togglePreview = (trackId: string, previewUrl: string | null) => {
    // No preview from Spotify — let the user know (e.g. some labels strip it).
    if (!previewUrl) {
      setNoPreviewId(trackId);
      setTimeout(() => {
        setNoPreviewId((cur) => (cur === trackId ? null : cur));
      }, 1800);
      return;
    }

    // Clicking the currently-playing track → pause.
    if (playingId === trackId && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingId(null);
      return;
    }

    // Switching tracks → stop the current one first.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(previewUrl);
    audio.volume = 0.8;
    audio.addEventListener("ended", () => {
      setPlayingId((cur) => (cur === trackId ? null : cur));
    });
    audio.addEventListener("error", () => {
      setPlayingId((cur) => (cur === trackId ? null : cur));
    });
    audio.play().catch(() => {
      // Autoplay policies or network hiccup — reset state silently.
      setPlayingId((cur) => (cur === trackId ? null : cur));
    });
    audioRef.current = audio;
    setPlayingId(trackId);
  };

  // Lazy-loaded collision state for every library tile. One batch call.
  type CollisionState = "green" | "yellow" | "red";
  const [collisions, setCollisions] = useState<Record<string, CollisionState>>({});
  const libraryIds = useMemo(() => library.map((t) => t.id), [library]);

  useEffect(() => {
    if (libraryIds.length === 0) {
      setCollisions({});
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/studio/music/collisions/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackIds: libraryIds }),
      });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as {
        results: Record<string, { state: CollisionState }>;
      };
      const map: Record<string, CollisionState> = {};
      for (const [id, v] of Object.entries(data.results)) {
        map[id] = v.state;
      }
      if (!cancelled) setCollisions(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [libraryIds]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setSearchError("");
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setSearching(true);
      setSearchError("");
      try {
        const res = await fetch(
          `/api/studio/music/search?q=${encodeURIComponent(query.trim())}`
        );
        // Only honor the latest request to avoid stale out-of-order results
        if (requestId !== requestIdRef.current) return;
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: "Search failed" }));
          setSearchError(error || "Search failed");
          setResults([]);
        } else {
          const { results: list } = (await res.json()) as { results: SearchResult[] };
          setResults(list);
        }
      } catch {
        if (requestId === requestIdRef.current) {
          setSearchError("Search failed");
          setResults([]);
        }
      } finally {
        if (requestId === requestIdRef.current) setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const saveTrack = async (spotifyTrackId: string) => {
    setSavingId(spotifyTrackId);
    const res = await fetch("/api/studio/music/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotifyTrackId }),
    });
    setSavingId(null);
    if (res.ok) {
      setSavedIds((prev) => new Set(prev).add(spotifyTrackId));
      router.refresh(); // re-fetch the library grid below
    } else {
      const { error } = await res.json().catch(() => ({ error: "Save failed" }));
      setSearchError(error || "Save failed");
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent-400 mb-1 inline-flex items-center gap-1.5">
              <Music className="h-3 w-3" />
              Music Hub — {studio.name}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">
              Find. Check. Lock.
            </h1>
            <p className="mt-2 text-sm text-surface-200 max-w-xl">
              Search Spotify, add tracks to your studio library, and keep a
              shared shortlist of songs you&apos;re considering this season.
            </p>
          </div>
          <a
            href="/studio/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm transition-colors"
          >
            ← Dashboard
          </a>
        </div>

        {/* Search bar */}
        <div className="glass rounded-2xl p-5 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-200" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Spotify — track, artist, or 'bpm 120 lyrical'"
              className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-10 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-accent-500 transition-colors"
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent-400 animate-spin" />
            )}
          </div>

          {searchError && (
            <p className="mt-3 text-sm text-red-400">{searchError}</p>
          )}

          {results.length > 0 && (
            <ul className="mt-5 space-y-2">
              {results.map((r) => {
                const saved = savedIds.has(r.spotifyTrackId);
                const isPlaying = playingId === r.spotifyTrackId;
                const showNoPreview = noPreviewId === r.spotifyTrackId;
                return (
                  <li
                    key={r.spotifyTrackId}
                    className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition-colors"
                  >
                    {/* Album art doubles as a play / pause button. */}
                    <button
                      type="button"
                      onClick={() => togglePreview(r.spotifyTrackId, r.previewUrl)}
                      className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0 group/art focus:outline-none focus:ring-2 focus:ring-accent-400"
                      aria-label={
                        !r.previewUrl
                          ? "No 30-second preview available for this track"
                          : isPlaying
                          ? `Pause preview of ${r.name}`
                          : `Play 30-second preview of ${r.name}`
                      }
                    >
                      {r.albumImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.albumImageUrl}
                          alt=""
                          className="h-12 w-12 object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-surface-900 flex items-center justify-center">
                          <Music className="h-4 w-4 text-surface-200" />
                        </div>
                      )}
                      {/* Overlay: play/pause icon (or muted icon if no preview). */}
                      <span
                        className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                          isPlaying
                            ? "bg-black/60 opacity-100"
                            : "bg-black/40 opacity-0 group-hover/art:opacity-100"
                        }`}
                      >
                        {!r.previewUrl ? (
                          <VolumeX className="h-5 w-5 text-white/70" />
                        ) : isPlaying ? (
                          <Pause className="h-5 w-5 text-white" fill="currentColor" />
                        ) : (
                          <Play className="h-5 w-5 text-white" fill="currentColor" />
                        )}
                      </span>
                      {isPlaying && (
                        <span className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full bg-accent-400/80 animate-pulse" />
                      )}
                    </button>
                    {showNoPreview && (
                      <span className="text-[10px] text-surface-200/80 -ml-1">
                        No preview
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {r.name}
                        {r.explicit && (
                          <span className="ml-2 text-[10px] font-bold bg-white/10 text-surface-200 px-1.5 py-0.5 rounded">
                            E
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-surface-200 truncate">
                        {r.artists.join(", ")}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {r.tempoBpm !== null && (
                          <Chip icon={<Gauge className="h-3 w-3" />}>{r.tempoBpm} bpm</Chip>
                        )}
                        {r.energy !== null && (
                          <Chip icon={<Activity className="h-3 w-3" />}>
                            energy {Math.round(r.energy * 100)}
                          </Chip>
                        )}
                        <Chip icon={<Clock className="h-3 w-3" />}>
                          {formatDuration(r.durationMs)}
                        </Chip>
                      </div>
                    </div>
                    <button
                      onClick={() => saveTrack(r.spotifyTrackId)}
                      disabled={saved || savingId === r.spotifyTrackId}
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        saved
                          ? "bg-green-500/20 text-green-300 cursor-default"
                          : savingId === r.spotifyTrackId
                          ? "bg-white/10 text-surface-200"
                          : "bg-accent-500 hover:bg-accent-400 text-white"
                      }`}
                    >
                      {saved ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Saved
                        </>
                      ) : savingId === r.spotifyTrackId ? (
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

          {!searching && query.trim() && results.length === 0 && !searchError && (
            <p className="mt-4 text-sm text-surface-200 text-center">
              No tracks found.
            </p>
          )}
        </div>

        {/* Library grid */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Your library ({library.length})
          </h2>
          {library.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Music className="mx-auto h-8 w-8 text-surface-200 mb-3" />
              <p className="text-surface-200 text-sm">
                No saved tracks yet. Search above and tap <strong>+ Add</strong> on
                any result to build your shortlist.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {library.map((t) => {
                const state = collisions[t.id];
                return (
                  <li key={t.id} className="glass rounded-2xl p-4 relative">
                    <CollisionDot state={state} />
                    <a href={`/studio/music/${t.id}`} className="flex items-center gap-3 group">
                      {t.albumImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.albumImageUrl}
                          alt=""
                          className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-md bg-surface-900 flex-shrink-0 flex items-center justify-center">
                          <Music className="h-5 w-5 text-surface-200" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate group-hover:text-accent-300 transition-colors">
                          {t.trackName || "Untitled"}
                        </p>
                        <p className="text-xs text-surface-200 truncate">
                          {t.artistName || "—"}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {t.tempoBpm !== null && (
                            <Chip icon={<Gauge className="h-3 w-3" />}>
                              {t.tempoBpm} bpm
                            </Chip>
                          )}
                          <Chip icon={<Clock className="h-3 w-3" />}>
                            {formatDuration(t.durationMs)}
                          </Chip>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-surface-200 group-hover:text-white transition-colors flex-shrink-0" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 text-surface-200 px-2 py-0.5 text-[10px] font-medium">
      {icon}
      {children}
    </span>
  );
}

function CollisionDot({ state }: { state: "green" | "yellow" | "red" | undefined }) {
  if (!state) {
    // Still loading — render an invisible placeholder so the tile's hit
    // area doesn't shift when the dot arrives.
    return <span className="absolute top-3 right-3 h-2.5 w-2.5" aria-hidden />;
  }
  const cfg = {
    green: {
      bg: "bg-green-400",
      title: "Clear to lock in — no other studio is using this song this season.",
    },
    yellow: {
      bg: "bg-yellow-400",
      title: "Being considered by another studio this season (outside your state).",
    },
    red: {
      bg: "bg-red-500",
      title: "Another studio in your state has locked this song in this season.",
    },
  }[state];
  return (
    <span
      className={`absolute top-3 right-3 h-2.5 w-2.5 rounded-full ${cfg.bg} ring-2 ring-surface-950/40`}
      title={cfg.title}
      aria-label={cfg.title}
    />
  );
}
