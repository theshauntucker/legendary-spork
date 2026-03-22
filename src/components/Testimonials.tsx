"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Jessica M.",
    role: "Dance Mom — Teen Competitive",
    text: "We spend thousands on competition fees and private lessons every year. Getting detailed feedback for $3.99 per routine is an absolute game-changer. My daughter improved her scores by 12 points in one season using RoutineX.",
    rating: 5,
    avatar: "JM",
  },
  {
    name: "Coach Sarah T.",
    role: "Studio Owner — 15 Years",
    text: "I run a studio with 200+ competitive dancers. RoutineX lets me give every single routine personalized feedback without spending hours reviewing video myself. The AI catches things I sometimes miss during group rehearsals.",
    rating: 5,
    avatar: "ST",
  },
  {
    name: "Michael R.",
    role: "Cheer Coach — All-Star Program",
    text: "We needed a way to evaluate routines between practices. RoutineX's timestamped notes are incredibly accurate — it flags the exact moments where our formations break or stunts lose sync. Worth every penny.",
    rating: 5,
    avatar: "MR",
  },
  {
    name: "Amanda K.",
    role: "Dance Mom — Junior Division",
    text: "My 10-year-old used to get nervous about competition scores. Now she uploads her practice videos and works on the specific improvements RoutineX recommends. She went from High Gold to Platinum in three competitions.",
    rating: 5,
    avatar: "AK",
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
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            What Our Users Say
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            Parents & Coaches Love RoutineX
          </h2>
          <p className="mt-4 text-lg text-surface-200">
            Real feedback from parents and coaches using RoutineX.
          </p>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-surface-200">{t.role}</p>
                </div>
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
