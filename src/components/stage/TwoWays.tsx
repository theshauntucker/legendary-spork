import Link from "next/link";
import StageImage from "@/components/stage/StageImage";
import { ARABESQUE_IMAGE, GROUP_IMAGE } from "@/lib/stage-assets";

/**
 * The stage, split. Left: the whole routine scored like a panel. Right: one
 * dancer under the spotlight. Two products, one decision — and the picture
 * says which is which before the copy does.
 */
export default function TwoWays() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-28">
      <div className="st-wrap">
        <p className="st-runner">Two ways in</p>
        <h2 className="st-h2 mt-3 max-w-3xl">Score the routine. Or put one dancer under the light.</h2>
        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="relative">
            <div className="st-frame relative aspect-[16/10] overflow-hidden">
              <StageImage asset={GROUP_IMAGE} sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-cover object-center transition-transform duration-[1800ms] ease-out hover:scale-[1.04]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(9,9,11,0.75))]" />
              <p className="absolute bottom-4 left-5 text-xs uppercase tracking-[0.18em] text-zinc-300">The whole routine</p>
            </div>
            <div className="mt-7 border-t border-white/10 pt-7">
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
          </div>
          <div className="relative">
            <div className="st-pool -top-24 right-0 h-64 w-64 bg-[radial-gradient(closest-side,rgba(251,191,36,0.18),transparent)]" />
            <div className="st-frame relative aspect-[16/10] overflow-hidden ring-1 ring-amber-300/30">
              <StageImage asset={ARABESQUE_IMAGE} sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-cover object-center transition-transform duration-[1800ms] ease-out hover:scale-[1.04]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(9,9,11,0.75))]" />
              <p className="absolute bottom-4 left-5 text-xs uppercase tracking-[0.18em] text-amber-200/90">One dancer</p>
            </div>
            <div className="mt-7 border-t border-amber-300/40 pt-7">
              <p className="text-sm text-amber-200/80">One dancer</p>
              <h3 className="st-display mt-2 text-3xl sm:text-4xl">RoutineX Spotlight</h3>
              <p className="mt-4 max-w-md text-[17px] leading-relaxed text-zinc-300">
                Sixty to eighty frames of her routine, tracked on your phone. The moments worth freezing, with the lines, angles and corrections drawn on her own frames. An AI breakdown: priorities, drills, a four-week plan, and a PDF you can hand to her teacher.
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><dt className="text-zinc-500">One dancer, one routine</dt><dd className="text-xl font-semibold">$14.99</dd></div>
                <div><dt className="text-zinc-500">What you keep</dt><dd className="text-xl font-semibold">Web + PDF</dd></div>
              </dl>
              <Link href="/spotlight" className="st-btn st-btn-sunset mt-7">See a Spotlight breakdown</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
