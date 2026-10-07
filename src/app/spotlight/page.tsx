import type { Metadata } from "next";
import Link from "next/link";
import SpotlightShowcase from "@/components/stage/SpotlightShowcase";
import HowSpotlightWorks from "@/components/stage/HowSpotlightWorks";
import PrivacyStage from "@/components/stage/PrivacyStage";
import FinalCurtain from "@/components/stage/FinalCurtain";
import ReviewStrip from "@/components/stage/ReviewStrip";
import { ARABESQUE_IMAGE, SPOTLIGHT_IMAGE } from "@/lib/stage-assets";
import StageImage from "@/components/stage/StageImage";
import { SAMPLE } from "@/lib/spotlight/sample";

export const metadata: Metadata = {
  title: "RoutineX Spotlight — a frame-by-frame technique breakdown of one dancer, $14.99",
  description:
    "Spotlight tracks 60–80 frames of your dancer's routine on your phone, measures her lines and angles, and sends back a coach's breakdown with the corrections drawn on her own frames — priorities, drills, a four-week plan, and a PDF for her teacher. $14.99, one dancer.",
  alternates: { canonical: "/spotlight" },
  openGraph: {
    title: "RoutineX Spotlight — coaching, drawn on her",
    description: "A private technique breakdown of one dancer. Measured angles, corrections drawn on her frames, drills and a four-week plan. $14.99.",
    url: "/spotlight",
    images: [{ url: "/stage/og-spotlight.jpg", width: 1200, height: 630, alt: "Silhouette of a dancer leaping across a competition stage" }],
  },
};

const INCLUDED = [
  ["Key moments, drawn on", "12–16 frames a coach would freeze on — the apex of the jump, the top of the extension, the landing, the turn — each with the lines, angles and corrections drawn directly on her."],
  ["Measured, not described", "Every angle comes from on-device pose tracking on her own body. 161° at the supporting knee is 161°, not “a little soft.”"],
  ["The difference, drawn", "On the moments that matter, the corrected limb is drawn translucent beside hers — same frame, knee finished, leg where it should be — so she sees exactly what to change."],
  ["How it reads on a judge's card", "Technique, performance, choreography, presentation, overall — weighted the way real sheets are, with the sentence each judge would say into the mic."],
  ["Next time on stage", "Competition-day cues written to her, in order: the walk-on, the first eight, the hard part, recovering a wobble, the finish. Plain words, nothing corny. Plus three lines for you about the car ride home."],
  ["Seven category scores", "Lines and extension, alignment, jumps and landings, turns and balance, arms, feet and turnout, presence. Honest numbers with the evidence."],
  ["Priorities with the cause", "Not “work on landings” — what in the preparation is making the landing heavy, and the one cue she says to herself to fix it."],
  ["Drills with doses", "Five to eight no-equipment drills tied to the priorities, with sets, reps, days a week and a cue."],
  ["A four-week plan", "Foundation, strength, integration, performance. Built to land before the next competition."],
  ["A PDF for her teacher", "Dark, clean, every page from her own frames. Forward it to the studio, print it for the fridge."],
  ["Group videos welcome", "Tap your dancer on the first frame. We follow her through the routine and blur everyone else before upload."],
];

export default function SpotlightPage() {
  return (
    <div data-stage-page>
      <section className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="absolute inset-0 -z-20">
          <StageImage asset={SPOTLIGHT_IMAGE} portrait={ARABESQUE_IMAGE} priority sizes="100vw" className="h-full w-full object-cover object-[50%_30%] lg:object-[68%_35%]" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,9,11,0.45)_0%,rgba(9,9,11,0.25)_30%,rgba(9,9,11,0.7)_60%,#09090B_100%)] lg:bg-[linear-gradient(90deg,rgba(9,9,11,0.92)_0%,rgba(9,9,11,0.7)_40%,rgba(9,9,11,0.15)_100%),linear-gradient(180deg,rgba(9,9,11,0.35),rgba(9,9,11,0.2)_60%,#09090B_100%)]" />
        <div className="st-wrap">
          <p className="st-runner">RoutineX Spotlight</p>
          <h1 className="st-display mt-4 max-w-4xl text-[2.9rem] sm:text-6xl lg:text-7xl">One dancer. Every frame. Drawn on.</h1>
          <p className="st-lede mt-6">
            A private technique breakdown that reads like an hour with a coach who filmed her and marked it all up — for $14.99 instead of $75–150, with notes that don&apos;t vanish when the lesson ends.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/spotlight/new" className="st-btn st-btn-sunset">Get her breakdown — $14.99</Link>
            {SAMPLE.report && <Link href="/spotlight/sample" className="st-btn st-btn-ghost">Read the full sample</Link>}
          </div>
          <p className="mt-5 text-sm text-zinc-500">One-time. Two to three minutes. Money-back guarantee.</p>
        </div>
      </section>

      <SpotlightShowcase />

      <section className="relative py-20 sm:py-28">
        <div className="st-wrap">
          <p className="st-runner">What comes back</p>
          <h2 className="st-h2 mt-3 max-w-2xl">Everything a $150 lesson would give her — and the parts it can&apos;t.</h2>
          <dl className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {INCLUDED.map(([t, b]) => (
              <div key={t} className="border-t border-white/10 pt-5">
                <dt className="text-lg font-semibold">{t}</dt>
                <dd className="mt-2 text-[15.5px] leading-relaxed text-zinc-400">{b}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <HowSpotlightWorks />
      <ReviewStrip />
      <PrivacyStage />

      <section className="relative py-20 sm:py-28">
        <div className="st-wrap grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <div>
            <p className="st-runner">What families ask us to look at</p>
            <h2 className="st-h2 mt-3">Bring the question. We bring the frames.</h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              "Her turns have been inconsistent — she struggles to control her energy.",
              "Is her technique clean enough for Teen Elite?",
              "What's costing us points?",
              "Are we competition-ready? Comp is in five months and we just finished the dance.",
              "Technique, not performance — this is just a combo.",
              "What other variation can she do to score better?",
            ].map((q) => (
              <li key={q} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 font-[family-name:var(--font-display)] text-lg italic text-zinc-200">“{q}”</li>
            ))}
          </ul>
        </div>
      </section>

      <FinalCurtain />
    </div>
  );
}
