"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users, MessageCircle, Trophy, Sparkles, Heart, Eye, Shield } from "lucide-react";

// Coda — the social platform built into RoutineX. Same-aesthetic section
// advertises the community layer (feed, DMs, trophies, auras, studio pages).
// Keep gradient + glass system. No hero-level claims; this lives under the
// scoring pitch as a second-act reveal.

const pillars = [
  {
    icon: Trophy,
    tint: "from-gold-400 to-primary-500",
    title: "A Trophy Wall that actually means something",
    copy:
      "Every routine, every score, every High Gold — stacked on your profile as animated trophies with aura gradients. Not emojis. Tiered visual treatments scale from Gold to Diamond.",
  },
  {
    icon: Sparkles,
    tint: "from-accent-500 to-primary-500",
    title: "Auras instead of selfies",
    copy:
      "No photos of dancers anywhere on Coda. Identity is gradient auras, glyphs, and earned badges. Parents feel safe. Dancers get a look that's unmistakably theirs.",
  },
  {
    icon: MessageCircle,
    tint: "from-primary-400 to-accent-500",
    title: "DMs built for dance",
    copy:
      "Message the dancers and choreographers you actually know. Dance Bonds let you tag relationships — duet partner, studio-mate, competition rival — right into the thread.",
  },
  {
    icon: Heart,
    tint: "from-accent-500 to-gold-400",
    title: "A feed that uplifts, not one that judges",
    copy:
      "Fair Feed algorithm surfaces check-ins, score climbs, and new trophies from the people you follow. No viral leaderboards. No leaked scores. You control who sees what — per post.",
  },
  {
    icon: Users,
    tint: "from-primary-500 to-gold-500",
    title: "Studio & Choreographer pages",
    copy:
      "Every studio gets a public page. Every choreographer gets credited when their routines drop. Studios run recruiting, dancers find new teachers, everybody wins.",
  },
  {
    icon: Eye,
    tint: "from-gold-500 to-accent-500",
    title: "Granular visibility — on every single item",
    copy:
      "Public, followers only, studio only, or private — set per trophy, per score, per post. Enforced at the database level, not just the UI. Your feed is yours.",
  },
];

export default function CodaSocial() {
  return (
    <section id="coda" className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-accent-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-primary-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-1.5 mb-5">
            <Sparkles className="h-3.5 w-3.5 text-accent-400" />
            <span className="text-sm text-accent-200 font-semibold uppercase tracking-wider">
              Introducing Coda
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-display)]">
            The social platform built{" "}
            <span className="gradient-text">for dancers and cheer athletes.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-surface-200 leading-relaxed">
            Same account as your analyzer. One tap from your score to a community that
            <span className="text-white font-semibold"> celebrates every High Gold, Platinum, and Diamond</span> — without
            the photo-driven pressure of Instagram.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-surface-200">
            <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary-400" /><span>Zero dancer photos, ever</span></div>
            <div className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-accent-400" /><span>Per-item privacy controls</span></div>
            <div className="flex items-center gap-1.5"><Trophy className="h-4 w-4 text-gold-400" /><span>Earned trophies, not influencer posts</span></div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="glass rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/[0.07] transition-colors"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${p.tint} shadow-lg`}>
                <p.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1.5 leading-snug">{p.title}</h3>
                <p className="text-sm text-surface-200 leading-relaxed">{p.copy}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 text-center"
        >
          <p className="text-surface-200 text-sm mb-4">
            Coda is included with every RoutineX account.{" "}
            <span className="text-white font-semibold">Score your routine. Then step inside the community.</span>
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-600 via-primary-500 to-gold-500 px-7 py-3.5 font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-accent-600/20"
          >
            Claim your handle on Coda
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-3 text-xs text-surface-200/60">
            Handles are first-come. Founding members keep theirs forever.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
