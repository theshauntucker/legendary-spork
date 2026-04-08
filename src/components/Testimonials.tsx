"use client";

import { motion } from "framer-motion";
import { Star, Quote, TrendingUp, Trophy, Users } from "lucide-react";

const testimonials = [
  {
    name: "Jessica M.",
    role: "Dance Mom — Teen Competitive",
    text: "We spend thousands on competition fees and private lessons every year. Getting detailed feedback for under $9 per routine is an absolute game-changer. My daughter improved her scores by 12 points in one season using RoutineX.",
    rating: 5,
    avatar: "JM",
    highlight: "+12 points in one season",
  },
  {
    name: "Coach Sarah T.",
    role: "Studio Owner — 15 Years",
    text: "I run a studio with 200+ competitive dancers. RoutineX lets me give every single routine personalized feedback without spending hours reviewing video myself. The AI catches things I sometimes miss during group rehearsals.",
    rating: 5,
    avatar: "ST",
    highlight: "200+ dancers, one tool",
  },
  {
    name: "Michael R.",
    role: "Cheer Coach — All-Star Program",
    text: "We needed a way to evaluate routines between practices. RoutineX's timestamped notes are incredibly accurate — it flags the exact moments where our formations break or stunts lose sync. Worth every penny.",
    rating: 5,
    avatar: "MR",
    highlight: "Pinpoints the exact moment",
  },
  {
    name: "Amanda K.",
    role: "Dance Mom — Junior Division",
    text: "My 10-year-old used to get nervous about competition scores. Now she uploads her practice videos and works on the specific improvements RoutineX recommends. She went from High Gold to Platinum in three competitions.",
    rating: 5,
    avatar: "AK",
    highlight: "High Gold → Platinum",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            What Our Users Say
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            Parents &amp; Coaches Love RoutineX
          </h2>

          {/* Aggregate social proof bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <p className="text-sm font-bold text-white">4.9 / 5.0</p>
              <p className="text-xs text-surface-200">from 48 reviews</p>
            </div>
            <div className="hidden sm:block h-10 w-px bg-surface-800" />
            <div className="flex flex-col items-center">
              <TrendingUp className="h-6 w-6 text-green-400 mb-1" />
              <p className="text-sm font-bold text-white">Avg. +9.4 points</p>
              <p className="text-xs text-surface-200">score improvement per routine</p>
            </div>
            <div className="hidden sm:block h-10 w-px bg-surface-800" />
            <div className="flex flex-col items-center">
              <Users className="h-6 w-6 text-primary-400 mb-1" />
              <p className="text-sm font-bold text-white">500+ routines</p>
              <p className="text-xs text-surface-200">analyzed across all studios</p>
            </div>
            <div className="hidden sm:block h-10 w-px bg-surface-800" />
            <div className="flex flex-col items-center">
              <Trophy className="h-6 w-6 text-gold-400 mb-1" />
              <p className="text-sm font-bold text-white">All major circuits</p>
              <p className="text-xs text-surface-200">Star Power, JUMP, NUVO &amp; more</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 relative"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary-500/20" />

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-sm font-bold shrink-0">
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-surface-200">{t.role}</p>
                </div>
                {t.highlight && (
                  <span className="shrink-0 text-xs font-bold bg-green-500/15 text-green-300 border border-green-500/30 rounded-full px-2.5 py-1">
                    {t.highlight}
                  </span>
                )}
              </div>

              <div className="flex gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star
                    key={j}
                    className="h-3.5 w-3.5 fill-gold-400 text-gold-400"
                  />
                ))}
              </div>

              <p className="text-sm text-surface-200 leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
