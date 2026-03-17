import { Sparkles, Heart, Brain, Shield, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Our Approach | RoutineX",
  description: "How RoutineX uses AI to help dancers grow — and what to expect from your analysis.",
};

export default function OurApproachPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="inline-flex items-center gap-2 mb-10">
          <Sparkles className="h-6 w-6 text-primary-400" />
          <span className="text-lg font-bold">
            Routine<span className="gradient-text">X</span>
          </span>
        </a>

        <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] mb-2">
          Our Approach to AI Scoring
        </h1>
        <p className="text-surface-200 mb-10">
          A note from the founder.
        </p>

        <div className="space-y-8 text-surface-200 leading-relaxed">
          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-accent-400 shrink-0" />
              <h2 className="text-xl font-bold text-white">Built for Dancers, by a Dance Family</h2>
            </div>
            <p>
              RoutineX was born from a simple frustration: your dancer works
              incredibly hard, but detailed feedback is expensive, hard to get,
              and often limited to competition day. We built this platform so
              every dancer — regardless of budget or geography — can get
              meaningful, actionable feedback on every single practice run.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-6 w-6 text-primary-400 shrink-0" />
              <h2 className="text-xl font-bold text-white">How Our AI Works</h2>
            </div>
            <p className="mb-4">
              Our AI analyzes video frames of your routine and scores it across
              the same categories real judges use: Technique, Performance,
              Choreography, and Overall Impression. It&apos;s trained on
              established competition rubrics from organizations like Star Power,
              JUMP, and UCA.
            </p>
            <p>
              That said, <span className="text-white font-medium">AI is not a
              replacement for a human judge or a qualified coach.</span> No
              technology can fully capture the nuance, artistry, and live energy
              that a trained eye picks up in person. Our scores are estimates —
              thoughtful, rubric-based estimates — but estimates nonetheless.
              Your actual competition scores may differ, and that&apos;s completely
              normal.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-gold-400 shrink-0" />
              <h2 className="text-xl font-bold text-white">What to Take Away</h2>
            </div>
            <p className="mb-4">
              Here&apos;s what we believe: <span className="text-white font-medium">even
              when a score isn&apos;t perfect, the feedback is always valuable.</span> If
              RoutineX tells your dancer to watch their arm placement during
              turns, or to maintain energy through the bridge section — that&apos;s
              real, specific, useful coaching that will make them better.
            </p>
            <p className="mb-4">
              Focus less on the exact number and more on the journey. Use the
              timestamped notes. Work through the improvement priorities. Upload
              again after a few rehearsals and see the progress. That cycle of
              feedback and growth is where the magic happens.
            </p>
            <p>
              Every dancer who steps on stage has already done something brave.
              RoutineX is here to help them keep getting better — one routine at
              a time.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-primary-700/20 to-accent-600/20 border border-white/10 p-6 sm:p-8 text-sm">
            <p className="text-white font-medium mb-2">In summary:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">&#x2022;</span>
                RoutineX scores are AI-generated estimates, not official competition results
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">&#x2022;</span>
                Actual scores at competitions may vary — this is a training tool, not a predictor
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">&#x2022;</span>
                The feedback and improvement priorities are designed to be constructive and actionable regardless of the score
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">&#x2022;</span>
                RoutineX is a supplement to coaching, not a replacement for it
              </li>
            </ul>
          </div>

          <div className="text-center pt-4">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
