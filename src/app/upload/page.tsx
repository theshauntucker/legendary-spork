"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Video,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Loader2,
  Music,
  Users,
  ImageIcon,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import UploadTrustBadge from "@/components/UploadTrustBadge";
import {
  extractFrames,
  framesToBase64,
  loadVideoMetadata,
  type ExtractedFrame,
  type ExtractionProgress,
} from "@/lib/video-processor";

const ageGroups = [
  "Mini (5-6)",
  "Petite (6-9)",
  "Junior (9-12)",
  "Teen (12-15)",
  "Senior (15-19)",
  "Adult (20+)",
];

const danceStyles = [
  "Jazz",
  "Contemporary",
  "Lyrical",
  "Hip Hop",
  "Tap",
  "Ballet",
  "Musical Theater",
  "Pom",
  "Acro",
  "Cheer",
  "Open / Freestyle",
  "Clogging",
  "Pointe",
  "Character",
  "Improvisation",
];

const entryTypes = [
  "Solo",
  "Duo/Trio",
  "Small Group",
  "Large Group",
  "Line",
  "Super Line",
  "Production",
  "Extended Line",
];

type UploadStage =
  | "idle"
  | "extracting"
  | "uploading"
  | "analyzing"
  | "done"
  | "error";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [style, setStyle] = useState("");
  const [entryType, setEntryType] = useState("");
  const [dancerName, setDancerName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [parentConsent, setParentConsent] = useState(false);

  // Upload/processing state
  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  const isProcessing = stage !== "idle" && stage !== "error";

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (f: File) => {
    if (!f.type.startsWith("video/")) {
      setError("Please upload a video file (MP4, MOV, AVI, WebM).");
      return;
    }
    const sizeMB = f.size / (1024 * 1024);
    setFile(f);
    // No file size limit — video is processed locally, only thumbnails are sent
    setError(sizeMB > 500 ? "Large video detected — frame extraction may take a moment, but your video never leaves your device." : "");
    setExtractedFrames([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const resetState = useCallback(() => {
    setStage("idle");
    setProgress(0);
    setStatusMessage("");
    setError("");
    abortRef.current = false;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !routineName || !ageGroup || !style || !entryType) {
      setError("Please fill in all required fields and upload a video.");
      return;
    }
    if (!parentConsent) {
      setError("Parental/guardian consent is required before submitting a video for analysis.");
      return;
    }

    abortRef.current = false;
    setError("");
    setProgress(0);

    try {
      // ── Step 1: Extract frames from the video ──────────────────────
      setStage("extracting");
      setStatusMessage("Preparing your video...");

      const metadata = await loadVideoMetadata(file);
      // Determine frame count based on video duration
      // ~1 frame every 3-4 seconds for detailed technique analysis
      // Extract up to 20 frames — Claude API limit is 20 anyway,
      // so extracting more just wastes upload bandwidth
      const frameCount = Math.min(
        Math.max(12, Math.ceil(metadata.duration / 5)),
        20
      );

      const frames = await extractFrames(
        file,
        frameCount,
        (p: ExtractionProgress) => {
          const pct = Math.round((p.current / p.total) * 30); // 0-30%
          setProgress(pct);
          setStatusMessage(p.message);
        }
      );

      if (abortRef.current) return;
      setExtractedFrames(frames);

      // ── Step 2: Convert frames to base64 for upload ────────────────
      setStage("uploading");
      setProgress(35);
      setStatusMessage("Uploading frames for analysis...");

      const base64Frames = await framesToBase64(frames);

      // ── Step 3: Send to analysis API ───────────────────────────────
      setProgress(45);
      setStatusMessage("Uploading frames — this can take a minute for longer routines...");

      const payload = JSON.stringify({
        frames: base64Frames,
        metadata: {
          routineName,
          dancerName: dancerName || undefined,
          studioName: studioName || undefined,
          ageGroup,
          style,
          entryType,
          duration: metadata.duration,
          resolution: `${metadata.width}x${metadata.height}`,
          originalFilename: file.name,
          originalFileSize: file.size,
        },
      });

      // Retry up to 2 times for transient network errors
      let response: Response | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const controller = new AbortController();
          const fetchTimeout = setTimeout(() => controller.abort(), 180000);
          response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            signal: controller.signal,
          });
          clearTimeout(fetchTimeout);
          break; // Success — exit retry loop
        } catch (fetchErr) {
          if (attempt === 2) throw fetchErr;
          // Wait before retry: 2s, then 4s
          setStatusMessage(`Connection hiccup — retrying upload (attempt ${attempt + 2} of 3)...`);
          await new Promise((r) => setTimeout(r, (attempt + 1) * 2000));
        }
      }

      if (!response) throw new Error("Upload failed after multiple attempts");

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        // No credits — redirect to purchase
        if (response.status === 402 && data.code === "NO_CREDITS") {
          setStage("idle");
          setProgress(0);
          // Default to single analysis checkout
          const checkoutRes = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "single" }),
          });
          const checkoutData = await checkoutRes.json();
          if (checkoutData.url) {
            window.location.href = checkoutData.url;
            return;
          }
          throw new Error("Unable to start checkout. Please try again.");
        }

        throw new Error(
          data.error || `Upload failed (${response.status})`
        );
      }

      const result = await response.json();

      if (abortRef.current) return;

      // ── Step 4: Redirect to processing page ────────────────────────
      setStage("done");
      setProgress(100);
      setStatusMessage("Uploaded! Redirecting to analysis...");

      // Redirect to the processing page — AI analysis runs in background
      window.location.href = `/processing/${result.videoId}`;
    } catch (err) {
      if (abortRef.current) return;
      console.error("Upload/analysis error:", err);
      setStage("error");
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const stageLabel = () => {
    switch (stage) {
      case "extracting":
        return "Preparing video...";
      case "uploading":
        return "Uploading...";
      case "analyzing":
        return "Analyzing...";
      case "done":
        return "Complete!";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen py-20 px-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary-400" />
            <span className="text-lg font-bold">
              Routine<span className="gradient-text">X</span>
            </span>
          </a>
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">
            Upload Your Routine
          </h1>
          <p className="mt-3 text-surface-200">
            Upload your video and get a full AI analysis in under 2 minutes.
          </p>
          <div className="mt-4">
            <UploadTrustBadge />
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="glass rounded-3xl p-6 sm:p-8 space-y-6"
        >
          {/* Video Upload Zone */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Video File <span className="text-accent-400">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                isProcessing
                  ? "cursor-default border-white/10"
                  : "cursor-pointer"
              } ${
                dragActive
                  ? "border-primary-400 bg-primary-500/10"
                  : file
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-white/20 hover:border-white/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />

              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <Video className="h-8 w-8 text-green-400 shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="font-medium text-sm truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-surface-200">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    {!isProcessing && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setExtractedFrames([]);
                        }}
                        className="ml-2 p-1 rounded-full hover:bg-white/10 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Upload className="mx-auto h-10 w-10 text-surface-200 mb-3" />
                    <p className="font-medium text-sm">
                      Drag & drop your video here
                    </p>
                    <p className="text-xs text-surface-200 mt-1">
                      MP4, MOV, AVI, WebM — any size (processed on your device)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Frame Preview (shown after extraction) */}
          <AnimatePresence>
            {extractedFrames.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-3.5 w-3.5 text-primary-400" />
                  <span className="text-xs font-medium text-surface-200">
                    {extractedFrames.length} frames extracted for analysis
                  </span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
                  {extractedFrames.slice(0, 8).map((frame, i) => (
                    <div
                      key={i}
                      className="relative shrink-0 w-16 h-10 rounded-md overflow-hidden border border-white/10"
                    >
                      <img
                        src={frame.dataUrl}
                        alt={`Frame at ${frame.label}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-black/60 text-white/80">
                        {frame.label}
                      </span>
                    </div>
                  ))}
                  {extractedFrames.length > 8 && (
                    <div className="shrink-0 w-16 h-10 rounded-md border border-white/10 flex items-center justify-center bg-white/5">
                      <span className="text-[10px] text-surface-200">
                        +{extractedFrames.length - 8}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Routine Details */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Routine Name <span className="text-accent-400">*</span>
              </label>
              <input
                type="text"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder='e.g., "Into the Light"'
                disabled={isProcessing}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Dancer / Team Name
              </label>
              <input
                type="text"
                value={dancerName}
                onChange={(e) => setDancerName(e.target.value)}
                placeholder="e.g., Emma R."
                disabled={isProcessing}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Studio Name
            </label>
            <input
              type="text"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              placeholder="e.g., Elite Dance Academy"
              disabled={isProcessing}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Selectors */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Users className="inline h-3.5 w-3.5 mr-1" />
                Age Division <span className="text-accent-400">*</span>
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                disabled={isProcessing}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none disabled:opacity-50"
              >
                <option value="" className="bg-surface-900">
                  Select...
                </option>
                {ageGroups.map((ag) => (
                  <option key={ag} value={ag} className="bg-surface-900">
                    {ag}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Music className="inline h-3.5 w-3.5 mr-1" />
                Style <span className="text-accent-400">*</span>
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                disabled={isProcessing}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none disabled:opacity-50"
              >
                <option value="" className="bg-surface-900">
                  Select...
                </option>
                {danceStyles.map((s) => (
                  <option key={s} value={s} className="bg-surface-900">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Entry Type <span className="text-accent-400">*</span>
              </label>
              <select
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
                disabled={isProcessing}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none disabled:opacity-50"
              >
                <option value="" className="bg-surface-900">
                  Select...
                </option>
                {entryTypes.map((et) => (
                  <option key={et} value={et} className="bg-surface-900">
                    {et}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-red-300">{error}</p>
                  {stage === "error" && (
                    <button
                      type="button"
                      onClick={resetState}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Try again
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-surface-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Status */}
                <div className="flex items-center justify-center gap-2 text-xs text-surface-200">
                  {stage === "done" ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>{statusMessage || stageLabel()}</span>
                </div>

                {/* Stage indicators */}
                <div className="flex justify-between px-2">
                  {[
                    { key: "extracting", label: "Extract Frames" },
                    { key: "uploading", label: "Upload" },
                    { key: "analyzing", label: "AI Analysis" },
                    { key: "done", label: "Done" },
                  ].map((s, i) => {
                    const stages: UploadStage[] = [
                      "extracting",
                      "uploading",
                      "analyzing",
                      "done",
                    ];
                    const currentIdx = stages.indexOf(stage);
                    const thisIdx = i;
                    const isActive = thisIdx === currentIdx;
                    const isComplete = thisIdx < currentIdx;

                    return (
                      <div key={s.key} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full transition-colors ${
                            isComplete
                              ? "bg-green-400"
                              : isActive
                              ? "bg-primary-400"
                              : "bg-surface-600"
                          }`}
                        />
                        <span
                          className={`text-[10px] ${
                            isActive
                              ? "text-primary-400 font-medium"
                              : isComplete
                              ? "text-green-400"
                              : "text-surface-400"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Parental Consent */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <input
              type="checkbox"
              id="parentConsent"
              checked={parentConsent}
              onChange={(e) => setParentConsent(e.target.checked)}
              disabled={isProcessing}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500 shrink-0"
            />
            <label htmlFor="parentConsent" className="text-xs text-surface-200 leading-relaxed">
              I am the parent or legal guardian of the performer(s) in this video (or I am the performer and I am 18+). I consent to video frames being processed by AI for dance analysis. Frames are automatically deleted within 24 hours. See our{" "}
              <a href="/privacy" className="text-primary-400 underline hover:text-primary-300">Privacy Policy</a>.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isProcessing || !parentConsent}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {stageLabel()}
              </>
            ) : (
              <>
                Analyze My Routine
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          <p className="text-xs text-surface-200 text-center">
            1 credit will be used for this analysis.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
