"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Gift, Zap, Star, Crown, Sparkles } from "lucide-react";
import { startCheckout } from "@/lib/checkout";

export default function Pricing() {
  const [subLoading, setSubLoading] = useState(false);

  // Routes through Stripe Checkout on web, native StoreKit IAP inside the
  // iOS Capacitor shell. See src/lib/checkout.ts for the branch logic.
  const handleSubscribe = async () => {
    setSubLoading(true);
    const result = await startCheckout("subscription");
    if (!result.ok) {
      // Silently swallow user-cancelled IAPs; surface real errors.
      if (!result.cancelled) {
        alert(result.error || "Something went wrong. Please try again.");
      }
      setSubLoading(false);
      return;
    }
    // iOS path: receipt validated, credits granted in-place. Show a
    // success state by routing to the dashboard so the user sees the
    // updated balance without a full page refresh.
    if (!result.redirected) {
      window.location.href = "/dashboard?from=iap";
    }
    // Web path: result.redirected === true, browser is already navigating
    // to Stripe — leaving subLoading=true is fine, page is unmounting.
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
            From First Analysis to{" "}
            <span className="gradient-text">Whole-Studio Software</span>
          </h2>
          <p className="mt-4 text-lg text-surface-200 max-w-2xl mx-auto">
            Dancers, cheer athletes, and parents start free. Studio owners get a <span className="text-white font-semibold">30-day free trial — no credit card required.</span> Launch pricing locked in forever.
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

        {/* ── STUDIO & ACADEMY TIER — flagship card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8 relative rounded-3xl overflow-hidden border-2 border-gold-500/50 ring-2 ring-gold-500/20 ring-offset-2 ring-offset-transparent"
          style={{ boxShadow: "0 0 50px rgba(234,179,8,0.18)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-accent-900/30 to-gold-900/30" />
          <div className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gold-500 via-accent-500 to-primary-500 px-3 py-1 text-xs font-bold text-white z-10">
            <Crown className="h-3 w-3" />
            RUNS YOUR WHOLE STUDIO
          </div>

          <div className="relative px-6 sm:px-10 py-9">
            <div className="grid md:grid-cols-5 gap-8 items-center">
              {/* Left: headline + price */}
              <div className="md:col-span-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gold-300 mb-2">
                  <Sparkles className="h-3 w-3" />
                  Studio &amp; Academy Plan
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                  The whole studio on <span className="gradient-text">one board.</span>
                </h3>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-5xl font-extrabold text-white">$99</span>
                  <span className="text-surface-200">/month</span>
                </div>
                <p className="mt-1 text-sm font-bold text-emerald-300">
                  🎁 30-day free trial · No credit card required
                </p>
                <p className="mt-1 text-xs text-gold-300 font-semibold">
                  🔒 Founding-studio pricing — locked in forever
                </p>

                <a
                  href="/studio/signup"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-3.5 font-bold text-white hover:opacity-90 transition-opacity animate-pulse-glow text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  Start 30-Day Free Trial
                  <ArrowRight className="h-4 w-4" />
                </a>
                <p className="mt-2 text-center text-xs text-surface-200/70">
                  Takes 60 seconds. Cancel anytime.
                </p>
              </div>

              {/* Right: feature grid */}
              <div className="md:col-span-3">
                <p className="text-sm text-surface-200 mb-4">
                  One subscription covers your whole staff. Every choreographer gets analyses from a shared 100-analysis pool. Plus tools nobody else has built for studios:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { name: "Team Board", desc: "Every routine, every dancer — one pipeline" },
                    { name: "Music Hub", desc: "In-state song collision detection" },
                    { name: "Season Schedule", desc: "Competition calendar, built-in" },
                    { name: "Shared Credit Pool", desc: "100 analyses/mo across your staff" },
                    { name: "Coach's Playbook", desc: "Auto-generated notes for every routine" },
                    { name: "Dancer Roster", desc: "Track every dancer, every event" },
                  ].map((f) => (
                    <div key={f.name} className="flex items-start gap-2.5 rounded-xl bg-white/5 border border-white/10 px-3.5 py-3">
                      <Check className="h-4 w-4 text-gold-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-bold text-white">{f.name}</div>
                        <div className="text-xs text-surface-200/80">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
