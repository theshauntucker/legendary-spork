"use client";

import { motion } from "framer-motion";
import { Music, Users } from "lucide-react";

const ageGroups = [
  { name: "Mini", ages: "5–6", color: "from-pink-400 to-pink-600" },
  { name: "Petite", ages: "6–9", color: "from-purple-400 to-purple-600" },
  { name: "Junior", ages: "9–12", color: "from-primary-400 to-primary-600" },
  { name: "Teen", ages: "12–15", color: "from-accent-400 to-accent-600" },
  { name: "Senior", ages: "15–19", color: "from-gold-400 to-gold-600" },
];

const styles = [
  "Jazz",
  "Contemporary",
  "Lyrical",
  "Hip Hop",
  "Tap",
  "Ballet",
  "Musical Theater",
  "Pom",
  "Acro",
];

export default function Competitions() {
  return (
    <section className="relative py-14 sm:py-20 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            Universal Coverage
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            Works With Every Major Competition
          </h2>
          <p className="mt-4 text-lg text-surface-200 max-w-2xl mx-auto">
            An AI estimate and a practice tool. Useful no matter where your dancer or cheer athlete competes — not an official score from any competition.
          </p>
        </motion.div>

        {/* Age Divisions & Styles */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Age Divisions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Users className="h-5 w-5 text-accent-400" />
              <h3 className="font-bold">All Age Divisions</h3>
            </div>
            <div className="space-y-3">
              {ageGroups.map((group) => (
                <div
                  key={group.name}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`h-2 w-2 rounded-full bg-gradient-to-r ${group.color}`}
                  />
                  <span className="font-medium w-16">
                    {group.name}
                  </span>
                  <span className="text-sm text-surface-200">
                    Ages {group.ages}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dance Styles */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Music className="h-5 w-5 text-gold-400" />
              <h3 className="font-bold">Every Dance Style</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <span
                  key={style}
                  className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-surface-200"
                >
                  {style}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-surface-200">
              Our AI adapts its scoring criteria to each style — evaluating hip hop differently than lyrical, and tap differently than contemporary.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
