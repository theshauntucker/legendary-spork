import Link from "next/link";

/**
 * The stage, split. Left: the whole routine scored like a panel. Right: one
 * dancer under the spotlight. Two products, one decision.
 */
export default function TwoWays() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-28">
      <div className="st-wrap">
        <p className="st-runner">Two ways in</p>
        <h2 className="st-h2 mt-3 max-w-3xl">Score the routine. Or put one dancer under the light.</h2>
        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="relative border-t border-white/10 pt-8">
            <p className="text-sm text-zinc-500">The routine</p>
            <h3 className="st-display mt-2 text-3xl sm:text-4xl">RoutineX scoring</h3>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-zinc-300">
              Three simulated judges score the whole routine on a 300-point competition rubric — technique, performance, choreography, overall — with timestamped notes and a priority list. Solos, groups, cheer. Results in minutes.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-zinc-500">First analysis</dt><dd className="text-xl font-semibold">99¢</dd></div>
              <div><dt className="text-zinc-500">Then</dt><dd className="text-xl font-semibold">$1.99 <span className="text-sm font-normal text-zinc-500">or $4.99/mo for 4</span></dd></div>
            </dl>
            <Link href="/signup" className="st-btn st-btn-ghost mt-7">Score a routine</Link>
          </div>
          <div className="relative border-t border-amber-300/40 pt-8">
            <div className="st-pool -top-24 right-0 h-64 w-64 bg-[radial-gradient(closest-side,rgba(251,191,36,0.18),transparent)]" />
            <p className="text-sm text-amber-200/80">One dancer</p>
            <h3 className="st-display mt-2 text-3xl sm:text-4xl">RoutineX Spotlight</h3>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-zinc-300">
              Sixty to eighty frames of her routine, tracked on your phone. The moments a coach would freeze on, with the lines, angles and corrections drawn on her own frames. Priorities, drills, a four-week plan. A PDF you can hand to her teacher.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-zinc-500">One dancer, one routine</dt><dd className="text-xl font-semibold">$14.99</dd></div>
              <div><dt className="text-zinc-500">A private lesson</dt><dd className="text-xl font-semibold text-zinc-500 line-through decoration-zinc-600">$75–150</dd></div>
            </dl>
            <Link href="/spotlight" className="st-btn st-btn-sunset mt-7">See a Spotlight breakdown</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
