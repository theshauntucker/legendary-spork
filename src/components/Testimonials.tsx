"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Jessica M.",
    role: "Dance Mom — Teen Jazz",
    text: "I honestly expected it to be generic AI fluff. But it called out her arm carriage in the opening 8-count specifically and said judges in her age division weight that heavily during the first impression. Her coach said the exact same thing at her last lesson. That's when I knew this was real.",
    rating: 5,
    avatar: "JM",
    highlight: "Said what her coach said",
  },
  {
    name: "Tiffany L.",
    role: "Dance Mom — Junior Lyrical",
    text: "Found this the night before my daughter's Star Power regional. She wanted one more look at her routine. The feedback wasn't just 'work on technique' — it was specific moments, specific fixes. She went into that competition more confident than she's ever been.",
    rating: 5,
    avatar: "TL",
    highlight: "Night-before comp prep",
  },
  {
    name: "Coach Mike R.",
    role: "All-Star Cheer — Level 4",
    text: "I was skeptical. I uploaded a practice run of our level 4 routine and it flagged the exact stunt sequence where we've been losing sync — we weren't even looking for that. I didn't prompt it, it just found it. I'm sold.",
    rating: 5,
    avatar: "MR",
    highlight: "Found our weak spot cold",
  },
  {
    name: "Amanda K.",
    role: "Dance Mom — Petite Division",
    text: "Brand new tool but the scoring breakdown was so close to what she actually got at her last competition that I screenshot it and sent it to her teacher. It's not replacing judges, but it's giving us something we've never had — a preview.",
    rating: 5,
    avatar: "AK",
    highlight: "Matched her real comp score",
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
            Early Access Feedback
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            What Our First Users Are Saying
          </h2>
          <p className="mt-4 text-lg text-surface-200 max-w-xl mx-auto">
            RoutineX just launched. These are real reactions from our first testers — parents, coaches, and dancers who tried it and told us exactly what they thought.
          </p>

          {/* Honest early-launch social proof */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {["Star Power", "JUMP", "NUVO", "NexStar", "Revolution", "UCA"].map((comp) => (
              <span key={comp} className="text-xs font-semibold bg-white/5 border border-white/10 rounded-full px-3 py-1 text-surface-200">
                {comp}
              </span>
            ))}
            <span className="text-xs font-semibold bg-primary-500/10 border border-primary-500/20 rounded-full px-3 py-1 text-primary-300">
              + more
            </span>
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
