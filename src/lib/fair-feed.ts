import { createClient } from "@/lib/supabase/server";
import type { FeedItem } from "@/components/FeedCard";

type AchievementRow = {
  id: string;
  award_level: FeedItem["award_level"];
  total_score: number;
  competition_name: string | null;
  earned_at: string;
  video_id: string | null;
  profile_id: string;
};

type ProfileLite = {
  id: string;
  handle: string;
  display_name: string | null;
  aura_stops: string[] | null;
  aura_tier: FeedItem["owner"]["aura_tier"];
  glyph: string | null;
  studio_id: string | null;
};

type VideoLite = { id: string; routine_name: string | null; style: string | null };

export type BuildFeedArgs = {
  viewerProfileId: string;
  viewerStudioId: string | null;
  limit?: number;
  cursor?: string | null;
};

export type BuildFeedResult = {
  items: FeedItem[];
  nextCursor: string | null;
  weights: Record<string, number>;
};

const FEED_WEIGHTS = {
  follow: 0.35,
  studio: 0.25,
  event: 0.15,
  fair_reach: 0.15,
  discovery: 0.1,
};

export async function buildFeed(args: BuildFeedArgs): Promise<BuildFeedResult> {
  const supabase = await createClient();
  const limit = args.limit ?? 20;

  const { data: followRows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", args.viewerProfileId);
  const followingIds = (followRows ?? []).map((r) => r.following_id);

  const { data: studioRows } = args.viewerStudioId
    ? await supabase
        .from("profiles")
        .select("id")
        .eq("studio_id", args.viewerStudioId)
        .neq("id", args.viewerProfileId)
    : { data: [] as { id: string }[] };
  const studioIds = (studioRows ?? []).map((r) => r.id);

  const candidateOwnerIds = Array.from(new Set([...followingIds, ...studioIds]));

  const cursorClause = args.cursor ? { lt: args.cursor } : null;

  let achievementsQuery = supabase
    .from("achievements")
    .select("id, award_level, total_score, competition_name, earned_at, video_id, profile_id")
    .order("earned_at", { ascending: false })
    .limit(limit * 2);

  if (candidateOwnerIds.length) {
    achievementsQuery = achievementsQuery.in("profile_id", candidateOwnerIds);
  } else {
    // No follows — surface recent public achievements (discovery mode).
    achievementsQuery = achievementsQuery;
  }
  if (cursorClause) {
    achievementsQuery = achievementsQuery.lt("earned_at", cursorClause.lt);
  }

  const { data: achievements } = await achievementsQuery;
  const rows = (achievements ?? []) as AchievementRow[];

  if (!rows.length) {
    return { items: [], nextCursor: null, weights: FEED_WEIGHTS };
  }

  const ownerIds = Array.from(new Set(rows.map((r) => r.profile_id)));
  const { data: ownerProfiles } = await supabase
    .from("profiles")
    .select("id, handle, display_name, aura_stops, aura_tier, glyph, studio_id")
    .in("id", ownerIds);
  const profileById = new Map(
    ((ownerProfiles ?? []) as ProfileLite[]).map((p) => [p.id, p]),
  );

  const videoIds = rows.map((r) => r.video_id).filter(Boolean) as string[];
  const { data: videos } = videoIds.length
    ? await supabase.from("videos").select("id, routine_name, style").in("id", videoIds)
    : { data: [] as VideoLite[] };
  const videoById = new Map((videos ?? []).map((v) => [v.id, v]));

  const followSet = new Set(followingIds);
  const studioSet = new Set(studioIds);

  const diversityCount = new Map<string, number>();
  const items: FeedItem[] = [];
  for (const row of rows) {
    const owner = profileById.get(row.profile_id);
    if (!owner) continue;
    const count = diversityCount.get(owner.id) ?? 0;
    if (count >= 3) continue;
    diversityCount.set(owner.id, count + 1);

    const source: FeedItem["source"] = followSet.has(owner.id)
      ? "follow"
      : studioSet.has(owner.id)
        ? "studio"
        : "discovery";

    const video = row.video_id ? videoById.get(row.video_id) : undefined;

    items.push({
      id: row.id,
      award_level: row.award_level,
      total_score: Number(row.total_score),
      routine_name: video?.routine_name ?? null,
      style: video?.style ?? null,
      competition_name: row.competition_name,
      earned_at: row.earned_at,
      source,
      owner: {
        id: owner.id,
        handle: owner.handle,
        display_name: owner.display_name,
        aura_stops: owner.aura_stops,
        aura_tier: owner.aura_tier,
        glyph: owner.glyph,
      },
    });

    if (items.length >= limit) break;
  }

  const nextCursor =
    items.length >= limit ? items[items.length - 1]?.earned_at ?? null : null;

  return { items, nextCursor, weights: FEED_WEIGHTS };
}

export async function getReachFloor(_profileId: string): Promise<number> {
  return 50;
}

export async function scorePostForViewer(): Promise<number> {
  return 0;
}
