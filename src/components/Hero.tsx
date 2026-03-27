"use client";

import { motion } from "framer-motion";
import { Play, ArrowRight, Users, Star, Shield, Zap, Trophy } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-500/35 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
            Routine<span className="gradient-text">X</span>
          </h2>
        </motion.div>

        {/* Launch badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
          </span>
          <span className="text-sm text-primary-200">
            Now Live — Start Analyzing Today
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-display)]"
        >
          AI-Powered{" "}
          <span className="gradient-text">Dance Scoring</span>
          <br />
          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-200 mt-2 block">
            for Competitive Dancers
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-surface-200 leading-relaxed"
        >
          Upload your routine and get{" "}
          <span className="text-white font-semibold">
            competition-standard scoring
          </span>{" "}
          with detailed, actionable feedback — powered by AI trained on
          real judging rubrics from Star Power, JUMP, UCA &amp; more.
        </motion.p>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-surface-200"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-primary-400" />
            <span>Competition-Calibrated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-accent-400" />
            <span>Results in Minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-gold-400" />
            <span>Used by Studio Owners</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Free CTA */}
          <div className="flex flex-col items-center gap-1">
            <a
              href="/signup"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all animate-pulse-glow"
            >
              Get Your Free Analysis
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <span className="text-xs text-green-300 font-semibold">Your first analysis is completely free</span>
          </div>

          {/* Pack CTA */}
          <div className="flex flex-col items-center gap-1">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-4 text-base font-medium text-white hover:bg-white/5 transition-colors"
            >
              Get 5 Analyses — $29.99
            </a>
            <span className="text-xs text-gray-400">Only $6 each — save $15</span>
          </div>
        </motion.div>

        {/* Small login link for returning users — not a CTA */}
        <p className="mt-2 text-xs text-surface-200">
          Already have an account?{" "}
          <a href="/login" className="underline hover:text-white transition-colors">Log in</a>
        </p>

        {/* Privacy trust badge — DIRECTLY below buttons, impossible to miss */}
        <div className="mt-6 mx-auto max-w-2xl">
          <div className="bg-white/10 border border-gold-400/50 rounded-2xl px-6 py-4 text-center">
            <p className="text-base font-bold text-white mb-1">🔒 Your video never leaves your phone.</p>
            <p className="text-sm text-gray-300">Only still-frame thumbnails are analyzed by AI. Nothing is uploaded, stored, or seen by any human. Ever.</p>
          </div>
        </div>

        {/* See Sample link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4"
        >
          <a
            href="#sample-analysis"
            className="inline-flex items-center gap-2 text-sm text-surface-200 hover:text-white transition-colors"
          >
            <Play className="h-4 w-4 text-primary-400" />
            See a sample analysis first
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-surface-200"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-400" />
            <span>
              
            </span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-surface-800" />
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-gold-400 text-gold-400"
              />
            ))}
            <span className="ml-1">from studio owners nationwide</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-surface-800" />
          <div>
            Works with{" "}
            <span className="text-white font-semibold">every</span> major
            competition
          </div>
        </motion.div>

        {/* Floating analysis preview card */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 mx-auto max-w-4xl"
        >
          <div className="glass rounded-2xl p-6 sm:p-8 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider">
                  Sample Analysis Preview
                </p>
                <p className="text-lg font-bold mt-1">
                  Teen Jazz Solo — &quot;Into the Light&quot;
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold gradient-text">274</p>
                <p className="text-xs text-surface-200">out of 300</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Technique", score: 32.2, max: 35 },
                { label: "Performance", score: 33.2, max: 35 },
                { label: "Choreography", score: 18.3, max: 20 },
                { label: "Overall", score: 9.0, max: 10 },
              ].map((cat) => (
                <div
                  key={cat.label}
                  className="rounded-xl bg-white/5 p-3 text-center"
                >
                  <p className="text-xs text-surface-200">{cat.label}</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {cat.score}
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-surface-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-400"
                      style={{
                        width: `${(cat.score / cat.max) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-surface-200 mt-1">
                    / {cat.max}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-center text-surface-200">
              <a
                href="#sample-analysis"
                className="text-primary-400 hover:underline"
              >
                See the full detailed analysis below &darr;
              </a>
            </p>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
