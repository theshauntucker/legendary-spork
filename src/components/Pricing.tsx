"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Gift, Zap, Star, Crown, Sparkles } from "lucide-react";

export default function Pricing() {
  const [subLoading, setSubLoading] = useState(false);

  const handleSubscribe = async () => {
    setSubLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
        setSubLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setSubLoading(false);
    }
  };

  return (
    <section id="pricing" className="relative py-14 sm:py-20">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            No credit card needed to start. Upgrade whenever you&apos;re ready — or lock in our introductory subscription rate before it goes up.
          </p>
        </motion.div>

        {/* 4-column grid — stacks to 2-col on tablet, 1-col on mobile */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* FREE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.0 }}
            className="relative glass rounded-3xl p-7 border border-primary-400/40 flex flex-col"
          >
            <div className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-3 py-1 text-xs font-bold text-white">
              <Star className="h-3 w-3" />
              ALWAYS FREE
            </div>
            <div className="mt-3 mb-4">
              <h3 className="text-lg font-bold">First Analysis</h3>
              <div className="flex items-baseline gap-1 mt-3 mb-1">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-surface-200 text-sm">forever</span>
              </div>
              <p className="text-xs text-primary-300 font-semibold">No card — no strings</p>
            </div>
            <ul className="space-y-2.5 mb-7 flex-1">
              {[
                "1 full AI analysis",
                "Competition-standard scoring",
                "Timestamped judge notes",
                "Improvement roadmap",
                "Results in under 5 min",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-5 py-3.5 font-bold text-white hover:opacity-90 transition-opacity animate-pulse-glow text-sm"
            >
              <Gift className="h-4 w-4" />
              Start Free
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-2.5 text-center text-xs text-primary-300">✨ Always on us</p>
          </motion.div>

          {/* BOGO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative glass rounded-3xl p-7 border border-gold-500/30 flex flex-col"
          >
            <div className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gold-500 to-accent-500 px-3 py-1 text-xs font-bold text-white">
              <Zap className="h-3 w-3" />
              BOGO
            </div>
            <div className="mt-3 mb-4">
              <h3 className="text-lg font-bold">Buy One Get One</h3>
              <div className="flex items-baseline gap-1 mt-3 mb-1">
                <span className="text-4xl font-extrabold">$8.99</span>
                <span className="text-surface-200 text-sm">2 analyses</span>
              </div>
              <p className="text-xs text-gold-400 font-semibold">$4.50 each — BOGO deal</p>
            </div>
            <ul className="space-y-2.5 mb-7 flex-1">
              {[
                "2 full AI analyses",
                "Competition-standard scoring",
                "Timestamped judge notes",
                "Improvement roadmap",
                "Re-submission tracking",
                "Results in under 5 min",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-gold-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-gold-500 px-5 py-3.5 font-bold text-white hover:bg-gold-500/20 transition-colors text-sm"
            >
              Claim BOGO — $8.99
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* SEASON MEMBER — featured */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative glass rounded-3xl p-7 border-2 border-primary-500/60 flex flex-col ring-2 ring-primary-500/20 ring-offset-2 ring-offset-transparent"
            style={{ boxShadow: "0 0 40px rgba(139,92,246,0.15)" }}
          >
            <div className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-gold-400 px-3 py-1 text-xs font-bold text-white">
              <Crown className="h-3 w-3" />
              MOST POPULAR
            </div>
            <div className="mt-3 mb-4">
              <h3 className="text-lg font-bold">Season Member</h3>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-extrabold">$12.99</span>
                <span className="text-surface-200 text-sm">/month</span>
              </div>
              <p className="text-xs text-primary-300 font-semibold mt-1">Introductory rate — locked in forever</p>
            <p className="text-xs text-surface-200/60 italic mt-2">
              Upload after every rehearsal. Watch your scores climb all season.
            </p>
            </div>
            <ul className="space-y-2.5 mb-7 flex-1">
              {[
                "10 analyses per month",
                "Competition-standard scoring",
                "Timestamped judge notes",
                "Full season tracking dashboard",
                "Re-submission score tracking",
                "Cancel anytime",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleSubscribe}
              disabled={subLoading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-3.5 font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              <Sparkles className="h-4 w-4" />
              {subLoading ? "Loading..." : "Subscribe — $12.99/mo"}
            </button>
            <p className="mt-2.5 text-center text-xs text-primary-300">🔒 Rate locked in at intro price</p>
          </motion.div>

          {/* COMPETITION PACK */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative glass rounded-3xl p-7 border border-primary-500/30 flex flex-col"
          >
            <div className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-600 to-gold-500 px-3 py-1 text-xs font-bold text-white">
              <Gift className="h-3 w-3" />
              BEST VALUE
            </div>
            <div className="mt-3 mb-4">
              <h3 className="text-lg font-bold">Competition Pack</h3>
              <div className="flex items-baseline gap-1 mt-3 mb-1">
                <span className="text-4xl font-extrabold">$29.99</span>
                <span className="text-surface-200 text-sm">5 analyses</span>
              </div>
              <p className="text-xs text-primary-400 font-semibold">$6 each — save $15 vs single</p>
            </div>
            <ul className="space-y-2.5 mb-7 flex-1">
              {[
                "5 full AI analyses",
                "Competition-standard scoring",
                "Timestamped notes on every moment",
                "Technique, Performance & Choreography",
                "Prioritized improvement roadmap",
                "Re-submission score tracking",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-surface-200">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-primary-500 px-5 py-3.5 font-bold text-white hover:bg-primary-500/20 transition-colors text-sm"
            >
              Get 5 Analyses — $29.99
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-2.5 text-center text-xs text-surface-200">Not satisfied? We&apos;ll make it right.</p>
          </motion.div>
        </div>

        {/* Studio tier — full-width contact card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-5 relative rounded-3xl overflow-hidden border border-white/10 bg-white/3 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 via-transparent to-gold-900/20" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6 px-8 py-7">
            {/* Icon */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500/30 to-primary-500/30 border border-white/10">
              <Sparkles className="h-7 w-7 text-gold-300" />
            </div>

            {/* Copy */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gold-400 mb-1">
                <Crown className="h-3 w-3" />
                Studio &amp; Academy Plan
              </div>
              <h3 className="text-xl font-extrabold text-white">
                $99<span className="text-base font-semibold text-surface-200">/month</span>
                <span className="ml-3 text-sm font-normal text-surface-200">· 100 analyses/month · entire studio covered</span>
              </h3>
              <p className="mt-1 text-sm text-surface-200 max-w-xl">
                Built for studios, academies, and cheer programs that need to analyze multiple routines across teams. One subscription covers your whole studio — coaches, solos, groups, everything.
              </p>
            </div>

            {/* CTA */}
            <a
              href="mailto:22tucker22@comcast.net?subject=Studio%20Plan%20Inquiry&body=Hi%20Shaun%2C%20I%27m%20interested%20in%20the%20RoutineX%20Studio%20Plan%20for%20my%20studio."
              className="shrink-0 flex items-center gap-2 rounded-full border border-gold-400/60 px-6 py-3 font-bold text-gold-300 hover:bg-gold-500/10 transition-colors text-sm whitespace-nowrap"
            >
              Contact for Studio Access
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        {/* Bottom comparison line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-surface-200">
            <div><span className="line-through">Private lesson: $75–$150/hr</span></div>
            <div><span className="line-through">Competition entry: $80–$120</span></div>
            <div className="text-white font-semibold">RoutineX: <span className="text-gold-400">first analysis always free</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
