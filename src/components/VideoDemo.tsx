"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

export default function VideoDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if ((videoRef.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen) {
      // iOS Safari fullscreen support
      (videoRef.current as HTMLVideoElement & { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
    }
  };

  return (
    <section id="demo-video" className="relative py-24 sm:py-32">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            See It In Action
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            Watch How RoutineX Works
          </h2>
          <p className="mt-4 text-lg text-surface-200 max-w-2xl mx-auto">
            See how our AI breaks down a routine in real-time with competition-standard scoring.
          </p>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden glass"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          onTouchStart={() => setShowControls(true)}
        >
          {/*
            Video element with mobile-critical attributes:
            - playsInline: prevents iOS Safari from forcing fullscreen
            - muted: required for autoplay on mobile browsers
            - webkit-playsinline: legacy iOS support
            - preload="metadata": loads dimensions/duration without full download

            Replace the poster and source URLs with your actual video assets.
          */}
          <video
            ref={videoRef}
            className="w-full aspect-video bg-surface-900 object-cover"
            playsInline
            muted={isMuted}
            preload="metadata"
            poster="/demo-poster.jpg"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            {...{ "webkit-playsinline": "true" } as React.HTMLAttributes<HTMLVideoElement>}
          >
            {/* MP4 with H.264 codec — works on all mobile browsers */}
            <source src="/demo-video.mp4" type="video/mp4" />
            {/* WebM fallback for browsers that prefer it */}
            <source src="/demo-video.webm" type="video/webm" />
            Your browser does not support video playback.
          </video>

          {/* Play/Pause Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 cursor-pointer ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            }`}
            onClick={togglePlay}
          >
            {!isPlaying && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-500 shadow-2xl shadow-primary-600/40"
              >
                <Play className="h-8 w-8 text-white ml-1" />
              </motion.div>
            )}
          </div>

          {/* Bottom Controls */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between transition-opacity duration-300 ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-white" />
              ) : (
                <Play className="h-5 w-5 text-white" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </button>
              <button
                onClick={handleFullscreen}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Fullscreen"
              >
                <Maximize className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>

        <p className="mt-4 text-xs text-center text-surface-200">
          Demo video showing a sample AI analysis walkthrough
        </p>
      </div>
    </section>
  );
}
