"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import AppStoreBadge from "@/components/AppStoreBadge";

/**
 * Hero — bright editorial. Ivory paper, serif headline, one primary CTA.
 * The product (a dark, cinematic score card) is the visual — no pricing
 * grids, no badge spam. Pricing lives once, in <Pricing />.
 */

const categories = [
  { label: "Technique", score: 32.2, max: 35 },
  { label: "Performance", score: 33.2, max: 35 },
  { label: "Choreography", score: 18.3, max: 20 },
  { label: "Overall Impression", score: 9.0, max: 10 },
];

const competitions = [
  "Star Power",
  "JUMP",
  "NUVO",
  "NexStar",
  "Revolution",
  "UCA",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-6 sm:pt-14 pb-16 sm:pb-24">
      {/* Soft warm wash — barely there */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gradient-to-r from-pink-200/40 via-orange-100/40 to-amber-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Headline block ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-7">
            <Image
              src="/sunset-x.png"
              alt="RoutineX"
              width={64}
              height={64}
              priority
              style={{ width: 64, height: 64 }}
            />
          </div>

          <p className="eyebrow text-[#B0356B] mb-5">
            AI video analysis for competitive dance &amp; cheer
          </p>

          <h1 className="text-[2.6rem] leading-[1.06] sm:text-6xl lg:text-[4.4rem] font-semibold tracking-tight font-[family-name:var(--font-display)] text-[#221A29]">
            Know her score{" "}
            <em className="italic sunset-text">before</em>
            <br className="hidden sm:block" /> the judges do.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-[#5D5565] leading-relaxed">
            Upload a routine. Three AI judges score it on a real 300-point
            rubric — technique, performance, choreography — with timestamped
            notes on exactly what to fix before competition day.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="/signup"
              className="btn-sunset inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold"
            >
              Analyze a routine
              <ArrowRight className="h-4.5 w-4.5" />
            </a>
            <a
              href="#sample-analysis"
              className="btn-outline-ink inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
            >
              See a sample report
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#7A7284]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#B0356B]" />
              Video never leaves your phone
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#C2410C]" />
              Results in under 5 minutes
            </span>
          </div>

          <div className="mt-8 flex justify-center">
            <AppStoreBadge variant="black" height={52} />
          </div>
        </motion.div>

        {/* ── The product: dark score card ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mt-14 sm:mt-16 max-w-2xl mx-auto"
        >
          {/* glow under the card */}
          <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-r from-pink-400/25 via-orange-300/20 to-amber-300/25 blur-2xl -z-10" />

          <div className="rounded-[26px] bg-[#15101C] text-white ring-1 ring-black/30 shadow-[0_40px_80px_-30px_rgba(34,26,41,0.5)] overflow-hidden">
            {/* Card header */}
            <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-5 border-b border-white/[0.07]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 mb-1.5">
                    RoutineX Score Report
                  </p>
                  <p className="font-semibold text-white text-base sm:text-lg leading-snug">
                    Teen Jazz Solo — &ldquo;Into the Light&rdquo;
                  </p>
                  <p className="text-xs text-white/45 mt-1">
                    Teen &bull; Jazz &bull; 2:45
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="text-5xl sm:text-6xl font-extrabold leading-none"
                    style={{
                      background:
                        "linear-gradient(135deg, #F472B6 0%, #FB923C 55%, #FBBF24 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    274
                  </p>
                  <p className="text-[11px] text-white/45 mt-1">out of 300</p>
                  <span className="inline-block mt-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-200">
                    High Gold
                  </span>
                </div>
              </div>
            </div>

            {/* Category bars */}
            <div className="px-6 sm:px-8 py-5 space-y-3.5">
              {categories.map((c, i) => (
                <div key={c.label}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[13px] text-white/70">{c.label}</span>
                    <span className="text-[13px] font-bold text-white">
                      {c.score.toFixed(1)}
                      <span className="text-white/35 font-medium"> / {c.max}</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(c.score / c.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 via-orange-400 to-amber-300"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Timestamped notes preview */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-7 space-y-2">
              <div className="flex items-start gap-3 rounded-xl bg-white/[0.05] px-3.5 py-2.5">
                <span className="shrink-0 text-[11px] font-mono font-bold text-pink-300/90 pt-0.5">
                  1:23
                </span>
                <AlertCircle className="shrink-0 h-3.5 w-3.5 text-amber-300 mt-0.5" />
                <span className="text-[13px] text-white/70 leading-snug">
                  Arm placement dropped during pirouette — easy fix
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white/[0.05] px-3.5 py-2.5">
                <span className="shrink-0 text-[11px] font-mono font-bold text-pink-300/90 pt-0.5">
                  2:15
                </span>
                <CheckCircle2 className="shrink-0 h-3.5 w-3.5 text-emerald-300 mt-0.5" />
                <span className="text-[13px] text-white/70 leading-snug">
                  Floor work: creative and well-executed — standout moment
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Competition strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-14 text-center"
        >
          <p className="eyebrow text-[#9A93A5] mb-4">
            Calibrated to the rubrics used at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5">
            {competitions.map((c) => (
              <span
                key={c}
                className="text-sm sm:text-base font-semibold tracking-wide text-[#7A7284]"
              >
                {c}
              </span>
            ))}
            <span className="text-sm text-[#9A93A5]">&amp; more</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
