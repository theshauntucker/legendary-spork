"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Gift, Star, Upload } from "lucide-react";

export default function SuccessClient({ sessionId }: { sessionId?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative glass rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
        </motion.div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">
          You&apos;re <span className="gradient-text">In!</span>
        </h1>

        <p className="mt-4 text-surface-200">
          Welcome to RoutineX! Your account is set up and ready to go.
        </p>

        <div className="mt-8 space-y-3 text-left">
          <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
            <Gift className="h-5 w-5 text-primary-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">1 Analysis Included</p>
              <p className="text-xs text-surface-200">
                Your $4.99 trial includes 1 video analysis — upload your first routine now.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
            <Upload className="h-5 w-5 text-accent-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Upload & Analyze</p>
              <p className="text-xs text-surface-200">
                Head to your dashboard to upload a routine and get your detailed AI scoring report.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
            <Star className="h-5 w-5 text-gold-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">RoutineX Member</p>
              <p className="text-xs text-surface-200">
                Ready to upload? Head to your dashboard and use your 1 analysis credit.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-gradient-to-r from-primary-700/30 to-accent-600/30 p-4">
          <p className="text-sm font-medium">Share with your dance fam</p>
          <p className="text-xs text-surface-200 mt-1">
            Know a dance parent or coach who&apos;d love this? Spread the word!
          </p>
        </div>

        <a
          href={sessionId ? `/dashboard?session_id=${sessionId}` : "/dashboard"}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </a>
      </motion.div>
    </div>
  );
}
