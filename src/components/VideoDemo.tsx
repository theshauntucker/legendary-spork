"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";

export default function VideoDemo() {
  return (
    <section id="demo-video" className="relative py-14 sm:py-20">
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

        {/* Video Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden glass"
        >
          <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-surface-900 via-primary-950/30 to-surface-900 relative">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl" />
              <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-accent-500/10 rounded-full blur-2xl" />
            </div>

            {/* Play button visual */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-600/40 to-accent-500/40 border border-white/10 mb-5">
              <Play className="h-8 w-8 text-white/60 ml-1" />
            </div>

            <div className="relative flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary-400" />
              <p className="text-sm font-semibold text-white">Demo Video Coming Soon</p>
            </div>
            <p className="relative text-xs text-surface-200 max-w-xs text-center px-4">
              We&apos;re putting the finishing touches on a full walkthrough of the AI analysis experience.
            </p>
          </div>
        </motion.div>

        <p className="mt-4 text-xs text-center text-surface-200">
          Full video walkthrough of the AI scoring process
        </p>
      </div>
    </section>
  );
}
