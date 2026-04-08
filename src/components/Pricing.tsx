"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Gift, Zap } from "lucide-react";

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
            Launch Offer — Limited Time
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            2 Analyses for <span className="gradient-text">$8.99</span>
          </h2>
          <p className="mt-4 text-lg text-surface-200 max-w-2xl mx-auto">
            Buy one analysis, get one free — our launch offer for early supporters. A private coaching session costs $75+; RoutineX gives you the same competition-standard feedback for a fraction of the price.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* BOGO Launch Offer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="relative glass rounded-3xl p-8 border border-gold-500/30"
          >
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gold-500 to-accent-500 px-3 py-1 text-xs font-bold text-white">
              <Zap className="h-3 w-3" />
              LAUNCH OFFER
            </div>
            <div className="mt-2">
              <h3 className="text-xl font-bold">BOGO — Buy One Get One</h3>
              <div className="flex items-baseline gap-1 mt-3 mb-1">
                <span className="text-5xl font-extrabold">$8.99</span>
                <span className="text-surface-200 text-sm">2 analyses</span>
              </div>
              <p className="text-xs text-gold-400 font-semibold mb-3">Only $4.50 each — limited time</p>
              <p className="text-sm text-surface-200 mb-6">Two full AI analyses. Use them on different routines or analyze the same one twice.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {["2 full AI analyses included", "Competition-standard scoring (Gold → Titanium)", "Timestamped judge notes", "Improvement roadmap", "Results in under 5 minutes"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-gold-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <a href="/signup" className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity animate-pulse-glow">
              Claim BOGO — $8.99
              <ArrowRight className="h-5 w-5" />
            </a>
          </motion.div>

          {/* Competition Pack */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
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
              <p className="text-xs text-primary-400 font-semibold mb-3">Only $6/analysis — save $15</p>
              <p className="text-sm text-surface-200 mb-6">5 full AI analyses. Track the same routine week by week or cover multiple dancers.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {["5 full AI analyses included", "Competition-standard scoring (Gold → Titanium)", "Timestamped notes on every key moment", "Technique, Performance & Choreography scores", "Prioritized improvement roadmap", "Results in under 5 minutes"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <a href="/signup" className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-primary-500 px-6 py-4 text-lg font-bold text-white hover:bg-primary-500/20 transition-colors">
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
            <div className="text-white font-semibold">RoutineX: from <span className="text-gold-400">$4.50/analysis</span> during launch</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
