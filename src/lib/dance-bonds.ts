export type BondType =
  | "diamond"
  | "fire"
  | "crown"
  | "division"
  | "studio"
  | "song"
  | "weekend"
  | "second_degree"
  | "mutual_90"
  | "rising"
  | "choreo"
  | "pace";

export const BOND_EMOJI: Record<BondType, string> = {
  diamond: "💎",
  fire: "🔥",
  crown: "👑",
  division: "🎭",
  studio: "🏛️",
  song: "🎵",
  weekend: "🗓️",
  second_degree: "⚡",
  mutual_90: "✨",
  rising: "🌟",
  choreo: "🎬",
  pace: "📈",
};

// Rarity order: rarer bonds appear first in the top-3.
export const BOND_RANK: BondType[] = [
  "choreo",
  "weekend",
  "division",
  "mutual_90",
  "diamond",
  "studio",
  "rising",
  "crown",
  "fire",
  "song",
  "pace",
  "second_degree",
];

export function rankBonds(types: BondType[]): BondType[] {
  const set = new Set(types);
  return BOND_RANK.filter((t) => set.has(t)).slice(0, 3);
}

export type ProfileSignal = {
  id: string;
  studio_id: string | null;
  aura_tier: "starter" | "gold" | "platinum" | "diamond" | null;
  recent_videos: Array<{
    division: string | null;
    song_title: string | null;
    competition_name: string | null;
    competition_date: string | null;
    created_at: string;
    total_score: number | null;
  }>;
  follows_count?: number;
  following_count?: number;
};

export type BondContext = {
  mutualFollows?: boolean;
  secondDegree?: boolean;
};

export function computeBondTypes(
  a: ProfileSignal,
  b: ProfileSignal,
  ctx: BondContext = {},
): BondType[] {
  const types: BondType[] = [];

  if (a.aura_tier === "diamond" && b.aura_tier === "diamond") types.push("diamond");
  if (a.studio_id && a.studio_id === b.studio_id) types.push("studio");

  const aDivisions = new Set(a.recent_videos.map((v) => v.division).filter(Boolean));
  const bDivisions = new Set(b.recent_videos.map((v) => v.division).filter(Boolean));
  if ([...aDivisions].some((d) => bDivisions.has(d))) types.push("division");

  const aSongs = new Set(a.recent_videos.map((v) => v.song_title?.toLowerCase()).filter(Boolean));
  const bSongs = new Set(b.recent_videos.map((v) => v.song_title?.toLowerCase()).filter(Boolean));
  if ([...aSongs].some((s) => s && bSongs.has(s))) types.push("song");

  const aWeekends = new Set(
    a.recent_videos.map((v) => `${v.competition_name}|${v.competition_date}`),
  );
  const bWeekends = new Set(
    b.recent_videos.map((v) => `${v.competition_name}|${v.competition_date}`),
  );
  if ([...aWeekends].some((w) => bWeekends.has(w) && w !== "null|null")) types.push("weekend");

  const aBest = Math.max(0, ...a.recent_videos.map((v) => v.total_score ?? 0));
  const bBest = Math.max(0, ...b.recent_videos.map((v) => v.total_score ?? 0));
  if (aBest >= 290 && bBest >= 290) types.push("mutual_90");
  if (aBest >= 280 && bBest >= 280) types.push("fire");
  if (aBest >= 290 || bBest >= 290) types.push("crown");

  if (ctx.mutualFollows) types.push("pace");
  if (ctx.secondDegree) types.push("second_degree");

  return Array.from(new Set(types));
}
