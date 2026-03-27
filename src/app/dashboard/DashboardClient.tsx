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
  trialUsed = false,
}: {
  user: { email: string; name: string };
  videos: VideoRecord[];
  credits: { remaining: number; total: number; used: number };
  trialUsed?: boolean;
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
                {trialUsed ? "Ready for Your Next Routine?" : `Welcome to RoutineX${user.name ? `, ${user.name.split(' ')[0]}` : ''}! 🏆`}
              </h2>
              <p className="text-surface-200 text-sm max-w-lg mx-auto">
                {trialUsed
                  ? "You've used your one-time trial. Get 5 more analyses to keep improving your routines."
                  : "You're in. Upload any dance or cheer routine and get competition-standard scoring with detailed judge feedback in under 5 minutes."}
              </p>
              {/* Privacy statement */}
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>🔒</span>
                <span>RoutineX was built with privacy in mind. Your video never leaves your device — only still-frame thumbnails are analyzed. Nothing is uploaded, stored, or seen by anyone.</span>
              </div>
            </div>

            {/* Pricing options */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Single Analysis */}
              <PurchaseCard
                badge="⚡ Single Analysis"
                badgeColor="text-accent-300 bg-accent-500/20"
                title="Single Analysis"
                price="$8.99"
                description="Get one full AI analysis for any routine."
                features={["1 full AI analysis", "Competition-standard scoring", "Timestamped judge notes", "Improvement roadmap"]}
                buttonText="Get 1 Analysis — $8.99"
                buttonStyle="border-2 border-accent-500 hover:bg-accent-500/20"
                type="single"
              />

              {/* Pack option */}
              <PurchaseCard
                badge="🏆 Best Value"
                badgeColor="text-gold-300 bg-gold-500/20"
                title="Competition Pack"
                price="$29.99"
                description="5 analyses — track progress all season long."
                features={["5 full AI analyses", "Only $6 each — save $15", "All styles supported", "Use any time, never expire"]}
                buttonText="Get 5 Analyses — $29.99"
                buttonStyle="bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 hover:opacity-90"
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
