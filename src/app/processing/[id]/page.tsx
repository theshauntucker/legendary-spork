"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Loader2, CheckCircle, Video, BarChart3, Cpu } from "lucide-react";

const stages = [
  { key: "uploaded", label: "Video uploaded", icon: Video },
  { key: "processing", label: "Analyzing your routine...", icon: Cpu },
  { key: "ready", label: "Preprocessing complete", icon: CheckCircle },
  { key: "analyzed", label: "Analysis ready!", icon: BarChart3 },
];

export default function ProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [status, setStatus] = useState("processing");
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [stuckMinutes, setStuckMinutes] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const startedAt = Date.now();

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/videos/${videoId}/status`);
        if (!res.ok) return;

        const data = await res.json();
        setStatus(data.status);

        if (data.status === "analyzed" && data.analysisId) {
          setAnalysisId(data.analysisId);
          clearInterval(interval);
          // Redirect to analysis page after a brief celebration moment
          setTimeout(() => {
            router.push(`/analysis/${videoId}`);
          }, 2000);
        } else if (data.status === "error") {
          clearInterval(interval);
        } else if (data.status === "processing") {
          // Check if processing has been stuck too long
          const elapsedMs = Date.now() - startedAt;
          const elapsed = Math.floor(elapsedMs / 60000);
          setStuckMinutes(elapsed);

          // If stuck for more than 6 minutes, mark as timed out
          if (elapsedMs > 6 * 60 * 1000) {
            setStatus("error");
            clearInterval(interval);
          }
        }
      } catch {
        // Silently retry
      }
    };

    // Poll every 3 seconds
    checkStatus();
    interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [videoId, router]);

  const currentStageIndex = stages.findIndex((s) => s.key === status);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <a href="/" className="inline-flex items-center gap-2 mb-8">
          <Sparkles className="h-6 w-6 text-primary-400" />
          <span className="text-lg font-bold">
            Routine<span className="gradient-text">X</span>
          </span>
        </a>

        {/* Main spinner / check */}
        <div className="mb-8">
          {status === "analyzed" ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <CheckCircle className="mx-auto h-20 w-20 text-green-400" />
            </motion.div>
          ) : status === "error" ? (
            <div className="mx-auto h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-3xl">!</span>
            </div>
          ) : (
            <Loader2 className="mx-auto h-20 w-20 text-primary-400 animate-spin" />
          )}
        </div>

        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-2">
          {status === "analyzed"
            ? "Analysis Complete!"
            : status === "error"
            ? "Something Went Wrong"
            : "Analyzing Your Routine"}
        </h1>

        <p className="text-surface-200 mb-8">
          {status === "analyzed"
            ? "Your full scorecard is ready. Redirecting..."
            : status === "error"
            ? "There was an issue processing your video. Please try uploading again."
            : stuckMinutes >= 3
            ? "Still working — longer routines can take a few extra minutes..."
            : "Our AI is watching your routine and scoring every moment. This usually takes 1-3 minutes."}
        </p>

        {/* Stage progress */}
        {status !== "error" && (
          <div className="glass rounded-2xl p-6 text-left space-y-4">
            {stages.map((stage, i) => {
              const isComplete = i < currentStageIndex || status === "analyzed";
              const isCurrent = i === currentStageIndex && status !== "analyzed";
              const StageIcon = stage.icon;

              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <div
                    className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${
                      isComplete
                        ? "bg-green-500/20"
                        : isCurrent
                        ? "bg-primary-500/20"
                        : "bg-white/5"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-primary-400 animate-spin" />
                    ) : (
                      <StageIcon className="h-4 w-4 text-surface-200" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isComplete
                        ? "text-green-400"
                        : isCurrent
                        ? "text-white font-medium"
                        : "text-surface-200"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Error action */}
        {status === "error" && (
          <a
            href="/upload"
            className="inline-flex items-center gap-2 mt-6 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Try Again
          </a>
        )}
      </motion.div>
    </div>
  );
}
