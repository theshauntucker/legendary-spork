"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const STAGES = [
  "Reading every tracked frame",
  "Measuring lines, angles and balance",
  "Choosing the moments worth freezing on",
  "Writing the breakdown",
  "Drawing on the frames",
  "Building the PDF",
];

/**
 * The honest wait. Spotlight runs 60–80 frames through pose tracking and a
 * full coaching pass, so it takes two to three minutes — we say so, show
 * real progress, and poll until the report flips to ready.
 */
export default function ProcessingView({ id, dancerName, status, error }: { id: string; dancerName: string; status: string; error: string | null }) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [failed, setFailed] = useState(status === "error");
  const [msg, setMsg] = useState(error);
  const first = dancerName.split(" ")[0];

  useEffect(() => {
    if (failed) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    const poll = setInterval(async () => {
      try {
        const r = await fetch(`/api/spotlight/status?id=${id}`, { cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        if (d.status === "ready") { clearInterval(poll); router.refresh(); }
        if (d.status === "error") { clearInterval(poll); setFailed(true); setMsg(d.error); }
      } catch { /* keep polling */ }
    }, 5000);
    return () => { clearInterval(t); clearInterval(poll); };
  }, [id, failed, router]);

  const stage = Math.min(STAGES.length - 1, Math.floor(elapsed / 28));
  const pct = Math.min(96, Math.round((elapsed / 170) * 100));

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090B] px-5 pt-16 text-white">
      <div className="w-full max-w-xl">
        <p className="sl-eyebrow">RoutineX Spotlight</p>
        {failed ? (
          <>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">We couldn&apos;t finish {first}&apos;s report.</h1>
            <p className="mt-3 text-zinc-400">{msg || "Something went wrong on our side."} Your Spotlight credit has been returned to your account, so you can try again right away.</p>
            <div className="mt-6 flex gap-3">
              <Link href="/spotlight/new" className="rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 px-5 py-2.5 text-sm font-bold">Try again</Link>
              <a href="mailto:danceroutinex@gmail.com" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold">Email Shaun</a>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">Building {first}&apos;s breakdown.</h1>
            <p className="mt-3 text-zinc-400">This is the most thorough look {first} can get — every frame is tracked and measured, then written up like a private session. It takes <span className="text-white">two to three minutes</span>. You can leave this page; we&apos;ll email you the moment it&apos;s ready.</p>
            <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-pink-500 via-orange-400 to-amber-300" animate={{ width: `${pct}%` }} transition={{ ease: "linear", duration: 1 }} />
            </div>
            <ul className="mt-6 space-y-2">
              {STAGES.map((s, i) => (
                <li key={s} className={`flex items-center gap-3 text-sm transition-colors ${i < stage ? "text-zinc-500" : i === stage ? "text-white" : "text-zinc-600"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${i < stage ? "bg-amber-300" : i === stage ? "animate-pulse bg-pink-400" : "bg-zinc-700"}`} />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs text-zinc-600">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} elapsed</p>
          </>
        )}
      </div>
    </main>
  );
}
