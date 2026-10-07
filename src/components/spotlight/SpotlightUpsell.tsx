import Link from "next/link";

/**
 * The Spotlight card for logged-in surfaces (dashboard, report page). One
 * clear offer, no bargain framing: this is the premium product.
 */
export default function SpotlightUpsell({ dancerName, compact = false }: { dancerName?: string | null; compact?: boolean }) {
  const first = dancerName?.split(" ")[0];
  return (
    <section className={`relative overflow-hidden rounded-3xl border border-amber-300/25 bg-[linear-gradient(160deg,rgba(251,191,36,0.10),rgba(236,72,153,0.07)_55%,rgba(9,9,11,0))] ${compact ? "p-5 sm:p-6" : "p-6 sm:p-8"} mb-8`}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(251,191,36,0.28),transparent)] blur-2xl" />
      <p className="text-sm text-amber-200/80">RoutineX Spotlight</p>
      <h3 className={`mt-1 font-[family-name:var(--font-display)] font-semibold text-white ${compact ? "text-2xl" : "text-3xl sm:text-4xl"}`}>
        {first ? `${first}, frame by frame.` : "One dancer. Every frame. Drawn on."}
      </h3>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-300">
        A private technique breakdown of one dancer: 60–80 frames tracked, the corrections drawn on her own frames with measured angles, priorities, drills and a four-week plan. On the web and as a PDF for her teacher. Works on group videos — tap her, everyone else is blurred.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Link href="/spotlight/new" className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20">Get the breakdown — $14.99</Link>
        <Link href="/spotlight" className="text-sm text-zinc-300 underline-offset-4 hover:underline">What&apos;s in it</Link>
      </div>
    </section>
  );
}
