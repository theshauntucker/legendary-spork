"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Gift } from "lucide-react";

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-14 sm:py-20">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            Simple Pricing
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            One Price. Full Access.
          </h2>
          <p className="mt-4 text-lg text-surface-200 max-w-2xl mx-auto">
            Join as a founding member for $4.99 and start analyzing routines instantly. A private coaching session costs $75+ — RoutineX gives you detailed feedback for a fraction of the price.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Trial Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">First-Time Offer</h3>
              <span className="text-xs bg-accent-500/20 text-accent-300 px-2 py-1 rounded-full font-bold uppercase tracking-wider">One-Time Only</span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-5xl font-extrabold">$4.99</span>
              <span className="text-surface-200 text-sm">1 analysis</span>
            </div>
            <p className="text-sm text-surface-200 mb-6">New to RoutineX? Try your first full AI analysis for $4.99. This offer is only available once.</p>
            <ul className="space-y-3 mb-8">
              {["1 full AI analysis included", "Competition-standard scoring", "Timestamped judge notes", "Improvement roadmap", "Results in under 5 minutes"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <a href="/signup" className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-accent-500 px-6 py-3.5 font-bold text-white hover:bg-accent-500/20 transition-colors">
              Try 1 Analysis — $4.99
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Pack Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative glass rounded-3xl p-8 border border-primary-500/30"
          >
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-600 to-gold-500 px-3 py-1 text-xs font-bold">
              <Gift className="h-3 w-3" />
              BEST VALUE
            </div>
            <div className="mt-2">
              <h3 className="text-xl font-bold">Competition Pack</h3>
              <div className="flex items-baseline gap-1 mt-3 mb-1">
                <span className="text-5xl font-extrabold">$24.99</span>
                <span className="text-surface-200 text-sm">5 analyses</span>
              </div>
              <p className="text-xs text-primary-400 font-semibold mb-3">Only $5/analysis — loved the trial? This is next.</p>
              <p className="text-sm text-surface-200 mb-6">5 full AI analyses. Use them on different routines or track the same routine week by week.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {["5 full AI analyses included", "Competition-standard scoring (Gold → Diamond)", "Timestamped notes on every key moment", "Technique, Performance & Choreography scores", "Prioritized improvement roadmap", "Results in under 5 minutes"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <a href="/signup" className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity animate-pulse-glow">
              Get 5 Analyses — $24.99
              <ArrowRight className="h-5 w-5" />
            </a>
            <p className="mt-3 text-center text-xs text-surface-200">Not satisfied? We&apos;ll make it right.</p>
          </motion.div>
        </div>

        {/* Value comparison */}
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
            <div className="text-white font-semibold">RoutineX: from <span className="text-primary-400">$4.99</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
