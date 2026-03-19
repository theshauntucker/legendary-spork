"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface VideoRecord {
  id: string;
  routine_name: string;
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

        {/* Purchase CTA — shown when user has no credits */}
        {credits.remaining === 0 && credits.total === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-6 flex items-center justify-between glass rounded-2xl p-6 border border-accent-500/30"
          >
            <div>
              <p className="font-bold text-accent-400">Payment Required</p>
              <p className="text-sm text-surface-200 mt-1">
                Purchase a Founding Member Pass ($9.99) to unlock 3 video analyses.
              </p>
            </div>
            <a
              href="/#pricing"
              className="shrink-0 ml-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity text-sm"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </a>
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

        {/* Videos List */}
        {videos.length > 0 ? (
          <div>
            <h2 className="text-lg font-bold mb-4">Your Routines</h2>
            <div className="space-y-3">
              {videos.map((video, i) => {
                const status = statusConfig[video.status] || statusConfig.uploaded;
                const StatusIcon = status.icon;
                const analysis = video.analyses?.[0];

                return (
                  <motion.a
                    key={video.id}
                    href={
                      analysis
                        ? `/analysis/${video.id}`
                        : video.status === "processing"
                        ? `/processing/${video.id}`
                        : "#"
                    }
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center gap-4 glass rounded-2xl p-4 hover:border-primary-500/20 transition-colors"
                  >
                    {/* Thumbnail placeholder */}
                    <div className="shrink-0 w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center">
                      <Video className="h-6 w-6 text-surface-200" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {video.routine_name}
                      </p>
                      <p className="text-xs text-surface-200 mt-0.5">
                        {video.style} {video.entry_type} &bull;{" "}
                        {video.age_group} &bull;{" "}
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Status */}
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                    >
                      <StatusIcon
                        className={`h-3 w-3 ${video.status === "processing" ? "animate-spin" : ""}`}
                      />
                      {status.label}
                    </div>

                    {/* Score (if analyzed) */}
                    {analysis && (
                      <div className="text-right hidden sm:block">
                        <p className="text-lg font-bold gradient-text">
                          {analysis.total_score}
                        </p>
                        <p className="text-[10px] text-surface-200">/ 300</p>
                      </div>
                    )}
                  </motion.a>
                );
              })}
            </div>
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
