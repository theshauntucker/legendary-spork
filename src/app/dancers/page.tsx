import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Trophy, Star, TrendingUp, Calendar, ChevronRight, Sparkles, Zap } from "lucide-react";

export const metadata = {
  title: "Season Tracker — RoutineX",
  description: "Track every dancer's scores, awards, and progress across the entire competition season.",
};

function awardColor(level: string): string {
  const l = (level ?? "").toLowerCase();
  if (l.includes("titanium"))                              return "text-cyan-300 bg-cyan-400/15 border-cyan-400/30";
  if (l.includes("platinum star") || l.includes("diamond")) return "text-purple-300 bg-purple-400/15 border-purple-400/30";
  if (l.includes("platinum"))                              return "text-violet-300 bg-violet-400/15 border-violet-400/30";
  if (l.includes("high gold"))                             return "text-yellow-200 bg-yellow-400/15 border-yellow-400/30";
  if (l.includes("gold"))                                  return "text-amber-300 bg-amber-400/15 border-amber-400/30";
  return "text-surface-200 bg-white/5 border-white/10";
}

function awardEmoji(level: string): string {
  const l = (level ?? "").toLowerCase();
  if (l.includes("titanium"))                              return "💎";
  if (l.includes("platinum star") || l.includes("diamond")) return "🌟";
  if (l.includes("platinum"))                              return "🏆";
  if (l.includes("high gold"))                             return "🥇";
  if (l.includes("gold"))                                  return "✨";
  return "🎭";
}

function awardRank(level: string): number {
  const l = (level ?? "").toLowerCase();
  if (l.includes("titanium"))      return 5;
  if (l.includes("platinum star")) return 4;
  if (l.includes("platinum"))      return 3;
  if (l.includes("high gold"))     return 2;
  if (l.includes("gold"))          return 1;
  return 0;
}

// Next award level based on score
function nextAwardInfo(bestScore: number): { name: string; emoji: string; threshold: number; pointsNeeded: number } | null {
  if (bestScore >= 295) return null; // already at top
  if (bestScore >= 285) return { name: "Titanium", emoji: "💎", threshold: 295, pointsNeeded: 295 - bestScore };
  if (bestScore >= 270) return { name: "Platinum Star", emoji: "🌟", threshold: 285, pointsNeeded: 285 - bestScore };
  if (bestScore >= 250) return { name: "Platinum", emoji: "🏆", threshold: 270, pointsNeeded: 270 - bestScore };
  if (bestScore >= 220) return { name: "High Gold", emoji: "🥇", threshold: 250, pointsNeeded: 250 - bestScore };
  return { name: "Gold", emoji: "✨", threshold: 220, pointsNeeded: 220 - bestScore };
}

interface DancerSummary {
  name: string;
  studio: string | null;
  ageGroup: string;
  totalAnalyses: number;
  bestScore: number;
  firstScore: number;
  latestScore: number;
  bestAward: string;
  latestAward: string;
  latestCompetition: string | null;
  styles: string[];
  scoreHistory: number[];
}

export default async function DancersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const serviceClient = await createServiceClient();

  const { data: videos } = await serviceClient
    .from("videos")
    .select(`
      id,
      dancer_name,
      studio_name,
      age_group,
      style,
      routine_name,
      competition_name,
      competition_date,
      status,
      created_at,
      analyses (
        id,
        total_score,
        award_level,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "analyzed")
    .order("created_at", { ascending: true });

  // Group by dancer name (ascending so first = earliest)
  const dancerMap = new Map<string, DancerSummary>();

  for (const video of (videos ?? [])) {
    const name = (video.dancer_name as string) || "Unnamed Dancer";
    const analyses = (video.analyses ?? []) as Array<{ id: string; total_score: number; award_level: string; created_at: string }>;
    const analysis = analyses[0];
    if (!analysis) continue;

    const score = analysis.total_score ?? 0;
    const award = analysis.award_level ?? "—";

    if (!dancerMap.has(name)) {
      dancerMap.set(name, {
        name,
        studio: (video.studio_name as string) || null,
        ageGroup: (video.age_group as string) || "—",
        totalAnalyses: 0,
        bestScore: 0,
        firstScore: score,
        latestScore: score,
        bestAward: award,
        latestAward: award,
        latestCompetition: (video.competition_name as string) || null,
        styles: [],
        scoreHistory: [],
      });
    }

    const dancer = dancerMap.get(name)!;
    dancer.totalAnalyses += 1;
    dancer.scoreHistory.push(score);
    dancer.latestScore = score;
    dancer.latestAward = award;
    if (score > dancer.bestScore) {
      dancer.bestScore = score;
      dancer.bestAward = award;
    }
    if ((video.competition_name as string)) dancer.latestCompetition = video.competition_name as string;
    const style = video.style as string;
    if (style && !dancer.styles.includes(style)) dancer.styles.push(style);
  }

  const dancers = Array.from(dancerMap.values()).sort((a, b) => b.totalAnalyses - a.totalAnalyses);
  const totalAnalyses = dancers.reduce((s, d) => s + d.totalAnalyses, 0);
  const topScore = dancers.reduce((s, d) => Math.max(s, d.bestScore), 0);
  const allStyles = [...new Set(dancers.flatMap(d => d.styles))];

  // How many are trending up?
  const trendingUp = dancers.filter(d => d.scoreHistory.length >= 2 && d.latestScore > d.firstScore).length;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-gold-500/8 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-surface-200 hover:text-white transition-colors text-sm">
            <Sparkles className="h-4 w-4 text-primary-400" />
            <span className="font-bold">Routine<span className="text-primary-400">X</span></span>
          </Link>
          <Link href="/dashboard" className="text-sm text-surface-200 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500/30 to-accent-500/30">
              <Trophy className="h-6 w-6 text-gold-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">
                Season Tracker
              </h1>
              <p className="text-surface-200 text-sm mt-0.5">
                Every score. Every award. Every step forward. 🏆
              </p>
            </div>
          </div>

          {/* Motivational banner if trending up */}
          {trendingUp > 0 && dancers.length > 0 && (
            <div className="mt-4 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 w-fit">
              <TrendingUp className="h-4 w-4 text-green-400 shrink-0" />
              <p className="text-sm text-green-300 font-medium">
                {trendingUp === dancers.length
                  ? "🔥 Everyone is trending up this season!"
                  : `🔥 ${trendingUp} dancer${trendingUp > 1 ? "s are" : " is"} trending up this season!`}
              </p>
            </div>
          )}
        </div>

        {/* Season Summary Stats */}
        {dancers.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Dancers Tracked", value: String(dancers.length), icon: Star, color: "text-primary-400" },
              { label: "Total Analyses", value: String(totalAnalyses), icon: BarChartIcon, color: "text-accent-400" },
              { label: "Season Best Score", value: topScore > 0 ? String(topScore) : "—", icon: Trophy, color: "text-gold-400" },
              { label: "Styles Covered", value: String(allStyles.length), icon: SparkleIcon, color: "text-violet-400" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-5 text-center">
                <stat.icon className={`mx-auto h-5 w-5 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-surface-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Dancer Cards */}
        {dancers.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Trophy className="mx-auto h-14 w-14 text-gold-400/40 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your Season Story Starts Here</h2>
            <p className="text-surface-200 mb-2 max-w-md mx-auto">
              Upload your first routine with a dancer name and we&apos;ll build a full season timeline — every score, every award, every improvement tracked automatically.
            </p>
            <p className="text-surface-200/60 text-sm mb-6 max-w-sm mx-auto italic">
              &quot;Every champion was once a beginner who refused to give up.&quot;
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-8 py-4 font-bold text-white hover:opacity-90 transition-opacity"
            >
              Upload First Routine
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-surface-200 mb-4">
              {dancers.length} Dancer{dancers.length !== 1 ? "s" : ""} This Season
            </h2>
            {dancers.map((dancer) => {
              const trend = dancer.scoreHistory.length >= 2
                ? dancer.scoreHistory[dancer.scoreHistory.length - 1] - dancer.scoreHistory[0]
                : null;
              const barPct = Math.min(100, Math.round((dancer.bestScore / 300) * 100));
              const improvePct = dancer.firstScore > 0 && dancer.scoreHistory.length >= 2
                ? Math.round(((dancer.bestScore - dancer.firstScore) / dancer.firstScore) * 100)
                : null;
              const next = nextAwardInfo(dancer.bestScore);
              const isNewPB = dancer.latestScore === dancer.bestScore && dancer.totalAnalyses > 1;

              return (
                <Link
                  key={dancer.name}
                  href={`/dancers/${encodeURIComponent(dancer.name)}`}
                  className="group block glass rounded-2xl p-6 hover:border-primary-500/30 transition-all hover:shadow-lg hover:shadow-primary-500/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Name + Best Award + milestone */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold group-hover:text-primary-300 transition-colors">
                          {dancer.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${awardColor(dancer.bestAward)}`}>
                          {awardEmoji(dancer.bestAward)} {dancer.bestAward}
                        </span>
                        {isNewPB && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-300">
                            🎉 New PB!
                          </span>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-surface-200 mb-4">
                        {dancer.studio && <span>{dancer.studio}</span>}
                        {dancer.studio && <span className="text-white/20">·</span>}
                        <span>{dancer.ageGroup}</span>
                        {dancer.styles.length > 0 && (
                          <>
                            <span className="text-white/20">·</span>
                            <span>{dancer.styles.slice(0, 3).join(", ")}{dancer.styles.length > 3 ? ` +${dancer.styles.length - 3}` : ""}</span>
                          </>
                        )}
                      </div>

                      {/* Score bar */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 via-accent-400 to-gold-400 transition-all"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-white shrink-0">
                          {dancer.bestScore} <span className="text-surface-200 font-normal text-xs">/ 300</span>
                        </span>
                      </div>

                      {/* Next level teaser */}
                      {next && (
                        <div className="flex items-center gap-1.5 text-xs text-surface-200">
                          <Zap className="h-3 w-3 text-gold-400 shrink-0" />
                          <span>
                            <span className="text-white font-semibold">{next.pointsNeeded} more pts</span>
                            {" "}to {next.emoji} {next.name}!
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right stats */}
                    <div className="shrink-0 text-right space-y-2">
                      <div className="flex items-center gap-1.5 justify-end text-surface-200">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs">{dancer.totalAnalyses} {dancer.totalAnalyses === 1 ? "analysis" : "analyses"}</span>
                      </div>
                      {trend !== null && (
                        <div className={`flex items-center gap-1 justify-end text-xs font-bold ${trend > 0 ? "text-green-400" : trend < 0 ? "text-red-400" : "text-surface-200"}`}>
                          <TrendingUp className={`h-3.5 w-3.5 ${trend < 0 ? "rotate-180" : ""}`} />
                          {trend > 0 ? `+${trend}` : trend} pts
                        </div>
                      )}
                      {improvePct !== null && improvePct > 0 && (
                        <div className="text-xs font-semibold text-green-400">
                          ↑ {improvePct}% growth
                        </div>
                      )}
                      {dancer.latestCompetition && (
                        <p className="text-xs text-surface-200 max-w-[140px] text-right truncate">{dancer.latestCompetition}</p>
                      )}
                      <ChevronRight className="h-5 w-5 text-surface-200 group-hover:text-white group-hover:translate-x-1 transition-all mt-1 ml-auto" />
                    </div>
                  </div>
                </Link>
              );
            })}

            <div className="pt-2 text-center">
              <Link href="/upload" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/5 transition-colors">
                + Analyze Another Routine
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="18" y="3" width="4" height="18" rx="1" /><rect x="10" y="8" width="4" height="13" rx="1" /><rect x="2" y="13" width="4" height="8" rx="1" />
    </svg>
  );
}
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}
