import Link from "next/link";
import AnnotatedFrame from "./AnnotatedFrame";
import { formatTime } from "@/lib/spotlight/landmarks";
import type { SpotlightFrame, SpotlightReport } from "@/lib/spotlight/types";

/** Drop a trailing "Coach" sign-off. The template signs the note itself. */
function presentClosing(closing: string): string {
  return closing.replace(/(?:\s*[—–,\-]\s*)?Coach\.?\s*$/i, "").trim();
}

/**
 * The Spotlight report on the web. Server-renderable so the public sample
 * is indexable; the private report page wraps it with auth.
 */
export default function ReportView({
  report, frames, urls, meta, actions, sample = false,
}: {
  report: SpotlightReport;
  frames: SpotlightFrame[];
  /** frame index → image URL */
  urls: Record<number, string>;
  meta: { date: string; frameCount: number; trackedFrames: number };
  actions?: React.ReactNode;
  sample?: boolean;
}) {
  const first = report.dancer.name.split(" ")[0];
  const hero = report.moments.find((m) => urls[m.frame]) ?? report.moments[0];
  const frameOf = (i: number) => frames[i];

  return (
    <article className="sl-report text-white">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(236,72,153,0.18),transparent_70%)]" />
        <div className="mx-auto max-w-5xl px-5 pt-12 pb-8 sm:px-8 sm:pt-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="sl-eyebrow">RoutineX Spotlight · AI breakdown · {report.dancer.style}{report.dancer.division ? ` · ${report.dancer.division}` : ""}</p>
            <p className="text-xs text-zinc-500">{meta.date}</p>
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">{report.dancer.name}</h1>
          {report.dancer.routine && <p className="mt-2 text-sm text-zinc-400">“{report.dancer.routine}”</p>}
          <div className="mt-5 h-[3px] w-24 rounded-full bg-gradient-to-r from-pink-500 via-orange-400 to-amber-300" />
          <p className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-2xl leading-snug text-zinc-100 sm:text-3xl">{report.headline}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {actions}
            <p className="text-xs text-zinc-500">{meta.frameCount} frames tracked · {report.moments.length} key moments · {report.drills.length} drills · 4-week plan</p>
          </div>
        </div>
        {hero && urls[hero.frame] && (
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <AnnotatedFrame src={urls[hero.frame]} pose={frameOf(hero.frame).pose} annotations={hero.annotations} w={frameOf(hero.frame).w} h={frameOf(hero.frame).h} className="rounded-2xl ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgba(236,72,153,0.35)]" alt={`${first} — ${hero.title}`} />
            <p className="mt-3 text-xs text-zinc-500">{hero.title} · {formatTime(frameOf(hero.frame).t)} — every line and angle is measured on {first}&apos;s own frame.</p>
          </div>
        )}
      </header>

      {/* ── Overview ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <p className="sl-eyebrow">The read</p>
        <h2 className="sl-h2">AI breakdown</h2>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4 text-[17px] leading-relaxed text-zinc-300">
            {report.opening.split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="space-y-3">
            {[["Where she is today", report.verdict.current], ["Where this takes her", report.verdict.potential], ["Timeline", report.verdict.timeline]].map(([t, b]) => (
              <div key={t} className="sl-card">
                <p className="sl-eyebrow text-[10px]">{t}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-200">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <p className="sl-eyebrow">Seven things the judges score</p>
          <h2 className="sl-h2">Where the points are</h2>
          <ul className="mt-8 divide-y divide-white/[0.06]">
            {report.categories.map((c) => (
              <li key={c.key} className="grid gap-3 py-5 sm:grid-cols-[200px_64px_1fr] sm:items-start sm:gap-6">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${c.score >= 8 ? "bg-amber-400" : c.score >= 6 ? "bg-orange-400" : "bg-pink-500"}`} style={{ width: `${(c.score / 10) * 100}%` }} />
                  </div>
                </div>
                <p className={`font-[family-name:var(--font-display)] text-3xl font-bold ${c.score >= 8 ? "text-amber-300" : "text-white"}`}>{c.score.toFixed(1)}</p>
                <p className="text-[15px] leading-relaxed text-zinc-400">{c.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Strengths / Priorities ─────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="sl-eyebrow text-amber-300">Keep doing this</p>
            <h2 className="sl-h2">What is already scoring</h2>
            <div className="mt-6 space-y-3">
              {report.strengths.map((st, i) => (
                <div key={i} className="sl-card flex gap-4">
                  {st.frame != null && urls[st.frame] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={urls[st.frame]} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover ring-1 ring-white/10" />
                  )}
                  <div>
                    <p className="font-semibold text-amber-200">{st.title}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-zinc-300">{st.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="sl-eyebrow text-pink-300">Fix these first</p>
            <h2 className="sl-h2">Priorities, in order</h2>
            <div className="mt-6 space-y-3">
              {report.priorities.map((p) => (
                <div key={p.rank} className="sl-card flex gap-4">
                  <span className="font-[family-name:var(--font-display)] text-4xl font-extrabold leading-none text-pink-400">{p.rank}</span>
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-zinc-300">{p.why}</p>
                    <p className="mt-2 text-sm text-zinc-500">Cue: <span className="font-medium text-zinc-200">“{p.cue}”</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Moments ────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="sl-eyebrow">Frame by frame</p>
              <h2 className="sl-h2">{report.moments.length} moments worth freezing on</h2>
            </div>
            <ul className="flex flex-wrap gap-3 text-xs text-zinc-400">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-300" />working</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-pink-400" />change</li>
              <li className="flex items-center gap-2"><span className="h-0 w-4 border-t border-dashed border-zinc-300" />reference</li>
            </ul>
          </div>
          <div className="mt-10 space-y-16">
            {report.moments.map((m, idx) => {
              const f = frameOf(m.frame);
              if (!f || !urls[m.frame]) return null;
              const portrait = f.h > f.w;
              return (
                <div key={idx} className={`grid gap-6 ${portrait ? "lg:grid-cols-[minmax(0,420px)_1fr]" : ""}`}>
                  <AnnotatedFrame src={urls[m.frame]} pose={f.pose} annotations={m.annotations} w={f.w} h={f.h} className="rounded-2xl ring-1 ring-white/10" alt={`${first} — ${m.title}`} />
                  <div>
                    <p className="sl-eyebrow">Moment {idx + 1} · {formatTime(f.t)}</p>
                    <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">{m.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{m.skill}</p>
                    <p className="mt-4 text-[16px] leading-relaxed text-zinc-200">{m.analysis}</p>
                    <div className={`mt-5 grid gap-3 ${portrait ? "" : "sm:grid-cols-2"}`}>
                      {m.working.length > 0 && (
                        <div className="sl-card border-amber-400/20">
                          <p className="sl-eyebrow text-[10px] text-amber-300">Working</p>
                          <ul className="mt-2 space-y-1.5 text-[15px] text-zinc-200">{m.working.map((t, i) => <li key={i} className="flex gap-2"><span className="text-amber-300">•</span>{t}</li>)}</ul>
                        </div>
                      )}
                      {m.fix.length > 0 && (
                        <div className="sl-card border-pink-400/20">
                          <p className="sl-eyebrow text-[10px] text-pink-300">Change</p>
                          <ul className="mt-2 space-y-1.5 text-[15px] text-zinc-200">{m.fix.map((t, i) => <li key={i} className="flex gap-2"><span className="text-pink-300">•</span>{t}</li>)}</ul>
                        </div>
                      )}
                    </div>
                    {f.metrics && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {chips(f).map((c) => <span key={c} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">{c}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Drills ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <p className="sl-eyebrow">Homework</p>
          <h2 className="sl-h2">Drills that fix the priorities</h2>
          <p className="mt-2 text-zinc-400">No equipment. Living room, hallway, or the studio before class.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {report.drills.map((d, i) => (
              <div key={i} className="sl-card">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{i + 1}. {d.name}</p>
                  <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-xs text-amber-200">{d.dose}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">Targets: {d.targets}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-300">{d.how}</p>
                <p className="mt-3 text-sm text-zinc-500">Cue: <span className="font-medium text-zinc-200">“{d.cue}”</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Judge's card ───────────────────────────────────────────────── */}
      {report.judgesCard && report.judgesCard.length > 0 && (
        <section className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
            <p className="sl-eyebrow">From the judges&apos; table</p>
            <h2 className="sl-h2">How it might read on a judge&apos;s card</h2>
            <p className="mt-2 max-w-2xl text-zinc-400">A practice read across technique, performance, choreography, presentation, and overall impression — the kind of note a judge might say into the mic while {first} dances. Not an official scoresheet.</p>
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0C0B10]">
              {report.judgesCard.map((j, i) => {
                const pts = Math.round((j.score / 10) * j.weight * 10) / 10;
                return (
                  <div key={i} className={`grid gap-3 px-5 py-5 sm:grid-cols-[11rem_1fr_6rem] sm:items-start sm:px-7 ${i > 0 ? "border-t border-white/[0.06]" : ""}`}>
                    <div>
                      <p className="font-semibold">{j.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{j.weight} pts in this estimate</p>
                    </div>
                    <p className="text-[15px] leading-relaxed text-zinc-300">“{j.note}”</p>
                    <div className="sm:text-right">
                      <p className="font-[family-name:var(--font-display)] text-2xl text-amber-200">{pts}<span className="text-sm text-zinc-500">/{j.weight}</span></p>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10 sm:ml-auto"><div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-amber-300" style={{ width: `${Math.round((j.score / 10) * 100)}%` }} /></div>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-baseline justify-between border-t border-white/10 bg-white/[0.03] px-5 py-4 sm:px-7">
                <p className="text-sm text-zinc-400">AI estimate, practice scale out of 100</p>
                <p className="font-[family-name:var(--font-display)] text-3xl text-white">{Math.round(report.judgesCard.reduce((a, j) => a + (j.score / 10) * j.weight, 0))}<span className="text-base text-zinc-500">/100</span></p>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">The split is RoutineX&apos;s practice scale (technique 40 · performance 30 · choreography 15 · presentation 10 · overall 5), not an official competition sheet. Your circuit&apos;s card may differ; the notes are the part to use.</p>
          </div>
        </section>
      )}

      {/* ── Next time on stage ─────────────────────────────────────────── */}
      {report.onStage && report.onStage.length > 0 && (
        <section className="border-t border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
            <p className="sl-eyebrow">For {first}</p>
            <h2 className="sl-h2">Next time on stage</h2>
            <p className="mt-2 text-zinc-400">Competition day, in order. Read it the night before, then once more in the hallway.</p>
            <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {report.onStage.map((o, i) => (
                <li key={i} className="sl-card relative">
                  <span className="absolute right-4 top-4 font-[family-name:var(--font-display)] text-3xl text-white/10">{i + 1}</span>
                  <p className="sl-eyebrow text-[10px]">{o.moment.replace(/-/g, " ")}</p>
                  <p className="mt-1 font-semibold">{o.title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-zinc-300">{o.cue}</p>
                </li>
              ))}
            </ol>
            {report.forParent && report.forParent.length > 0 && (
              <div className="mt-8 rounded-2xl border border-white/10 p-6 sm:p-7">
                <p className="sl-eyebrow">For the parent</p>
                <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-zinc-300">
                  {report.forParent.map((t, i) => <li key={i} className="flex gap-3"><span className="text-amber-300">—</span><span>{t}</span></li>)}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Plan + closing ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <p className="sl-eyebrow">The next four weeks</p>
        <h2 className="sl-h2">Training plan</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {report.plan.map((w) => (
            <div key={w.week} className="sl-card">
              <p className="sl-eyebrow text-[10px]">Week {w.week}</p>
              <p className="mt-1 font-semibold">{w.focus}</p>
              <ul className="mt-3 space-y-1.5 text-[15px] text-zinc-300">{w.plan.map((t, i) => <li key={i} className="flex gap-2"><span className="text-zinc-500">•</span>{t}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-purple-400/20 bg-[linear-gradient(135deg,rgba(147,51,234,0.12),rgba(236,72,153,0.08),rgba(245,158,11,0.06))] p-7 sm:p-9">
          <p className="sl-eyebrow">A note for {first}</p>
          <p className="mt-4 font-[family-name:var(--font-display)] text-xl leading-relaxed text-zinc-100 sm:text-2xl">{presentClosing(report.closing)}</p>
          <p className="mt-5 text-sm tracking-wide text-zinc-400">— RoutineX · AI breakdown</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="sl-eyebrow">Glossary</p>
            <dl className="mt-3 space-y-2 text-sm">
              {report.glossary.map((g) => <div key={g.term}><dt className="inline font-semibold text-zinc-200">{g.term}</dt><dd className="inline text-zinc-400"> — {g.meaning}</dd></div>)}
            </dl>
          </div>
          <div>
            <p className="sl-eyebrow">How to read the numbers</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">This is an AI breakdown from RoutineX, not a note from a human coach. Every angle and line here is measured from the frames of this video using on-device pose tracking, projected from the camera&apos;s point of view. A different camera angle reads slightly differently; trends across moments matter more than any single degree. {sample ? "This sample was produced from generated footage so no real dancer appears on the public site." : "Frames the report doesn't use are deleted after it is built."}</p>
            {sample && (
              <Link href="/spotlight" className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 px-5 py-2.5 text-sm font-bold text-white">Get {`a report like this for your dancer`} — $14.99</Link>
            )}
          </div>
        </div>
      </section>
    </article>
  );
}

function chips(f: SpotlightFrame): string[] {
  const m = f.metrics!;
  const out: string[] = [];
  const lift = Math.max(m.legElevation.left, m.legElevation.right);
  if (lift > 30) out.push(`leg lift ${Math.round(lift)}°`);
  if (m.splitAngle > 90) out.push(`split ${Math.round(m.splitAngle)}°`);
  out.push(`knees ${Math.round(m.jointAngles.left_knee)}° / ${Math.round(m.jointAngles.right_knee)}°`);
  out.push(`torso lean ${Math.abs(Math.round(m.torsoLean))}°`);
  out.push(`shoulders ${Math.abs(Math.round(m.shoulderTilt))}° · hips ${Math.abs(Math.round(m.hipTilt))}°`);
  if (m.support !== "both") out.push(`on the ${m.support} leg`);
  return out;
}
