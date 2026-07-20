"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "The video stays on your device",
    copy: "Your routine is processed right on your phone. The full video is never uploaded and never touches our servers.",
  },
  {
    icon: Lock,
    title: "Only still frames are analyzed",
    copy: "Small snapshots at key moments are what the AI judges see — and they auto-delete within 24 hours, or instantly if you choose.",
  },
  {
    icon: EyeOff,
    title: "No humans. No selling. Ever.",
    copy: "No person ever views your content, and nothing is shared or sold. Only the written feedback is saved to your account.",
  },
];

export default function PrivacyTrust() {
  return (
    <section className="relative py-16 sm:py-24 bg-[#F4EEE3]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="eyebrow text-[#B0356B] mb-4">Privacy first</p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight font-[family-name:var(--font-display)] text-[#221A29]">
            Her video never leaves your phone.
          </h2>
        </motion.div>

        {/* Real parent question — serif pull quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 mx-auto max-w-2xl text-center"
        >
          <p className="text-xl sm:text-2xl italic leading-relaxed text-[#443B4E] font-[family-name:var(--font-display)]">
            &ldquo;What happens to the videos of the children being uploaded?
            Privacy is a real issue and we want to protect our children.&rdquo;
          </p>
          <cite className="mt-4 block text-sm not-italic text-[#8B8492]">
            — a dance mom, before she signed up. Fair question. Here&apos;s the
            complete answer.
          </cite>
        </motion.blockquote>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="lux-card rounded-2xl p-7 text-left"
            >
              <p.icon className="h-6 w-6 text-[#B0356B]" />
              <h3 className="mt-4 font-bold text-[17px] text-[#221A29]">
                {p.title}
              </h3>
              <p className="mt-2 text-[15px] text-[#5D5565] leading-relaxed">
                {p.copy}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center text-base font-semibold text-[#221A29]"
        >
          Your child&apos;s privacy isn&apos;t an afterthought — it&apos;s how
          RoutineX was built from day one.
        </motion.p>
      </div>
    </section>
  );
}
