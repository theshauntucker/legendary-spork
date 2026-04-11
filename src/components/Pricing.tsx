"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Gift, Zap, Star } from "lucide-react";

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-14 sm:py-20">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            Simple, honest pricing
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            Your First Analysis Is{" "}
            <span className="gradient-text">Always Free</span>
          </h2>
          <p className="mt-4 text-lg text-surface-200 max-w-2xl mx-auto">
            No credit card needed to get started. Sign up, upload your routine, and see real competition-standard feedback — on us. Come back for more whenever you&apos;re ready.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* FREE TIER */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.0 }}
            className="relative glass rounded-3xl p-8 border border-primary-400/40"
          >
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-3 py-1 text-xs font-bold text-white">
              <Star className="h-3 w-3" />
              ALWAYS FREE
            </div>
            <div className="mt-2">
              <h3 className="text-xl font-bold">First Analysis</h3>
              <div className="flex items-baseline gap-1 mt-3 mb-1">
                <span className="text-5xl font-extrabold">$0</span>
                <span className="text-surface-200 text-sm">1 analysis</span>
              </div>
              <p className="text-xs text-primary-300 font-semibold mb-3">No credit card — no strings attached</p>
              <p className="text-sm text-surface-200 mb-6">Sign up and get your first full AI analysis free. See exactly what our judges see before you spend a dime.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "1 full AI analysis included",
                "Competition-standard scoring",
                "Timestamped judge notes",
                "Improvement roadmap",
                "Results in under 5 minutes",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity animate-pulse-glow"
            >
              <Gift className="h-5 w-5" />
              Start Free — No Card
              <ArrowRight className="h-5 w-5" />
            </a>
            <p className="mt-3 text-center text-xs text-primary-300 font-semibold">✨ Your first analysis is always on us</p>
          </motion.div>

          {/* BOGO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative glass rounded-3xl p-8 border border-gold-500/30"
          >
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gold-500 to-accent-500 px-3 py-1 text-xs font-bold text-white">
              <Zap className="h-3 w-3" />
              COME BACK FOR MORE
            </div>
            <div className="mt-2">
              <h3 className="text-xl font-bold">BOGO — Buy One Get One</h3>
              <div className="flex items-baseline gap-1 mt-3 mb-1">
                <span className="text-5xl font-extrabold">$8.99</span>
                <span className="text-surface-200 text-sm">2 analyses</span>
              </div>
              <p className="text-xs text-gold-400 font-semibold mb-3">Only $4.50 each — buy one, get one free</p>
              <p className="text-sm text-surface-200 mb-6">Loved your free analysis? Get two more. Use them on different routines or re-submit the same one to track improvement.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "2 full AI analyses included",
                "Competition-standard scoring",
                "Timestamped judge notes",
                "Improvement roadmap",
                "Re-submission score tracking",
                "Results in under 5 minutes",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-gold-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-gold-500 px-6 py-4 text-lg font-bold text-white hover:bg-gold-500/20 transition-colors"
            >
              Claim BOGO — $8.99
              <ArrowRight className="h-5 w-5" />
            </a>
          </motion.div>

          {/* COMPETITION PACK */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative glass rounded-3xl p-8 border border-primary-500/30"
          >
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-600 to-gold-500 px-3 py-1 text-xs font-bold text-white">
              <Gift className="h-3 w-3" />
              BEST VALUE
            </div>
            <div className="mt-2">
              <h3 className="text-xl font-bold">Competition Pack</h3>
              <div className="flex items-baseline gap-1 mt-3 mb-1">
                <span className="text-5xl font-extrabold">$29.99</span>
                <span className="text-surface-200 text-sm">5 analyses</span>
              </div>
              <p className="text-xs text-primary-400 font-semibold mb-3">Only $6/analysis — save $15 vs single</p>
              <p className="text-sm text-surface-200 mb-6">Cover multiple dancers or track one routine all season. The serious choice for studio owners and comp families.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "5 full AI analyses included",
                "Competition-standard scoring",
                "Timestamped notes on every key moment",
                "Technique, Performance & Choreography",
                "Prioritized improvement roadmap",
                "Re-submission score tracking",
                "Results in under 5 minutes",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-primary-500 px-6 py-4 text-lg font-bold text-white hover:bg-primary-500/20 transition-colors"
            >
              Get 5 Analyses — $29.99
              <ArrowRight className="h-5 w-5" />
            </a>
            <p className="mt-3 text-center text-xs text-surface-200">Not satisfied? We&apos;ll make it right.</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-surface-200">
            <div><span className="line-through">Private lesson: $75–$150/hr</span></div>
            <div><span className="line-through">Competition entry fee: $80–$120</span></div>
            <div className="text-white font-semibold">RoutineX: <span className="text-gold-400">first analysis always free</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
