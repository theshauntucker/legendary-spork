"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, Star, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        <a href="/" className="inline-flex items-center gap-2 mb-10">
          <Sparkles className="h-6 w-6 text-primary-400" />
          <span className="text-lg font-bold">
            Routine<span className="gradient-text">X</span>
          </span>
        </a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-400 mb-3">
              Our Story
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)] leading-tight">
              Built by Dance Parents.<br />
              <span className="gradient-text">For Every Dancer.</span>
            </h1>
          </div>

          {/* Founder story */}
          <div className="glass rounded-3xl p-8 space-y-5 text-surface-200 leading-relaxed">
            <div>
              <p className="text-white text-lg font-medium">
                We&apos;re not choreographers. We&apos;re not judges. We&apos;re dance parents — and that&apos;s exactly why we built this.
              </p>
            </div>

            <p>
              We&apos;ve sat in hundreds of competition bleachers watching our dancer pour everything she has into a two-minute routine. We&apos;ve seen her walk off that stage not knowing if she nailed it or missed something critical. We&apos;ve watched her wait days for scores that come back as just a number — with no explanation of what the judges actually saw.
            </p>

            <p>
              That never felt right. These young dancers train year-round. They sacrifice weekends, holidays, and social lives to perfect their craft. They deserve more than a ribbon and a score sheet.
            </p>

            <p>
              They deserve to know what a judge actually thinks. What they did brilliantly. What&apos;s holding them back. And most importantly — what to focus on next.
            </p>

            <p className="text-white font-medium">
              RoutineX is that feedback. Professional, specific, and honest — delivered in minutes, not days.
            </p>
          </div>

          {/* More than numbers */}
          <div className="glass rounded-3xl p-8 border border-primary-500/20">
            <div className="flex items-center gap-3 mb-5">
              <Heart className="h-6 w-6 text-accent-400 shrink-0" />
              <h2 className="text-xl font-bold">More Than a Score</h2>
            </div>
            <p className="text-surface-200 leading-relaxed mb-4">
              These analyses aren&apos;t just numbers. They&apos;re a motivating source of feedback for young dancers — something real to hold onto, study, and work toward.
            </p>
            <p className="text-surface-200 leading-relaxed mb-4">
              When a 14-year-old reads that her arabesque at 1:17 showed &quot;beautiful port de bras with consistent épaulement&quot; — she knows exactly what to bring to her next rehearsal. When she reads that her floor work at 2:34 needs more precision — she has a target. Not a vague feeling. A target.
            </p>
            <p className="text-surface-200 leading-relaxed">
              That kind of specific, encouraging feedback is what separates dancers who plateau from dancers who keep growing. RoutineX exists to give every dancer access to it — not just the ones whose studios can afford private judges.
            </p>
          </div>

          {/* The real heart */}
          <div className="glass rounded-3xl p-8 border border-gold-500/20">
            <div className="flex items-center gap-3 mb-5">
              <Star className="h-6 w-6 text-gold-400 shrink-0" />
              <h2 className="text-xl font-bold">Sometimes They Just Need to Hear It From Someone Else</h2>
            </div>
            <p className="text-surface-200 leading-relaxed mb-4">
              Our dancer has an incredible coach. She has parents who show up to every competition, every rehearsal, every late-night run-through. We tell her she&apos;s amazing. We tell her what to fix. We tell her we believe in her.
            </p>
            <p className="text-surface-200 leading-relaxed mb-4">
              And sometimes — it doesn&apos;t land. Not because she doesn&apos;t trust us. But because we&apos;re her parents. We&apos;re her at-home coaches. We&apos;re supposed to say that.
            </p>
            <p className="text-surface-200 leading-relaxed mb-4">
              But when something outside of that circle — something that watched her routine and studied every frame — tells her that her arabesque at 1:17 was <em>beautiful</em>, that her stage presence at 2:04 was <em>palpable</em>, that the story she told for two minutes and fifty-two seconds <em>moved people</em>...
            </p>
            <p className="text-white font-medium leading-relaxed">
              She believes it differently. And she works harder because of it.
            </p>
            <p className="text-surface-200 leading-relaxed mt-4">
              RoutineX was built with heart and passion for the dancers who stress, who doubt themselves, who pour everything into their craft and wonder if it&apos;s enough. It is. And now they have something to prove it.
            </p>

            <p className="text-sm text-surface-200/60 pt-2">— The RoutineX family</p>
          </div>

          {/* Values */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: Star,
                color: "text-gold-400",
                bg: "bg-gold-500/10",
                title: "Honest Feedback",
                desc: "Real observations. Real coaching. Not generic praise."
              },
              {
                icon: Heart,
                color: "text-accent-400",
                bg: "bg-accent-500/10",
                title: "Built with Love",
                desc: "Every feature exists because a real dance parent needed it."
              },
              {
                icon: Sparkles,
                color: "text-primary-400",
                bg: "bg-primary-500/10",
                title: "For Every Dancer",
                desc: "Soloists, groups, beginners, nationals competitors — all welcome."
              }
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass rounded-2xl p-5 text-center"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${item.bg} mb-3`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-surface-200">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
            <p className="text-surface-200 mb-5">
              If you&apos;re a dance parent, a coach, or a dancer — we built this for you. We hope it helps your dancer find her next breakthrough.
            </p>

            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-8 py-4 font-bold text-white hover:opacity-90 transition-opacity"
            >
              Try RoutineX Today
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

