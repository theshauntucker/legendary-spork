import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  Trophy, TrendingUp, Calendar, ChevronLeft, Star,
  Award, BarChart3, Sparkles, ExternalLink, Music, Users, Zap, Heart
} from "lucide-react";

// ─────────────────────────────────────────
// Award helpers
// ─────────────────────────────────────────

function awardColor(level: string) {
  const l = (level ?? "").toLowerCase();
  if (l.includes("titanium"))                              return { badge: "text-cyan-300 bg-cyan-400/15 border-cyan-400/30", bar: "#67e8f9" };
  if (l.includes("platinum star") || l.includes("diamond")) return { badge: "text-purple-300 bg-purple-400/15 border-purple-400/30", bar: "#c084fc" };
  if (l.includes("platinum"))                              return { badge: "text-violet-300 bg-violet-400/15 border-violet-400/30", bar: "#a78bfa" };
  if (l.includes("high gold"))                             return { badge: "text-yellow-200 bg-yellow-400/15 border-yellow-400/30", bar: "#fde68a" };
  if (l.includes("gold"))                                  return { badge: "text-amber-300 bg-amber-400/15 border-amber-400/30", bar: "#fbbf24" };
  return { badge: "text-surface-200 bg-white/5 border-white/10", bar: "#6b7280" };
}

function awardEmoji(level: string) {
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

// Next award level based on best score
function nextAwardInfo(bestScore: number): { name: string; emoji: string; threshold: number; pointsNeeded: number; pct: number } | null {
  const tiers = [
    { name: "Gold", emoji: "✨", threshold: 220 },
    { name: "High Gold", emoji: "🥇", threshold: 250 },
    { name: "Platinum", emoji: "🏆", threshold: 270 },
    { name: "Platinum Star", emoji: "🌟", threshold: 285 },
    { name: "Titanium", emoji: "💎", threshold: 295 },
  ];
  for (const tier of tiers) {
    if (bestScore < tier.threshold) {
      const prevThreshold = tiers[tiers.indexOf(tier) - 1]?.threshold ?? 0;
      const range = tier.threshold - prevThreshold;
      const progress = bestScore - prevThreshold;
      return {
        name: tier.name,
        emoji: tier.emoji,
        threshold: tier.threshold,
        pointsNeeded: tier.threshold - bestScore,
        pct: Math.round((progress / range) * 100),
      };
    }
  }
  return null; // Titanium or above — top tier!
}

// Motivational message based on trend and level
function getMotivation(trend: number | null, bestAward: string, winRate: number): string {
  const rank = awardRank(bestAward);
  if (trend !== null && trend > 10) return "🔥 On fire! The scores are climbing — keep this momentum going!";
  if (trend !== null && trend > 0) return "📈 Improving every time out — that consistency is everything in competition dance.";
  if (trend !== null && trend === 0) return "💪 Holding steady — now let's break through to the next level!";
  if (trend !== null && trend < 0) return "💙 Every dancer has tough weeks. Use the feedback and come back stronger!";
  if (winRate >= 75 && rank >= 3) return "⭐ Consistently earning top-tier awards — this is what dedication looks like!";
  if (rank >= 3) return "🏆 Platinum-level dancing! You should be incredibly proud of this work.";
  if (rank >= 2) return "🥇 High Gold is no joke — you're right on the edge of Platinum. Keep pushing!";
  return "✨ Every great dancer started exactly where you are. The scores will follow the work.";
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
}

// ─────────────────────────────────────────
// SVG Score Timeline Chart
// ─────────────────────────────────────────
function ScoreChart({ entries }: { entries: Array<{ label: string; score: number; award: string; date: string | null }> }) {
  if (entries.length === 0) return null;
  const W = 600, H = 200, PAD = { top: 24, right: 20, bottom: 50, left: 44 };
  const maxScore = 300;
  const minScore = Math.max(0, Math.min(...entries.map(e => e.score)) - 20);
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const xStep = entries.length > 1 ? chartW / (entries.length - 1) : chartW / 2;
  const pts = entries.map((e, i) => ({
    x: PAD.left + (entries.length > 1 ? i * xStep : chartW / 2),
    y: PAD.top + chartH - ((e.score - minScore) / (maxScore - minScore)) * chartH,
    ...e,
  }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const areaPath = `M${pts[0].x},${pts[0].y} ` +
    pts.slice(1).map(p => `L${p.x},${p.y}`).join(" ") +
    ` L${pts[pts.length - 1].x},${PAD.top + chartH} L${pts[0].x},${PAD.top + chartH} Z`;

  // Mark the peak point
  const peakIdx = pts.reduce((best, p, i) => p.score > pts[best].score ? i : best, 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet" aria-label="Score timeline chart">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.top + chartH * (1 - t);
        const val = Math.round(minScore + t * (maxScore - minScore));
        return (
          <g key={t}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="10">{val}</text>
          </g>
        );
      })}
      {/* Area fill */}
      <path d={areaPath} fill="url(#chartGrad)" />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Data points */}
      {pts.map((p, i) => (
        <g key={i}>
          {/* Peak glow */}
          {i === peakIdx && (
            <circle cx={p.x} cy={p.y} r="9" fill={awardColor(p.award).bar} opacity="0.3" />
          )}
          <circle cx={p.x} cy={p.y} r={i === peakIdx ? 6 : 5} fill={awardColor(p.award).bar} stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
          <text x={p.x} y={p.y - 12} textAnchor="middle" fill="white" fontSize="11" fontWeight="600">{p.score}</text>
          {i === peakIdx && (
            <text x={p.x} y={p.y - 23} textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="700">⭐ BEST</text>
          )}
          <text x={p.x} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9">
            {(p.label.length > 12 ? p.label.slice(0, 11) + "…" : p.label)}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────
export default async function DancerSeasonPage({
  params,
}: {
  params: Promise<{ dancerName: string }>;
}) {
  const { dancerName: encodedName } = await params;
  const dancerName = decodeURIComponent(encodedName);

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
      entry_type,
      competition_name,
      competition_date,
      status,
      created_at,
      analyses (
        id,
        total_score,
        award_level,
        judge_scores,
        improvement_priorities,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .eq("dancer_name", dancerName)
    .eq("status", "analyzed")
    .order("competition_date", { ascending: true, nullsFirst: false });

  if (!videos || videos.length === 0) notFound();

  // Build competition entries
  type Entry = {
    videoId: string;
    analysisId: string;
    routineName: string;
    style: string;
    entryType: string;
    competitionName: string;
    competitionDate: string | null;
    createdAt: string;
    score: number;
    award: string;
    judgeScores: Array<{ category: string; avg: number; max: number }> | null;
    improvementPriorities: unknown;
  };

  const entries: Entry[] = [];
  for (const video of videos) {
    const analyses = (video.analyses ?? []) as Array<{
      id: string; total_score: number; award_level: string;
      judge_scores: unknown; improvement_priorities: unknown; created_at: string;
    }>;
    const analysis = analyses[0];
    if (!analysis) continue;
    entries.push({
      videoId: video.id as string,
      analysisId: analysis.id,
      routineName: (video.routine_name as string) || "Untitled",
      style: (video.style as string) || "—",
      entryType: (video.entry_type as string) || "—",
      competitionName: (video.competition_name as string) || "Practice / Unspecified",
      competitionDate: (video.competition_date as string) || null,
      createdAt: (video.created_at as string),
      score: analysis.total_score ?? 0,
      award: analysis.award_level ?? "—",
      judgeScores: analysis.judge_scores as Entry["judgeScores"],
      improvementPriorities: analysis.improvement_priorities,
    });
  }

  if (entries.length === 0) notFound();

  // ── Core stats ──────────────────────────
  const scores = entries.map(e => e.score);
  const bestScore = Math.max(...scores);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const latestEntry = entries[entries.length - 1];
  const bestEntry = entries.reduce((best, e) => e.score > best.score ? e : best, entries[0]);
  const competitions = [...new Set(entries.map(e => e.competitionName))].filter(c => c !== "Practice / Unspecified");
  const styles = [...new Set(entries.map(e => e.style))];
  const bestAward = entries.reduce((best, e) => awardRank(e.award) > awardRank(best.award) ? e : best, entries[0]).award;
  const firstScore = entries[0].score;

  // Trend: latest vs first
  const scoreTrend = entries.length >= 2 ? entries[entries.length - 1].score - entries[0].score : null;

  // Improvement %
  const improvePct = entries.length >= 2 && firstScore > 0
    ? Math.round(((bestScore - firstScore) / firstScore) * 100)
    : null;

  // Win rate: % of entries at Platinum or above
  const topTierCount = entries.filter(e => awardRank(e.award) >= 3).length;
  const winRate = entries.length > 0 ? Math.round((topTierCount / entries.length) * 100) : 0;

  // Next award level
  const next = nextAwardInfo(bestScore);

  // Milestones
  const isNewPB = entries.length >= 2 && latestEntry.score === bestScore;
  const uniqueAwardLevels = [...new Set(entries.map(e => e.award))];
  const highestRankUnique = uniqueAwardLevels.reduce((best, a) => awardRank(a) > awardRank(best) ? a : best, uniqueAwardLevels[0]);
  const firstTimeHighest = entries.findIndex(e => e.award === highestRankUnique) === entries.length - 1 && entries.length > 1;

  // Trophy wall — tally each award
  const trophyTally: Record<string, number> = {};
  for (const e of entries) {
    const key = e.award;
    trophyTally[key] = (trophyTally[key] || 0) + 1;
  }
  const trophyRows = Object.entries(trophyTally).sort((a, b) => awardRank(b[0]) - awardRank(a[0]));

  // Consecutive improvement streak
  let streak = 0;
  for (let i = entries.length - 1; i > 0; i--) {
    if (entries[i].score > entries[i - 1].score) streak++;
    else break;
  }

  // Category averages
  const categoryTotals: Record<string, { total: number; max: number; count: number }> = {};
  for (const entry of entries) {
    if (!entry.judgeScores) continue;
    for (const cat of entry.judgeScores) {
      if (!categoryTotals[cat.category]) categoryTotals[cat.category] = { total: 0, max: cat.max, count: 0 };
      categoryTotals[cat.category].total += cat.avg;
      categoryTotals[cat.category].count += 1;
    }
  }
  const categoryAverages = Object.entries(categoryTotals).map(([cat, data]) => ({
    category: cat,
    avg: Math.round((data.total / data.count) * 10) / 10,
    max: data.max,
    pct: Math.round((data.total / data.count / data.max) * 100),
  })).sort((a, b) => b.pct - a.pct);

  // Chart data
  const chartEntries = entries.map(e => ({
    label: e.competitionName,
    score: e.score,
    award: e.award,
    date: e.competitionDate || e.createdAt,
  }));

  const studioName = (videos[0]?.studio_name as string) || null;
  const ageGroup = (videos[0]?.age_group as string) || "—";
  const motivationalMsg = getMotivation(scoreTrend, bestAward, winRate);

  return (
    <div className="min-h-screen py-10 px-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent-500/8 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-gold-500/8 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl">

        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dancers" className="flex items-center gap-1.5 text-sm text-surface-200 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Season Tracker
          </Link>
          <Link href="/" className="flex items-center gap-2 text-surface-200 hover:text-white transition-colors text-sm">
            <Sparkles className="h-4 w-4 text-primary-400" />
            <span className="font-bold">Routine<span className="text-primary-400">X</span></span>
          </Link>
        </div>

        {/* ── Celebration Banner (milestone moments) ── */}
        {(isNewPB || firstTimeHighest || streak >= 3) && (
          <div className="mb-5 rounded-2xl border border-gold-400/30 bg-gradient-to-r from-gold-500/15 via-accent-500/10 to-primary-500/15 p-4 flex items-center gap-3">
            <span className="text-2xl shrink-0">
              {isNewPB ? "🎉" : firstTimeHighest ? "🏆" : "🔥"}
            </span>
            <div>
              <p className="font-bold text-white">
                {isNewPB && `New Personal Best for ${dancerName}!`}
                {!isNewPB && firstTimeHighest && `First ever ${highestRankUnique} for ${dancerName}!`}
                {!isNewPB && !firstTimeHighest && streak >= 3 && `${streak} improvements in a row!`}
              </p>
              <p className="text-sm text-gold-300/80">
                {isNewPB && `${latestEntry.score} pts at ${latestEntry.competitionName} — a new season high!`}
                {!isNewPB && firstTimeHighest && `What a moment. ${dancerName} has worked hard for this. ${awardEmoji(highestRankUnique)}`}
                {!isNewPB && !firstTimeHighest && streak >= 3 && `Consistent growth is the hallmark of champions. Keep going! 💪`}
              </p>
            </div>
          </div>
        )}

        {/* ── Hero Header ───────────────────────────── */}
        <div className="glass rounded-3xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-gold-500/10 pointer-events-none" />
          <div className="relative">
            {/* Name + award */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
                    {dancerName}
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border ${awardColor(bestAward).badge}`}>
                    {awardEmoji(bestAward)} Season Best: {bestAward}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-surface-200">
                  {studioName && (
                    <span className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-gold-400" />
                      {studioName}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary-400" />
                    {ageGroup}
                  </span>
                  {styles.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Music className="h-3.5 w-3.5 text-accent-400" />
                      {styles.join(", ")}
                    </span>
                  )}
                </div>
              </div>

              {/* Trend pill */}
              {scoreTrend !== null && (
                <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${scoreTrend >= 0 ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"}`}>
                  <TrendingUp className={`h-5 w-5 ${scoreTrend < 0 ? "rotate-180" : ""}`} />
                  <div className="text-right">
                    <p className="text-xl font-bold">{scoreTrend > 0 ? "+" : ""}{scoreTrend} pts</p>
                    <p className="text-xs opacity-80">Season Progress</p>
                  </div>
                </div>
              )}
            </div>

            {/* Motivational message */}
            <div className="flex items-start gap-2 bg-white/5 rounded-xl px-4 py-3 mt-2">
              <Heart className="h-4 w-4 text-accent-400 shrink-0 mt-0.5" />
              <p className="text-sm text-surface-200 italic">{motivationalMsg}</p>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Season Best", value: bestScore, sub: "/ 300", icon: Trophy, color: "text-gold-400", gradient: true },
            { label: "Season Average", value: avgScore, sub: "/ 300", icon: BarChart3, color: "text-primary-400", gradient: false },
            { label: "Analyses Done", value: entries.length, sub: entries.length === 1 ? "routine" : "routines", icon: Award, color: "text-accent-400", gradient: false },
            { label: "Competitions", value: competitions.length || entries.length, sub: competitions.length ? "events" : "sessions", icon: Calendar, color: "text-violet-400", gradient: false },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5 text-center">
              <stat.icon className={`mx-auto h-5 w-5 ${stat.color} mb-2`} />
              <p className={`text-2xl font-bold ${stat.gradient ? "gradient-text" : "text-white"}`}>{stat.value}</p>
              <p className="text-xs text-surface-200 mt-0.5">{stat.sub}</p>
              <p className="text-xs text-surface-200/70 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Extra season metrics ──────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Win rate */}
          {entries.length >= 2 && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-gold-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-surface-200">Top-Tier Rate</span>
              </div>
              <p className="text-3xl font-bold gradient-text">{winRate}%</p>
              <p className="text-xs text-surface-200 mt-1">Platinum or above in {topTierCount}/{entries.length} routines</p>
            </div>
          )}

          {/* Season improvement */}
          {improvePct !== null && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-surface-200">Season Growth</span>
              </div>
              <p className={`text-3xl font-bold ${improvePct >= 0 ? "text-green-400" : "text-red-400"}`}>
                {improvePct > 0 ? "+" : ""}{improvePct}%
              </p>
              <p className="text-xs text-surface-200 mt-1">From first ({firstScore}) to best ({bestScore})</p>
            </div>
          )}

          {/* Streak */}
          {streak >= 2 && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-accent-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-surface-200">Hot Streak</span>
              </div>
              <p className="text-3xl font-bold gradient-text">{streak}🔥</p>
              <p className="text-xs text-surface-200 mt-1">Consecutive improvements in a row</p>
            </div>
          )}
        </div>

        {/* ── Next Award Level Progress ──────────────── */}
        {next ? (
          <div className="glass rounded-3xl p-6 mb-6 border border-gold-500/20 bg-gold-500/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-gold-400" />
                <h2 className="text-lg font-bold">Next Milestone</h2>
              </div>
              <span className="text-2xl">{next.emoji}</span>
            </div>
            <p className="text-surface-200 text-sm mb-4">
              <span className="text-white font-semibold text-base">{next.pointsNeeded} more points</span>
              {" "}to reach <span className="text-white font-semibold">{next.name}</span>
              {next.pointsNeeded <= 5 && <span className="text-gold-300 font-bold"> — SO CLOSE! 🎯</span>}
              {next.pointsNeeded <= 15 && next.pointsNeeded > 5 && <span className="text-accent-300"> — within reach! 💪</span>}
            </p>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 via-accent-400 to-gold-400 transition-all"
                style={{ width: `${next.pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-surface-200/60">
              <span>Current best: {bestScore}</span>
              <span>{next.pct}% of the way there</span>
              <span>Goal: {next.threshold}</span>
            </div>
          </div>
        ) : null}

        {/* ── Trophy Wall ───────────────────────────── */}
        <div className="glass rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-gold-400" />
            <h2 className="text-lg font-bold">Trophy Wall</h2>
            <span className="text-xs text-surface-200 ml-auto">{entries.length} total awards earned</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {trophyRows.map(([award, count]) => (
              <div key={award} className={`flex items-center gap-2 rounded-2xl border px-4 py-3 ${awardColor(award).badge}`}>
                <span className="text-xl">{awardEmoji(award)}</span>
                <div>
                  <p className="text-xs font-semibold leading-none">{award}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{count}× earned</p>
                </div>
              </div>
            ))}
          </div>
          {trophyRows.length === 0 && (
            <p className="text-surface-200 text-sm">No awards yet — upload a routine to start your trophy collection!</p>
          )}
        </div>

        {/* ── Best Performance Spotlight ──────────────── */}
        <div className="rounded-3xl p-6 mb-6 bg-gradient-to-br from-gold-500/10 via-accent-500/5 to-primary-500/10 border border-gold-400/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⭐</span>
            <h2 className="text-lg font-bold">Best Performance This Season</h2>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-2xl font-bold">{bestEntry.routineName}</p>
              <p className="text-surface-200 mt-1">{bestEntry.competitionName}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full border ${awardColor(bestEntry.award).badge}`}>
                  {awardEmoji(bestEntry.award)} {bestEntry.award}
                </span>
                {bestEntry.style !== "—" && (
                  <span className="text-xs text-surface-200 bg-white/5 rounded-full px-2 py-1">{bestEntry.style}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold gradient-text">{bestEntry.score}</p>
              <p className="text-xs text-surface-200 mt-1">out of 300</p>
              <Link
                href={`/analysis/${bestEntry.videoId}`}
                className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors mt-2"
              >
                Full Report <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Score Timeline ────────────────────────── */}
        {entries.length > 1 && (
          <div className="glass rounded-3xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-400" />
              Score Timeline
            </h2>
            <p className="text-xs text-surface-200 mb-4">Scores across all competitions this season</p>
            <ScoreChart entries={chartEntries} />
          </div>
        )}

        {/* ── Category Strengths ───────────────────── */}
        {categoryAverages.length > 0 && (
          <div className="glass rounded-3xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent-400" />
              Category Breakdown
            </h2>
            <p className="text-xs text-surface-200 mb-5">Season averages across all {entries.length} {entries.length === 1 ? "analysis" : "analyses"}</p>
            <div className="space-y-4">
              {categoryAverages.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{cat.category}</span>
                    <span className="text-sm font-bold">
                      <span className="gradient-text">{cat.avg}</span>
                      <span className="text-surface-200 font-normal"> / {cat.max}</span>
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${cat.pct}%`,
                        background: cat.pct >= 90 ? "linear-gradient(90deg,#10b981,#34d399)" :
                          cat.pct >= 75 ? "linear-gradient(90deg,#8b5cf6,#ec4899)" :
                          "linear-gradient(90deg,#f59e0b,#fbbf24)"
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[10px] text-surface-200/60">
                      {cat.pct >= 90 ? "🔥 Excellent" : cat.pct >= 75 ? "✨ Strong" : cat.pct >= 60 ? "📈 Growing" : "💪 Focus Area"}
                    </span>
                    <span className="text-[10px] text-surface-200/60">{cat.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Competition History ──────────────────── */}
        <div className="glass rounded-3xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gold-400" />
            Competition History
          </h2>
          <p className="text-xs text-surface-200 mb-5">Full record of every routine analyzed this season</p>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="pb-3 text-xs text-surface-200 font-semibold uppercase tracking-wider">Date</th>
                  <th className="pb-3 text-xs text-surface-200 font-semibold uppercase tracking-wider">Competition</th>
                  <th className="pb-3 text-xs text-surface-200 font-semibold uppercase tracking-wider">Routine</th>
                  <th className="pb-3 text-xs text-surface-200 font-semibold uppercase tracking-wider">Style</th>
                  <th className="pb-3 text-xs text-surface-200 font-semibold uppercase tracking-wider text-right">Score</th>
                  <th className="pb-3 text-xs text-surface-200 font-semibold uppercase tracking-wider">Award</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...entries].reverse().map((entry, i) => {
                  const isBest = entry.videoId === bestEntry.videoId;
                  return (
                    <tr key={entry.videoId} className={`group ${isBest ? "bg-gold-500/5" : ""}`}>
                      <td className="py-3.5 text-surface-200">
                        {formatDate(entry.competitionDate || entry.createdAt)}
                      </td>
                      <td className="py-3.5 font-medium max-w-[160px]">
                        <span className="truncate block">{entry.competitionName}</span>
                        {isBest && <span className="text-[10px] text-gold-400 font-bold">⭐ Personal Best</span>}
                      </td>
                      <td className="py-3.5 text-surface-200 max-w-[140px] truncate">{entry.routineName}</td>
                      <td className="py-3.5 text-surface-200">{entry.style}</td>
                      <td className="py-3.5 text-right">
                        <span className="font-bold gradient-text">{entry.score}</span>
                        <span className="text-surface-200 text-xs"> /300</span>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${awardColor(entry.award).badge}`}>
                          {awardEmoji(entry.award)} {entry.award}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <Link
                          href={`/analysis/${entry.videoId}`}
                          className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Full Report <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {[...entries].reverse().map((entry) => {
              const isBest = entry.videoId === bestEntry.videoId;
              return (
                <Link
                  key={entry.videoId}
                  href={`/analysis/${entry.videoId}`}
                  className={`flex items-start justify-between gap-3 rounded-xl p-4 hover:bg-white/10 transition-colors ${isBest ? "bg-gold-500/10 border border-gold-400/20" : "bg-white/5"}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold truncate">{entry.competitionName}</p>
                      {isBest && <span className="text-[10px] text-gold-400 font-bold shrink-0">⭐ PB</span>}
                    </div>
                    <p className="text-xs text-surface-200 mt-0.5 truncate">{entry.routineName} · {entry.style}</p>
                    <p className="text-xs text-surface-200/60 mt-0.5">{formatDate(entry.competitionDate || entry.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold gradient-text text-lg">{entry.score}</p>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${awardColor(entry.award).badge}`}>
                      {awardEmoji(entry.award)} {entry.award}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Focus for Next Competition ───────────── */}
        {latestEntry.improvementPriorities && Array.isArray(latestEntry.improvementPriorities) && latestEntry.improvementPriorities.length > 0 && (
          <div className="glass rounded-3xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent-400" />
              Focus for Next Competition
            </h2>
            <p className="text-xs text-surface-200 mb-1">Top improvement areas from the most recent analysis</p>
            <p className="text-xs text-surface-200/60 italic mb-4">
              &quot;Champions don&apos;t become champions in the ring — they become champions in training.&quot;
            </p>
            <div className="space-y-3">
              {(latestEntry.improvementPriorities as Array<{ priority: string; description?: string } | string>).slice(0, 4).map((item, i) => {
                const text = typeof item === "string" ? item : (item?.priority ?? String(item));
                const desc = typeof item === "object" ? item?.description : undefined;
                return (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-accent-300 text-xs font-bold">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{text}</p>
                      {desc && <p className="text-xs text-surface-200 mt-0.5">{desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Actions ──────────────────────────────── */}
        <div className="flex flex-wrap gap-3 justify-center pb-4">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-7 py-3.5 font-bold text-white hover:opacity-90 transition-opacity"
          >
            <Sparkles className="h-4 w-4" />
            Analyze Another Routine
          </Link>
          <Link
            href={`/analysis/${bestEntry.videoId}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 font-semibold hover:bg-white/5 transition-colors"
          >
            <Trophy className="h-4 w-4 text-gold-400" />
            View Best Performance
          </Link>
        </div>

      </div>
    </div>
  );
}
