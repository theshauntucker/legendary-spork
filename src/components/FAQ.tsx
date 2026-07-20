"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What happens to my dancer's video? Is it uploaded, stored, or sold?",
    a: `Your video never leaves your phone. RoutineX processes it locally on your device and extracts small still-frame snapshots at key moments — those are what get analyzed. The full video is never uploaded, never stored on our servers, and never seen by any human.\n\nThe frames auto-delete within 24 hours of your analysis completing, or you can delete them instantly from your results page.\n\nWe don't sell data. We don't share videos. No human ever views your content. Period.`,
  },
  {
    q: "How does the AI analysis work?",
    a: "RoutineX uses AI trained on real competition judging rubrics from major organizations. When you upload a video, three AI judges evaluate technique, performance quality, choreography, and overall impression — the same categories on a real scoresheet — and generate a detailed scorecard with actionable feedback in under 5 minutes.",
  },
  {
    q: "How accurate is the scoring compared to real judges?",
    a: "The AI is calibrated on thousands of real competition scores and judging rubrics. While no AI replaces the nuance of a live judge, RoutineX provides consistent, unbiased feedback that closely mirrors competition scoring — users report their RoutineX scores typically land within 5–8 points of their actual competition results.",
  },
  {
    q: "Is this a replacement for judges or coaching?",
    a: "No — RoutineX is a training tool, not a replacement. Think of it as an extra set of expert eyes on every practice run. Use it between competitions and lessons to track progress, catch what's costing points, and make the most of your studio time.",
  },
  {
    q: "What ages, styles, and formats does it support?",
    a: "All competitive divisions from Mini (5–6) through Senior (15–19), across Jazz, Contemporary, Lyrical, Hip Hop, Tap, Ballet, Musical Theater, Pom, Acro — and cheer, including All-Star and school programs. Upload MP4, MOV, or any standard format up to 10 minutes long.",
  },
  {
    q: "What does it cost?",
    a: "Your first analysis is $1.99. From there, most families choose Season Member — $4.99/month for four analyses every month plus the season dashboard. Competition week? The Competition Pack is five analyses for $9.99, and credits never expire. Studios have their own plan with a shared analysis pool.",
  },
  {
    q: "Can I get a refund?",
    a: "If you're not satisfied with your experience, reach out through the Contact page and we'll work with you. We want every dancer to get real value from RoutineX.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="eyebrow text-[#B0356B] mb-4">FAQ</p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight font-[family-name:var(--font-display)] text-[#221A29]">
            The questions parents ask.
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="lux-card rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
              >
                <span className="font-semibold text-[15px] text-[#221A29] pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#8B8492] transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 sm:px-6 pb-6 text-[15px] text-[#5D5565] leading-relaxed whitespace-pre-line">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
