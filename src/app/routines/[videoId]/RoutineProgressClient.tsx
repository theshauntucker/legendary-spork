"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Award, Target, BarChart3, Sparkles } from "lucide-react";

interface Submission {
  videoId: string;
  date: string;
  totalScore: number;
  awardLevel: string;
  judgeScores: Array<{ category: string; avg: number; max: number }>;
  improvementPriorities: Array<{ priority: number; item: string }>;
  timelineNotes: Array<{ time: string; note: string }>;
}

interface Props {
  routineName: string;
  style: string;
  entryType: string;
  ageGroup: string;
  submissions: Submission[];
}

const AWARD_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; min: number }> = {
  Gold:      { label: "Gold",      color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/30", min: 260 },
  "High Gold": { label: "High Gold", color: "text-amber-400",  bg: "bg-amber-400/10",   border: "border-amber-400/30",  min: 270 },
  Platinum:  { label: "Platinum",  color: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/30",   min: 280 },
  Diamond:   { label: "Diamond",   color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/30", min: 290 },
};

function awardConfig(level: string) {
  return AWARD_CONFIG[level] ?? AWARD_CONFIG["Gold"];
}

// ── SVG Score Chart ─────────────────────────────────────────────────────────
function ScoreChart({ submissions }: { submissions: Submission[] }) {
  const W = 600, H = 200, PAD = { top: 20, right: 30, bottom: 40, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const scores = submissions.map((s) => s.totalScore);
  const minScore = Math.max(240, Math.min(...scores) - 10);
  const maxScore = Math.min(300, Math.max(...scores) + 10);

  const toX = (i: number) =>
    submissions.length === 1
      ? PAD.left + innerW / 2
      : PAD.left + (i / (submissions.length - 1)) * innerW;

  const toY = (score: number) =>
    PAD.top + innerH - ((score - minScore) / (maxScore - minScore)) * innerH;

  const points = submissions.map((s, i) => ({ x: toX(i), y: toY(s.totalScore), s }));
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M ${points[0].x},${PAD.top + innerH} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x},${PAD.top + innerH} Z`;

  // Award level bands
  const bands = [
    { label: "Diamond", min: 290, color: "rgba(167,139,250,0.06)" },
    { label: "Platinum", min: 280, color: "rgba(34,211,238,0.06)" },
    { label: "High Gold", min: 270, color: "rgba(251,191,36,0.06)" },
    { label: "Gold", min: 260, color: "rgba(250,204,21,0.04)" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Award bands */}
      {bands.map((band) => {
        const bandMin = Math.max(band.min, minScore);
        const bandMax = Math.min(band.min + 10, maxScore);
        if (bandMin >= maxScore || bandMax <= minScore) return null;
        const y1 = toY(bandMax);
        const y2 = toY(bandMin);
        return (
          <rect key={band.label} x={PAD.left} y={y1} width={innerW} height={y2 - y1}
            fill={band.color} />
        );
      })}

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const score = Math.round(minScore + t * (maxScore - minScore));
        const y = toY(score);
        return (
          <g key={t}>
            <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end"
              className="fill-surface-200" style={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }}>
              {score}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={area} fill="url(#lineGrad)" />

      {/* Line */}
      {submissions.length > 1 && (
        <polyline points={polyline} fill="none"
          stroke="url(#strokeGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={6} fill="#0a0a0a" stroke="#8B5CF6" strokeWidth="2.5" />
          <circle cx={p.x} cy={p.y} r={2.5} fill="#8B5CF6" />
          <text x={p.x} y={p.y - 12} textAnchor="middle"
            style={{ fontSize: 10, fontWeight: 700, fill: "rgba(255,255,255,0.9)" }}>
            {p.s.totalScore}
          </text>
          {/* Date label */}
          <text x={p.x} y={PAD.top + innerH + 18} textAnchor="middle"
            style={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }}>
            {new Date(p.s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Category Comparison Bar ──────────────────────────────────────────────────
function CategoryBar({ label, prev, curr, max }: { label: string; prev?: number; curr: number; max: number }) {
  const delta = prev !== undefined ? curr - prev : null;
  const pct = (curr / max) * 100;
  const prevPct = prev !== undefined ? (prev / max) * 100 : null;

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-surface-200 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {delta !== null && (
            <span className={`text-xs font-bold ${delta > 0 ? "text-green-400" : delta < 0 ? "text-red-400" : "text-surface-200"}`}>
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(delta).toFixed(1)}
            </span>
          )}
          <span className="text-xs font-bold text-white">{curr.toFixed(1)}<span className="text-surface-200 font-normal">/{max}</span></span>
        </div>
      </div>
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        {prevPct !== null && (
          <div className="absolute h-full bg-white/10 rounded-full transition-all"
            style={{ width: `${prevPct}%` }} />
        )}
        <div className="absolute h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function RoutineProgressClient({ routineName, style, entryType, ageGroup, submissions }: Props) {
  const latest = submissions[submissions.length - 1];
  const first = submissions[0];
  const prev = submissions.length > 1 ? submissions[submissions.length - 2] : null;
  const totalDelta = latest.totalScore - first.totalScore;
  const bestScore = Math.max(...submissions.map((s) => s.totalScore));
  const award = awardConfig(latest.awardLevel);

  const roadmap = ["Gold", "High Gold", "Platinum", "Diamond"];
  const currentLevel = roadmap.indexOf(latest.awardLevel);

  // Next milestone
  const nextLevel = roadmap[Math.min(currentLevel + 1, roadmap.length - 1)];
  const nextMin = AWARD_CONFIG[nextLevel]?.min ?? 300;
  const ptsToNext = Math.max(0, nextMin - latest.totalScore);

  const prevJudgeScores = useMemo(() =>
    prev ? Object.fromEntries(prev.judgeScores.map((j) => [j.category, j.avg])) : {},
    [prev]
  );

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <motion.a href="/dashboard" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 text-sm text-surface-200 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </motion.a>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-primary-400" />
                <span className="text-xs text-surface-200 uppercase tracking-widest">Routine Progress</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">
                {routineName}
              </h1>
              <p className="text-surface-200 mt-1 text-sm">
                {style} · {entryType} · {ageGroup} · {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${award.bg} ${award.border}`}>
              <Award className={`h-4 w-4 ${award.color}`} />
              <span className={`font-bold text-sm ${award.color}`}>{latest.awardLevel}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Current Score", value: latest.totalScore, sub: "/ 300" },
            { label: "Starting Score", value: first.totalScore, sub: "/ 300" },
            { label: "Best Score", value: bestScore, sub: "/ 300" },
            {
              label: "Total Progress",
              value: `${totalDelta >= 0 ? "+" : ""}${totalDelta}`,
              sub: "pts",
              highlight: totalDelta > 0,
            },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center">
              <p className={`text-2xl font-bold ${stat.highlight ? "text-green-400" : "gradient-text"}`}>
                {stat.value}
              </p>
              <p className="text-xs text-surface-200">{stat.sub}</p>
              <p className="text-[10px] text-surface-200 mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Score Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-surface-200 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary-400" /> Score Journey
          </h2>
          <ScoreChart submissions={submissions} />
        </motion.div>

        {/* Roadmap strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {roadmap.map((level, i) => {
              const cfg = awardConfig(level);
              const isCurrent = level === latest.awardLevel;
              const isPast = roadmap.indexOf(latest.awardLevel) > i;
              return (
                <React.Fragment key={level}>
                  <div className={`flex flex-col items-center gap-1 ${isCurrent ? "" : isPast ? "opacity-40" : "opacity-20"}`}>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${isCurrent ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-offset-1 ring-offset-black ${cfg.border}` : "border-white/10 text-surface-200"}`}>
                      {isCurrent && "✦ "}{level}
                    </div>
                    {isCurrent && ptsToNext > 0 && (
                      <span className="text-[9px] text-surface-200">{ptsToNext} pts to {nextLevel}</span>
                    )}
                    {isCurrent && ptsToNext === 0 && (
                      <span className="text-[9px] text-green-400">Max level! 💎</span>
                    )}
                  </div>
                  {i < roadmap.length - 1 && (
                    <div className={`flex-1 h-px min-w-[12px] ${isPast || isCurrent ? "bg-gradient-to-r from-primary-500/50 to-white/10" : "bg-white/5"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>

        {/* Category Breakdown */}
        {latest.judgeScores.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-surface-200 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent-400" />
              {prev ? "Category Improvement" : "Category Scores"}
            </h2>
            {prev && (
              <p className="text-xs text-surface-200 mb-4">
                Comparing latest submission vs previous — purple bar is current, gray is previous.
              </p>
            )}
            {latest.judgeScores.map((j) => (
              <CategoryBar key={j.category} label={j.category}
                curr={j.avg} max={j.max}
                prev={prevJudgeScores[j.category]} />
            ))}
          </motion.div>
        )}

        {/* Submissions Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-surface-200 mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary-400" /> All Submissions
          </h2>
          <div className="space-y-3">
            {[...submissions].reverse().map((sub, i) => {
              const subIdx = submissions.indexOf(sub);
              const prevSub = subIdx > 0 ? submissions[subIdx - 1] : null;
              const delta = prevSub ? sub.totalScore - prevSub.totalScore : null;
              const cfg = awardConfig(sub.awardLevel);
              const isLatest = i === 0;

              return (
                <motion.div key={sub.videoId}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  className={`glass rounded-2xl p-4 border ${isLatest ? "border-primary-500/30" : "border-white/5"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs text-surface-200">
                          {new Date(sub.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                        {isLatest && (
                          <span className="text-[10px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full font-bold">
                            Latest
                          </span>
                        )}
                      </div>
                      {sub.improvementPriorities.slice(0, 2).map((p) => (
                        <p key={p.priority} className="text-xs text-surface-200 flex items-start gap-1.5 mb-1">
                          <span className="text-primary-400 mt-0.5">→</span>
                          {p.item}
                        </p>
                      ))}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        {delta !== null && (
                          <span className={`text-xs font-bold ${delta > 0 ? "text-green-400" : delta < 0 ? "text-red-400" : "text-surface-200"}`}>
                            {delta > 0 ? <TrendingUp className="inline h-3 w-3 mr-0.5" /> : delta < 0 ? <TrendingDown className="inline h-3 w-3 mr-0.5" /> : <Minus className="inline h-3 w-3 mr-0.5" />}
                            {delta >= 0 ? "+" : ""}{delta} pts
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold gradient-text">{sub.totalScore}</p>
                      <p className="text-[10px] text-surface-200 mb-1">/ 300</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {sub.awardLevel}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
                    <a href={`/analysis/${sub.videoId}`}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                      View full analysis →
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Latest coaching priorities */}
        {latest.improvementPriorities.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass rounded-2xl p-6 border border-primary-500/20">
            <h2 className="text-sm font-bold uppercase tracking-widest text-surface-200 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold-400" /> Current Focus Areas
            </h2>
            <p className="text-xs text-surface-200 mb-4">
              Based on your most recent analysis — work these in order for maximum score improvement.
            </p>
            <div className="space-y-3">
              {latest.improvementPriorities.map((p) => (
                <div key={p.priority} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 text-[10px] font-bold flex items-center justify-center">
                    {p.priority}
                  </span>
                  <p className="text-sm text-surface-100">{p.item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
