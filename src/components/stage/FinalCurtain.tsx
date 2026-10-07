import Link from "next/link";
import AppStoreBadge from "@/components/AppStoreBadge";
import RoutineXLogo from "@/components/RoutineXLogo";

export default function FinalCurtain() {
  return (
    <footer className="relative overflow-hidden">
      <section className="relative py-24 sm:py-32">
        <div className="st-pool left-1/2 top-0 h-[40rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(236,72,153,0.16),rgba(249,115,22,0.08),transparent)]" />
        <div className="st-wrap relative text-center">
          <h2 className="st-display mx-auto max-w-3xl text-4xl sm:text-6xl">Walk into the next competition already knowing.</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">A score before the judges. A breakdown before the next lesson.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/spotlight" className="st-btn st-btn-sunset">Get a Spotlight breakdown</Link>
            <Link href="/signup" className="st-btn st-btn-ghost">Score a routine — 99¢</Link>
          </div>
          <div className="mt-8 flex justify-center"><AppStoreBadge variant="white" height={44} /></div>
        </div>
      </section>
      <div className="border-t border-white/[0.06]">
        <div className="st-wrap flex flex-col gap-6 py-10 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <RoutineXLogo size="sm" wordmarkClassName="text-white" />
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/spotlight" className="hover:text-zinc-300">Spotlight</Link>
            <Link href="/pricing" className="hover:text-zinc-300">Pricing</Link>
            <Link href="/guides" className="hover:text-zinc-300">Guides</Link>
            <Link href="/events" className="hover:text-zinc-300">Competitions</Link>
            <Link href="/studio/signup" className="hover:text-zinc-300">For studios</Link>
            <Link href="/privacy" className="hover:text-zinc-300">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-300">Terms</Link>
            <Link href="/contact" className="hover:text-zinc-300">Contact</Link>
          </nav>
          <p>© {new Date().getFullYear()} RoutineX · danceroutinex@gmail.com</p>
        </div>
      </div>
    </footer>
  );
}
