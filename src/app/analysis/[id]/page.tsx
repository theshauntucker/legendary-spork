"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
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
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

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

export default function AnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    // Load analysis from sessionStorage (set by upload page after analysis completes)
    const stored = sessionStorage.getItem(`analysis-${id}`);
    if (stored) {
      try {
        setAnalysis(JSON.parse(stored));
      } catch {
        setError("Failed to load analysis results.");
      }
    } else {
      setError("Analysis not found. Please upload your video again.");
    }
    setLoading(false);
  }, [id]);

  const handleShare = async () => {
    if (!analysis) return;
    const awardLvl = getAwardLevel(analysis.totalScore);
    const summary = [
      `RoutineX Analysis Report`,
      `${analysis.routineName} — ${analysis.dancerName}`,
      `${analysis.style} ${analysis.entryType} | ${analysis.ageGroup}`,
      ``,
      `Score: ${analysis.totalScore}/300 (${awardLvl})`,
      ``,
      `Top Strengths:`,
      ...analysis.strengthsSummary.map((s, i) => `${i + 1}. ${s}`),
      ``,
      `Powered by RoutineX — AI Dance Analysis`,
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: `RoutineX: ${analysis.routineName}`, text: summary });
        return;
      }
    } catch {
      // User cancelled or share failed, fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(summary);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const handleDownload = () => {
    if (!analysis) return;
    const awardLvl = getAwardLevel(analysis.totalScore);
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>RoutineX Report — ${analysis.routineName}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 24px; color: #1a1a2e; background: #fff; }
  h1 { font-size: 28px; margin: 0; } h2 { font-size: 18px; margin: 24px 0 12px; border-bottom: 2px solid #6c63ff; padding-bottom: 6px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
  .score { font-size: 48px; font-weight: 800; color: #6c63ff; } .award { display: inline-block; background: #6c63ff; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; }
  .meta { color: #666; font-size: 14px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; } th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; } th { background: #f8f8fc; font-weight: 600; font-size: 13px; }
  .strength { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; margin: 6px 0; font-size: 14px; }
  .timeline { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; } .time { font-family: monospace; font-weight: 700; color: #6c63ff; min-width: 70px; }
  .improvement { background: #f8f8fc; border-radius: 8px; padding: 12px 16px; margin: 6px 0; } .improvement .num { display: inline-block; background: #6c63ff; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; margin-right: 8px; }
  .feedback { background: #fafafa; border-radius: 8px; padding: 14px; margin: 8px 0; font-size: 14px; line-height: 1.6; }
  .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <div>
    <h1>${analysis.routineName}</h1>
    <div class="meta">${analysis.dancerName} &bull; ${analysis.ageGroup} &bull; ${analysis.style} ${analysis.entryType} &bull; ${analysis.duration}</div>
    <div class="meta" style="margin-top:2px">Analysis ID: ${id}</div>
  </div>
  <div style="text-align:right">
    <div class="score">${analysis.totalScore}</div>
    <div style="font-size:13px;color:#666">out of 300</div>
    <span class="award">${awardLvl}</span>
  </div>
</div>

<h2>Top Strengths</h2>
${analysis.strengthsSummary.map((s) => `<div class="strength">${s}</div>`).join("")}

<h2>Score Breakdown</h2>
<table>
  <thead><tr><th>Category</th><th>Max</th><th>Technician</th><th>Artist</th><th>Choreographer</th><th>Average</th></tr></thead>
  <tbody>
    ${analysis.judgeScores.map((r) => `<tr><td><strong>${r.category}</strong></td><td>${r.max}</td>${r.judges.map((j) => `<td>${j.toFixed(1)}</td>`).join("")}<td><strong>${r.avg.toFixed(1)}</strong></td></tr>`).join("")}
    <tr style="font-weight:700;font-size:16px"><td>Total</td><td>300</td><td colspan="3"></td><td>${analysis.totalScore}</td></tr>
  </tbody>
</table>

<h2>How You Compare</h2>
<table>
  <thead><tr><th>Your Score</th><th>Regional Avg.</th><th>Top 10%</th><th>Top 5%</th></tr></thead>
  <tbody><tr><td><strong>${analysis.competitionComparison.yourScore}</strong></td><td>${analysis.competitionComparison.avgRegional}</td><td>${analysis.competitionComparison.top10Threshold}</td><td>${analysis.competitionComparison.top5Threshold}</td></tr></tbody>
</table>
${analysis.competitiveEdge ? `<div class="feedback"><strong>Competitive Edge:</strong> ${analysis.competitiveEdge}</div>` : ""}

<h2>Detailed Feedback</h2>
${analysis.judgeScores.map((r) => `<div><strong>${r.category} (${r.avg.toFixed(1)}/${r.max})</strong><div class="feedback">${r.feedback}</div></div>`).join("")}

<h2>Timestamped Notes</h2>
${analysis.timelineNotes.map((n) => `<div class="timeline"><span class="time">${n.time}</span><span>${n.type === "positive" ? "+" : "!"} ${n.note}</span></div>`).join("")}

<h2>Improvement Roadmap</h2>
${analysis.improvementPriorities.map((p) => `<div class="improvement"><span class="num">${p.priority}</span><strong>${p.item}</strong><br><span style="font-size:12px;color:#666">Impact: ${p.impact} &bull; Est. time: ${p.timeToFix}</span></div>`).join("")}

<div class="footer">Generated by RoutineX — AI-Powered Dance Analysis</div>
<script>window.onload = () => window.print()</script>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-10 text-center max-w-md"
        >
          <Loader2 className="h-12 w-12 text-primary-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Analyzing Your Routine</h2>
          <p className="text-sm text-surface-200 mb-4">
            Our AI judges are reviewing your performance frame by frame. This usually takes 30-60 seconds.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-surface-200">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary-400" />
              <span>3 Expert Judges</span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-accent-400" />
              <span>4 Scoring Categories</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-10 text-center max-w-md"
        >
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-sm text-surface-200 mb-6">
            {error || "Something went wrong. Please try again."}
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/upload"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="h-4 w-4" />
              Upload & Try Again
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  const awardLevel = getAwardLevel(analysis.totalScore);

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <a
            href="/upload"
            className="inline-flex items-center gap-2 text-sm text-surface-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Upload Another
          </a>
          <a href="/" className="inline-flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-400" />
            <span className="font-bold">
              Routine<span className="gradient-text">X</span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Download Report">
              <Download className="h-4 w-4 text-surface-200" />
            </button>
            <button onClick={handleShare} className="p-2 rounded-lg hover:bg-white/10 transition-colors relative" title="Share">
              <Share2 className="h-4 w-4 text-surface-200" />
              {shareToast && (
                <span className="absolute -bottom-8 right-0 whitespace-nowrap rounded-lg bg-green-500 px-2 py-1 text-xs font-medium text-white">
                  Copied!
                </span>
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
                <h1 className="text-2xl font-bold">
                  {analysis.routineName}
                </h1>
                <p className="text-sm text-surface-200 mt-1">
                  {analysis.dancerName} &bull; {analysis.ageGroup} &bull;{" "}
                  {analysis.style} {analysis.entryType} &bull;{" "}
                  {analysis.duration}
                </p>
                <p className="text-xs text-surface-200/60 mt-1">
                  Analysis ID: {id}
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
                <span>Platinum Star</span>
                <span>Titanium</span>
              </div>
            </div>
          </div>

          {/* Top Strengths */}
          {analysis.strengthsSummary && analysis.strengthsSummary.length > 0 && (
            <div className="px-6 sm:px-8 pt-6 sm:pt-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-gold-400" />
                <h2 className="text-lg font-bold">Top Strengths</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {analysis.strengthsSummary.map((strength, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl bg-green-500/10 border border-green-500/20 p-4"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-surface-200">{strength}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Score Breakdown */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary-400" />
              <h2 className="text-lg font-bold">Score Breakdown by Judge</h2>
              <span className="text-xs text-surface-200 ml-auto">Technician / Artist / Choreographer</span>
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
                  {Math.round(analysis.competitionComparison.yourScore - analysis.competitionComparison.avgRegional)} points {analysis.competitionComparison.yourScore >= analysis.competitionComparison.avgRegional ? "above" : "below"} regional average
                </span>{" "}
                and{" "}
                <span className="text-gold-400 font-semibold">
                  {Math.round(analysis.competitionComparison.top10Threshold - analysis.competitionComparison.yourScore)} points from the top 10%
                </span>.
              </p>

              {/* Competitive Edge */}
              {analysis.competitiveEdge && (
                <div className="mt-4 rounded-xl bg-primary-500/10 border border-primary-500/20 p-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-primary-300 mb-1">Competitive Edge</p>
                      <p className="text-sm text-surface-200">{analysis.competitiveEdge}</p>
                    </div>
                  </div>
                </div>
              )}
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
                <div key={i} className="flex items-start gap-3 rounded-lg bg-white/5 p-3">
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
      </div>
    </div>
  );
}
