"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Share2, Check, Gift, Send, Users, Star } from "lucide-react";
import Confetti from "@/components/Confetti";

/**
 * The celebration card.
 *
 * Fires once per account per milestone — first report, a personal best, an
 * award level climb, a third analysis, a Diamond. The page hands down every
 * milestone this report qualifies for, highest value first; we show the first
 * one the account hasn't already seen and then mark it spent.
 *
 * Each milestone carries exactly one ask. Never two.
 */

export type MilestoneAsk = "review" | "share" | "refer" | "feedback";

export interface Milestone {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  stat?: string;
  ask: MilestoneAsk;
}

const APP_STORE_ID = "6763345348";

function inIosShell(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.dataset.nativeShell === "ios") return true;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}

export default function MilestoneCelebration({
  milestones,
  videoId,
  shareLine,
}: {
  milestones: Milestone[];
  videoId: string;
  shareLine: string;
}) {
  const [active, setActive] = useState<Milestone | null>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [creditGranted, setCreditGranted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The page already filtered out anything this account has celebrated, so
    // the first entry is the one to show. Burn it immediately — a milestone
    // seen once is spent, whether or not they act on the ask.
    const next = milestones[0];
    if (!next) return;
    let cancelled = false;

    setActive(next);
    // Let the report land first — the celebration is a reward, not a gate.
    const timer = window.setTimeout(() => !cancelled && setVisible(true), 2200);

    fetch("/api/milestone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: next.key, videoId }),
    }).catch(() => {});

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [milestones, videoId]);

  const close = () => setVisible(false);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "https://routinex.org";
    const text = `${shareLine} — scored on RoutineX ${url}`;
    const nav = navigator as Navigator & { share?: (d: { text: string }) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ text });
        setDone(true);
        return;
      } catch {
        /* user backed out — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked — nothing useful to do */
    }
  };

  const openStore = () => {
    const url = inIosShell()
      ? `itms-apps://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`
      : `https://apps.apple.com/us/app/routinex-dance-cheer-ai/id${APP_STORE_ID}?action=write-review`;
    if (inIosShell()) window.location.href = url;
    else window.open(url, "_blank", "noopener");
    setDone(true);
  };

  const sendNote = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "milestone",
          promptKey: active?.key,
          body: note.trim(),
          videoId,
          platform: inIosShell() ? "ios" : "web",
        }),
      });
      const data = await res.json().catch(() => null);
      setCreditGranted(!!data?.creditGranted);
    } catch {
      /* ignore */
    }
    setSending(false);
    setDone(true);
  };

  if (!active) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center"
          onClick={close}
          role="dialog"
          aria-label={active.title}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#18181B] p-6 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)]"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B]" />
            <Confetti count={28} seed={active.key.length} />

            <button
              onClick={close}
              className="absolute top-3 right-3 z-10 text-white/40 transition-colors hover:text-white/80"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9333EA] via-[#EC4899] to-[#F59E0B]">
                <Trophy className="h-6 w-6 text-white" />
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[1px] text-[#C084FC]">
                {active.eyebrow}
              </p>
              <h3 className="mt-1 text-xl font-bold leading-tight text-white">{active.title}</h3>
              {active.stat && (
                <p className="mt-2 bg-gradient-to-r from-[#C084FC] via-[#F472B6] to-[#FBBF24] bg-clip-text text-3xl font-extrabold text-transparent">
                  {active.stat}
                </p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">{active.body}</p>

              {done ? (
                <div className="mt-5">
                  {creditGranted ? (
                    <>
                      <p className="text-sm font-bold text-[#FBBF24]">
                        +1 free analysis, added to your account.
                      </p>
                      <p className="mt-1 text-xs text-[#A1A1AA]">
                        Thank you — that&rsquo;s the stuff that shapes what gets built next.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-white">Thank you. 💛</p>
                  )}
                  <button
                    onClick={close}
                    className="mt-3 w-full rounded-xl border border-white/12 bg-white/5 py-2.5 text-xs font-semibold text-white/85 hover:bg-white/10"
                  >
                    Back to the report
                  </button>
                </div>
              ) : (
                <div className="mt-5">
                  {active.ask === "review" && (
                    <>
                      <p className="mb-2 text-xs leading-relaxed text-[#A1A1AA]">
                        If RoutineX earned it, 30 seconds in the App Store is how the next family
                        finds us.
                      </p>
                      <button
                        onClick={openStore}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                      >
                        <Star className="h-4 w-4" /> Leave a review
                      </button>
                    </>
                  )}

                  {active.ask === "share" && (
                    <button
                      onClick={share}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                      {copied ? "Copied — go brag" : "Share the win"}
                    </button>
                  )}

                  {active.ask === "refer" && (
                    <>
                      <p className="mb-2 text-xs leading-relaxed text-[#A1A1AA]">
                        Know a dance parent still guessing at score sheets? Send them your link.
                      </p>
                      <a
                        href="/referrals"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                      >
                        <Users className="h-4 w-4" /> Get my referral link
                      </a>
                    </>
                  )}

                  {active.ask === "feedback" && !noteOpen && (
                    <>
                      <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#FBBF24]/25 bg-[#FBBF24]/[0.07] px-3 py-2">
                        <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FBBF24]" />
                        <p className="text-[11px] leading-snug text-[#FBBF24]">
                          Tell us one thing and we&rsquo;ll drop a{" "}
                          <strong className="font-bold">free analysis</strong> in your account.
                        </p>
                      </div>
                      <button
                        onClick={() => setNoteOpen(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                      >
                        <Send className="h-4 w-4" /> What surprised you?
                      </button>
                    </>
                  )}

                  {active.ask === "feedback" && noteOpen && (
                    <>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        maxLength={800}
                        autoFocus
                        placeholder="The thing I didn't expect was…"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[#C084FC]/60 focus:outline-none"
                      />
                      <button
                        onClick={sendNote}
                        disabled={sending || note.trim().length < 3}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                      >
                        <Send className="h-4 w-4" />
                        {sending ? "Sending…" : "Send to Shaun"}
                      </button>
                    </>
                  )}

                  <button
                    onClick={close}
                    className="mt-2 w-full text-xs text-white/40 hover:text-white/70"
                  >
                    Not now
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
