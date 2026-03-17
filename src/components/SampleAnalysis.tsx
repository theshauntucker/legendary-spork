"use client";

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
} from "lucide-react";

const judgeScores = [
  {
    category: "Technique",
    max: 35,
    judges: [32.5, 31.0, 33.0],
    avg: 32.2,
    feedback:
      "Strong extension in leaps with excellent turnout. Left arm placement needs attention during pirouette sequence at 1:23. Core engagement could be stronger for cleaner turns — recommend targeted conditioning.",
  },
  {
    category: "Performance",
    max: 35,
    judges: [33.0, 32.5, 34.0],
    avg: 33.2,
    feedback:
      "Excellent facial expression and commanding stage presence throughout. Energy dipped slightly during the bridge section (1:45–2:00). Eye focus was sharp and intentional. Connection to the music is a standout strength.",
  },
  {
    category: "Choreography",
    max: 20,
    judges: [18.5, 17.5, 19.0],
    avg: 18.3,
    feedback:
      "Creative formation transitions and strong use of levels in the chorus. Consider varying dynamics more in the opening 8-count. The ending pose is powerful. Floor work sequence at 2:15 was innovative and well-executed.",
  },
  {
    category: "Overall Impression",
    max: 10,
    judges: [9.0, 8.5, 9.5],
    avg: 9.0,
    feedback:
      "A polished, competition-ready routine with clear artistic vision. Costuming and music selection complement the choreography perfectly. This routine has strong potential for Platinum Star at regionals.",
  },
];

const timelineNotes = [
  {
    time: "0:00–0:15",
    note: "Strong opening — great energy and formation",
    type: "positive" as const,
  },
  {
    time: "0:32",
    note: "Leap sequence: excellent height, watch left arm",
    type: "improvement" as const,
  },
  {
    time: "1:05",
    note: "Turn sequence: 3/4 clean doubles, tighten spotting",
    type: "improvement" as const,
  },
  {
    time: "1:23",
    note: "Arm placement dropped during pirouette — easy fix",
    type: "improvement" as const,
  },
  {
    time: "1:45–2:00",
    note: "Bridge section: energy dipped, maintain performance quality",
    type: "improvement" as const,
  },
  {
    time: "2:15",
    note: "Floor work: creative and well-executed — standout moment",
    type: "positive" as const,
  },
  {
    time: "2:30–2:45",
    note: "Finale: powerful ending, strong stage presence",
    type: "positive" as const,
  },
];

const improvementPriorities = [
  {
    priority: 1,
    item: "Arm placement consistency during turns",
    impact: "High",
    timeToFix: "1–2 weeks",
  },
  {
    priority: 2,
    item: "Energy maintenance in bridge section",
    impact: "Medium",
    timeToFix: "2–3 rehearsals",
  },
  {
    priority: 3,
    item: "Core conditioning for cleaner turns",
    impact: "High",
    timeToFix: "3–4 weeks",
  },
  {
    priority: 4,
    item: "Dynamic variation in opening 8-count",
    impact: "Medium",
    timeToFix: "1 rehearsal",
  },
];

const awardLevels = [
  { label: "Gold", min: 100, max: 249, color: "bg-yellow-600" },
  { label: "High Gold", min: 250, max: 264, color: "bg-yellow-500" },
  { label: "Platinum", min: 265, max: 279, color: "bg-surface-200" },
  { label: "Platinum Star", min: 280, max: 289, color: "bg-primary-400" },
  { label: "Titanium", min: 290, max: 300, color: "bg-gold-400" },
];

export default function SampleAnalysis() {
  const totalScore = 274;
  const awardLevel = "Platinum";

  return (
    <section id="sample-analysis" className="relative py-24 sm:py-32">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            What You Get
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            Sample Analysis Report
          </h2>
          <p className="mt-4 text-lg text-surface-200 max-w-2xl mx-auto">
            Here&apos;s exactly what a RoutineX analysis looks like. Every upload gets this level of detail — for just $2.99.
          </p>
        </motion.div>

        {/* Analysis Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
                <h3 className="text-2xl font-bold">
                  Teen Jazz Solo — &quot;Into the Light&quot;
                </h3>
                <p className="text-sm text-surface-200 mt-1">
                  Dancer: Emma R. &bull; Age Division: Teen (14) &bull; Style:
                  Jazz &bull; Duration: 2:45
                </p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-5xl font-extrabold gradient-text">
                  {totalScore}
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
                  const width =
                    ((level.max - level.min) / 200) * 100;
                  return (
                    <div
                      key={level.label}
                      className={`${level.color} relative group`}
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

          {/* Score Breakdown Table */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary-400" />
              <h4 className="text-lg font-bold">Score Breakdown by Judge</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 pr-4 text-surface-200 font-medium">
                      Category
                    </th>
                    <th className="text-center py-3 px-3 text-surface-200 font-medium">
                      Judge 1
                    </th>
                    <th className="text-center py-3 px-3 text-surface-200 font-medium">
                      Judge 2
                    </th>
                    <th className="text-center py-3 px-3 text-surface-200 font-medium">
                      Judge 3
                    </th>
                    <th className="text-center py-3 pl-3 text-white font-bold">
                      Average
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {judgeScores.map((row) => (
                    <tr
                      key={row.category}
                      className="border-b border-white/5"
                    >
                      <td className="py-3 pr-4 font-medium">
                        {row.category}{" "}
                        <span className="text-surface-200 text-xs">
                          (/{row.max})
                        </span>
                      </td>
                      {row.judges.map((score, j) => (
                        <td
                          key={j}
                          className="text-center py-3 px-3 text-surface-200"
                        >
                          {score.toFixed(1)}
                        </td>
                      ))}
                      <td className="text-center py-3 pl-3 font-bold text-white">
                        {row.avg.toFixed(1)}
                        <div className="mt-1 mx-auto h-1 w-12 rounded-full bg-surface-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-400"
                            style={{
                              width: `${(row.avg / row.max) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-3 pr-4 font-bold text-lg">Total</td>
                    <td colSpan={3} />
                    <td className="text-center py-3 pl-3 font-extrabold text-lg gradient-text">
                      {totalScore}/300
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Competition Comparison */}
            <div className="mt-8 rounded-2xl bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-gold-400" />
                <h5 className="font-bold text-sm">
                  How This Compares
                </h5>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-surface-200">
                    Your Score
                  </p>
                  <p className="text-2xl font-bold text-white">274</p>
                </div>
                <div>
                  <p className="text-xs text-surface-200">
                    Avg. at Star Power Regionals
                  </p>
                  <p className="text-2xl font-bold text-surface-200">
                    261
                  </p>
                </div>
                <div>
                  <p className="text-xs text-surface-200">
                    Top 10% Threshold
                  </p>
                  <p className="text-2xl font-bold text-gold-400">282</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-surface-200">
                Your score is{" "}
                <span className="text-primary-400 font-semibold">
                  13 points above average
                </span>{" "}
                and{" "}
                <span className="text-gold-400 font-semibold">
                  8 points from the top 10%
                </span>
                . Focus on the improvement priorities below to close the gap.
              </p>
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-accent-400" />
              <h4 className="text-lg font-bold">
                Detailed Feedback by Category
              </h4>
            </div>

            <div className="space-y-4">
              {judgeScores.map((row) => (
                <div
                  key={row.category}
                  className="rounded-xl bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold">{row.category}</h5>
                    <span className="text-sm font-bold text-primary-400">
                      {row.avg.toFixed(1)}/{row.max}
                    </span>
                  </div>
                  <p className="text-sm text-surface-200 leading-relaxed">
                    {row.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Notes */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gold-400" />
              <h4 className="text-lg font-bold">
                Timestamped Performance Notes
              </h4>
            </div>

            <div className="space-y-2">
              {timelineNotes.map((note, i) => (
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
                  <span className="text-sm text-surface-200">
                    {note.note}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Priorities */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-primary-400" />
              <h4 className="text-lg font-bold">
                Improvement Priorities
              </h4>
            </div>

            <div className="space-y-3">
              {improvementPriorities.map((item) => (
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
                      Impact: {item.impact} &bull; Est. time to
                      improve: {item.timeToFix}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-surface-200" />
                </div>
              ))}
            </div>
          </div>

          {/* CTA inside report */}
          <div className="bg-gradient-to-r from-primary-700/30 to-accent-600/30 p-6 sm:p-8 text-center">
            <p className="text-lg font-bold">
              Want this for your dancer&apos;s routine?
            </p>
            <p className="text-sm text-surface-200 mt-1 mb-4">
              Join the beta — first 500 members get early access to sample the full platform.
            </p>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Join the Beta — $9.99
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
