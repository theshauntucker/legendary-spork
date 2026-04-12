"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, BarChart3, BookOpen, Lightbulb, Shield, Zap, Trophy, Target, RefreshCw, Star, Users } from "lucide-react";

const features = [
  { icon: BarChart3, color: "from-primary-500 to-primary-700", title: "3-Judge Scoring Panel", description: "Scores across Technique, Performance, Choreography, and Overall Impression — the exact same categories real competition judges use. Three simulated judge scores averaged just like on the actual panel.", tag: "Core" },
  { icon: Clock, color: "from-gold-400 to-gold-600", title: "Timestamped Notes", description: "The AI calls out specific moments at the exact second they happen — '0:32: Leap sequence, watch left arm' or '1:23: Arm placement dropped during pirouette.' Not generic feedback. Pinpoint moments.", tag: "Core" },
  { icon: Target, color: "from-accent-500 to-accent-700", title: "Coach's Playbook", description: "5–7 prioritized improvements ranked by impact. Each one includes what to fix, how long it'll take, and a specific drill or exercise. Something a parent can read out loud and their dancer can immediately work on.", tag: "Core" },
  { icon: TrendingUp, color: "from-green-500 to-green-700", title: "Progress Tracker", description: "Submit the same routine multiple times and watch the score climb. RoutineX remembers every previous submission, shows the full score history, and always rewards improvement — so dancers actually see their growth.", tag: "Unique" },
  { icon: RefreshCw, color: "from-primary-400 to-accent-500", title: "Re-Submission Tracking", description: "Click 'Submit Improved Routine' on any analysis and the upload form pre-fills with the routine linked. The AI sees all previous scores and coaching before giving new feedback — full context, every time.", tag: "Unique" },
  { icon: Lightbulb, color: "from-yellow-400 to-gold-500", title: "Judge Tips by Style", description: "Every style has a different judging lens. Jazz judges weight musicality and sharpness differently than Contemporary judges. RoutineX gives style-specific reminders tailored to exactly what that panel will look for.", tag: "Unique" },
  { icon: Trophy, color: "from-gold-400 to-primary-500", title: "Competition Benchmarks", description: "See how your score compares to the regional average, top 10%, and top 5% for your age division and style — not just a number, but context. 'You're 13 points above average and 8 from the top 10%.'", tag: "Core" },
  { icon: BookOpen, color: "from-accent-400 to-primary-500", title: "Detailed Category Feedback", description: "Written paragraph feedback for every scoring category. Not just a number — a judge's narrative. What's working, what to improve, and what specifically to focus on before the next competition.", tag: "Core" },
  { icon: Shield, color: "from-green-500 to-primary-600", title: "Video Never Leaves Your Phone", description: "Only still-frame thumbnails are analyzed — the actual video stays on your device, never uploaded, never stored, never seen by any human. Parents can feel completely safe. Kids' privacy is non-negotiable.", tag: "Privacy" },
  { icon: Star, color: "from-gold-500 to-accent-500", title: "All Major Competitions", description: "Calibrated to Star Power, JUMP, NUVO, NexStar, Revolution, UCA, NCA, 24 Seven, Applause, Turn It Up, Platinum, and RADIX rubrics. Wherever your dancer competes, RoutineX knows the scoring standard.", tag: "Coverage" },
  { icon: Users, color: "from-primary-500 to-gold-500", title: "Every Age & Style", description: "Mini (5–6) through Senior (15–19). Jazz, Contemporary, Lyrical, Hip Hop, Tap, Ballet, Musical Theater, Pom, Acro, Cheer — and more. The AI adjusts its judging criteria for each combination.", tag: "Coverage" },
  { icon: Zap, color: "from-accent-500 to-gold-400", title: "Results in Under 5 Minutes", description: "Upload before rehearsal, have the full report before practice ends. No scheduling, no waiting for a callback, no appointment. Competition-standard feedback whenever your dancer needs it.", tag: "Speed" },
];

const tagColors: Record<string, string> = {
  Core: "bg-primary-500/15 text-primary-300 border-primary-500/20",
  Unique: "bg-green-500/15 text-green-300 border-green-500/20",
  Privacy: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Coverage: "bg-gold-500/15 text-gold-300 border-gold-500/20",
  Speed: "bg-accent-500/15 text-accent-300 border-accent-500/20",
};

export default function Features() {
  return (
    <section id="features" className="relative py-14 sm:py-20">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gold-500/8 rounded-full blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">Everything Included</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            Built for <span className="gradient-text">Competitive Dance Families</span>
          </h2>
          <p className="mt-4 text-lg text-surface-200 max-w-2xl mx-auto">
            Every analysis includes all of this — no tiers, no add-ons. This is what dance parents and coaches get every single time they upload.
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
              className="glass rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 ${tagColors[feature.tag]}`}>
                  {feature.tag}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1.5">{feature.title}</h3>
                <p className="text-sm text-surface-200 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <p className="text-surface-200 text-sm mb-4">
            All of this — for the price of a single coffee run. <span className="text-white font-semibold">BOGO: 2 analyses for $8.99.</span>
          </p>
          <a href="/signup" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-7 py-3.5 font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-primary-600/20">
            Get 2 Analyses — $8.99
            <Zap className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
