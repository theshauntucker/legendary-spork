"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Award, Target, BarChart3, Sparkles, Lightbulb, Zap, Clock, ChevronRight, RefreshCw } from "lucide-react";

interface ImprovementPriority {
  priority: number;
  item: string;
  impact?: string;
  timeToFix?: string;
  trainingTip?: string;
}

interface Submission {
  videoId: string;
  date: string;
  totalScore: number;
  awardLevel: string;
  dancerName?: string;
  studioName?: string;
  judgeScores: Array<{ category: string; avg: number; max: number }>;
  improvementPriorities: ImprovementPriority[];
  timelineNotes: Array<{ time: string; note: string }>;
}

// ── Judge Tips by style ─────────────────────────────────────────────────────
const JUDGE_TIPS: Record<string, string[]> = {
  "Jazz": [
    "Your energy should peak at every musical accent — judges feel it when you nail the hit.",
    "Clean transitions score higher than flashy tricks with sloppy exits.",
    "Spot your turns — every wobble is a deduction in a judge's mind.",
    "Jazz hands are technique, not an afterthought — every finger tells the story.",
  ],
  "Contemporary": [
    "The floor is part of your stage — use levels with intention, not just habit.",
    "Breath is visible from the front row. Let your phrase endings land.",
    "Judges notice when you're 'doing' the movement vs. living it — be in it.",
    "Your stillness is as powerful as your movement. Own every pause.",
  ],
  "Lyrical": [
    "Connect to the lyric before the movement — your face should tell the story first.",
    "Your arms should have a beginning, middle, and end — incomplete lines lose points.",
    "The moment before you move is scored just as much as the movement itself.",
    "Judges want to feel something. If you're not feeling it, they won't either.",
  ],
  "Hip Hop": [
    "Find the pocket — groove is felt, not just seen. Rushing is the #1 deduction.",
    "Hit every 8-count with intention. Judges reward commitment over tricks.",
    "Your whole body should reflect the style — even your face is part of the vibe.",
    "Cleaner is always better. Lock it before you layer complexity on top.",
  ],
  "Tap": [
    "Every sound is a note — your feet are the instrument. Judges are listening.",
    "Weight placement is everything. Most mistakes start with where your weight is.",
    "Clarity over speed. A clean slow combination beats muddy fast footwork.",
    "Your arms and upper body frame the sound — don't neglect them.",
  ],
  "Ballet": [
    "Your line continues past your fingertips and pointed toe — extend everything.",
    "Judges follow the line of your head, neck, and spine before your legs.",
    "Epaulement is not optional — it's what separates ballet from gymnastics.",
    "Placement first, everything else second. Technique is the foundation judges build on.",
  ],
  "Musical Theater": [
    "If your face doesn't say it, your body can't save it. Commit to the character.",
    "Project to the back of the house — every movement should read from row 20.",
    "Your exit is as important as your entrance. Stay in character until you're offstage.",
    "Judges want a story. Give them a beginning, a conflict, and a resolution.",
  ],
  "default": [
    "Your entrance and exit are scored — be 'on' before you hit your opening position.",
    "Judges watch the corners and wings. Don't throw away movements near the edges.",
    "The best technique in the room means nothing without performance energy behind it.",
    "Consistency beats brilliance in competition — clean and consistent wins divisions.",
  ],
};

function getJudgeTips(style: string): string[] {
  const tips = JUDGE_TIPS[style] || JUDGE_TIPS["default"];
  // Always return exactly 3 tips
  return tips.slice(0, 3);
}

interface Props {
  routineName: string;
  style: string;
  entryType: string;
  ageGroup: string;
  choreographer?: string;
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

// ── Coach Card ──────────────────────────────────────────────────────────────
function CoachCard({ priority, isFirst }: { priority: ImprovementPriority; isFirst: boolean }) {
  const impactColor =
    priority.impact === "High" ? "text-red-400 bg-red-400/10 border-red-400/20" :
    priority.impact === "Medium" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
    "text-green-400 bg-green-400/10 border-green-400/20";

  return (
    <div className={`rounded-2xl p-5 border transition-all ${isFirst ? "border-primary-500/30 bg-primary-500/5" : "border-white/8 bg-white/[0.03]"}`}>
      <div className="flex items-start gap-4">
        {/* Priority number */}
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${isFirst ? "bg-primary-500/30 text-primary-300" : "bg-white/8 text-surface-200"}`}>
          {priority.priority}
        </div>
        <div className="flex-1 min-w-0">
          {/* Item title */}
          <p className="font-semibold text-white text-sm leading-snug mb-2">{priority.item}</p>
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {priority.impact && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${impactColor}`}>
                <Zap className="h-2.5 w-2.5" />
                {priority.impact} Impact
              </span>
            )}
            {priority.timeToFix && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/10 text-surface-200">
                <Clock className="h-2.5 w-2.5" />
                {priority.timeToFix}
              </span>
            )}
          </div>
          {/* Training tip */}
          {priority.trainingTip && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/5 border border-white/8">
              <Lightbulb className="h-3.5 w-3.5 text-gold-400 shrink-0 mt-0.5" />
              <p className="text-xs text-surface-200 leading-relaxed">{priority.trainingTip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Judge Tip Card ───────────────────────────────────────────────────────────
function JudgeTipCard({ tip, index }: { tip: string; index: number }) {
  const accents = [
    "border-primary-500/20 bg-primary-500/5",
    "border-accent-500/20 bg-accent-500/5",
    "border-gold-500/20 bg-gold-500/5",
  ];
  const icons = ["👁️", "⭐", "🎯"];
  return (
    <div className={`rounded-xl p-4 border ${accents[index % 3]}`}>
      <div className="text-lg mb-2">{icons[index % 3]}</div>
      <p className="text-xs text-surface-100 leading-relaxed">{tip}</p>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function RoutineProgressClient({ routineName, style, entryType, ageGroup, choreographer, submissions }: Props) {
  const latest = submissions[submissions.length - 1];
  const first = submissions[0];
  const prev = submissions.length > 1 ? submissions[submissions.length - 2] : null;
  const totalDelta = latest.totalScore - first.totalScore;
  const bestScore = Math.max(...submissions.map((s) => s.totalScore));
  const award = awardConfig(latest.awardLevel);

  const roadmap = ["Gold", "High Gold", "Platinum", "Diamond"];

  // Build the "Submit Improved Routine" URL — everything pre-filled + parent linked
  const uploadParams = new URLSearchParams({
    parentVideoId: submissions[submissions.length - 1].videoId,
    routineName,
    style,
    entryType,
    ageGroup,
    ...(choreographer ? { choreographer } : {}),
    ...(submissions[submissions.length - 1].dancerName ? { dancerName: submissions[submissions.length - 1].dancerName! } : {}),
    ...(submissions[submissions.length - 1].studioName ? { studioName: submissions[submissions.length - 1].studioName! } : {}),
  });
  const improvedUploadUrl = `/upload?${uploadParams.toString()}`;
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
                {choreographer && <span className="text-surface-200"> · Choreo: <span className="text-white font-medium">{choreographer}</span></span>}
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

        {/* Submit Improved Routine CTA */}
        <motion.a
          href={improvedUploadUrl}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="mb-6 flex items-center justify-between rounded-2xl p-5 border border-primary-500/30 bg-gradient-to-r from-primary-500/10 via-accent-500/5 to-primary-500/10 hover:border-primary-500/60 transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shrink-0">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Submit Improved Routine</p>
              <p className="text-xs text-surface-200 mt-0.5">
                Routine pre-linked · All fields auto-filled · Score history carried forward
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-400 group-hover:text-primary-300 transition-colors shrink-0">
            Submit
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </motion.a>

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

        {/* Coach's Playbook — full priority cards with training tips */}
        {latest.improvementPriorities.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-gold-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-surface-200">Coach&apos;s Playbook</h2>
              <span className="text-[10px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full font-bold ml-1">From your latest analysis</span>
            </div>
            <p className="text-xs text-surface-200 mb-4">
              These are your coach&apos;s specific notes from the last analysis. Work through them in order — #1 will move your score the most.
            </p>
            <div className="space-y-3">
              {latest.improvementPriorities.map((p, i) => (
                <motion.div key={p.priority}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}>
                  <CoachCard priority={p} isFirst={i === 0} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Judge Tips — style-specific reminders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="h-4 w-4 text-accent-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-surface-200">What Judges Notice</h2>
            <span className="text-[10px] bg-accent-500/20 text-accent-400 px-2 py-0.5 rounded-full font-bold ml-1">{style}</span>
          </div>
          <p className="text-xs text-surface-200 mb-4">
            3 things judges always notice in {style}. Keep these in your head every time you run it.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {getJudgeTips(style).map((tip, i) => (
              <JudgeTipCard key={i} tip={tip} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
