import Link from "next/link";
import AnnotatedFrame from "@/components/spotlight/AnnotatedFrame";
import { formatTime } from "@/lib/spotlight/landmarks";
import { SAMPLE } from "@/lib/spotlight/sample";

/**
 * The product, shown. Real annotated frames from the public sample report
 * in a horizontal rail — the lines on the dancer are the memorable thing,
 * so everything around them stays quiet.
 */
export default function SpotlightShowcase() {
  const { report, frames, urls } = SAMPLE;
  const moments = report ? report.moments.filter((m) => urls[m.frame]).slice(0, 6) : [];
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
              <li>Seven category scores with the evidence</li>
              <li>Priorities, in order, with the cause behind each</li>
              <li>Drills with sets, reps and a cue she says to herself</li>
              <li>A four-week plan and a PDF for her teacher</li>
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/spotlight/new" className="st-btn st-btn-sunset">Get her breakdown — $14.99</Link>
              {report && <Link href="/spotlight/sample" className="st-btn st-btn-ghost">Read the full sample</Link>}
            </div>
          </div>
          <div className="min-w-0">
            {moments.length ? (
              <div className="st-rail -mr-5 pr-5 sm:-mr-8 sm:pr-8">
                {moments.map((m) => {
                  const f = frames[m.frame];
                  return (
                    <figure key={m.frame} className="w-[82vw] max-w-[640px] sm:w-[560px]">
                      <AnnotatedFrame src={urls[m.frame]} pose={f.pose} annotations={m.annotations} w={f.w} h={f.h} className="st-frame" alt={m.title} />
                      <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-sm">
                        <span className="font-[family-name:var(--font-display)] text-lg text-zinc-100">{m.title}</span>
                        <span className="text-zinc-500">{formatTime(f.t)}</span>
                      </figcaption>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-400 line-clamp-3">{m.analysis}</p>
                    </figure>
                  );
                })}
              </div>
            ) : (
              <div className="st-frame aspect-video w-full bg-[radial-gradient(60%_60%_at_60%_40%,rgba(251,191,36,0.16),transparent)]" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
