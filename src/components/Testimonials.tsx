"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Jessica M.",
    role: "Dance mom — Teen Jazz, 4 seasons competing",
    text: "Every comp we'd wait till 10pm for scores and get a sheet with three numbers on it. No context, no 'here's why.' RoutineX gave us more in 5 minutes than two years of judges' sheets combined. Her coach literally said 'that's exactly what I've been trying to tell her.'",
    rating: 5,
    avatar: "JM",
  },
  {
    name: "Tiffany L.",
    role: "Dance mom — Junior Lyrical",
    text: "I was up at midnight before her Star Power regional uploading her practice video. The feedback came back with specific timestamps — '1:14, arm carriage drops on the reach.' She fixed it the morning of, and she placed for the first time. I keep using it.",
    rating: 4,
    avatar: "TL",
  },
  {
    name: "Coach Mike R.",
    role: "All-Star cheer coach — Level 4",
    text: "Uploaded our practice run without telling the team. It flagged the exact 8-count in our stunt sequence where we've been falling apart — the same thing I'd been saying for three weeks. I put the report on the screen. They got it immediately.",
    rating: 5,
    avatar: "MR",
  },
  {
    name: "Amanda K.",
    role: "Dance mom — Petite & Junior divisions",
    text: "My youngest is 8. She doesn't always understand what 'work on technique' means from a judge. But when I pull up the report and say 'see this moment at 0:32? That's what we're fixing this week' — she gets it. She looks forward to uploading now.",
    rating: 5,
    avatar: "AK",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="eyebrow text-[#B0356B] mb-4">From the wings</p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight font-[family-name:var(--font-display)] text-[#221A29]">
            What families are saying.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="lux-card rounded-2xl p-7 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star
                    key={j}
                    className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-[15px] text-[#443B4E] leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3 pt-5 border-t border-[#221A29]/[0.06]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-orange-400 to-amber-300 text-xs font-bold text-white shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#221A29]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#8B8492]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
