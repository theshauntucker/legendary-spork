/**
 * Spotify Web API wrapper using the Client Credentials flow.
 *
 * Why Client Credentials (not user OAuth): the Music Hub searches the public
 * catalog and reads audio features — no per-user playlist/library scope is
 * needed. Studios never authenticate against a personal Spotify account.
 *
 * Token caching: module-level singleton. Lives for the lifetime of a
 * serverless instance. Token re-auth only happens when the cache is empty
 * or within 30 seconds of expiry. On Vercel each instance caches
 * independently (different instances = independent cache), which is fine
 * for rate-limit and cost purposes.
 */

interface CachedToken {
  value: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;
let inflightAuth: Promise<string> | null = null;

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";
const SAFETY_MARGIN_MS = 30_000; // refresh 30s before expiry to avoid mid-request expiry

export class SpotifyConfigError extends Error {}
export class SpotifyAPIError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

async function authenticate(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new SpotifyConfigError(
      "SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set"
    );
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!resp.ok) {
    throw new SpotifyAPIError(
      `Spotify auth failed (${resp.status})`,
      resp.status
    );
  }

  const data = (await resp.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

export async function getSpotifyToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - SAFETY_MARGIN_MS > now) {
    return cachedToken.value;
  }
  // Collapse concurrent refreshes into a single network call.
  if (!inflightAuth) {
    inflightAuth = authenticate().finally(() => {
      inflightAuth = null;
    });
  }
  return inflightAuth;
}

async function spotifyFetch<T>(path: string): Promise<T> {
  const token = await getSpotifyToken();
  let resp = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  // One retry on 401 in case a token expired between cache check and use
  if (resp.status === 401) {
    cachedToken = null;
    const fresh = await getSpotifyToken();
    resp = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${fresh}` },
      cache: "no-store",
    });
  }
  if (!resp.ok) {
    throw new SpotifyAPIError(
      `Spotify ${path} failed (${resp.status})`,
      resp.status
    );
  }
  return (await resp.json()) as T;
}

// ─────────────────────────────────────────────────────────────────────
// Public types: narrow slices of the Spotify responses we actually use
// ─────────────────────────────────────────────────────────────────────

export interface SpotifyTrackSummary {
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

interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}
interface SpotifyArtist {
  name: string;
}
interface SpotifyAlbum {
  name: string;
  images: SpotifyImage[];
}
interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  explicit: boolean;
  preview_url: string | null;
}
interface SpotifySearchResponse {
  tracks: { items: SpotifyTrack[] };
}
interface SpotifyAudioFeatures {
  id: string;
  tempo: number;
  energy: number;
  danceability: number;
}
interface SpotifyAudioFeaturesBatch {
  audio_features: (SpotifyAudioFeatures | null)[];
}

// ─────────────────────────────────────────────────────────────────────

export async function searchTracks(
  query: string,
  limit = 20
): Promise<SpotifyTrackSummary[]> {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: String(Math.min(50, Math.max(1, limit))),
  });
  const data = await spotifyFetch<SpotifySearchResponse>(
    `/search?${params.toString()}`
  );
  const items = data.tracks.items;
  if (items.length === 0) return [];

  // Batch audio-features lookup (one API call for up to 100 IDs).
  const ids = items.map((t) => t.id).join(",");
  let features: (SpotifyAudioFeatures | null)[] = [];
  try {
    const feat = await spotifyFetch<SpotifyAudioFeaturesBatch>(
      `/audio-features?ids=${encodeURIComponent(ids)}`
    );
    features = feat.audio_features;
  } catch (err) {
    // Audio features are nice-to-have; don't fail search if they're flaky.
    console.error("Spotify audio-features lookup failed:", err);
    features = items.map(() => null);
  }

  const featureMap = new Map<string, SpotifyAudioFeatures>();
  for (const f of features) {
    if (f) featureMap.set(f.id, f);
  }

  return items.map((t) => {
    const f = featureMap.get(t.id);
    return {
      spotifyTrackId: t.id,
      name: t.name,
      artists: t.artists.map((a) => a.name),
      albumName: t.album.name,
      albumImageUrl: t.album.images[0]?.url ?? null,
      durationMs: t.duration_ms,
      explicit: t.explicit,
      previewUrl: t.preview_url,
      tempoBpm: f ? Math.round(f.tempo * 10) / 10 : null,
      energy: f ? Math.round(f.energy * 100) / 100 : null,
      danceability: f ? Math.round(f.danceability * 100) / 100 : null,
    };
  });
}

export async function getTrackById(
  spotifyTrackId: string
): Promise<SpotifyTrackSummary | null> {
  const track = await spotifyFetch<SpotifyTrack>(`/tracks/${encodeURIComponent(spotifyTrackId)}`);
  let feature: SpotifyAudioFeatures | null = null;
  try {
    feature = await spotifyFetch<SpotifyAudioFeatures>(
      `/audio-features/${encodeURIComponent(spotifyTrackId)}`
    );
  } catch {
    feature = null;
  }
  return {
    spotifyTrackId: track.id,
    name: track.name,
    artists: track.artists.map((a) => a.name),
    albumName: track.album.name,
    albumImageUrl: track.album.images[0]?.url ?? null,
    durationMs: track.duration_ms,
    explicit: track.explicit,
    previewUrl: track.preview_url,
    tempoBpm: feature ? Math.round(feature.tempo * 10) / 10 : null,
    energy: feature ? Math.round(feature.energy * 100) / 100 : null,
    danceability: feature ? Math.round(feature.danceability * 100) / 100 : null,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Recommendations ("Find me something like this")
// ─────────────────────────────────────────────────────────────────────

export interface RecommendationFilters {
  /** Target tempo — Spotify picks candidates near this BPM. */
  targetTempo?: number;
  /** Hard min/max BPM. */
  minTempo?: number;
  maxTempo?: number;
  /** Target energy 0..1. */
  targetEnergy?: number;
  /** Hard min/max duration in ms. */
  minDurationMs?: number;
  maxDurationMs?: number;
  /** 1..100. Default 20. */
  limit?: number;
}

interface SpotifyRecommendationsResponse {
  tracks: SpotifyTrack[];
}

export async function getRecommendations(
  seedTrackIds: string[],
  filters: RecommendationFilters = {}
): Promise<SpotifyTrackSummary[]> {
  if (seedTrackIds.length === 0) return [];
  // Spotify caps seed_tracks at 5.
  const seeds = seedTrackIds.slice(0, 5).join(",");

  const params = new URLSearchParams({
    seed_tracks: seeds,
    limit: String(Math.min(100, Math.max(1, filters.limit ?? 20))),
  });
  if (filters.targetTempo !== undefined) params.set("target_tempo", String(filters.targetTempo));
  if (filters.minTempo !== undefined) params.set("min_tempo", String(filters.minTempo));
  if (filters.maxTempo !== undefined) params.set("max_tempo", String(filters.maxTempo));
  if (filters.targetEnergy !== undefined) params.set("target_energy", String(filters.targetEnergy));
  if (filters.minDurationMs !== undefined) params.set("min_duration_ms", String(filters.minDurationMs));
  if (filters.maxDurationMs !== undefined) params.set("max_duration_ms", String(filters.maxDurationMs));

  const data = await spotifyFetch<SpotifyRecommendationsResponse>(
    `/recommendations?${params.toString()}`
  );
  const items = data.tracks;
  if (items.length === 0) return [];

  // Enrich with batched audio-features for nicer chips on each suggestion.
  const ids = items.map((t) => t.id).join(",");
  let features: (SpotifyAudioFeatures | null)[] = [];
  try {
    const feat = await spotifyFetch<SpotifyAudioFeaturesBatch>(
      `/audio-features?ids=${encodeURIComponent(ids)}`
    );
    features = feat.audio_features;
  } catch {
    features = items.map(() => null);
  }
  const featureMap = new Map<string, SpotifyAudioFeatures>();
  for (const f of features) if (f) featureMap.set(f.id, f);

  return items.map((t) => {
    const f = featureMap.get(t.id);
    return {
      spotifyTrackId: t.id,
      name: t.name,
      artists: t.artists.map((a) => a.name),
      albumName: t.album.name,
      albumImageUrl: t.album.images[0]?.url ?? null,
      durationMs: t.duration_ms,
      explicit: t.explicit,
      previewUrl: t.preview_url,
      tempoBpm: f ? Math.round(f.tempo * 10) / 10 : null,
      energy: f ? Math.round(f.energy * 100) / 100 : null,
      danceability: f ? Math.round(f.danceability * 100) / 100 : null,
    };
  });
}

// Test-only helper (not exported from an index) — lets the regression
// test reset cache between cases.
export function __resetSpotifyTokenCache() {
  cachedToken = null;
  inflightAuth = null;
}
