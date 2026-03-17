"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Star,
  BarChart3,
  Sparkles,
  Download,
  Share2,
  ArrowLeft,
  Check,
  Bot,
  Cpu,
} from "lucide-react";

interface JudgeScore {
  category: string;
  max: number;
  judges: number[];
  avg: number;
  feedback: string;
}

interface TimelineNote {
  time: string;
  note: string;
  type: string;
}

interface ImprovementItem {
  priority: number;
  item: string;
  impact: string;
  timeToFix: string;
}

interface AnalysisFrame {
  timestamp: number;
  label: string;
  url: string;
}

interface AnalysisData {
  id: string;
  routineName: string;
  dancerName: string;
  ageGroup: string;
  style: string;
  entryType: string;
  duration: string;
  totalScore: number;
  awardLevel: string;
  judgeScores: JudgeScore[];
  timelineNotes: TimelineNote[];
  improvementPriorities: ImprovementItem[];
  competitionComparison: {
    yourScore: number;
    avgRegional: number;
    top10Threshold: number;
    top5Threshold: number;
  };
  analysisMethod?: "ai" | "simulated";
  frames?: AnalysisFrame[];
}

const awardLevels = [
  { label: "Gold", min: 260, max: 269, color: "bg-yellow-600" },
  { label: "High Gold", min: 270, max: 279, color: "bg-yellow-500" },
  { label: "Platinum", min: 280, max: 289, color: "bg-primary-400" },
  { label: "Diamond", min: 290, max: 300, color: "bg-gold-400" },
];

function getAwardLevel(score: number) {
  if (score >= 290) return "Diamond";
  if (score >= 280) return "Platinum";
  if (score >= 270) return "High Gold";
  return "Gold";
}

/**
 * Parse a timestamp like "0:05" or "0:10-0:15" into seconds.
 */
function parseTimestamp(time: string): number {
  // Take the first timestamp if it's a range like "0:10-0:15"
  const first = time.split("-")[0].trim();
  const parts = first.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

/**
 * Match each timeline note to a unique frame. No two notes share a thumbnail.
 */
function matchFramesToNotes(
  notes: TimelineNote[],
  frames?: AnalysisFrame[]
): Map<number, AnalysisFrame | undefined> {
  const result = new Map<number, AnalysisFrame | undefined>();
  if (!frames || frames.length === 0) {
    notes.forEach((_, i) => result.set(i, undefined));
    return result;
  }
  const used = new Set<number>();
  for (let i = 0; i < notes.length; i++) {
    const targetSec = parseTimestamp(notes[i].time);
    const candidates = frames
      .map((f) => ({ frame: f, dist: Math.abs(f.timestamp - targetSec) }))
      .filter((c) => c.dist <= 8 && !used.has(c.frame.timestamp))
      .sort((a, b) => a.dist - b.dist);
    if (candidates.length > 0) {
      used.add(candidates[0].frame.timestamp);
      result.set(i, candidates[0].frame);
    } else {
      result.set(i, undefined);
    }
  }
  return result;
}

export default function AnalysisReport({ analysis }: { analysis: AnalysisData }) {
  const awardLevel = getAwardLevel(analysis.totalScore);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${analysis.routineName} — RoutineX Analysis`,
          text: `${analysis.dancerName} scored ${analysis.totalScore}/300 (${awardLevel}) on their ${analysis.style} ${analysis.entryType}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled share dialog
    }
  };

  const handleDownload = () => {
    // Use browser's print dialog — user can "Save as PDF" for a polished report
    window.print();
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8" data-print-hide>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-surface-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </a>
          <a href="/" className="inline-flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-400" />
            <span className="font-bold">
              Routine<span className="gradient-text">X</span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Download as PDF"
            >
              <Download className="h-4 w-4 text-surface-200" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
              title="Share"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Share2 className="h-4 w-4 text-surface-200" />
              )}
            </button>
          </div>
        </div>

        {/* Analysis Report */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl overflow-hidden"
        >
          {/* Report Header */}
          <div className="bg-gradient-to-r from-primary-700/50 to-accent-600/50 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-5 w-5 text-gold-400" />
                  <span className="text-sm font-semibold text-gold-400 uppercase tracking-wider">
                    RoutineX Analysis Report
                  </span>
                </div>
                <h1 className="text-2xl font-bold">{analysis.routineName}</h1>
                <p className="text-sm text-surface-200 mt-1">
                  {analysis.dancerName} &bull; {analysis.ageGroup} &bull;{" "}
                  {analysis.style} {analysis.entryType} &bull; {analysis.duration}
                </p>
                {/* Analysis method indicator */}
                <div className="flex items-center gap-1.5 mt-2">
                  {analysis.analysisMethod === "ai" ? (
                    <>
                      <Bot className="h-3 w-3 text-green-400" />
                      <span className="text-[10px] text-green-400 font-medium">
                        AI Vision Analysis
                      </span>
                    </>
                  ) : (
                    <>
                      <Cpu className="h-3 w-3 text-surface-200/60" />
                      <span className="text-[10px] text-surface-200/60 font-medium">
                        Algorithmic Analysis (Beta)
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-5xl font-extrabold gradient-text">
                  {analysis.totalScore}
                </p>
                <p className="text-sm text-surface-200">out of 300</p>
                <span className="inline-block mt-1 rounded-full bg-white/10 px-3 py-0.5 text-xs font-bold text-primary-300">
                  {awardLevel}
                </span>
              </div>
            </div>

            {/* Award Level Bar */}
            <div className="mt-6">
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                {awardLevels.map((level) => {
                  const width = ((level.max - level.min) / 40) * 100;
                  return (
                    <div
                      key={level.label}
                      className={`${level.color} relative`}
                      style={{ width: `${width}%` }}
                      title={`${level.label}: ${level.min}–${level.max}`}
                    >
                      {level.label === awardLevel && (
                        <div className="absolute -top-1 right-0 w-1.5 h-5 bg-white rounded-full shadow-lg" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-surface-200">
                <span>Gold</span>
                <span>High Gold</span>
                <span>Platinum</span>
                <span>Diamond</span>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary-400" />
              <h2 className="text-lg font-bold">Score Breakdown by Judge</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 pr-4 text-surface-200 font-medium">Category</th>
                    <th className="text-center py-3 px-3 text-surface-200 font-medium">Judge 1</th>
                    <th className="text-center py-3 px-3 text-surface-200 font-medium">Judge 2</th>
                    <th className="text-center py-3 px-3 text-surface-200 font-medium">Judge 3</th>
                    <th className="text-center py-3 pl-3 text-white font-bold">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.judgeScores.map((row) => (
                    <tr key={row.category} className="border-b border-white/5">
                      <td className="py-3 pr-4 font-medium">
                        {row.category} <span className="text-surface-200 text-xs">(/{row.max})</span>
                      </td>
                      {row.judges.map((score, j) => (
                        <td key={j} className="text-center py-3 px-3 text-surface-200">
                          {score.toFixed(1)}
                        </td>
                      ))}
                      <td className="text-center py-3 pl-3 font-bold text-white">
                        {row.avg.toFixed(1)}
                        <div className="mt-1 mx-auto h-1 w-12 rounded-full bg-surface-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-400"
                            style={{ width: `${(row.avg / row.max) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-3 pr-4 font-bold text-lg">Total</td>
                    <td colSpan={3} />
                    <td className="text-center py-3 pl-3 font-extrabold text-lg gradient-text">
                      {analysis.totalScore}/300
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Competition Comparison */}
            <div className="mt-8 rounded-2xl bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-gold-400" />
                <h3 className="font-bold text-sm">How You Compare</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-surface-200">Your Score</p>
                  <p className="text-2xl font-bold text-white">{analysis.competitionComparison.yourScore}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-200">Regional Avg.</p>
                  <p className="text-2xl font-bold text-surface-200">{analysis.competitionComparison.avgRegional}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-200">Top 10%</p>
                  <p className="text-2xl font-bold text-gold-400">{analysis.competitionComparison.top10Threshold}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-200">Top 5%</p>
                  <p className="text-2xl font-bold text-primary-400">{analysis.competitionComparison.top5Threshold}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-accent-400" />
              <h2 className="text-lg font-bold">Detailed Feedback by Category</h2>
            </div>
            <div className="space-y-4">
              {analysis.judgeScores.map((row) => (
                <motion.div
                  key={row.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{row.category}</h3>
                    <span className="text-sm font-bold text-primary-400">
                      {row.avg.toFixed(1)}/{row.max}
                    </span>
                  </div>
                  <p className="text-sm text-surface-200 leading-relaxed">{row.feedback}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Timeline Notes with Frame Screenshots */}
          {analysis.timelineNotes.length > 0 && (
            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-gold-400" />
                <h2 className="text-lg font-bold">Timestamped Performance Notes</h2>
              </div>
              <div className="space-y-3">
                {(() => {
                  const frameMap = matchFramesToNotes(analysis.timelineNotes, analysis.frames);
                  return analysis.timelineNotes.map((note, i) => {
                    const matchedFrame = frameMap.get(i);
                    return (
                      <div key={i} className="rounded-xl bg-white/5 overflow-hidden">
                        <div className="flex gap-0">
                          {/* Frame thumbnail */}
                          {matchedFrame && (
                            <div className="relative shrink-0 w-24 sm:w-36">
                              <img
                                src={matchedFrame.url}
                                alt={`Frame at ${note.time}`}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 left-1 text-[9px] font-mono font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
                                {matchedFrame.label}
                              </span>
                            </div>
                          )}
                          {/* Note content — stacked on mobile for readability */}
                          <div className="flex flex-col gap-1 p-3 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-primary-300">
                                {note.time}
                              </span>
                              {note.type === "positive" ? (
                                <CheckCircle className="shrink-0 h-4 w-4 text-green-400" />
                              ) : (
                                <AlertCircle className="shrink-0 h-4 w-4 text-gold-400" />
                              )}
                            </div>
                            <p className="text-sm text-surface-200 leading-relaxed">{note.note}</p>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Improvement Priorities */}
          {analysis.improvementPriorities.length > 0 && (
            <div className="px-6 sm:px-8 pb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-primary-400" />
                <h2 className="text-lg font-bold">Your Improvement Roadmap</h2>
              </div>
              <div className="space-y-3">
                {analysis.improvementPriorities.map((item) => (
                  <div key={item.priority} className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-sm font-bold">
                      {item.priority}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{item.item}</p>
                      <p className="text-xs text-surface-200 mt-0.5">
                        Impact: {item.impact} &bull; Est. time: {item.timeToFix}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-surface-200" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-primary-700/30 to-accent-600/30 p-6 sm:p-8 text-center" data-print-hide>
            <p className="text-lg font-bold">Ready to analyze another routine?</p>
            <p className="text-sm text-surface-200 mt-1 mb-4">
              Track progress over time by analyzing routines regularly.
            </p>
            <a
              href="/upload"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Upload Another Routine
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
