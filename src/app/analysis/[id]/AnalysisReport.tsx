"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Download,
  Shield,
  Lock,
  Trash2,
  X,
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
  type: "positive" | "improvement";
}

interface ImprovementItem {
  priority: number;
  item: string;
  impact: string;
  timeToFix: string;
}

interface CompetitionComparison {
  yourScore: number;
  avgRegional: number;
  top10Threshold: number;
  top5Threshold: number;
}

export interface AnalysisData {
  id: string;
  routineName: string;
  dancerName: string;
  ageGroup: string;
  style: string;
  entryType: string;
  duration: string;
  totalScore: number;
  judgeScores: JudgeScore[];
  timelineNotes: TimelineNote[];
  improvementPriorities: ImprovementItem[];
  competitionComparison: CompetitionComparison;
  frames?: string[];
  framesDeleted?: boolean;
  videoId?: string;
}

const awardLevels = [
  { label: "Gold", min: 100, max: 249, color: "bg-yellow-600" },
  { label: "High Gold", min: 250, max: 264, color: "bg-yellow-500" },
  { label: "Platinum", min: 265, max: 279, color: "bg-surface-200" },
  { label: "Platinum Star", min: 280, max: 289, color: "bg-primary-400" },
  { label: "Titanium", min: 290, max: 300, color: "bg-gold-400" },
];

function getAwardLevel(score: number) {
  if (score >= 290) return "Titanium";
  if (score >= 280) return "Platinum Star";
  if (score >= 265) return "Platinum";
  if (score >= 250) return "High Gold";
  return "Gold";
}

export default function AnalysisReport({ analysis }: { analysis: AnalysisData }) {
  const awardLevel = getAwardLevel(analysis.totalScore);
  const [framesDeleted, setFramesDeleted] = useState(analysis.framesDeleted ?? false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [bannerReady, setBannerReady] = useState(false);

  // 60 second cooldown before delete button is active
  useEffect(() => {
    if (framesDeleted) {
      setBannerReady(true);
      return;
    }
    const timer = setTimeout(() => setBannerReady(true), 60000);
    return () => clearTimeout(timer);
  }, [framesDeleted]);

  // Countdown timer display
  const [countdown, setCountdown] = useState(60);
  useEffect(() => {
    if (framesDeleted || bannerReady) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [framesDeleted, bannerReady]);

  const handleDeleteFrames = async () => {
    if (!analysis.videoId) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/delete-frames", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: analysis.videoId }),
      });
      if (res.ok) {
        setFramesDeleted(true);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error("Failed to delete frames:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Privacy Banner */}
      {!framesDeleted ? (
        <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-emerald-300 font-medium">
              Your privacy is protected
            </p>
            <p className="text-xs text-emerald-300/70 mt-1">
              Thumbnail images will be automatically removed from our servers within 24 hours.
              You can also delete them immediately using the button below.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-start gap-3">
          <Lock className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-emerald-300 font-medium">
              Thumbnails deleted
            </p>
            <p className="text-xs text-emerald-300/70 mt-1">
              All thumbnail images have been permanently removed from our servers.
              Your analysis report is still available.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-6">
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 transition-colors"
          title="Download Report PDF"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
        {!framesDeleted && (
          <button
            onClick={() => bannerReady && setShowDeleteConfirm(true)}
            disabled={!bannerReady}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              bannerReady
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                : "bg-white/5 text-surface-200/50 cursor-not-allowed"
            }`}
            title={bannerReady ? "Delete thumbnails now" : `Available in ${countdown}s`}
          >
            <Trash2 className="h-4 w-4" />
            {bannerReady ? "Delete Thumbnails Now" : `Delete Thumbnails (${countdown}s)`}
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Delete Thumbnails?</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-surface-200 mb-6">
                This will permanently delete all thumbnail images from our servers.
                Your analysis report will still be available, but thumbnail previews
                will show as removed. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  Keep Thumbnails
                </button>
                <button
                  onClick={handleDeleteFrames}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete Now"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Report Card */}
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
              <p className="text-xs text-surface-200/60 mt-1">
                Analysis ID: {analysis.id}
              </p>
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
                const width = ((level.max - level.min) / 200) * 100;
                return (
                  <div
                    key={level.label}
                    className={`${level.color} relative`}
                    style={{ width: `${width}%` }}
                    title={`${level.label}: ${level.min}-${level.max}`}
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
              <span>Platinum Star</span>
              <span>Titanium</span>
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
                      {row.category}{" "}
                      <span className="text-surface-200 text-xs">(/{row.max})</span>
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
                <p className="text-2xl font-bold text-white">
                  {analysis.competitionComparison.yourScore}
                </p>
              </div>
              <div>
                <p className="text-xs text-surface-200">Regional Avg.</p>
                <p className="text-2xl font-bold text-surface-200">
                  {analysis.competitionComparison.avgRegional}
                </p>
              </div>
              <div>
                <p className="text-xs text-surface-200">Top 10%</p>
                <p className="text-2xl font-bold text-gold-400">
                  {analysis.competitionComparison.top10Threshold}
                </p>
              </div>
              <div>
                <p className="text-xs text-surface-200">Top 5%</p>
                <p className="text-2xl font-bold text-primary-400">
                  {analysis.competitionComparison.top5Threshold}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-surface-200">
              Your score is{" "}
              <span className="text-primary-400 font-semibold">
                {Math.round(
                  analysis.competitionComparison.yourScore -
                    analysis.competitionComparison.avgRegional
                )}{" "}
                points above regional average
              </span>{" "}
              and{" "}
              <span className="text-gold-400 font-semibold">
                {Math.round(
                  analysis.competitionComparison.top10Threshold -
                    analysis.competitionComparison.yourScore
                )}{" "}
                points from the top 10%
              </span>
              .
            </p>
          </div>
        </div>

        {/* Thumbnail Preview (with privacy handling) */}
        {analysis.frames && analysis.frames.length > 0 && (
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <h2 className="text-lg font-bold mb-4">Frame Previews</h2>
            <div className="grid grid-cols-4 gap-2">
              {framesDeleted
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-video rounded-lg bg-white/5 flex flex-col items-center justify-center"
                    >
                      <Lock className="h-5 w-5 text-surface-200/40 mb-1" />
                      <span className="text-[10px] text-surface-200/40">
                        Removed for privacy
                      </span>
                    </div>
                  ))
                : analysis.frames.slice(0, 4).map((frame, i) => (
                    <img
                      key={i}
                      src={frame}
                      alt={`Frame ${i + 1}`}
                      className="aspect-video rounded-lg object-cover"
                    />
                  ))}
            </div>
          </div>
        )}

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
                <p className="text-sm text-surface-200 leading-relaxed">
                  {row.feedback}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline Notes */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-gold-400" />
            <h2 className="text-lg font-bold">Timestamped Performance Notes</h2>
          </div>
          <div className="space-y-2">
            {analysis.timelineNotes.map((note, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg bg-white/5 p-3"
              >
                <span className="shrink-0 text-xs font-mono font-bold text-primary-300 w-20">
                  {note.time}
                </span>
                {note.type === "positive" ? (
                  <CheckCircle className="shrink-0 h-4 w-4 text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="shrink-0 h-4 w-4 text-gold-400 mt-0.5" />
                )}
                <span className="text-sm text-surface-200">{note.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Priorities */}
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-primary-400" />
            <h2 className="text-lg font-bold">Your Improvement Roadmap</h2>
          </div>
          <div className="space-y-3">
            {analysis.improvementPriorities.map((item) => (
              <div
                key={item.priority}
                className="flex items-center gap-4 rounded-xl bg-white/5 p-4"
              >
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

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-primary-700/30 to-accent-600/30 p-6 sm:p-8 text-center">
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
    </>
  );
}
