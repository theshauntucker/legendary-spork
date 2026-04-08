"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Gift, Sparkles, Clock } from "lucide-react";

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
            Launch Weekend Pricing
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            Your First Analysis is <span className="gradient-text">Free</span>
          </h2>
          <p className="mt-4 text-lg text-surface-200 max-w-2xl mx-auto">
            Sign up and get your first full AI analysis completely free. A private coaching session costs $75+ — RoutineX gives you detailed, competition-standard feedback for a fraction of the price.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Free First Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="glass rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">First Analysis</h3>
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Free</span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-5xl font-extrabold">$0</span>
              <span className="text-surface-200 text-sm">1 analysis</span>
            </div>
            <p className="text-sm text-surface-200 mb-6">Sign up and try your first full AI analysis completely free. No credit card required.</p>
            <ul className="space-y-3 mb-8">
              {["1 free AI analysis", "Competition-standard scoring", "Timestamped judge notes", "Improvement roadmap", "Results in under 5 minutes"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <a href="/signup" className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-green-500 px-6 py-3.5 font-bold text-white hover:bg-green-500/20 transition-colors">
              Get Free Analysis
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Single Analysis — BOGO during launch */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative glass rounded-3xl p-8 border border-accent-500/30"
          >
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent-600 to-accent-400 px-3 py-1 text-xs font-bold">
              <Gift className="h-3 w-3" />
              BUY ONE GET ONE FREE
            </div>
            <div className="mt-2 flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Launch Offer</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-extrabold">$8.99</span>
              <div className="flex flex-col">
                <span className="text-sm text-green-400 font-bold">2 analyses</span>
                <span className="text-xs text-surface-200 line-through">was $17.98</span>
              </div>
            </div>
            <p className="text-xs text-accent-400 font-semibold mb-3">Limited-time: buy 1, get 1 free — save $8.99</p>
            <p className="text-sm text-surface-200 mb-6">Used your free analysis? Get two more for the price of one — use them on different routines or track progress on the same one.</p>
            <ul className="space-y-3 mb-8">
              {["2 full AI analyses (BOGO)", "Competition-standard scoring", "Timestamped judge notes", "Improvement roadmap", "Results in under 5 minutes"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <a href="/signup" className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-accent-500 bg-accent-500/10 px-6 py-3.5 font-bold text-white hover:bg-accent-500/20 transition-colors">
              Claim BOGO — $8.99
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Competition Pack */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="relative glass rounded-3xl p-8 border border-primary-500/30"
          >
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-600 to-gold-500 px-3 py-1 text-xs font-bold">
              <Gift className="h-3 w-3" />
              BEST VALUE
            </div>
            <div className="mt-2">
              <h3 className="text-xl font-bold">Competition Pack</h3>
              <div className="flex items-baseline gap-1 mt-3 mb-1">
                <span className="text-5xl font-extrabold">$29.99</span>
                <span className="text-surface-200 text-sm">5 analyses</span>
              </div>
              <p className="text-xs text-primary-400 font-semibold mb-3">Only $6/analysis — save $15 vs buying singles</p>
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
              Get 5 Analyses — $29.99
              <ArrowRight className="h-5 w-5" />
            </a>
            <p className="mt-3 text-center text-xs text-surface-200">Not satisfied? We&apos;ll make it right.</p>
          </motion.div>
        </div>

        {/* Urgency deadline bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8 mx-auto max-w-xl"
        >
          <div className="flex items-center justify-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-5 py-2.5 text-sm font-semibold text-gold-300">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Launch pricing ends April 20 — lock in your rate before it goes up</span>
          </div>
        </motion.div>

        {/* Value comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-surface-200">
            <div><span className="line-through">Private lesson: $75–$150/hr</span></div>
            <div><span className="line-through">Competition entry fee: $80–$120</span></div>
            <div className="text-white font-semibold">RoutineX: <span className="text-green-400">First one FREE</span>, then from <span className="text-primary-400">$6/analysis</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
