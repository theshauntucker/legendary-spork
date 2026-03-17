"use client";

import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight, Gift, Star } from "lucide-react";

export default function SuccessPage() {
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
          Welcome to the DanceIQ beta. You&apos;re officially a founding member
          — one of only 500 with early access.
        </p>

        <div className="mt-8 space-y-3 text-left">
          <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
            <Gift className="h-5 w-5 text-primary-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">3 Free Analyses</p>
              <p className="text-xs text-surface-200">
                You&apos;ll get 3 free video analyses when we launch — no
                additional charge.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
            <Star className="h-5 w-5 text-gold-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Founding Member Status</p>
              <p className="text-xs text-surface-200">
                Your profile will carry a founding member badge permanently.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
            <Sparkles className="h-5 w-5 text-accent-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Early Access</p>
              <p className="text-xs text-surface-200">
                You&apos;ll get access 2-4 weeks before the public launch. We&apos;ll
                email you.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-gradient-to-r from-primary-700/30 to-accent-600/30 p-4">
          <p className="text-sm font-medium">Share with your dance fam</p>
          <p className="text-xs text-surface-200 mt-1">
            Know a dance parent or coach who&apos;d love this? Spread the word
            before beta spots run out.
          </p>
        </div>

        <a
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to DanceIQ
        </a>
      </motion.div>
    </div>
  );
}
