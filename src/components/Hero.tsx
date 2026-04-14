"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Star, Shield, Zap, Trophy, Check, Crown, Sparkles } from "lucide-react";

export default function Hero() {
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
    <section className="relative overflow-hidden pt-[130px] pb-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* ── Headline ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
            </span>
            <span className="text-sm text-primary-200">For competitive dancers, dance moms &amp; studio owners</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-display)]">
            Score Every Routine.{" "}
            <span className="gradient-text">Track the Whole Season.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-surface-200 leading-relaxed">
            Upload any routine and get <span className="text-white font-semibold">competition-standard scoring, timestamped judge notes, and a Coach&apos;s Playbook</span> in under 5 minutes.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-sm text-surface-200">
            <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary-400" /><span>Competition-Calibrated Scoring</span></div>
            <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-accent-400" /><span>Results in Under 5 Minutes</span></div>
            <div className="flex items-center gap-1.5"><Trophy className="h-4 w-4 text-gold-400" /><span>Full Season Tracking</span></div>
          </div>
        </motion.div>

        {/* ── Pricing cards — right here at the top ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 max-w-3xl mx-auto"
        >
          {/* Season Member — featured hero card */}
          <div
            className="relative glass rounded-3xl p-7 border-2 border-primary-500/60 flex flex-col mb-4 ring-2 ring-primary-500/20 ring-offset-2 ring-offset-transparent"
            style={{ boxShadow: "0 0 40px rgba(139,92,246,0.2)" }}
          >
            <div className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-gold-400 px-3 py-1 text-xs font-bold text-white">
              <Crown className="h-3 w-3" />
              MOST POPULAR
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
              <div>
                <h3 className="text-xl font-bold text-white">Season Member</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-white">$12.99</span>
                  <span className="text-surface-200 text-sm">/month</span>
                </div>
                <p className="text-xs text-primary-300 font-semibold mt-1">Introductory rate — locked in forever 🔒</p>
                <p className="text-xs text-surface-200/60 italic mt-1">Upload after every rehearsal. Watch your scores climb all season.</p>
              </div>

              <div className="sm:text-right shrink-0">
                <ul className="space-y-1.5 text-sm text-surface-200 mb-4 sm:text-left">
                  {[
                    "10 analyses per month",
                    "Full season tracking dashboard",
                    "Timestamped judge notes",
                    "Re-submission score tracking",
                    "Cancel anytime",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleSubscribe}
                  disabled={subLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-7 py-3.5 font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  {subLoading ? "Loading..." : "Subscribe — $12.99/mo"}
                </button>
              </div>
            </div>
          </div>

          {/* BOGO + Pack side by side */}
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            {/* BOGO */}
            <div className="relative glass rounded-3xl p-6 border border-yellow-500/40 flex flex-col">
              <div className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 px-3 py-1 text-xs font-bold text-white">
                <Zap className="h-3 w-3" />
                BOGO
              </div>
              <div className="mt-3 mb-3">
                <h3 className="text-base font-bold text-white">Buy One Get One</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-white">$8.99</span>
                  <span className="text-surface-200 text-xs">2 analyses</span>
                </div>
                <p className="text-xs text-yellow-300 font-semibold mt-0.5">$4.50 each — BOGO deal</p>
              </div>
              <ul className="space-y-1.5 mb-4 flex-1">
                {["2 full AI analyses", "Competition-standard scoring", "Timestamped judge notes", "Never expire"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-surface-200">
                    <Check className="h-3 w-3 text-yellow-400 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <a href="/signup" className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-yellow-500 px-5 py-3 font-bold text-white hover:bg-yellow-500/20 transition-colors text-sm">
                Claim BOGO — $8.99 <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Competition Pack */}
            <div className="relative glass rounded-3xl p-6 border border-primary-500/30 flex flex-col">
              <div className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-600 to-gold-500 px-3 py-1 text-xs font-bold text-white">
                BEST VALUE
              </div>
              <div className="mt-3 mb-3">
                <h3 className="text-base font-bold text-white">Competition Pack</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-white">$29.99</span>
                  <span className="text-surface-200 text-xs">5 analyses</span>
                </div>
                <p className="text-xs text-primary-400 font-semibold mt-0.5">$6 each — save $15 vs single</p>
              </div>
              <ul className="space-y-1.5 mb-4 flex-1">
                {["5 full AI analyses", "Only $6 each — save $15", "All styles supported", "Never expire"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-surface-200">
                    <Check className="h-3 w-3 text-primary-400 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <a href="/signup" className="w-full flex items-center justify-center gap-2 rounded-full border border-primary-500/60 px-5 py-3 font-bold text-white hover:bg-primary-500/20 transition-colors text-sm">
                Get 5 Analyses — $29.99 <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Free tier link */}
          <p className="text-center text-sm text-surface-200">
            Not sure yet?{" "}
            <a href="/signup" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors underline underline-offset-2">
              Start free — first analysis on us, no card required →
            </a>
          </p>
          <p className="text-center text-xs text-surface-200/50 mt-1">
            Already have an account? <a href="/login" className="hover:text-white transition-colors underline">Log in</a>
          </p>
        </motion.div>

        {/* ── Trust row ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-surface-200"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-400" />
            <span>Early access — join our first users</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-surface-800" />
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
            ))}
            <span className="ml-1">from studio owners nationwide</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-surface-800" />
          <div>Works with <span className="text-white font-semibold">every</span> major competition</div>
        </motion.div>

      </div>
    </section>
  );
}
