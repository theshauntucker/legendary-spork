"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  TrendingUp,
  BarChart3,
  ArrowLeft,
  Sparkles,
  Shield,
  Award,
  Zap,
  Target,
  ChevronRight,
} from "lucide-react";
import ScoreHistoryChart from "@/components/ScoreHistoryChart";

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_data: Record<string, unknown>;
  earned_at: string;
}

interface ScorePoint {
  videoId: string;
  analysisId: string;
  totalScore: number;
  awardLevel: string;
  date: string;
  routineName?: string;
  style?: string;
}

interface DancerProfile {
  id: string;
  dancer_name: string;
  studio_name: string | null;
  styles: string[];
  age_group: string | null;
  bio: string | null;
  avatar_url: string | null;
}

const awardConfig: Record<string, { color: string; gradient: string; icon: string }> = {
  Diamond: {
    color: "text-gold-400",
    gradient: "from-gold-400 to-gold-500",
    icon: "💎",
  },
  Platinum: {
    color: "text-primary-400",
    gradient: "from-primary-400 to-primary-500",
    icon: "🏆",
  },
  "High Gold": {
    color: "text-yellow-400",
    gradient: "from-yellow-400 to-yellow-500",
    icon: "🥇",
  },
  Gold: {
    color: "text-yellow-600",
    gradient: "from-yellow-500 to-yellow-600",
    icon: "🏅",
  },
};

const achievementLabels: Record<string, { label: string; icon: typeof Trophy }> = {
  first_diamond: { label: "First Diamond", icon: Star },
  first_platinum: { label: "First Platinum", icon: Trophy },
  first_high_gold: { label: "First High Gold", icon: Award },
  first_gold: { label: "First Gold", icon: Award },
  score_jump: { label: "Score Jump", icon: Zap },
  analysis_streak: { label: "Dedicated Dancer", icon: Target },
};

export default function DancerProfileClient({
  dancerName,
  profile,
  scoreHistory,
  achievements,
  stats,
}: {
  dancerName: string;
  profile: DancerProfile | null;
  scoreHistory: ScorePoint[];
  achievements: Achievement[];
  competitionScores: Array<Record<string, unknown>>;
  stats: {
    totalAnalyses: number;
    bestScore: number;
    avgScore: number;
    awardCounts: Record<string, number>;
    styles: string[];
  };
}) {
  const initials = dancerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
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
          <div className="w-20" />
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-primary-700/50 to-accent-600/50 p-6 sm:p-8">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 via-accent-500 to-gold-500 flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">
                  {initials}
                </span>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
                  {dancerName}
                </h1>
                {profile?.studio_name && (
                  <p className="text-sm text-surface-200 mt-0.5">{profile.studio_name}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {stats.styles.map((style) => (
                    <span
                      key={style}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-surface-200"
                    >
                      {style}
                    </span>
                  ))}
                  {profile?.age_group && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-surface-200">
                      {profile.age_group}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Privacy badge */}
            <div className="flex items-center gap-1.5 mt-4">
              <Shield className="h-3 w-3 text-green-400" />
              <span className="text-[10px] text-green-400">
                Your trophy room is private
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 p-6">
            <div className="text-center">
              <p className="text-2xl font-bold gradient-text">{stats.totalAnalyses}</p>
              <p className="text-xs text-surface-200 mt-1">Analyses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gold-400">{stats.bestScore}</p>
              <p className="text-xs text-surface-200 mt-1">Best Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400">{stats.avgScore}</p>
              <p className="text-xs text-surface-200 mt-1">Avg Score</p>
            </div>
          </div>
        </motion.div>

        {/* Trophy Case */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-3xl p-6 sm:p-8 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-gold-400" />
            <h2 className="text-lg font-bold">Trophy Case</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["Diamond", "Platinum", "High Gold", "Gold"] as const).map((award) => {
              const count = stats.awardCounts[award] || 0;
              const config = awardConfig[award];
              return (
                <div
                  key={award}
                  className={`rounded-xl p-4 text-center ${
                    count > 0 ? "bg-white/5" : "bg-white/[0.02] opacity-40"
                  }`}
                >
                  <span className="text-2xl">{config.icon}</span>
                  <p className={`text-2xl font-bold mt-1 ${count > 0 ? config.color : "text-surface-200"}`}>
                    {count}
                  </p>
                  <p className="text-xs text-surface-200 mt-0.5">{award}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="glass rounded-3xl p-6 sm:p-8 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-primary-400" />
              <h2 className="text-lg font-bold">Achievements</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((achievement) => {
                const config = achievementLabels[achievement.achievement_type] || {
                  label: achievement.achievement_type,
                  icon: Star,
                };
                const AchIcon = config.icon;
                const data = achievement.achievement_data;

                return (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500">
                      <AchIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{config.label}</p>
                      <p className="text-xs text-surface-200">
                        {achievement.achievement_type === "score_jump" &&
                          `+${data.jump} point jump (${data.previous_score} → ${data.new_score})`}
                        {achievement.achievement_type === "analysis_streak" &&
                          `${data.streak_count} analyses completed`}
                        {achievement.achievement_type.startsWith("first_") &&
                          `Score: ${data.score}/300`}
                      </p>
                      <p className="text-[10px] text-surface-200/60 mt-0.5">
                        {new Date(achievement.earned_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Score History Chart */}
        {scoreHistory.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-3xl p-6 sm:p-8 mb-6"
          >
            <ScoreHistoryChart
              scores={scoreHistory}
              title="Score Progress"
            />
          </motion.div>
        )}

        {/* Recent Analyses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="glass rounded-3xl p-6 sm:p-8 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-accent-400" />
            <h2 className="text-lg font-bold">All Analyses</h2>
          </div>

          <div className="space-y-2">
            {[...scoreHistory].reverse().map((entry) => {
              const config = awardConfig[entry.awardLevel] || awardConfig.Gold;
              return (
                <a
                  key={entry.videoId}
                  href={`/analysis/${entry.videoId}`}
                  className="flex items-center gap-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{entry.routineName}</p>
                    <p className="text-xs text-surface-200">
                      {entry.style} &bull;{" "}
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className={`text-lg font-bold ${config.color}`}>
                        {entry.totalScore}
                      </p>
                      <p className="text-[10px] text-surface-200">{entry.awardLevel}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-surface-200" />
                  </div>
                </a>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <div className="glass rounded-3xl p-6 sm:p-8 text-center">
          <p className="text-lg font-bold">Keep improving!</p>
          <p className="text-sm text-surface-200 mt-1 mb-4">
            Upload another routine to track {dancerName}&apos;s progress.
          </p>
          <a
            href="/upload"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Analyze Another Routine
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
