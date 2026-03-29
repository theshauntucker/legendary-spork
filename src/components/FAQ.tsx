"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What happens to my dancer's video? Is it uploaded, stored, or sold?",
    a: `We get this question a lot, and it's the most important one we can answer.\n\nA dance mom emailed us and said it perfectly: "I really love the idea of this product. Would love to try — but I'm wondering about your privacy policy. What happens to the videos of the children being uploaded? Privacy is a real issue and we want to protect our children. Are videos sold to third parties?"\n\nHere is the honest, complete answer:\n\nYour video never leaves your phone. RoutineX processes your video locally on your device. We extract small still-frame snapshots at key moments — those are what get analyzed. The full video is never uploaded, never stored on our servers, and never seen by any human.\n\nWhat about the frames? They're automatically deleted within 24 hours of your analysis completing. Don't want to wait? You can delete them immediately from your results page — one tap and they're gone.\n\nWe don't sell data. We don't share videos. No human ever views your content. Period.\n\nYour child's privacy isn't an afterthought. It's how we built RoutineX from day one.`,
  },
  {
    q: "How does the AI analysis work?",
    a: "RoutineX uses advanced AI trained on real competition judging rubrics from major organizations. When you upload a video, our AI evaluates technique, performance quality, choreography, and overall impression — the same categories judges use — and generates a detailed scorecard with actionable feedback in under 5 minutes.",
  },
  {
    q: "What video formats and lengths are supported?",
    a: "We accept MP4, MOV, AVI, and all standard video formats. Routines can be up to 10 minutes long. For best results, we recommend recording from a front-facing angle with good lighting, similar to how judges would view the performance.",
  },
  {
    q: "How accurate is the scoring compared to real judges?",
    a: "Our AI is trained on thousands of real competition scores and judging rubrics. While no AI replaces the nuance of a live judge, RoutineX provides consistent, unbiased feedback that closely mirrors competition scoring. Users report their RoutineX scores typically fall within 5-8 points of their actual competition scores.",
  },
  {
    q: "Is this a replacement for judges or coaching?",
    a: "Not at all — RoutineX is a training tool, not a replacement. Think of it as having an extra set of expert eyes on every practice run. Use it between competitions and lessons to track progress, identify areas for improvement, and make the most of your studio time.",
  },
  {
    q: "What age groups and styles does this work for?",
    a: "RoutineX works for all competitive age divisions — Mini (5-6), Petite (6-9), Junior (9-12), Teen (12-15), and Senior (15-19). We support Jazz, Contemporary, Lyrical, Hip Hop, Tap, Ballet, Musical Theater, Pom, and Acro. Our AI adapts its scoring criteria to each style.",
  },
  {
    q: "Can I use this for cheer routines too?",
    a: "Yes! RoutineX analyzes cheer routines with the same level of detail, evaluating tumbling, stunts, formations, synchronization, and overall performance quality. It works for both All-Star and school cheer programs.",
  },
  {
    q: "What do I get when I sign up?",
    a: "When you sign up, you automatically get your first analysis FREE. After that, single analyses are $8.99 each, or grab our Competition Pack — 5 analyses for $29.99 (just $6 each).",
  },
  {
    q: "Can I get a refund?",
    a: "If you're not satisfied with your experience, reach out to us through the Contact page and we'll work with you. We want every dancer to get real value from RoutineX.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-14 sm:py-20">
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
                    <p className="px-5 pb-5 text-sm text-surface-200 leading-relaxed whitespace-pre-line">
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
