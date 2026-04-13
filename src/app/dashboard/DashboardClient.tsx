"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  Upload,
  Video,
  BarChart3,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  LogOut,
  TrendingUp,
  TrendingDown,
  Trophy,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface VideoRecord {
  id: string;
  routine_name: string;
  dancer_name: string | null;
  style: string;
  age_group: string;
  entry_type: string;
  status: string;
  created_at: string;
  thumbnail_path: string | null;
  analyses: Array<{ id: string; total_score: number; award_level: string }>;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  uploaded: {
    label: "Uploaded",
    color: "text-blue-400 bg-blue-400/10",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "text-yellow-400 bg-yellow-400/10",
    icon: Loader2,
  },
  ready: {
    label: "Ready",
    color: "text-green-400 bg-green-400/10",
    icon: CheckCircle,
  },
  analyzed: {
    label: "Analyzed",
    color: "text-primary-400 bg-primary-400/10",
    icon: BarChart3,
  },
  error: {
    label: "Error",
    color: "text-red-400 bg-red-400/10",
    icon: AlertCircle,
  },
};

// Sub-component for purchase cards
function PurchaseCard({
  badge, badgeColor, title, price, description, features, buttonText, buttonStyle, type
}: {
  badge: string; badgeColor: string; title: string; price: string;
  description: string; features: string[]; buttonText: string;
  buttonStyle: string; type: string;
}) {
  const [loading, setLoading] = React.useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 border border-white/10 flex flex-col">
      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit ${badgeColor}`}>{badge}</span>
      <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
      <p className="text-3xl font-extrabold text-white mb-1">{price}</p>
      <p className="text-sm text-surface-200 mb-4">{description}</p>
      <ul className="space-y-2 mb-6 flex-1">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm text-surface-200">
            <span className="text-primary-400">✓</span> {f}
          </li>
        ))}
      </ul>
      <button
        onClick={handlePurchase}
        disabled={loading}
        className={`w-full py-3 rounded-full font-bold text-white transition-all ${buttonStyle} disabled:opacity-50`}
      >
        {loading ? "Loading..." : buttonText}
      </button>
    </div>
  );
}

export default function DashboardClient({
  user,
  videos,
  credits,
}: {
  user: { email: string; name: string };
  videos: VideoRecord[];
  credits: { remaining: number; total: number; used: number };
}) {
  const router = useRouter();

  // Client-side credit verification fallback:
  // If user just paid but credits are still 0, call verify-payment API
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId && credits.remaining === 0) {
      fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.verified) {
            router.refresh();
          }
        })
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <a href="/" className="inline-flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary-400" />
              <span className="text-lg font-bold">
                Routine<span className="gradient-text">X</span>
              </span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-surface-200 hidden sm:block">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm text-surface-200 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">
            {user.name ? `Hey, ${user.name.split(" ")[0]}!` : "Your Dashboard"}
          </h1>
          <p className="mt-2 text-surface-200">
            {videos.length > 0
              ? `You have ${videos.length} routine${videos.length !== 1 ? "s" : ""} uploaded.`
              : "Upload your first routine to get started."}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {(() => {
            const analyzedCount = videos.filter((v) => v.status === "analyzed").length;
            const analyzedVideos = videos.filter((v) => v.analyses?.length > 0);
            const avgScore = analyzedVideos.length > 0
              ? Math.round(
                  analyzedVideos.reduce(
                    (sum, v) => sum + (v.analyses[0]?.total_score ?? 0),
                    0
                  ) / analyzedVideos.length
                )
              : "—";

            return [
              {
                label: "Credits Left",
                value: credits.remaining,
                icon: CheckCircle,
              },
              {
                label: "Videos Uploaded",
                value: videos.length,
                icon: Video,
              },
              {
                label: "Analyses Complete",
                value: analyzedCount,
                icon: BarChart3,
              },
              {
                label: "Avg. Score",
                value: avgScore,
                icon: CheckCircle,
              },
            ];
          })().map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center">
              <stat.icon className="mx-auto h-5 w-5 text-primary-400 mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-surface-200 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Welcome + Pricing — shown when user has no credits */}
        {credits.remaining === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-8"
          >
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-primary-700/60 via-accent-600/40 to-primary-700/60 border border-primary-500/30 rounded-2xl p-6 mb-4 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {credits.used > 0 ? "Ready for Your Next Routine?" : `Welcome to RoutineX${user.name ? `, ${user.name.split(' ')[0]}` : ''}! 🏆`}
              </h2>
              <p className="text-surface-200 text-sm max-w-lg mx-auto">
                {credits.used > 0
                  ? "Pick up more credits to keep improving your routines all season long."
                  : "Get 2 analyses for $8.99 (BOGO) or a 5-pack for $29.99 to keep tracking all season."}
              </p>
              {/* Privacy statement */}
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>🔒</span>
                <span>RoutineX was built with privacy in mind. Your video never leaves your device — only still-frame thumbnails are analyzed. Nothing is uploaded, stored, or seen by anyone.</span>
              </div>
            </div>

            {/* Pricing options */}
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Season Member subscription — featured */}
              <PurchaseCard
                badge="👑 Most Popular"
                badgeColor="text-primary-300 bg-primary-500/20"
                title="Season Member"
                price="$12.99/mo"
                description="10 analyses/month. Intro rate — locked in forever."
                features={["10 analyses per month", "Full season tracking", "Cancel anytime", "🔒 Rate locked at intro price"]}
                buttonText="Subscribe — $12.99/mo"
                buttonStyle="bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 hover:opacity-90"
                type="subscription"
              />

              {/* BOGO */}
              <PurchaseCard
                badge="⚡ Buy One Get One"
                badgeColor="text-gold-300 bg-gold-500/20"
                title="BOGO — 2 Analyses"
                price="$8.99"
                description="Buy one analysis, get one free. Only $4.50 each."
                features={["2 full AI analyses", "Competition-standard scoring", "Timestamped judge notes", "Re-submission tracking"]}
                buttonText="Get 2 Analyses — $8.99"
                buttonStyle="border-2 border-gold-500 hover:bg-gold-500/20"
                type="single"
              />

              {/* Pack option */}
              <PurchaseCard
                badge="🏆 Best Value"
                badgeColor="text-gold-300 bg-gold-500/20"
                title="Competition Pack"
                price="$29.99"
                description="5 analyses — only $6 each, never expire."
                features={["5 full AI analyses", "Only $6 each — save $15", "All styles supported", "Never expire"]}
                buttonText="Get 5 Analyses — $29.99"
                buttonStyle="border-2 border-primary-500 hover:bg-primary-500/20"
                type="pack"
              />
            </div>
          </motion.div>
        )}

        {/* Upload CTA */}
        <motion.a
          href="/upload"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 flex items-center justify-between glass rounded-2xl p-6 hover:border-primary-500/30 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold">Upload a New Routine</p>
              <p className="text-sm text-surface-200">
                Get AI-powered competition scoring in under 5 minutes
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-surface-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </motion.a>

        {/* Season Tracker CTA */}
        <motion.a
          href="/dancers"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10 flex items-center justify-between rounded-2xl p-6 hover:border-gold-500/40 transition-all cursor-pointer group border border-gold-500/20 bg-gradient-to-r from-gold-500/8 via-accent-500/5 to-primary-600/8"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500/30 to-accent-500/30">
              <Trophy className="h-6 w-6 text-gold-400" />
            </div>
            <div>
              <p className="font-bold flex items-center gap-2">
                Season Tracker
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full">New</span>
              </p>
              <p className="text-sm text-surface-200">
                Every score, every award, every competition — all in one place 🏆
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {videos.filter(v => v.analyses?.length > 0 && v.dancer_name).length > 0 && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-gold-300 font-medium">
                <Star className="h-3 w-3" />
                {new Set(videos.filter(v => v.analyses?.length > 0 && v.dancer_name).map(v => v.dancer_name)).size} dancer{new Set(videos.filter(v => v.analyses?.length > 0 && v.dancer_name).map(v => v.dancer_name)).size !== 1 ? "s" : ""} tracked
              </span>
            )}
            <ArrowRight className="h-5 w-5 text-gold-400 group-hover:text-gold-300 group-hover:translate-x-1 transition-all" />
          </div>
        </motion.a>

        {/* Your Routines — Grouped by routine_name */}
        {videos.length > 0 ? (
          <div>
            <h2 className="text-lg font-bold mb-4">Your Routines</h2>
            {(() => {
              // Group by routine_name
              const groups: Record<string, VideoRecord[]> = {};
              for (const v of videos) {
                if (!groups[v.routine_name]) groups[v.routine_name] = [];
                groups[v.routine_name].push(v);
              }
              // Sort each group oldest→newest
              for (const key of Object.keys(groups)) {
                groups[key].sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
                );
              }
              // Sort groups by most-recent submission
              const sortedNames = Object.keys(groups).sort((a, b) => {
                const latestA =
                  groups[a][groups[a].length - 1].created_at;
                const latestB =
                  groups[b][groups[b].length - 1].created_at;
                return (
                  new Date(latestB).getTime() - new Date(latestA).getTime()
                );
              });

              const analyzedGroups = sortedNames.filter((name) =>
                groups[name].some(
                  (v) => v.status === "analyzed" && v.analyses?.length > 0
                )
              );
              const pendingGroups = sortedNames.filter(
                (name) =>
                  !groups[name].some(
                    (v) => v.status === "analyzed" && v.analyses?.length > 0
                  )
              );

              const awardColors: Record<string, string> = {
                Gold: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
                "High Gold":
                  "text-amber-400 bg-amber-400/10 border-amber-400/30",
                Platinum: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
                Diamond:
                  "text-violet-400 bg-violet-400/10 border-violet-400/30",
              };

              return (
                <>
                  {/* Analyzed routines — progress cards */}
                  {analyzedGroups.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {analyzedGroups.map((name, i) => {
                        const group = groups[name];
                        const analyzed = group.filter(
                          (v) =>
                            v.status === "analyzed" && v.analyses?.length > 0
                        );
                        const latest = analyzed[analyzed.length - 1];
                        const first = analyzed[0];
                        const latestScore =
                          latest.analyses[0]?.total_score ?? 0;
                        const firstScore =
                          first.analyses[0]?.total_score ?? 0;
                        const delta = latestScore - firstScore;
                        const awardLevel =
                          latest.analyses[0]?.award_level ?? "";
                        const awardStyle =
                          awardColors[awardLevel] ||
                          "text-primary-400 bg-primary-400/10 border-primary-400/30";

                        return (
                          <motion.a
                            key={name}
                            href={`/routines/${latest.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 glass rounded-2xl p-5 hover:border-primary-500/30 transition-all group cursor-pointer"
                          >
                            {/* Left: info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                {awardLevel && (
                                  <span
                                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${awardStyle}`}
                                  >
                                    🏆 {awardLevel}
                                  </span>
                                )}
                                <span className="text-xs text-surface-200">
                                  {analyzed.length} submission
                                  {analyzed.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <p className="font-bold text-white text-lg leading-tight truncate">
                                {name}
                              </p>
                              <p className="text-xs text-surface-200 mt-0.5">
                                {latest.style} {latest.entry_type} &bull;{" "}
                                {latest.age_group}
                              </p>
                            </div>

                            {/* Center: score + delta */}
                            <div className="flex items-center gap-6 sm:gap-8">
                              <div className="text-center">
                                <p className="text-2xl font-extrabold gradient-text">
                                  {latestScore}
                                </p>
                                <p className="text-[10px] text-surface-200">
                                  / 300 latest
                                </p>
                              </div>
                              {analyzed.length > 1 && (
                                <div
                                  className={`flex items-center gap-1 text-sm font-semibold ${
                                    delta >= 0
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {delta >= 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4" />
                                  )}
                                  {delta >= 0 ? "+" : ""}
                                  {delta} pts
                                </div>
                              )}
                            </div>

                            {/* Right: CTA */}
                            <div className="flex items-center gap-2 text-sm text-primary-400 font-semibold group-hover:text-primary-300 transition-colors shrink-0">
                              View Progress
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </motion.a>
                        );
                      })}
                    </div>
                  )}

                  {/* Pending / processing routines */}
                  {pendingGroups.length > 0 && (
                    <div>
                      {analyzedGroups.length > 0 && (
                        <h3 className="text-sm font-semibold text-surface-200 mb-3 mt-6">
                          In Progress
                        </h3>
                      )}
                      <div className="space-y-3">
                        {pendingGroups.map((name, i) => {
                          const group = groups[name];
                          const latest = group[group.length - 1];
                          const status =
                            statusConfig[latest.status] ||
                            statusConfig.uploaded;
                          const StatusIcon = status.icon;

                          return (
                            <motion.a
                              key={name}
                              href={
                                latest.status === "processing"
                                  ? `/processing/${latest.id}`
                                  : "#"
                              }
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay:
                                  (analyzedGroups.length + i) * 0.05,
                              }}
                              className="flex items-center gap-4 glass rounded-2xl p-4 hover:border-primary-500/20 transition-colors"
                            >
                              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                <Video className="h-5 w-5 text-surface-200" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{name}</p>
                                <p className="text-xs text-surface-200 mt-0.5">
                                  {latest.style} {latest.entry_type} &bull;{" "}
                                  {latest.age_group}
                                </p>
                              </div>
                              <div
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                              >
                                <StatusIcon
                                  className={`h-3 w-3 ${
                                    latest.status === "processing"
                                      ? "animate-spin"
                                      : ""
                                  }`}
                                />
                                {status.label}
                              </div>
                            </motion.a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <div className="glass rounded-3xl p-12 text-center">
            <Video className="mx-auto h-12 w-12 text-surface-200 mb-4" />
            <h2 className="text-xl font-bold">No routines yet</h2>
            <p className="mt-2 text-surface-200 text-sm max-w-md mx-auto">
              Upload your first dance or cheer routine to get a full AI-powered
              competition analysis.
            </p>
            <a
              href="/upload"
              className="inline-flex items-center gap-2 mt-6 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Upload Your First Routine
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
