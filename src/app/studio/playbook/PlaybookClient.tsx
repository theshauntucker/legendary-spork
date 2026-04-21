"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/GradientText";
import { Glass } from "@/components/ui/Glass";
import { springOut, stagger, staggerItem } from "@/lib/motion";

interface PlaybookRoutine {
  videoId: string;
  analysisId: string;
  routineName: string;
  dancerName: string;
  totalScore: number;
  awardLevel: string;
  feedbackPoints: string[];
}

interface TopTheme {
  label: string;
  count: number;
}

interface PlaybookClientProps {
  routines: PlaybookRoutine[];
  topThemes: TopTheme[];
}

const AWARD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Gold: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300" },
  "High Gold": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  Platinum: { bg: "bg-slate-100", text: "text-slate-900", border: "border-slate-300" },
  Diamond: { bg: "bg-cyan-100", text: "text-cyan-900", border: "border-cyan-300" },
};

export default function PlaybookClient({ routines, topThemes }: PlaybookClientProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <motion.div className="space-y-8 p-4 md:p-8" initial="hidden" animate="visible" variants={stagger}>
      {/* Header */}
      <motion.div variants={staggerItem} className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          <GradientText gradient="auraGold">Coach's Playbook</GradientText>
        </h1>
        <p className="text-gray-600 text-lg">
          Auto-generated coaching notes from every analyzed routine.
        </p>
      </motion.div>

      {/* Top Focus Areas */}
      {topThemes.length > 0 && (
        <motion.div variants={staggerItem} className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">This Season's Top Focus Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThemes.map((theme, idx) => (
              <Glass key={idx} className="p-6 text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Appears {theme.count} times</p>
                <p className="text-lg font-semibold text-gray-900">{theme.label}</p>
              </Glass>
            ))}
          </div>
        </motion.div>
      )}

      {/* Playbook Routines */}
      {routines.length > 0 ? (
        <motion.div variants={staggerItem} className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Weekly Coaching Plan</h2>
          <div className="space-y-3">
            {routines.map((routine) => {
              const isExpanded = expanded === routine.analysisId;
              const awardStyle = AWARD_COLORS[routine.awardLevel] || AWARD_COLORS.Gold;

              return (
                <Glass
                  key={routine.analysisId}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setExpanded(isExpanded ? null : routine.analysisId)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{routine.routineName}</h3>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded border ${awardStyle.bg} ${awardStyle.text} ${awardStyle.border}`}>
                          {routine.awardLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {routine.dancerName} • Score: {routine.totalScore}
                      </p>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-2 border-t pt-4"
                        >
                          {routine.feedbackPoints.length > 0 ? (
                            <ul className="space-y-2">
                              {routine.feedbackPoints.map((point, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-gray-700">
                                  <span className="text-auraGold font-bold">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">No feedback available yet.</p>
                          )}
                          <Link
                            href={`/analysis/${routine.analysisId}`}
                            className="text-sm font-medium text-auraGold hover:text-auraGold/80 mt-3 inline-block"
                          >
                            View Full Analysis →
                          </Link>
                        </motion.div>
                      )}
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="flex-shrink-0 text-gray-400 mt-1"
                    >
                      ▼
                    </motion.div>
                  </div>
                </Glass>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <Glass className="p-12 text-center">
          <p className="text-gray-600 mb-6">
            Once your dancers' routines are analyzed, their feedback shows up here as a weekly coaching plan.
          </p>
          <Link
            href="/upload"
            className="inline-block px-6 py-2 bg-auraGold text-white rounded-lg font-medium hover:bg-auraGold/90 transition-colors"
          >
            Upload Your First Routine
          </Link>
        </Glass>
      )}
    </motion.div>
  );
}
