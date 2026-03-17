"use client";

import { motion } from "framer-motion";
import { Check, Zap, ArrowRight, Gift } from "lucide-react";

export default function Pricing() {
  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
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
            No Subscriptions. No Hidden Fees.
          </h2>
          <p className="mt-4 text-lg text-surface-200 max-w-2xl mx-auto">
            Pay once to join, then only when you upload. A private coaching session costs $75+. RoutineX gives you detailed feedback for $2.99.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Beta Access Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative glass rounded-3xl p-8 border border-primary-500/30"
          >
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-3 py-1 text-xs font-bold">
              <Gift className="h-3 w-3" />
              LAUNCH SPECIAL — 1,000 SPOTS
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-bold">Launch Member Pass</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold">$9.99</span>
                <span className="text-surface-200 text-sm">one-time</span>
              </div>
              <p className="mt-3 text-sm text-surface-200">
                Join during our launch and get full platform access at our lowest price ever. This rate won&apos;t last.
              </p>
            </div>

            <ul className="mt-6 space-y-3">
              {[
                "Instant full platform access",
                "Upload and analyze right away",
                "Lock in founding member status",
                "3 free video analyses included",
                "Direct feedback channel to our team",
                "Founding member badge on profile",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className="mt-8 w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity animate-pulse-glow"
            >
              Get Started — $9.99
              <ArrowRight className="h-5 w-5" />
            </a>

            <p className="mt-3 text-center text-xs text-surface-200">
              Only 487 spots remaining. Secure checkout via Stripe.
            </p>
          </motion.div>

          {/* Per Upload Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-3xl p-8"
          >
            <h3 className="text-xl font-bold">Per Video Analysis</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold">$2.99</span>
              <span className="text-surface-200 text-sm">per upload</span>
            </div>
            <p className="mt-3 text-sm text-surface-200">
              Upload any routine and get your full AI analysis. No bulk commitments required — analyze as many or as few as you want.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Full scoring across all categories",
                "3-judge simulation with detailed breakdown",
                "Timestamped performance notes",
                "Prioritized improvement action items",
                "Competition comparison benchmarks",
                "Results in under 5 minutes",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-surface-200 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl bg-white/5 p-4 text-center">
              <Zap className="h-6 w-6 text-gold-400 mx-auto mb-2" />
              <p className="text-sm font-medium">Available at launch</p>
              <p className="text-xs text-surface-200 mt-1">
                Launch members get 3 free analyses to try before paying
              </p>
            </div>
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
            <div>
              <span className="line-through">Private lesson: $75–$150/hr</span>
            </div>
            <div>
              <span className="line-through">Competition entry: $80–$120</span>
            </div>
            <div className="text-white font-semibold">
              RoutineX analysis: <span className="text-primary-400">$2.99</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
