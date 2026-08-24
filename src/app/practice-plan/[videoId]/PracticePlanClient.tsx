"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Eye,
  Heart,
  Loader2,
  Lock,
  Printer,
  Sparkles,
  Target,
} from "lucide-react";
import { startCheckout } from "@/lib/checkout";

interface PlanContent {
  title: string;
  summary: string;
  focusAreas: Array<{ name: string; why: string; targetCategory: string }>;
  weeks: Array<{
    week: number;
    theme: string;
    days: Array<{
      day: string;
      minutes: number;
      blocks: Array<{
        name: string;
        minutes: number;
        drill: string;
        sets: string;
        watchFor: string;
      }>;
    }>;
  }>;
  checkpoints: Array<{ when: string; test: string; passSignal: string }>;
  parentTips: string[];
  motivation: string;
}

type Status =
  | "none"
  | "pending_payment"
  | "queued"
  | "generating"
  | "ready"
  | "error";

export default function PracticePlanClient({
  videoId,
  routineName,
  dancerName,
  style,
  initialStatus,
  initialContent,
  isMember,
}: {
  videoId: string;
  routineName: string;
  dancerName: string;
  style: string | null;
  initialStatus: string;
  initialContent: PlanContent | null;
  isMember: boolean;
}) {
  const [status, setStatus] = useState<Status>(initialStatus as Status);
  const [content, setContent] = useState<PlanContent | null>(initialContent);
  const [working, setWorking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const kicked = useRef(false);

  const generate = useCallback(async () => {
    setWorking(true);
    setErrorMsg(null);
    setStatus((s) => (s === "none" || s === "pending_payment" || s === "error" ? s : "generating"));
    try {
      const res = await fetch("/api/practice-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const data = await res.json();
      if (data.status === "ready") {
        const poll = await fetch(`/api/practice-plan?videoId=${videoId}`);
        const pd = await poll.json();
        setContent(pd.content);
        setStatus("ready");
      } else if (data.status === "checkout" && data.url) {
        window.location.href = data.url;
        return;
      } else if (data.status === "generating" || data.status === "queued") {
        setStatus("generating");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong generating the plan.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error — try again.");
    } finally {
      setWorking(false);
    }
  }, [videoId]);

  // Landing from Stripe success (?paid=1) or with a queued plan: kick generation.
  useEffect(() => {
    if (kicked.current) return;
    const paid = typeof window !== "undefined" && window.location.search.includes("paid=1");
    if (status === "queued" || (paid && status !== "ready")) {
      kicked.current = true;
      generate();
    }
  }, [status, generate]);

  // Poll while generating (covers webhook-side generation finishing)
  useEffect(() => {
    if (status !== "generating") return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/practice-plan?videoId=${videoId}`);
        const data = await res.json();
        if (data.status === "ready") {
          setContent(data.content);
          setStatus("ready");
        } else if (data.status === "error") {
          setStatus("error");
        }
      } catch {
        /* keep polling */
      }
    }, 4000);
    return () => clearInterval(t);
  }, [status, videoId]);

  return (
    <div className="min-h-screen py-12 px-4 print:py-4">
      <div className="fixed inset-0 -z-10 print:hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            href={`/analysis/${videoId}`}
            className="flex items-center gap-2 text-surface-200 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to the report
          </Link>
          {status === "ready" && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-sm text-surface-200 hover:text-white transition-colors"
            >
              <Printer className="h-4 w-4" /> Print for the fridge
            </button>
          )}
        </div>

        {/* ── Not purchased yet ── */}
        {(status === "none" || status === "pending_payment") && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/30 to-gold-500/30">
              <ClipboardList className="h-7 w-7 text-primary-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Turn {dancerName}&apos;s judge sheet into a practice plan
            </h1>
            <p className="text-surface-200 max-w-xl mx-auto leading-relaxed mb-6">
              A 2-week home plan built from this exact report on &ldquo;{routineName}&rdquo; —
              4 days a week, 20&ndash;30 minutes a day. Every drill traces to a specific note the
              judges made{style ? ` on this ${style} routine` : ""}. Nothing generic.
            </p>
            {isMember ? (
              <button
                onClick={generate}
                disabled={working}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-8 py-3.5 font-bold text-white disabled:opacity-60"
              >
                {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Build the plan — included with your membership
              </button>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={generate}
                  disabled={working}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-8 py-3.5 font-bold text-white disabled:opacity-60"
                >
                  {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Get the plan — $4.99
                </button>
                <p className="text-sm text-surface-200">
                  Season Members get every practice plan free.{" "}
                  <button
                    onClick={() => startCheckout("subscription")}
                    className="text-primary-300 font-semibold hover:text-primary-200 underline underline-offset-2"
                  >
                    Become a Season Member →
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Generating ── */}
        {(status === "generating" || status === "queued") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center"
            >
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary-400 mb-5" />
              <h2 className="text-xl font-bold text-white mb-2">
                Your coach is writing the plan…
              </h2>
              <p className="text-surface-200 max-w-md mx-auto leading-relaxed">
                Reading the judge sheet for &ldquo;{routineName}&rdquo;, matching every note to the
                right drill, and pacing two weeks of practice. Usually under a minute.
              </p>
            </motion.div>
          )}

        {/* ── Error ── */}
        {status === "error" && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">That didn&apos;t go through</h2>
            <p className="text-surface-200 mb-5">{errorMsg || "Generation hit a snag — your plan is safe to retry."}</p>
            <button
              onClick={generate}
              disabled={working}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-6 py-2.5 font-semibold text-white hover:bg-white/15 disabled:opacity-60"
            >
              {working ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Try again
            </button>
          </div>
        )}

        {/* ── The plan ── */}
        {status === "ready" && content && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <div className="text-[11px] uppercase tracking-wider text-primary-300 font-bold mb-2">
                Personalized Practice Plan · {dancerName}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{content.title}</h1>
              <p className="text-surface-200 leading-relaxed">{content.summary}</p>
            </div>

            {/* Focus areas */}
            <div className="grid gap-3 sm:grid-cols-2 mb-10">
              {content.focusAreas.map((f, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Target className="h-4 w-4 text-primary-400" />
                    <span className="font-bold text-white text-sm">{f.name}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-wide text-surface-200 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                      {f.targetCategory}
                    </span>
                  </div>
                  <p className="text-sm text-surface-200 leading-relaxed">{f.why}</p>
                </div>
              ))}
            </div>

            {/* Weeks */}
            {content.weeks.map((w) => (
              <div key={w.week} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/30 to-gold-500/30 font-bold text-white">
                    {w.week}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Week {w.week}</h2>
                    <p className="text-sm text-surface-200">{w.theme}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {w.days.map((d, di) => (
                    <div key={di} className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                        <span className="font-bold text-white text-sm">{d.day}</span>
                        <span className="text-xs text-surface-200">{d.minutes} min</span>
                      </div>
                      <div className="divide-y divide-white/5">
                        {d.blocks.map((b, bi) => (
                          <div key={bi} className="px-4 py-3.5">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Dumbbell className="h-3.5 w-3.5 text-primary-400" />
                              <span className="font-semibold text-white text-sm">{b.name}</span>
                              <span className="ml-auto text-[11px] text-surface-200 whitespace-nowrap">
                                {b.minutes} min · {b.sets}
                              </span>
                            </div>
                            <p className="text-sm text-surface-200 leading-relaxed mb-2">{b.drill}</p>
                            <p className="text-xs text-primary-300/90 leading-relaxed flex items-start gap-1.5">
                              <Eye className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                              <span><span className="font-semibold">Parent check:</span> {b.watchFor}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Checkpoints */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <CalendarCheck className="h-5 w-5 text-gold-400" />
                <h2 className="text-lg font-bold text-white">Checkpoints — film these</h2>
              </div>
              <div className="space-y-3">
                {content.checkpoints.map((c, i) => (
                  <div key={i} className="rounded-xl border border-gold-500/20 bg-gold-500/[0.05] p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-gold-400 mb-1">{c.when}</div>
                    <p className="text-sm text-white mb-1.5">{c.test}</p>
                    <p className="text-xs text-surface-200 flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-400" />
                      Passing looks like: {c.passSignal}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Parent tips + motivation */}
            {content.parentTips?.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 mb-6">
                <h3 className="font-bold text-white text-sm mb-3">For the parent running this</h3>
                <ul className="space-y-2">
                  {content.parentTips.map((t, i) => (
                    <li key={i} className="text-sm text-surface-200 leading-relaxed">• {t}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-xl border border-primary-500/25 bg-gradient-to-br from-primary-500/10 to-transparent p-5 mb-12">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-accent-400" />
                <span className="text-xs uppercase tracking-wider font-bold text-primary-300">From your coach</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed italic">{content.motivation}</p>
            </div>

            <div className="text-center print:hidden">
              <p className="text-sm text-surface-200 mb-3">
                Run the plan, then submit the routine again — the Season Tracker will measure exactly what moved.
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-7 py-3 font-bold text-white"
              >
                <Sparkles className="h-4 w-4" /> Score the improved routine
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
