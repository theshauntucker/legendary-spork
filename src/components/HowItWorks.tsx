"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Film the routine",
    description:
      "Any phone, any angle judges would see. Solos, duos, groups — dance or cheer, up to 10 minutes.",
  },
  {
    n: "02",
    title: "Upload it",
    description:
      "The video is processed on your device. Only still frames are analyzed — the footage never leaves your phone.",
  },
  {
    n: "03",
    title: "Get the score",
    description:
      "A 300-point scorecard from three AI judges, timestamped notes, and a prioritized fix list — in under 5 minutes.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="eyebrow text-[#B0356B] mb-4">How it works</p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight font-[family-name:var(--font-display)] text-[#221A29]">
            Film it. Upload it. Fix it.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <p
                className="text-5xl font-semibold font-[family-name:var(--font-display)] sunset-text leading-none"
                aria-hidden
              >
                {step.n}
              </p>
              <div className="hairline-sunset w-10 mt-5 mb-5 opacity-70" />
              <h3 className="text-xl font-bold text-[#221A29]">{step.title}</h3>
              <p className="mt-2.5 text-[15px] text-[#5D5565] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
