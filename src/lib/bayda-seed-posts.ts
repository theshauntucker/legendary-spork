/**
 * Bayda daily-post generator. Runs server-side (cron or edge function).
 * Returns 5 post bodies based on fresh Supabase data. Post inserts are done by
 * the caller (so this module stays pure and testable).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type BaydaPost = {
  body: string;
  kind: "score_gain" | "top_song" | "new_diamond" | "checkin_count" | "rising_star";
};

type SupabaseLike = Pick<SupabaseClient, "from" | "rpc">;

export async function generateBaydaPosts(supabase: SupabaseLike): Promise<BaydaPost[]> {
  const posts: BaydaPost[] = [];

  const sinceIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // 1) Biggest score gain in last 7 days (placeholder — needs analyses diffing)
  const { data: topAchievement } = await supabase
    .from("achievements")
    .select("total_score, profile_id")
    .gte("earned_at", sinceIso)
    .order("total_score", { ascending: false })
    .limit(1)
    .maybeSingle<{ total_score: number; profile_id: string }>();

  if (topAchievement) {
    const { data: topProfile } = await supabase
      .from("profiles")
      .select("handle")
      .eq("id", topAchievement.profile_id)
      .maybeSingle<{ handle: string }>();
    if (topProfile) {
      posts.push({
        kind: "score_gain",
        body: `Biggest score on the board this week: @${topProfile.handle} just ran a ${Math.round(topAchievement.total_score)}. Not bad. Not bad at all.`,
      });
    }
  }

  // 2) Placeholder for top song (needs song tracking from studio/music/*)
  posts.push({
    kind: "top_song",
    body: "Most-used song across studios this week: details rolling in as the weekend fires up. Stay loud.",
  });

  // 3) Newest Diamond
  const { data: newDiamond } = await supabase
    .from("achievements")
    .select("profile_id, earned_at")
    .eq("award_level", "diamond")
    .gte("earned_at", sinceIso)
    .order("earned_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ profile_id: string; earned_at: string }>();

  if (newDiamond) {
    const { data: diamondProfile } = await supabase
      .from("profiles")
      .select("handle")
      .eq("id", newDiamond.profile_id)
      .maybeSingle<{ handle: string }>();
    if (diamondProfile) {
      posts.push({
        kind: "new_diamond",
        body: `Fresh Diamond alert: @${diamondProfile.handle} just joined the club. Welcome in. Stay humble.`,
      });
    }
  }

  // 4) Check-in count for next weekend's competition
  const now = new Date();
  const nextSat = new Date(now);
  nextSat.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
  const weekendDate = nextSat.toISOString().slice(0, 10);

  const { data: checkins } = await supabase
    .from("competition_checkins")
    .select("competition_id", { count: "exact" })
    .eq("competition_date", weekendDate);
  const checkinCount = (checkins ?? []).length;
  if (checkinCount) {
    posts.push({
      kind: "checkin_count",
      body: `${checkinCount} dancers already checked in for ${weekendDate}. If you're competing this weekend, hit Check In and link up.`,
    });
  }

  // 5) Rising Star — highest score jump in last 30 days (placeholder)
  posts.push({
    kind: "rising_star",
    body: "Rising Star of the week: keep an eye on your feed today. Someone's moving up fast.",
  });

  return posts.slice(0, 5);
}
