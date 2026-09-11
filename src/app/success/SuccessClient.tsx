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
          Payment received — you&apos;re all set.
        </p>

        <div className="mt-8 space-y-3 text-left">
          <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
            <Gift className="h-5 w-5 text-primary-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Credits added</p>
              <p className="text-xs text-surface-200">
                Your analyses are on your account and ready to use.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
            <Upload className="h-5 w-5 text-accent-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Upload & analyze</p>
              <p className="text-xs text-surface-200">
                Pick a routine video on your phone — the full judge report is usually ready in 1–3 minutes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
            <Star className="h-5 w-5 text-gold-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Track the season</p>
              <p className="text-xs text-surface-200">
                Every report lands in your Season Tracker so you can watch the scores climb.
              </p>
            </div>
          </div>
        </div>

        <a
          href="/upload"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-7 py-3.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
        >
          Upload a Routine
          <ArrowRight className="h-4 w-4" />
        </a>
        <div className="mt-4">
          <a
            href={sessionId ? `/dashboard?session_id=${sessionId}` : "/dashboard"}
            className="text-sm text-surface-200 hover:text-white underline-offset-2 hover:underline"
          >
            Go to Dashboard
          </a>
        </div>
      </motion.div>
    </div>
  );
}
