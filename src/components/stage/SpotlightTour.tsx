import Link from "next/link";
import AnnotatedFrame from "@/components/spotlight/AnnotatedFrame";
import { formatTime } from "@/lib/spotlight/landmarks";
import { SAMPLE } from "@/lib/spotlight/sample";
import type { SpotlightMoment } from "@/lib/spotlight/types";

/**
 * Spotlight, shown four ways — every picture and number on this section is
 * the published sample report (src/lib/spotlight/sample-data.json), i.e. the
 * real engine's output on a generated clip. Nothing here is mocked up: if the
 * sample changes, this changes with it.
 *
 *   1. Drawn on her      — two tall crops: what is working / what to change
 *   2. Every moment      — a contact sheet of time-stamped key frames
 *   3. Scored            — the seven categories and the judge's card
 *   4. A plan            — priorities, drills, the PDF pages
 */

const STEPS: Array<[string, string]> = [
  ["Upload", "Any routine video on your phone. It never leaves your device."],
  ["Tap her", "In a group? Tap your dancer. Everyone else is blurred first."],
  ["Read it", "About three minutes later it is on your screen and in your inbox."],
];

export default function SpotlightTour({ id = "spotlight" }: { id?: string }) {
  const { report, frames, urls } = SAMPLE;
  if (!report) return null;

  const first = report.dancer.name.split(" ")[0];
  const has = (m: SpotlightMoment) => Boolean(urls[m.frame] && frames[m.frame]?.pose);
  const moments = report.moments.filter(has);
  if (moments.length < 4) return null;

  // Act 1: the cleanest "keep this" frame and the clearest "change this" frame.
  const score = (m: SpotlightMoment, status: "good" | "fix") => m.annotations.filter((a) => a.status === status).length - m.annotations.filter((a) => a.status !== status).length;
  const keep = [...moments].sort((a, b) => score(b, "good") - score(a, "good"))[0];
  const change = [...moments].filter((m) => m.frame !== keep.frame).sort((a, b) => {
    const ghost = (m: SpotlightMoment) => (m.annotations.some((x) => x.type === "ghost") ? 1 : 0);
    return ghost(b) - ghost(a) || score(b, "fix") - score(a, "fix");
  })[0];
  const crowded = (m: SpotlightMoment) => new Set(m.annotations.map((a) => a.type)).size < m.annotations.length;
  const sheet = moments.filter((m) => m.frame !== keep.frame && m.frame !== change.frame && !crowded(m));
  const picked = sheet.length > 6 ? pickSpread(sheet, 6) : sheet;

  const card = report.judgesCard ?? [];
  const cardTotal = Math.round(card.reduce((sum, l) => sum + (l.weight * l.score) / 10, 0));
  const cardMax = card.reduce((sum, l) => sum + l.weight, 0);
  const span = `${formatTime(frames[moments[0].frame].t)}–${formatTime(frames[moments[moments.length - 1].frame].t)}`;

  return (
    <section id={id} className="relative overflow-hidden">
      {/* ── Opening ─────────────────────────────────────────────────── */}
      <div className="st-wrap pt-20 sm:pt-28">
        <p className="st-new">New · RoutineX Spotlight</p>
        <h2 className="st-mega mt-5 max-w-5xl">
          One dancer. Every key moment. <span className="st-sun-text block">Marked up.</span>
        </h2>
        <p className="st-lede mt-7 !max-w-2xl">
          Spotlight is a private technique breakdown of your dancer, built from her own routine video. This is a real one, start to finish. Scroll it.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/spotlight/new" className="st-btn st-btn-sunset">Get her breakdown — $14.99</Link>
          <Link href="/spotlight/sample" className="st-btn st-btn-ghost">Read {first}&apos;s full report</Link>
        </div>
      </div>

      {/* ── 1 · Drawn on her ────────────────────────────────────────── */}
      <div className="st-wrap mt-20 sm:mt-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-end lg:gap-14">
          <div>
            <p className="st-act">1 of 4</p>
            <h3 className="st-big mt-3">The coaching is drawn on her.</h3>
            <p className="mt-5 text-[17px] leading-relaxed text-zinc-300">
              Not a paragraph about “extension.” The line, the angle and the fix, on her own frame, measured from her own body.
            </p>
            <ul className="mt-7 space-y-4 text-[16px]">
              <li className="flex gap-3"><span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-amber-300" /><span><b className="font-semibold text-white">Gold is working.</b> <span className="text-zinc-400">Keep doing exactly this.</span></span></li>
              <li className="flex gap-3"><span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-pink-500" /><span><b className="font-semibold text-white">Pink is the fix.</b> <span className="text-zinc-400">With the number it is now and the number to reach.</span></span></li>
              <li className="flex gap-3"><span aria-hidden className="mt-2.5 h-0 w-3 shrink-0 border-t-2 border-dashed border-pink-400" /><span><b className="font-semibold text-white">Dashed is where it should be.</b> <span className="text-zinc-400">The corrected limb, drawn beside hers.</span></span></li>
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Crop m={keep} tag="Keep this" tone="gold" />
            <Crop m={change} tag="Change this" tone="pink" />
          </div>
        </div>
      </div>

      {/* ── 2 · Every moment, time-stamped ──────────────────────────── */}
      <div className="st-wrap mt-24 sm:mt-36">
        <p className="st-act">2 of 4</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_minmax(0,24rem)] lg:items-end">
          <h3 className="st-big max-w-3xl">{report.moments.length} moments a coach would freeze on. Time-stamped.</h3>
          <p className="text-[17px] leading-relaxed text-zinc-300">
            The top of the extension. The apex of the jump. The landing. The last picture the judges see. {first}&apos;s clip runs {span}; a full routine gets up to 14 moments from up to 80 tracked frames.
          </p>
        </div>
        <div className="st-rail -mx-5 mt-10 scroll-pl-5 px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {picked.map((m) => (
            <figure key={m.frame} className="w-[80vw] sm:w-auto">
              <Zoom m={m} box={4 / 3} zoom={1.45} className="st-frame" />
              <figcaption className="mt-2.5 flex items-baseline justify-between gap-3">
                <span className="font-[family-name:var(--font-display)] text-[15px] leading-snug text-zinc-100 sm:text-lg">{m.title}</span>
                <span className="shrink-0 text-xs tabular-nums text-amber-200/80">{formatTime(frames[m.frame].t)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-5 text-sm text-zinc-500"><span className="sm:hidden">Swipe through them. </span>Each one comes with what is working, what to change, and the measurements behind it.</p>
      </div>

      {/* ── 3 · Scored ──────────────────────────────────────────────── */}
      <div className="st-wrap mt-24 sm:mt-36">
        <p className="st-act">3 of 4</p>
        <h3 className="st-big mt-3 max-w-4xl">Scored where the judges score.</h3>
        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="text-sm text-zinc-500">Seven technique categories, out of 10</p>
            <ul className="mt-5 space-y-4">
              {report.categories.map((c) => (
                <li key={c.key}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[16px] font-medium text-zinc-100">{c.name}</span>
                    <span className="font-[family-name:var(--font-display)] text-2xl tabular-nums text-amber-200">{c.score.toFixed(1)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className="h-full rounded-full bg-gradient-to-r from-pink-500 via-orange-400 to-amber-300" style={{ width: `${c.score * 10}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {card.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <p className="text-sm text-zinc-500">How it reads on a judge&apos;s card</p>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-display)] text-7xl font-semibold leading-none tabular-nums sm:text-8xl">{cardTotal}</span>
                <span className="text-xl text-zinc-500">/ {cardMax}</span>
              </p>
              <p className="mt-2 text-sm text-zinc-500">Projected, one judge, weighted like a real sheet.</p>
              <ul className="mt-7 space-y-5">
                {card.slice(0, 3).map((l) => (
                  <li key={l.category} className="border-t border-white/10 pt-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{l.name}</p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-lg italic leading-snug text-zinc-100">“{l.note}”</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-zinc-600">The line each judge would say into the mic, for every category on the sheet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 4 · A plan ──────────────────────────────────────────────── */}
      <div className="st-wrap mt-24 sm:mt-36">
        <p className="st-act">4 of 4</p>
        <h3 className="st-big mt-3 max-w-4xl">And a plan she can start tonight.</h3>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-14">
          <div>
            <p className="text-sm text-zinc-500">{first}&apos;s priorities, in order</p>
            <ol className="mt-5 space-y-5">
              {report.priorities.slice(0, 3).map((p) => (
                <li key={p.rank} className="flex gap-4">
                  <span className="font-[family-name:var(--font-display)] text-4xl leading-none text-pink-400">{p.rank}</span>
                  <div>
                    <p className="text-[17px] font-semibold leading-snug text-white">{p.title}</p>
                    <p className="mt-1.5 text-[15px] text-zinc-400">Her cue: <span className="italic text-zinc-200">“{p.cue}”</span></p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-9 text-sm text-zinc-500">The drills that fix them. No equipment.</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {report.drills.slice(0, 4).map((d) => (
                <li key={d.name} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="font-semibold text-zinc-100">{d.name}</p>
                  <p className="mt-1 text-sm text-amber-200/80">{d.dose}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[15px] leading-relaxed text-zinc-400">
              Plus a four-week training plan, competition-day cues written to her, and notes for you about the car ride home.
            </p>
          </div>
          <div>
            <div className="st-pages" aria-hidden>
              {/* eslint-disable @next/next/no-img-element */}
              <img src="/spotlight-sample/pages/page-23.webp" alt="" loading="lazy" />
              <img src="/spotlight-sample/pages/page-21.webp" alt="" loading="lazy" />
              <img src="/spotlight-sample/pages/page-10.webp" alt="" loading="lazy" />
              <img src="/spotlight-sample/pages/page-01.webp" alt="" loading="lazy" />
              {/* eslint-enable @next/next/no-img-element */}
            </div>
            <p className="mt-6 font-[family-name:var(--font-display)] text-2xl leading-snug text-zinc-100">It all comes as a PDF. Hers to keep.</p>
            <p className="mt-2 text-[15px] text-zinc-400">Forward it to her teacher. Print it for the fridge.</p>
            <a href="/spotlight-sample/RoutineX-Spotlight-Sample.pdf" className="mt-4 inline-flex text-sm font-semibold text-amber-200 underline-offset-4 hover:underline">Download {first}&apos;s PDF</a>
          </div>
        </div>
      </div>

      {/* ── Easy + price ────────────────────────────────────────────── */}
      <div className="st-wrap mt-24 pb-20 sm:mt-36 sm:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] border border-amber-300/25 bg-[radial-gradient(80%_120%_at_85%_0%,rgba(236,72,153,0.16),transparent_60%),radial-gradient(60%_100%_at_0%_100%,rgba(147,51,234,0.14),transparent_60%)] p-7 sm:p-12">
          <h3 className="st-mega !text-[clamp(2.4rem,6.6vw,4.75rem)]">Three steps. About three minutes.</h3>
          <ol className="mt-9 grid gap-6 sm:grid-cols-3">
            {STEPS.map(([t, b], i) => (
              <li key={t} className="border-t border-white/15 pt-5">
                <p className="font-[family-name:var(--font-display)] text-3xl"><span className="text-amber-300">{i + 1}.</span> {t}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-300">{b}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col gap-6 border-t border-white/15 pt-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-[family-name:var(--font-display)] text-6xl font-semibold leading-none sm:text-7xl">$14.99</p>
              <p className="mt-3 text-lg text-zinc-400">One dancer, one routine. A private lesson runs <span className="line-through decoration-zinc-600">$75–150</span>.</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href="/spotlight/new" className="st-btn st-btn-sunset justify-center whitespace-nowrap">Get her breakdown</Link>
              <Link href="/spotlight/sample" className="st-btn st-btn-ghost justify-center whitespace-nowrap">Read the full report first</Link>
            </div>
          </div>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-zinc-600">
          {first} is a generated dancer, so no real child appears on this site. The report is exactly what Spotlight returned for that clip: every mark, angle, score and note above is from it.
        </p>
      </div>
    </section>
  );

  /** A tall crop centred on the dancer, with a status tag and the moment's title. */
  function Crop({ m, tag, tone }: { m: SpotlightMoment; tag: string; tone: "gold" | "pink" }) {
    return (
      <figure>
        <div className="relative">
          <Zoom m={m} box={1} zoom={1.08} className={`st-frame ${tone === "gold" ? "ring-1 ring-amber-300/40" : "ring-1 ring-pink-500/40"}`} />
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${tone === "gold" ? "bg-amber-300 text-black" : "bg-pink-500 text-white"}`}>{tag}</span>
        </div>
        <figcaption className="mt-3">
          <p className="flex items-baseline justify-between gap-3">
            <span className="font-[family-name:var(--font-display)] text-xl text-zinc-100">{m.title}</span>
            <span className="shrink-0 text-xs tabular-nums text-zinc-500">{formatTime(frames[m.frame].t)}</span>
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400 line-clamp-3">{m.analysis}</p>
        </figcaption>
      </figure>
    );
  }

  /**
   * The frame is a wide stage shot; the dancer is a small part of it. Zoom
   * shows a `box`-shaped window centred on her hips by scaling the whole
   * AnnotatedFrame (picture + drawn marks together, so they stay registered).
   */
  function Zoom({ m, box, zoom = 1, className }: { m: SpotlightMoment; box: number; zoom?: number; className?: string }) {
    const f = frames[m.frame];
    const pose = f.pose;
    const frameAspect = (f.w || 16) / (f.h || 9);
    const hPct = 100 * zoom;
    const wPct = Math.max(100, (frameAspect / box) * 100 * zoom);
    // Centre on the box around her whole body, arms and legs included.
    const pts = pose ? [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].map((i) => pose[i]) : [];
    const mid = (k: 0 | 1) => (pts.length ? (Math.min(...pts.map((l) => l[k])) + Math.max(...pts.map((l) => l[k]))) / 2 : 0.5);
    // Labels sit to the right of the joint they mark, so bias the window that way.
    const cx = mid(0) + 0.035;
    const cy = mid(1);
    const left = Math.min(0, Math.max(100 - wPct, 50 - cx * wPct));
    const top = Math.min(0, Math.max(100 - hPct, 50 - cy * hPct));
    return (
      <div className={`relative overflow-hidden ${className ?? ""}`} style={{ aspectRatio: String(box) }}>
        <div className="absolute" style={{ width: `${wPct}%`, height: `${hPct}%`, left: `${left}%`, top: `${top}%` }}>
          <AnnotatedFrame src={urls[m.frame]} pose={pose} annotations={m.annotations} w={f.w} h={f.h} alt={`${first} — ${m.title}`} />
        </div>
      </div>
    );
  }
}

/** n items spread evenly across the list, keeping time order. */
function pickSpread<T>(list: T[], n: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(list[Math.round((i * (list.length - 1)) / (n - 1))]);
  return [...new Set(out)];
}
