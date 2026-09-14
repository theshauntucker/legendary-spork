"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, Gift } from "lucide-react";
import Confetti from "@/components/Confetti";

/**
 * The wait-room question.
 *
 * Analysis takes one to three minutes and right now that minute is dead air.
 * This fills it: one tap to say what they're hoping the report tells them,
 * then an optional note. A real note earns a free analysis, once per account.
 *
 * Shows once per video. Never blocks the progress indicator — it sits at the
 * bottom of the screen and can be dismissed with one tap.
 */

const FOCUS_CHOICES = [
  { key: "technique", label: "Is her technique clean?" },
  { key: "performance", label: "Does she sell it on stage?" },
  { key: "choreo", label: "Is the choreography scoring well?" },
  { key: "ready", label: "Are we competition-ready?" },
  { key: "gap", label: "What's costing us points?" },
];

type Step = "ask" | "note" | "done";

export default function WaitRoomPrompt({ videoId }: { videoId: string }) {
  const lsKey = `rx_wait_prompt_${videoId}`;

  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>("ask");
  const [choice, setChoice] = useState<{ key: string; label: string } | null>(null);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [rewardAvailable, setRewardAvailable] = useState(false);
  const [creditGranted, setCreditGranted] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(lsKey)) return;
    } catch {
      /* private mode — the per-video key just won't stick */
    }
    const timer = window.setTimeout(() => setVisible(true), 7000);
    return () => window.clearTimeout(timer);
  }, [lsKey]);

  useEffect(() => {
    if (!visible) return;
    fetch("/api/feedback")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setRewardAvailable(!!d?.rewardAvailable))
      .catch(() => {});
  }, [visible]);

  const mark = () => {
    try {
      localStorage.setItem(lsKey, "1");
    } catch {
      /* ignore */
    }
  };

  const post = async (body: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "pre_analysis", promptKey: "waitroom_focus", videoId, ...body }),
      });
      const data = await res.json().catch(() => null);
      return !!data?.creditGranted;
    } catch {
      return false;
    }
  };

  const pick = (c: { key: string; label: string }) => {
    setChoice(c);
    setStep("note");
    void post({ choice: c.label });
  };

  const sendNote = async () => {
    setSending(true);
    const granted = await post({ choice: choice?.label, body: note.trim() });
    setCreditGranted(granted);
    setSending(false);
    mark();
    setStep("done");
    if (!granted) window.setTimeout(() => setVisible(false), 3200);
  };

  const skip = () => {
    mark();
    setStep("done");
    window.setTimeout(() => setVisible(false), 2200);
  };

  const dismiss = () => {
    mark();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[400px] z-[70]"
          role="dialog"
          aria-label="While your routine is scoring"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#18181B]/95 backdrop-blur-xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] p-5">
            <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B]" />
            {step === "done" && creditGranted && <Confetti seed={3} />}

            <button
              onClick={dismiss}
              className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            {step === "ask" && (
              <>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[1px] text-[#C084FC]">
                  <Sparkles className="h-3 w-3" /> While the judges deliberate
                </p>
                <h3 className="mt-1 pr-6 text-base font-bold text-white">
                  What are you hoping this report tells you?
                </h3>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  One tap. It shapes what we build next.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FOCUS_CHOICES.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => pick(c)}
                      className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 transition-colors hover:border-[#C084FC]/60 hover:bg-white/10 active:scale-95"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "note" && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#C084FC]">Got it</p>
                <h3 className="mt-1 pr-6 text-base font-bold text-white">
                  Anything you want us to look for?
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                  Shaun reads these himself — it&rsquo;s how the scoring gets sharper every season.
                </p>

                {rewardAvailable && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#FBBF24]/25 bg-[#FBBF24]/[0.07] px-3 py-2">
                    <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FBBF24]" />
                    <p className="text-[11px] leading-snug text-[#FBBF24]">
                      Leave us a real sentence and we&rsquo;ll drop a{" "}
                      <strong className="font-bold">free analysis</strong> in your account. One per
                      family, on the house.
                    </p>
                  </div>
                )}

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={600}
                  autoFocus
                  placeholder="Her turns have been inconsistent all season — I want to know if a judge would catch it."
                  className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[#C084FC]/60 focus:outline-none"
                />
                <button
                  onClick={sendNote}
                  disabled={sending || note.trim().length < 3}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Sending…" : "Send it to Shaun"}
                </button>
                <button onClick={skip} className="mt-2 w-full text-xs text-white/40 hover:text-white/70">
                  No thanks, just watching the clock
                </button>
              </>
            )}

            {step === "done" && (
              <>
                {creditGranted ? (
                  <>
                    <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#FBBF24]">
                      That&rsquo;s a free analysis
                    </p>
                    <h3 className="mt-1 text-base font-bold text-white">+1 credit, added just now.</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                      Use it on her next run-through and watch the two reports side by side. Thank you
                      for the note — it genuinely changes what gets built.
                    </p>
                    <button
                      onClick={dismiss}
                      className="mt-3 w-full rounded-xl border border-white/12 bg-white/5 py-2.5 text-xs font-semibold text-white/85 hover:bg-white/10"
                    >
                      Back to the countdown
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-white">Noted. 💛</h3>
                    <p className="mt-1 text-xs text-[#A1A1AA]">
                      Your report is still cooking — it&rsquo;ll open on its own.
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
