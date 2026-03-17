import { Sparkles, Heart, Brain, Shield, DollarSign, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Our Approach | RoutineX",
  description: "A note from our founder on how RoutineX uses AI to help dancers grow — honestly, affordably, and with love.",
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
          A Note From a Dance Dad
        </h1>
        <p className="text-surface-200 mb-10">
          Why I built RoutineX, and what you should expect from it.
        </p>

        <div className="space-y-8 text-surface-200 leading-relaxed">
          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-accent-400 shrink-0" />
              <h2 className="text-xl font-bold text-white">I Get It — This Matters to You</h2>
            </div>
            <p className="mb-4">
              I&apos;m a dance dad. I&apos;ve sat in the audience at more competitions
              than I can count, watched my kid pour their heart into a routine,
              and then waited nervously for scores. I know how much this means to
              your family.
            </p>
            <p>
              That&apos;s exactly why I built RoutineX. Not as some tech gimmick,
              but because I saw a real problem: <span className="text-white font-medium">detailed
              feedback is expensive, hard to get, and usually only happens on
              competition day.</span> Private coaching sessions run $75–$150 an hour.
              Competition entry fees pile up. And between events, you&apos;re often
              left guessing what to work on.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-green-400 shrink-0" />
              <h2 className="text-xl font-bold text-white">$3.99 for What Used to Cost $100+</h2>
            </div>
            <p className="mb-4">
              Here&apos;s the thing — for the price of a coffee, RoutineX gives
              your dancer a full breakdown of their routine: technique scores,
              timestamped notes on what to fix, and a prioritized improvement
              plan. That&apos;s feedback that would normally require a private
              session or a competition weekend.
            </p>
            <p>
              Is it as good as having a world-class coach sitting next to you?
              No. But it&apos;s <span className="text-white font-medium">available
              right now, for every practice run, at a price that doesn&apos;t
              break the bank.</span> And that matters — especially when you&apos;re
              already spending thousands on studio fees, costumes, and
              competition travel.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-6 w-6 text-primary-400 shrink-0" />
              <h2 className="text-xl font-bold text-white">It&apos;s Not Perfect — And That&apos;s Okay</h2>
            </div>
            <p className="mb-4">
              I want to be straight with you: RoutineX uses AI, and AI isn&apos;t
              perfect. The scores you see are <span className="text-white font-medium">estimates
              based on competition judging rubrics</span> — not official results.
              Your dancer&apos;s actual competition scores may be higher or lower.
            </p>
            <p className="mb-4">
              But here&apos;s what the AI <span className="text-white font-medium">is</span> really
              good at: <span className="text-white font-medium">catching things you might
              miss.</span> That left arm dropping during the pirouette at 1:23. The
              energy dip in the bridge section. The formation that breaks for
              half a second at 2:15. These are the kinds of specific, actionable
              details that help a dancer go from High Gold to Platinum — and
              RoutineX catches them consistently, on every upload.
            </p>
            <p>
              Even when the overall score is off by a few points, the
              feedback underneath it is still gold. Focus on the notes, not
              the number.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-gold-400 shrink-0" />
              <h2 className="text-xl font-bold text-white">A Tool, Not a Replacement</h2>
            </div>
            <p className="mb-4">
              RoutineX doesn&apos;t replace your dancer&apos;s coach, their studio,
              or the experience of competing live. It&apos;s the extra set of eyes
              between lessons — the thing that helps them walk into their next
              practice or competition with a clear plan.
            </p>
            <p>
              Upload a routine. Read the feedback. Work on the top 2-3
              priorities. Upload again in a week and see what improved.
              <span className="text-white font-medium"> That cycle of feedback
              and growth is where the real magic happens.</span>
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-primary-500/20">
            <p className="text-white font-medium mb-3">
              Every dancer who steps on that stage has already done something
              incredibly brave. RoutineX is just here to help them keep getting
              better — one routine at a time.
            </p>
            <p className="text-sm">
              — From a proud dance dad who built this for families like ours
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-primary-700/20 to-accent-600/20 border border-white/10 p-6 sm:p-8 text-sm">
            <p className="text-white font-medium mb-2">The fine print, plainly:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">&#x2022;</span>
                Scores are AI-generated estimates, not official competition results
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">&#x2022;</span>
                Actual competition scores will vary — this is a training tool, not a predictor
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">&#x2022;</span>
                The real value is in the detailed feedback and improvement priorities, not the exact score
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">&#x2022;</span>
                RoutineX supplements coaching — it doesn&apos;t replace it
              </li>
            </ul>
          </div>

          <div className="text-center pt-4">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Get Started — $9.99
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
