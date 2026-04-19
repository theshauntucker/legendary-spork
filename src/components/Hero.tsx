"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Star, Shield, Zap, Trophy, Check, Crown, Sparkles } from "lucide-react";
import RoutineXLogo from "@/components/RoutineXLogo";

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

        {/* ── Brand lockup ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <RoutineXLogo size="xl" stacked />
        </motion.div>

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
            <span className="text-sm text-primary-200">For competitive dancers, cheer athletes, dance moms &amp; studio owners</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-display)]">
            Score Every Routine.{" "}
            <span className="gradient-text">Track the Whole Season.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-surface-200 leading-relaxed">
            Upload any routine and get <span className="text-white font-semibold">competition-standard scoring, timestamped judge notes, and a Coach&apos;s Playbook</span> in under 5 minutes. Then step into <span className="text-white font-semibold">Coda</span> — the private, photo-free social platform built for dancers, cheer athletes, and the studios who coach them.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-sm text-surface-200">
            <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary-400" /><span>Competition-Calibrated Scoring</span></div>
            <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-accent-400" /><span>Results in Under 5 Minutes</span></div>
            <div className="flex items-center gap-1.5"><Trophy className="h-4 w-4 text-gold-400" /><span>Trophies + Aura Profile</span></div>
            <div className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary-400" /><span>Studio & Choreographer Pages</span></div>
          </div>
        </motion.div>

        {/* ── Pricing cards — right here at the top ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 max-w-3xl mx-auto"
        >
          {/* Free first analysis */}
          <a
            href="/signup"
            className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3.5 mb-4 hover:bg-emerald-500/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 shrink-0">
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Try it free — first analysis on us</p>
                <p className="text-xs text-emerald-300/80">No credit card required. See your score in under 5 minutes.</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </a>

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

          <p className="text-center text-xs text-surface-200/50 mt-1">
            Already have an account? <a href="/login" className="hover:text-white transition-colors underline">Log in</a>
          </p>
        </motion.div>

        {/* ── FOR STUDIO OWNERS ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1">
              <Users className="h-3.5 w-3.5 text-gold-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-gold-300">For Studio Owners</span>
            </div>
          </div>

          <h2 className="text-center text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-display)]">
            Run your whole studio on <span className="gradient-text">one board.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base sm:text-lg text-surface-200 leading-relaxed">
            Team Board, Music Hub with in-state collision detection, Season Schedule, and a shared credit pool — one subscription for every choreographer on staff.
          </p>

          {/* Studio Subscription Card */}
          <div
            className="relative glass rounded-3xl p-7 border-2 border-gold-500/60 flex flex-col mt-8 ring-2 ring-gold-500/20 ring-offset-2 ring-offset-transparent"
            style={{ boxShadow: "0 0 40px rgba(234,179,8,0.18)" }}
          >
            <div className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gold-500 via-accent-500 to-primary-500 px-3 py-1 text-xs font-bold text-white">
              <Crown className="h-3 w-3" />
              RUNS YOUR WHOLE STUDIO
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
              <div>
                <h3 className="text-xl font-bold text-white">Studio Subscription</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-white">$99</span>
                  <span className="text-surface-200 text-sm">/month</span>
                </div>
                <p className="text-sm font-bold text-emerald-300 mt-1">🎁 30-day free trial — no credit card required</p>
                <p className="text-xs text-gold-300 font-semibold mt-1">🔒 Founding-studio pricing — locked in forever</p>
              </div>

              <div className="sm:text-right shrink-0">
                <ul className="space-y-1.5 text-sm text-surface-200 mb-4 sm:text-left">
                  {[
                    "100 analyses/mo — shared across staff",
                    "Team Board for every routine",
                    "Music Hub with collision detection",
                    "Season Schedule + travel",
                    "Cancel anytime in settings",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-gold-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/studio/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-7 py-3.5 font-bold text-white hover:opacity-90 transition-opacity text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  Start 30-Day Free Trial
                </a>
              </div>
            </div>
          </div>

          {/* 6-feature wow grid */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: "Team Board", desc: "Every routine, every dancer, every event" },
              { name: "Music Hub", desc: "Never share a song with a rival studio" },
              { name: "Season Schedule", desc: "Comp calendar, hotel blocks, travel" },
              { name: "Shared Credits", desc: "One pool. Every choreographer." },
              { name: "Coach's Playbook", desc: "Auto-generated per routine" },
              { name: "Dancer Roster", desc: "Track levels, events, readiness" },
            ].map((f) => (
              <div key={f.name} className="rounded-xl glass border border-white/10 px-3 py-2.5">
                <div className="text-sm font-bold text-white">{f.name}</div>
                <div className="text-xs text-surface-200/80 mt-0.5">{f.desc}</div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-surface-200/60">
            Already run a studio?{" "}
            <a href="/studio/dashboard" className="text-gold-300 hover:underline font-medium">
              Open your dashboard
            </a>
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
