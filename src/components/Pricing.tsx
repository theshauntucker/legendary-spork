"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { startCheckout } from "@/lib/checkout";

/**
 * Pricing — the only pricing section on the page. Three consumer tiers
 * (Season Member is the flagship, rendered as the dark "stage" card),
 * plus a single quiet band for the Studio plan. No badge spam, no
 * bargain framing — the numbers speak for themselves.
 */

export default function Pricing() {
  const [subLoading, setSubLoading] = useState(false);

  // Web → Stripe Checkout; iOS shell → native StoreKit IAP.
  // Branch logic lives in src/lib/checkout.ts — never call /api/checkout
  // directly from a component.
  const handleSubscribe = async () => {
    setSubLoading(true);
    const result = await startCheckout("subscription");
    if (!result.ok) {
      if (!result.cancelled) {
        alert(result.error || "Something went wrong. Please try again.");
      }
      setSubLoading(false);
      return;
    }
    if (!result.redirected) {
      window.location.href = "/dashboard?from=iap";
    }
  };

  return (
    <section id="pricing" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="eyebrow text-[#B0356B] mb-4">Membership</p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight font-[family-name:var(--font-display)] text-[#221A29]">
            Simple pricing. Serious feedback.
          </h2>
          <p className="mt-5 text-lg text-[#5D5565] max-w-xl mx-auto">
            Start with a single analysis. Stay for the season.
          </p>
        </motion.div>

        {/* ── Three tiers ── */}
        <div className="grid md:grid-cols-3 gap-5 items-stretch max-w-5xl mx-auto">
          {/* Single */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lux-card rounded-3xl p-8 flex flex-col"
          >
            <h3 className="font-bold text-[#221A29]">First Analysis</h3>
            <p className="text-sm text-[#8B8492] mt-1">
              See the full report on one routine.
            </p>
            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-5xl font-semibold tracking-tight text-[#221A29] font-[family-name:var(--font-display)]">
                $1.99
              </span>
              <span className="text-sm text-[#8B8492]">once</span>
            </div>
            <ul className="mt-7 space-y-3 flex-1">
              {[
                "One complete analysis",
                "300-point scorecard, three judges",
                "Timestamped notes + Coach's Playbook",
                "Results in under 5 minutes",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#B0356B] mt-0.5 shrink-0" />
                  <span className="text-sm text-[#5D5565]">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="btn-outline-ink mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
            >
              Start with one
            </a>
          </motion.div>

          {/* Season Member — flagship dark card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-3xl p-8 flex flex-col stage-dark text-white shadow-[0_36px_70px_-28px_rgba(34,26,41,0.55)] md:-my-3"
          >
            <div className="absolute top-0 left-8 right-8 hairline-sunset" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Season Member</h3>
              <span className="rounded-full bg-white/[0.09] border border-white/15 px-3 py-1 text-[11px] font-semibold text-white/85">
                Most popular
              </span>
            </div>
            <p className="text-sm text-white/50 mt-1">
              For families competing all season long.
            </p>
            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-5xl font-semibold tracking-tight font-[family-name:var(--font-display)]">
                $4.99
              </span>
              <span className="text-sm text-white/50">/ month</span>
            </div>
            <ul className="mt-7 space-y-3 flex-1">
              {[
                "4 analyses every month",
                "Season dashboard — watch scores climb",
                "Re-submission tracking on every routine",
                "Full judge reports, nothing held back",
                "Cancel anytime",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-amber-300 mt-0.5 shrink-0" />
                  <span className="text-sm text-white/75">{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleSubscribe}
              disabled={subLoading}
              className="btn-sunset mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold disabled:opacity-50"
            >
              {subLoading ? "One moment…" : "Become a Season Member"}
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 text-center text-[11px] text-white/40">
              Current rate stays locked for as long as you subscribe.
            </p>
          </motion.div>

          {/* Competition Pack */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lux-card rounded-3xl p-8 flex flex-col"
          >
            <h3 className="font-bold text-[#221A29]">Competition Pack</h3>
            <p className="text-sm text-[#8B8492] mt-1">
              Five analyses for competition week.
            </p>
            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-5xl font-semibold tracking-tight text-[#221A29] font-[family-name:var(--font-display)]">
                $9.99
              </span>
              <span className="text-sm text-[#8B8492]">5 analyses</span>
            </div>
            <ul className="mt-7 space-y-3 flex-1">
              {[
                "Five complete analyses",
                "Credits never expire",
                "Every style, dance & cheer",
                "Re-submission tracking included",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#B0356B] mt-0.5 shrink-0" />
                  <span className="text-sm text-[#5D5565]">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="btn-ink mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
            >
              Get the pack
            </a>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 text-center text-sm text-[#8B8492]"
        >
          Every plan includes the complete judge report — nothing inside an
          analysis is ever paywalled.
        </motion.p>

        {/* ── Studio band ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-16 lux-card rounded-3xl px-8 sm:px-10 py-9"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <p className="eyebrow text-[#B08A2E] mb-3">
                RoutineX for Studios
              </p>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#221A29] font-[family-name:var(--font-display)]">
                Run the whole studio on one board.
              </h3>
              <p className="mt-3 text-[15px] text-[#5D5565] leading-relaxed max-w-xl">
                Team Board, Music Hub with song-collision detection, season
                schedule, and a shared pool of 100 analyses a month — one
                subscription for your entire staff.
              </p>
            </div>
            <div className="shrink-0 text-left md:text-right">
              <div className="flex items-baseline gap-1.5 md:justify-end">
                <span className="text-4xl font-semibold tracking-tight text-[#221A29] font-[family-name:var(--font-display)]">
                  $99
                </span>
                <span className="text-sm text-[#8B8492]">/ month</span>
              </div>
              <p className="mt-1 text-sm text-[#5D5565]">
                30-day free trial · no card required
              </p>
              <a
                href="/studio/signup"
                className="btn-ink mt-4 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
              >
                Explore the studio plan
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
