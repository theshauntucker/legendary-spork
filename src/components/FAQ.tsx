"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How does the AI analysis work?",
    a: "DanceIQ uses advanced AI trained on real competition judging rubrics from major organizations. When you upload a video, our AI evaluates technique, performance quality, choreography, and overall impression — the same categories judges use — and generates a detailed scorecard with actionable feedback in under 5 minutes.",
  },
  {
    q: "What video formats and lengths are supported?",
    a: "We accept MP4, MOV, AVI, and all standard video formats. Routines can be up to 10 minutes long. For best results, we recommend recording from a front-facing angle with good lighting, similar to how judges would view the performance.",
  },
  {
    q: "How accurate is the scoring compared to real judges?",
    a: "Our AI is trained on thousands of real competition scores and judging rubrics. While no AI replaces the nuance of a live judge, DanceIQ provides consistent, unbiased feedback that closely mirrors competition scoring. Beta testers report their DanceIQ scores typically fall within 5-8 points of their actual competition scores.",
  },
  {
    q: "Is this a replacement for judges or coaching?",
    a: "Not at all — DanceIQ is a training tool, not a replacement. Think of it as having an extra set of expert eyes on every practice run. Use it between competitions and lessons to track progress, identify areas for improvement, and make the most of your studio time.",
  },
  {
    q: "What age groups and styles does this work for?",
    a: "DanceIQ works for all competitive age divisions — Mini (5-6), Petite (6-9), Junior (9-12), Teen (12-15), and Senior (15-19). We support Jazz, Contemporary, Lyrical, Hip Hop, Tap, Ballet, Musical Theater, Pom, and Acro. Our AI adapts its scoring criteria to each style.",
  },
  {
    q: "Can I use this for cheer routines too?",
    a: "Yes! DanceIQ analyzes cheer routines with the same level of detail, evaluating tumbling, stunts, formations, synchronization, and overall performance quality. It works for both All-Star and school cheer programs.",
  },
  {
    q: "What do I get as a beta member?",
    a: "Beta members ($9.99 one-time) get priority access when we launch, 3 free video analyses to sample the full platform, founding member status with a profile badge, and a direct feedback channel to shape the product. Only 500 beta spots are available.",
  },
  {
    q: "When will the full platform launch?",
    a: "We're targeting Q2 2026 for our full public launch. Beta members will get access 2-4 weeks before the public launch to test everything and provide feedback. Join the waitlist to stay updated.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            FAQ
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            Questions? We&apos;ve Got Answers.
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="glass rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === i ? null : i)
                }
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-sm pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-surface-200 transition-transform ${
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
                    <p className="px-5 pb-5 text-sm text-surface-200 leading-relaxed">
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
