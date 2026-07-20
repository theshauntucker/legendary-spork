"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  Trophy,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "A real judging panel",
    description:
      "Three AI judges score Technique, Performance, Choreography, and Overall Impression — the same categories on a real competition scoresheet, averaged the same way.",
  },
  {
    icon: Clock,
    title: "Timestamped notes",
    description:
      "Not “work on technique.” More like “1:23 — arm placement dropped during pirouette.” Every note lands on the exact second it happens.",
  },
  {
    icon: Target,
    title: "The Coach’s Playbook",
    description:
      "Five to seven fixes ranked by impact, each with a drill and a realistic timeline. Something you can read aloud in the car on the way to practice.",
  },
  {
    icon: TrendingUp,
    title: "Season tracking",
    description:
      "Re-submit the same routine as it improves. RoutineX remembers every score and shows the climb — Gold to High Gold to Platinum — across the whole season.",
  },
  {
    icon: Trophy,
    title: "Competition context",
    description:
      "Every score comes with benchmarks: the regional average, the top 10% line, and exactly how many points sit between your dancer and the next award level.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by design",
    description:
      "The video stays on your device. Only still frames are analyzed, they auto-delete after 24 hours, and no human ever sees them.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="eyebrow text-[#B0356B] mb-4">What you get</p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight font-[family-name:var(--font-display)] text-[#221A29]">
            Everything a judge sees.
            <br className="hidden sm:block" /> Nothing held back.
          </h2>
          <p className="mt-5 text-lg text-[#5D5565] max-w-xl mx-auto">
            Every analysis includes all of it — no tiers, no add-ons, nothing
            paywalled inside a report.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="lux-card rounded-2xl p-7"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/12 via-orange-400/12 to-amber-300/12 border border-[#221A29]/[0.06]">
                <feature.icon className="h-5 w-5 text-[#B0356B]" />
              </div>
              <h3 className="mt-5 font-bold text-[17px] text-[#221A29]">
                {feature.title}
              </h3>
              <p className="mt-2 text-[15px] text-[#5D5565] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
