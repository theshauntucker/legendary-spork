"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";

/**
 * "How did this report land?" — the one-time review ask.
 *
 * Shows once per account, a few seconds after a parent has had a real look
 * at their report (time on page + a little scroll). 4–5 stars → App Store
 * review link (deep-links into the App Store inside the iOS shell). 1–3 →
 * a private note to Shaun, plus a reminder of the money-back guarantee.
 *
 * Every outcome is recorded via /api/review-prompt so it never nags again;
 * localStorage is the fast-path guard for the same browser.
 */

const APP_STORE_ID = "6763345348";
const WEB_REVIEW_URL = `https://apps.apple.com/us/app/routinex-dance-cheer-ai/id${APP_STORE_ID}?action=write-review`;
// itms-apps:// is handed straight to the App Store app by WKWebView inside
// the Capacitor shell — no plugin needed.
const SHELL_REVIEW_URL = `itms-apps://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`;
const LS_KEY = "rx_review_prompt_done";

function inIosShell(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.dataset.nativeShell === "ios") return true;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}

type Step = "rate" | "store" | "feedback" | "thanks";

export default function RateReportPrompt({ analysisId }: { analysisId: string }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>("rate");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(LS_KEY)) return;
    } catch {
      /* private mode — fall through, server flag still guards */
    }
    let scrolled = false;
    let elapsed = false;
    const maybeShow = () => {
      if (scrolled && elapsed) setVisible(true);
    };
    const onScroll = () => {
      if (window.scrollY > 400) {
        scrolled = true;
        maybeShow();
      }
    };
    const timer = window.setTimeout(() => {
      elapsed = true;
      maybeShow();
    }, 12_000);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const record = async (payload: Record<string, unknown>) => {
    try {
      localStorage.setItem(LS_KEY, "1");
    } catch {
      /* ignore */
    }
    try {
      await fetch("/api/review-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, platform: inIosShell() ? "ios" : "web", ...payload }),
      });
    } catch {
      /* never block the UI on this */
    }
  };

  const choose = (n: number) => {
    setRating(n);
    if (n >= 4) {
      setStep("store");
      void record({ rating: n });
    } else {
      setStep("feedback");
    }
  };

  const openStore = () => {
    void record({ rating, clickedStore: true });
    const url = inIosShell() ? SHELL_REVIEW_URL : WEB_REVIEW_URL;
    if (inIosShell()) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener");
    }
    setStep("thanks");
    window.setTimeout(() => setVisible(false), 2500);
  };

  const sendFeedback = async () => {
    setSending(true);
    await record({ rating, feedback: feedback.trim() });
    setSending(false);
    setStep("thanks");
    window.setTimeout(() => setVisible(false), 3500);
  };

  const dismiss = () => {
    void record({ rating: rating || null, dismissed: true });
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
          className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:left-4 sm:bottom-4 sm:w-[380px] z-[70]"
          role="dialog"
          aria-label="Rate your report"
        >
          <div className="relative rounded-2xl border border-white/10 bg-[#18181B]/95 backdrop-blur-xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] p-5">
            <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B]" />
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            {step === "rate" && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#C084FC]">Quick question</p>
                <h3 className="mt-1 text-base font-bold text-white">How did this report land?</h3>
                <p className="mt-1 text-xs text-[#A1A1AA]">One tap. It helps us make the next one better.</p>
                <div className="mt-3 flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => choose(n)}
                      onMouseEnter={() => setHover(n)}
                      className="p-1 transition-transform active:scale-90"
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          n <= (hover || rating) ? "fill-[#FBBF24] text-[#FBBF24]" : "text-white/25"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "store" && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#C084FC]">Thank you</p>
                <h3 className="mt-1 text-base font-bold text-white">That means a lot to a small team.</h3>
                <p className="mt-1 text-xs text-[#A1A1AA] leading-relaxed">
                  A 30-second App Store review is the single biggest thing that helps other dance and cheer
                  families find RoutineX. Would you leave one?
                </p>
                <button
                  onClick={openStore}
                  className="mt-3 w-full rounded-xl py-3 text-sm font-bold text-white bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] hover:opacity-90 transition-opacity"
                >
                  Rate RoutineX on the App Store
                </button>
                <button onClick={dismiss} className="mt-2 w-full text-xs text-white/40 hover:text-white/70">
                  Maybe later
                </button>
              </>
            )}

            {step === "feedback" && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#C084FC]">We want to fix that</p>
                <h3 className="mt-1 text-base font-bold text-white">What missed the mark?</h3>
                <p className="mt-1 text-xs text-[#A1A1AA] leading-relaxed">
                  Shaun reads every one of these personally. If the report didn&rsquo;t give you something you can
                  use, we credit your account — that&rsquo;s the guarantee.
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  maxLength={1500}
                  placeholder="Too harsh, too vague, missed a section, wrong style…"
                  className="mt-3 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C084FC]/60"
                />
                <button
                  onClick={sendFeedback}
                  disabled={sending || feedback.trim().length < 3}
                  className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {sending ? "Sending…" : "Send to Shaun"}
                </button>
              </>
            )}

            {step === "thanks" && (
              <>
                <h3 className="text-base font-bold text-white">Thank you. 💛</h3>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  {rating >= 4
                    ? "Every review helps another dancer walk in prepared."
                    : "Got it — you'll hear back from Shaun directly."}
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
