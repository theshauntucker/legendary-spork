"use client";

import { motion } from "framer-motion";
import { Shield, Music, Users } from "lucide-react";

const competitions = [
  "StarQuest",
  "Starpower",
  "Showstopper",
  "JUMP",
  "NUVO",
  "RADIX",
  "24 Seven",
  "The Dance Awards",
  "Hall of Fame",
  "Star Power",
  "NexStar",
  "Revolution",
  "UCA",
  "NCA",
  "Applause",
  "Energy",
  "Platinum",
];

const ageGroups = [
  { name: "Mini", ages: "5 & Under", color: "from-pink-400 to-pink-600" },
  { name: "Petite", ages: "6–8", color: "from-purple-400 to-purple-600" },
  { name: "Junior", ages: "9–11", color: "from-primary-400 to-primary-600" },
  { name: "Teen", ages: "12–14", color: "from-accent-400 to-accent-600" },
  { name: "Senior", ages: "15–19", color: "from-gold-400 to-gold-600" },
  { name: "Adult", ages: "20+", color: "from-surface-200 to-surface-400" },
];

const styles = [
  "Jazz",
  "Contemporary",
  "Lyrical",
  "Ballet",
  "Pointe",
  "Hip Hop",
  "Tap",
  "Musical Theater",
  "Modern",
  "Pom",
  "Acro",
  "Clogging",
  "Ballroom",
  "Cheer",
  "Open/Freestyle",
];

export default function Competitions() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
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
            Our AI is trained on competition-standard scoring rubrics. No matter where your dancer competes, RoutineX speaks the same language as the judges.
          </p>
        </motion.div>

        {/* Competition logos/badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 justify-center mb-6">
            <Shield className="h-5 w-5 text-primary-400" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-surface-200">
              Competition-Ready Scoring For
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {competitions.map((comp, i) => (
              <motion.div
                key={comp}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="glass rounded-xl px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors cursor-default"
              >
                {comp}
              </motion.div>
            ))}
          </div>
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
