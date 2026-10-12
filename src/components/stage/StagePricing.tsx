"use client";

import { useState } from "react";
import Link from "next/link";
import { startCheckout, type CheckoutType } from "@/lib/checkout";

/**
 * Pricing as a short menu, not a card wall. Spotlight is the headline; the
 * routine ladder reads underneath it in one line each.
 */
export default function StagePricing() {
  const [busy, setBusy] = useState<CheckoutType | null>(null);
  const [err, setErr] = useState("");
  const buy = async (type: CheckoutType) => {
    setBusy(type); setErr("");
    const r = await startCheckout(type);
    if (!r.ok) { if (!r.cancelled) setErr(r.error === "Not authenticated" || /401/.test(r.error) ? "Sign in or create an account first." : r.error); setBusy(null); return; }
    if (!r.redirected) window.location.href = type === "spotlight" ? "/spotlight/new" : "/dashboard?from=iap";
  };

  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="st-wrap">
        <p className="st-runner">Pricing</p>
        <h2 className="st-h2 mt-3">One-time credits stay. Season Member credits reset monthly.</h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-3xl border border-amber-300/25 bg-[linear-gradient(160deg,rgba(251,191,36,0.08),rgba(236,72,153,0.06)_50%,transparent)] p-7 sm:p-9">
            <div className="st-pool -right-10 -top-10 h-56 w-56 bg-[radial-gradient(closest-side,rgba(251,191,36,0.25),transparent)]" />
            <p className="text-sm text-amber-200/80">RoutineX Spotlight</p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="st-display text-6xl">$14.99</span>
              <span className="text-zinc-400">one dancer, one routine</span>
            </div>
            <ul className="mt-6 space-y-2 text-[15.5px] text-zinc-200">
              <li>60–80 frames tracked on your phone</li>
              <li>12–16 key moments with lines, angles and corrections drawn on her</li>
              <li>The corrected limb drawn beside hers, so she sees the difference</li>
              <li>Seven category scores, plus how it reads on a judge&apos;s card</li>
              <li>Priorities with the cause, drills with cues, competition-day cues, a four-week plan</li>
              <li>Web report plus a PDF for her teacher</li>
              <li>Group videos: tap your dancer, everyone else is blurred</li>
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button onClick={() => buy("spotlight")} disabled={busy !== null} className="st-btn st-btn-sunset disabled:opacity-60">{busy === "spotlight" ? "Opening checkout…" : "Get the Spotlight report"}</button>
              <Link href="/spotlight/sample" className="text-sm text-zinc-300 underline-offset-4 hover:underline">Read the sample first</Link>
            </div>
            <p className="mt-4 text-xs text-zinc-500">One-time. Money-back guarantee.</p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">Routine scoring</p>
            <ul className="mt-3 divide-y divide-white/10">
              {[
                ["First analysis", "99¢", "One-time welcome price. The full three-judge sheet.", "intro"],
                ["Single analysis", "$1.99", "Any routine, any time. Credits never expire.", "single"],
                ["Season Member", "$4.99/mo", "4 analyses a month, season tracker, practice plans included. Cancel anytime.", "subscription"],
                ["Competition Pack", "$9.99", "5 analyses. Credits never expire.", "pack"],
              ].map(([name, price, body, type]) => (
                <li key={name} className="flex items-start justify-between gap-6 py-5">
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="mt-1 text-sm text-zinc-400">{body}</p>
                  </div>
                  <button onClick={() => buy(type as CheckoutType)} disabled={busy !== null} className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/5 disabled:opacity-60">{busy === type ? "…" : price}</button>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-zinc-500">Studios: <Link href="/studio/signup" className="text-zinc-300 underline-offset-4 hover:underline">RoutineX Studio</Link>, $99/mo with a 30-day free trial.</p>
            {err && <p className="mt-3 text-sm text-pink-300">{err} <Link href="/signup" className="underline">Create an account</Link></p>}
          </div>
        </div>
      </div>
    </section>
  );
}
