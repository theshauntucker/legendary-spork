"use client";

import { useState, useRef } from "react";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ageGroups = ["Mini (5-6)", "Petite (6-9)", "Junior (9-12)", "Teen (12-15)", "Senior (15-19)"];
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
];
const entryTypes = ["Solo", "Duo/Trio", "Small Group", "Large Group", "Production"];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [style, setStyle] = useState("");
  const [entryType, setEntryType] = useState("");
  const [dancerName, setDancerName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<"uploading" | "processing" | "done">("uploading");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
      setError("");
    } else {
      setError("Please upload a video file (MP4, MOV, AVI, WebM).");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a video file (MP4, MOV, AVI, WebM).");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !routineName || !ageGroup || !style || !entryType) {
      setError("Please fill in all required fields and upload a video.");
      return;
    }

    setUploading(true);
    setError("");
    setUploadStage("uploading");
    setUploadProgress(0);

    try {
      // Step 1: Get a signed upload URL
      const signedUrlRes = await fetch("/api/upload/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
          routineName,
          ageGroup,
          style,
          entryType,
          dancerName,
          studioName,
        }),
      });

      const signedUrlData = await signedUrlRes.json();

      if (!signedUrlRes.ok || !signedUrlData.signedUrl) {
        throw new Error(signedUrlData.error || "Failed to prepare upload");
      }

      const { videoId, storagePath, token } = signedUrlData;

      // Step 2: Upload directly to Supabase Storage with progress tracking
      const supabase = createClient();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 80); // 0-80% for upload
            setUploadProgress(percent);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));

        // Upload to the signed URL
        const uploadUrl = signedUrlData.signedUrl;
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      setUploadProgress(85);
      setUploadStage("processing");

      // Step 3: Notify the server that upload is complete, trigger preprocessing
      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (!completeRes.ok) {
        throw new Error("Failed to start processing");
      }

      setUploadProgress(100);
      setUploadStage("done");

      // Redirect to processing page
      setTimeout(() => {
        window.location.href = `/processing/${videoId}`;
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed. Please try again."
      );
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            Upload your video and get a full AI analysis in under 5 minutes.
          </p>
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
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
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
                    <Video className="h-8 w-8 text-green-400" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-surface-200">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="ml-2 p-1 rounded-full hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
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
                      MP4, MOV, AVI, WebM — up to 500MB
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

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
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
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
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
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
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
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
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
              >
                <option value="" className="bg-surface-900">Select...</option>
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
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
              >
                <option value="" className="bg-surface-900">Select...</option>
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
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
              >
                <option value="" className="bg-surface-900">Select...</option>
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
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Upload Progress */}
          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="h-2 rounded-full bg-surface-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-surface-200 mt-2 text-center">
                  {uploadStage === "uploading" && (
                    <>
                      <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                      Uploading to cloud... {Math.round(uploadProgress)}%
                    </>
                  )}
                  {uploadStage === "processing" && (
                    <>
                      <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                      Processing video...
                    </>
                  )}
                  {uploadStage === "done" && (
                    <>
                      <CheckCircle className="inline h-3 w-3 text-green-400 mr-1" />
                      Upload complete! Redirecting...
                    </>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {uploadStage === "uploading" ? "Uploading..." : "Processing..."}
              </>
            ) : (
              <>
                Analyze My Routine — $2.99
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          <p className="text-xs text-surface-200 text-center">
            Beta members: Your first 3 analyses are free.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
