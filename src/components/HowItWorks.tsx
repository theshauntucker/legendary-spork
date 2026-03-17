"use client";

import { motion } from "framer-motion";
import { Upload, Cpu, FileCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Routine",
    description:
      "Record your solo, duo/trio, or group routine and upload the video. We accept MP4, MOV, and all standard formats up to 10 minutes.",
    accent: "from-primary-500 to-primary-700",
  },
  {
    icon: Cpu,
    title: "AI Analyzes Everything",
    description:
      "Our AI — trained on real competition judging rubrics — scores your technique, performance quality, choreography, and overall impression in under 5 minutes.",
    accent: "from-accent-500 to-accent-700",
  },
  {
    icon: FileCheck,
    title: "Get Detailed Feedback",
    description:
      "Receive a full scorecard with per-category breakdowns, timestamped notes on key moments, and prioritized action items for improvement.",
    accent: "from-gold-400 to-gold-600",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            Simple Process
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            How RoutineX Works
          </h2>
          <p className="mt-4 text-lg text-surface-200 max-w-2xl mx-auto">
            From upload to actionable feedback in under 5 minutes. No appointments, no waiting for judges — just results.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary-500 via-accent-500 to-gold-500 opacity-30" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Step number */}
              <div className="mx-auto mb-6 relative">
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.accent} shadow-lg`}
                >
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface-950 border border-surface-800 text-xs font-bold text-white">
                  {i + 1}
                </span>
              </div>

              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="mt-3 text-surface-200 leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>

              {/* Arrow between steps (mobile) */}
              {i < steps.length - 1 && (
                <ArrowRight className="mx-auto mt-6 h-5 w-5 text-surface-800 md:hidden rotate-90" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
