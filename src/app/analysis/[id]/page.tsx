"use client";

import { useParams } from "next/navigation";
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
} from "lucide-react";

// Simulated AI analysis data — in production this would come from the API
function generateAnalysis(id: string) {
  // Use the ID to create slight variations in scores for realism
  const seed = id.charCodeAt(0) + (id.charCodeAt(1) || 0);
  const variation = (base: number, range: number) =>
    Math.round((base + ((seed % range) - range / 2) * 0.1) * 10) / 10;

  return {
    id,
    routineName: "Uploaded Routine",
    dancerName: "Dancer",
    ageGroup: "Teen (12-15)",
    style: "Jazz",
    entryType: "Solo",
    duration: "2:45",
    totalScore: variation(274, 20),
    awardLevel: "Platinum" as const,
    judgeScores: [
      {
        category: "Technique",
        max: 35,
        judges: [variation(32.5, 10), variation(31.0, 10), variation(33.0, 10)],
        avg: variation(32.2, 10),
        feedback:
          "Solid foundational technique with good body placement and alignment throughout. Extension in leaps shows strong flexibility. Pirouette sequence shows promise — focus on consistent spotting to maintain clean rotations. Footwork in jazz isolations is sharp and precise. Recommend targeted work on landing control after aerial skills.",
      },
      {
        category: "Performance",
        max: 35,
        judges: [variation(33.0, 10), variation(32.5, 10), variation(34.0, 10)],
        avg: variation(33.2, 10),
        feedback:
          "Strong stage presence with genuine connection to the music. Facial expressions are authentic and engaging — this is a standout quality. Energy is mostly consistent but watch for slight drops during transitional phrases. Eye focus is intentional and draws the audience in. Work on maintaining peak performance energy in the final 30 seconds when fatigue may set in.",
      },
      {
        category: "Choreography",
        max: 20,
        judges: [variation(18.5, 8), variation(17.5, 8), variation(19.0, 8)],
        avg: variation(18.3, 8),
        feedback:
          "Well-constructed routine with a clear narrative arc. Effective use of space and levels. Formation changes (if group) are smooth and purposeful. Music interpretation is strong — choreography matches the dynamics of the track. Consider adding more contrast between high-energy sections and lyrical moments for greater impact. The ending is strong and memorable.",
      },
      {
        category: "Overall Impression",
        max: 10,
        judges: [variation(9.0, 4), variation(8.5, 4), variation(9.5, 4)],
        avg: variation(9.0, 4),
        feedback:
          "A polished, competition-ready routine that demonstrates strong training and preparation. The dancer shows maturity and artistry beyond their age division. Costuming and music selection complement the choreography well. This routine has strong potential for advancement at regional and national level competitions.",
      },
    ],
    timelineNotes: [
      { time: "0:00–0:12", note: "Strong opening — immediate energy and audience engagement", type: "positive" as const },
      { time: "0:25", note: "Leap combination: good height and split, watch back foot on landing", type: "improvement" as const },
      { time: "0:45", note: "Jazz isolations: sharp, clean, and well-timed with the music", type: "positive" as const },
      { time: "1:05", note: "Turn sequence: good preparation, focus on spotting consistency", type: "improvement" as const },
      { time: "1:30", note: "Floor work section: creative and well-executed", type: "positive" as const },
      { time: "1:55", note: "Transitional phrase: energy dipped slightly — maintain intensity", type: "improvement" as const },
      { time: "2:10", note: "Acro/trick element: clean execution with solid landing", type: "positive" as const },
      { time: "2:30–2:45", note: "Finale: powerful ending pose, strong audience impact", type: "positive" as const },
    ],
    improvementPriorities: [
      { priority: 1, item: "Landing control after leaps and jumps", impact: "High", timeToFix: "2–3 weeks" },
      { priority: 2, item: "Spotting consistency in turn sequences", impact: "High", timeToFix: "1–2 weeks" },
      { priority: 3, item: "Energy maintenance in transitional phrases", impact: "Medium", timeToFix: "2–3 rehearsals" },
      { priority: 4, item: "Dynamic contrast between sections", impact: "Medium", timeToFix: "1 rehearsal" },
      { priority: 5, item: "Final 30-second stamina and peak energy", impact: "Medium", timeToFix: "Conditioning focus" },
    ],
    competitionComparison: {
      yourScore: variation(274, 20),
      avgRegional: 261,
      top10Threshold: 282,
      top5Threshold: 288,
    },
  };
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

export default function AnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const analysis = generateAnalysis(id);
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
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Download Report">
              <Download className="h-4 w-4 text-surface-200" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Share">
              <Share2 className="h-4 w-4 text-surface-200" />
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
                  {Math.round(analysis.competitionComparison.yourScore - analysis.competitionComparison.avgRegional)} points above regional average
                </span>{" "}
                and{" "}
                <span className="text-gold-400 font-semibold">
                  {Math.round(analysis.competitionComparison.top10Threshold - analysis.competitionComparison.yourScore)} points from the top 10%
                </span>.
              </p>
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
