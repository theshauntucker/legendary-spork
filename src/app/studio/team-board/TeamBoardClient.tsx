"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Filter, ArrowRight, Play } from "lucide-react";
import Glass from "@/components/ui/Glass";
import GradientText from "@/components/ui/GradientText";
import Button from "@/components/ui/Button";
import { gradients } from "@/lib/gradients";
import { fadeLift, stagger, staggerItem } from "@/lib/motion";

interface Studio {
  id: string;
  name: string;
  invite_code: string;
  region: string | null;
}

interface Routine {
  id: string;
  routineName: string;
  style: string | null;
  entryType: string | null;
  dancerId: string;
  dancerName: string;
  createdAt: string;
  status: string;
  totalScore: number | null;
  awardLevel: string | null;
  analysisId: string | null;
}

const awardLevelGradients: Record<string, string> = {
  gold: gradients.auraGold,
  "high gold": gradients.auraGold,
  platinum: gradients.auraPlatinum,
  diamond: gradients.auraDiamond,
};

const awardLevelColors: Record<string, string> = {
  gold: "from-amber-400 to-amber-600",
  "high gold": "from-amber-300 to-amber-500",
  platinum: "from-slate-300 to-slate-500",
  diamond: "from-cyan-300 to-purple-400",
};

export default function TeamBoardClient({
  studio,
  role,
  routines,
}: {
  studio: Studio;
  role: "owner" | "choreographer" | "viewer";
  routines: Routine[];
}) {
  const [filterStatus, setFilterStatus] = useState<"all" | "analyzed" | "pending" | "flagged">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"newest" | "highest-score" | "lowest-score" | "by-dancer">(
    "newest"
  );

  const filteredAndSorted = useMemo(() => {
    let result = routines;

    // Filter
    if (filterStatus === "analyzed") {
      result = result.filter((r) => r.status === "analyzed");
    } else if (filterStatus === "pending") {
      result = result.filter((r) => r.status !== "analyzed");
    } else if (filterStatus === "flagged") {
      // Flagged = analyzed but score < gold (260)
      result = result.filter(
        (r) => r.status === "analyzed" && r.totalScore != null && r.totalScore < 260
      );
    }

    // Sort
    const sorted = [...result];
    if (sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "highest-score") {
      sorted.sort((a, b) => {
        const scoreA = a.totalScore ?? -1;
        const scoreB = b.totalScore ?? -1;
        return scoreB - scoreA;
      });
    } else if (sortBy === "lowest-score") {
      sorted.sort((a, b) => {
        const scoreA = a.totalScore ?? 999;
        const scoreB = b.totalScore ?? 999;
        return scoreA - scoreB;
      });
    } else if (sortBy === "by-dancer") {
      sorted.sort((a, b) => a.dancerName.localeCompare(b.dancerName));
    }

    return sorted;
  }, [routines, filterStatus, sortBy]);

  return (
    <div className="min-h-screen px-4 py-10">
      {/* Background blur */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div className="max-w-6xl mx-auto" variants={stagger} initial="initial" animate="animate">
        {/* Header */}
        <motion.div variants={staggerItem} className="mb-8">
          <p className="text-xs uppercase tracking-widest text-primary-400 mb-2">
            Studio Overview
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)] mb-2">
            <GradientText gradient="sunsetText">Team Board</GradientText>
          </h1>
          <p className="text-lg text-surface-200">
            Every routine, every dancer — one pipeline
          </p>
        </motion.div>

        {/* Filter & Sort Controls */}
        <motion.div variants={staggerItem} className="mb-8 flex flex-wrap gap-3">
          {/* Filter Chips */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-surface-400 font-semibold self-center">Filter:</span>
            {(["all", "analyzed", "pending", "flagged"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  filterStatus === status
                    ? "bg-primary-500/40 text-primary-100 border border-primary-400/50"
                    : "bg-surface-800/60 text-surface-300 border border-surface-700/50 hover:bg-surface-700/60"
                }`}
              >
                {status === "all" && "All"}
                {status === "analyzed" && "Analyzed"}
                {status === "pending" && "Pending"}
                {status === "flagged" && "Flagged"}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex gap-2 items-center ml-auto">
            <span className="text-xs text-surface-400 font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "newest" | "highest-score" | "lowest-score" | "by-dancer"
                )
              }
              className="px-3 py-1.5 rounded-full text-sm font-semibold bg-surface-800/60 text-surface-200 border border-surface-700/50 hover:bg-surface-700/60 cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="highest-score">Highest Score</option>
              <option value="lowest-score">Lowest Score</option>
              <option value="by-dancer">By Dancer</option>
            </select>
          </div>
        </motion.div>

        {/* Routines Grid */}
        {filteredAndSorted.length === 0 ? (
          <motion.div variants={staggerItem}>
            <Glass className="p-8 text-center">
              <p className="text-lg text-surface-300 mb-4">
                No routines yet — upload your first routine to see the pipeline come alive
              </p>
              <Link href="/upload">
                <Button variant="primary" className="mx-auto">
                  <Play className="h-4 w-4" />
                  Upload Your First Routine
                </Button>
              </Link>
            </Glass>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredAndSorted.map((routine) => (
              <motion.div key={routine.id} variants={staggerItem}>
                <Link href={routine.analysisId ? `/analysis/${routine.analysisId}` : "#"}>
                  <Glass
                    className={`p-4 cursor-pointer hover:border-primary-400/40 transition-all h-full flex flex-col ${
                      routine.status === "analyzed" ? "" : "opacity-60"
                    }`}
                  >
                    {/* Routine Name */}
                    <h3 className="text-base font-bold text-white mb-1 line-clamp-2">
                      {routine.routineName}
                    </h3>

                    {/* Dancer Name */}
                    <p className="text-sm text-surface-300 mb-3">{routine.dancerName}</p>

                    {/* Award Level Pill */}
                    {routine.status === "analyzed" && routine.awardLevel ? (
                      <div className="mb-3 flex items-center gap-2">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${
                            awardLevelColors[routine.awardLevel.toLowerCase()] ||
                            awardLevelColors.gold
                          }`}
                        >
                          {routine.awardLevel.toUpperCase()}
                        </div>
                        {routine.totalScore != null && (
                          <span className="text-sm font-semibold text-surface-300">
                            {routine.totalScore}/300
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="mb-3 px-3 py-1 rounded-full text-xs font-bold bg-surface-700/50 text-surface-300 inline-block w-fit">
                        Pending Analysis
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-surface-700/50 text-xs text-surface-400">
                      <span>{routine.style ? routine.style : "—"}</span>
                      <span>
                        {new Date(routine.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Open Button */}
                    {routine.analysisId && (
                      <Button variant="ghost" className="mt-3 text-sm justify-center gap-1">
                        View Analysis
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                  </Glass>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
