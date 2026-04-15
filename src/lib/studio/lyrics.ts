/**
 * Lyric safety check for studio music tracks.
 *
 * Calls Claude Haiku with a strict JSON-only prompt and returns a typed
 * result. Spec-shaped: { safe_age_divisions, flags, notes, confidence }.
 *
 * Design rules:
 *   - Platform-wide caching: the caller is expected to look up any other
 *     studio_music_tracks row (ANY studio) with the same spotify_track_id
 *     that's already been checked, and reuse its result if found — we only
 *     pay Claude once per song platform-wide.
 *   - Strict JSON parsing. Claude occasionally wraps JSON in prose or code
 *     fences; we tolerate that with a regex extraction.
 *   - Never throw on upstream failure; return a "low-confidence /
 *     unavailable" result so the caller can mark the row gracefully.
 */

export interface LyricFlags {
  profanity: boolean;
  sexual_content: boolean;
  drug_references: boolean;
  violence: boolean;
  religious_conflict: boolean;
}

export interface LyricCheckResult {
  safe_age_divisions: string[]; // e.g. ['mini','junior','teen','senior']
  flags: LyricFlags;
  notes: string;
  confidence: "high" | "medium" | "low";
}

export type LyricsStatus = "unchecked" | "safe" | "flagged" | "unavailable";
export type AgeRating = "all_ages" | "teen_plus" | "senior_only" | "flagged";

const CLAUDE_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

/**
 * Make a fresh Claude call. Returns null if the API key is missing, the
 * request fails, or the response can't be parsed — callers treat that as
 * "unavailable" and mark the row accordingly.
 */
export async function callClaudeLyricCheck(
  title: string,
  artist: string
): Promise<LyricCheckResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not set — lyric check unavailable");
    return null;
  }

  const prompt = `Analyze the song "${title}" by ${artist} for competitive dance suitability. Return ONLY JSON matching this schema, no prose, no code fences:

{
  "safe_age_divisions": ["mini","petite","junior","teen","senior"],
  "flags": {
    "profanity": false,
    "sexual_content": false,
    "drug_references": false,
    "violence": false,
    "religious_conflict": false
  },
  "notes": "one sentence, max 200 chars",
  "confidence": "high"
}

safe_age_divisions contains only the divisions the song is appropriate for, drawn from: mini, petite, junior, teen, senior.

Each flag is true only when the song's lyrics contain that category of content.

confidence: "high" if you know this song, "medium" if you know the artist but not this specific track, "low" if you don't know the song at all. If confidence is "low", set all flags to false and leave safe_age_divisions as an empty array.`;

  let text: string;
  try {
    const resp = await fetch(CLAUDE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!resp.ok) {
      console.error("Claude lyric check failed:", resp.status, await resp.text());
      return null;
    }
    const data = (await resp.json()) as { content?: Array<{ text?: string }> };
    text = data.content?.[0]?.text ?? "";
  } catch (err) {
    console.error("Claude lyric check fetch error:", err);
    return null;
  }

  if (!text) return null;

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]) as Partial<LyricCheckResult>;
    return normalizeResult(parsed);
  } catch (err) {
    console.error("Claude lyric check JSON parse error:", err, text);
    return null;
  }
}

function normalizeResult(raw: Partial<LyricCheckResult>): LyricCheckResult {
  const flagsRaw = (raw.flags ?? {}) as Partial<LyricFlags>;
  const flags: LyricFlags = {
    profanity: Boolean(flagsRaw.profanity),
    sexual_content: Boolean(flagsRaw.sexual_content),
    drug_references: Boolean(flagsRaw.drug_references),
    violence: Boolean(flagsRaw.violence),
    religious_conflict: Boolean(flagsRaw.religious_conflict),
  };
  const confidence: LyricCheckResult["confidence"] =
    raw.confidence === "high" || raw.confidence === "medium" || raw.confidence === "low"
      ? raw.confidence
      : "low";
  return {
    safe_age_divisions: Array.isArray(raw.safe_age_divisions)
      ? raw.safe_age_divisions.filter((s): s is string => typeof s === "string")
      : [],
    flags,
    notes: typeof raw.notes === "string" ? raw.notes.slice(0, 400) : "",
    confidence,
  };
}

/**
 * Derive the DB-level age rating + lyrics_status from a Claude result.
 *
 * Heuristic:
 *   - confidence='low'    → lyrics_status=unavailable, age_rating=null
 *   - ≥3 serious flags    → flagged
 *   - sexual_content, or  → senior_only
 *     profanity+drugs
 *   - any flag / religious → teen_plus
 *   - no flags            → all_ages
 */
export function deriveRating(
  result: LyricCheckResult
): { status: LyricsStatus; ageRating: AgeRating | null } {
  if (result.confidence === "low") {
    return { status: "unavailable", ageRating: null };
  }

  const f = result.flags;
  const seriousCount =
    (f.profanity ? 1 : 0) +
    (f.sexual_content ? 1 : 0) +
    (f.drug_references ? 1 : 0) +
    (f.violence ? 1 : 0);

  if (seriousCount >= 3) {
    return { status: "flagged", ageRating: "flagged" };
  }
  if (f.sexual_content || (f.profanity && f.drug_references)) {
    return { status: "flagged", ageRating: "senior_only" };
  }
  if (seriousCount >= 1 || f.religious_conflict) {
    return { status: "safe", ageRating: "teen_plus" };
  }
  return { status: "safe", ageRating: "all_ages" };
}
