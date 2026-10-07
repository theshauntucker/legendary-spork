import Link from "next/link";
import AnnotatedFrame from "@/components/spotlight/AnnotatedFrame";
import { formatTime } from "@/lib/spotlight/landmarks";
import { SAMPLE } from "@/lib/spotlight/sample";
import { DEMO_FRAMES } from "@/lib/spotlight/demo";

/**
 * The product, shown. Annotated frames in a horizontal rail — the lines on
 * the dancer are the memorable thing, so everything around them stays quiet.
 * Uses the public sample report when it exists, otherwise the demo frames
 * (generated photographs run through the real tracker).
 */
export default function SpotlightShowcase() {
  const { report, frames, urls } = SAMPLE;
  const moments = report ? report.moments.filter((m) => urls[m.frame]).slice(0, 6) : [];
  const cards = moments.length
    ? moments.map((m) => { const f = frames[m.frame]; return { key: String(m.frame), src: urls[m.frame], pose: f.pose, w: f.w, h: f.h, annotations: m.annotations, title: m.title, time: formatTime(f.t), analysis: m.analysis }; })
    : DEMO_FRAMES.map((d) => ({ key: d.key, src: `${d.src}.jpg`, pose: d.pose, w: d.w, h: d.h, annotations: d.annotations, title: d.title, time: "", analysis: d.analysis }));
  return (
    <section id="spotlight" className="relative py-20 sm:py-28">
      <div className="st-wrap">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="st-runner">RoutineX Spotlight</p>
            <h2 className="st-h2 mt-3">Coaching, drawn on her.</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-zinc-300">
              Every angle on these frames is measured from the dancer&apos;s own body. Gold marks what is working. Pink marks what to change. The dashed line is where the line should be.
            </p>
            <ul className="mt-6 space-y-2 text-[15px] text-zinc-400">
              <li>12–16 key moments, chosen from 60–80 tracked frames</li>
              <li>The corrected limb drawn beside hers, so she sees the difference</li>
              <li>Seven category scores and how it reads on a judge&apos;s card</li>
              <li>Priorities with the cause, drills with sets, reps and a cue</li>
              <li>Competition-day cues, a four-week plan, a PDF for her teacher</li>
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/spotlight/new" className="st-btn st-btn-sunset">Get her breakdown — $14.99</Link>
              {report && <Link href="/spotlight/sample" className="st-btn st-btn-ghost">Read the full sample</Link>}
            </div>
            {!report && <p className="mt-4 text-xs text-zinc-500">Frames shown are generated stage photographs run through the same tracker — no real dancer appears on this site.</p>}
          </div>
          <div className="min-w-0">
            <div className="st-rail -mr-5 pr-5 sm:-mr-8 sm:pr-8">
              {cards.map((c) => (
                <figure key={c.key} className="w-[82vw] max-w-[640px] sm:w-[560px]">
                  <AnnotatedFrame src={c.src} pose={c.pose} annotations={c.annotations} w={c.w} h={c.h} className="st-frame" alt={c.title} />
                  <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-sm">
                    <span className="font-[family-name:var(--font-display)] text-lg text-zinc-100">{c.title}</span>
                    {c.time && <span className="text-zinc-500">{c.time}</span>}
                  </figcaption>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400 line-clamp-3">{c.analysis}</p>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
