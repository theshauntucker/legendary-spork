"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Gift, Send, Quote } from "lucide-react";
import Confetti from "@/components/Confetti";

/**
 * "How did this report land?" — the one-time review ask.
 *
 * Shows once per account, a few seconds after a parent has had a real look at
 * their report (time on page + a little scroll).
 *
 *   4–5 stars       → App Store review, everywhere. iOS deep-links to the
 *                     write-review sheet; web says "get the free app, then
 *                     rate it" (Apple only counts reviews from downloads).
 *                     A typed testimonial is the secondary option.
 *   1–3 stars       → a private note straight to Shaun, plus the guarantee
 *
 * Any written note earns a free analysis, once per account. Every outcome is
 * recorded via /api/review-prompt so the prompt never nags again; localStorage
 * is the fast-path guard for the same browser.
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

type Step = "rate" | "store" | "testimonial" | "feedback" | "founder" | "thanks";

export default function RateReportPrompt({ analysisId }: { analysisId: string }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>("rate");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [allowPublish, setAllowPublish] = useState(true);
  const [sending, setSending] = useState(false);
  const [rewardAvailable, setRewardAvailable] = useState(false);
  const [creditGranted, setCreditGranted] = useState(false);

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

  // Only promise a free analysis if this account hasn't already claimed one.
  useEffect(() => {
    if (!visible) return;
    fetch("/api/feedback")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setRewardAvailable(!!d?.rewardAvailable))
      .catch(() => {});
  }, [visible]);

  /** Marks the prompt answered so it never shows for this account again. */
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

  /** Sends the written note through the reward engine. Returns true if paid. */
  const sendNote = async (body: string, testimonial?: { displayName: string }) => {
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "report_rating",
          promptKey: "report_stars",
          analysisId,
          rating: rating || null,
          body,
          platform: inIosShell() ? "ios" : "web",
          testimonial: testimonial
            ? { allow: allowPublish, displayName: testimonial.displayName, role: "RoutineX parent" }
            : undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      return !!data?.creditGranted;
    } catch {
      return false;
    }
  };

  const choose = (n: number) => {
    setRating(n);
    if (n >= 4) {
      void record({ rating: n });
      setStep("store");
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
  };

  const submit = async (asTestimonial: boolean) => {
    setSending(true);
    const text = feedback.trim();
    const granted = await sendNote(text, asTestimonial ? { displayName: displayName.trim() } : undefined);
    await record({ rating, feedback: text });
    setCreditGranted(granted);
    setSending(false);
    setStep("thanks");
    if (!granted) window.setTimeout(() => setVisible(false), 4000);
  };

  const dismiss = () => {
    void record({ rating: rating || null, dismissed: true });
    setVisible(false);
  };

  const rewardBadge = rewardAvailable && (
    <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#FBBF24]/25 bg-[#FBBF24]/[0.07] px-3 py-2">
      <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FBBF24]" />
      <p className="text-[11px] leading-snug text-[#FBBF24]">
        A real sentence earns you a <strong className="font-bold">free analysis</strong>. One per
        family — this is the one.
      </p>
    </div>
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:left-4 sm:bottom-4 sm:w-[390px] z-[70]"
          role="dialog"
          aria-label="Rate your report"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#18181B]/95 p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B]" />
            {step === "thanks" && creditGranted && <Confetti seed={5} />}

            <button
              onClick={dismiss}
              className="absolute top-3 right-3 text-white/40 transition-colors hover:text-white/80"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            {step === "rate" && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#C084FC]">
                  Quick question
                </p>
                <h3 className="mt-1 pr-6 text-base font-bold text-white">How did this report land?</h3>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  One tap. It helps us make the next one better.
                </p>
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
                <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#C084FC]">
                  Thank you
                </p>
                <h3 className="mt-1 pr-6 text-base font-bold text-white">
                  That means a lot to a small team.
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                  A 30-second App Store review is the single biggest thing that helps other dance and
                  cheer families find RoutineX. Would you leave one?
                  {!inIosShell() && " Grab the free app, then tap Rate."}
                </p>
                <button
                  onClick={openStore}
                  className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  Rate RoutineX on the App Store
                </button>
                <button
                  onClick={() => setStep("testimonial")}
                  className="mt-2 w-full text-xs text-white/40 hover:text-white/70"
                >
                  {rewardAvailable ? "Rather type a note? (free analysis)" : "Rather type a note?"}
                </button>
              </>
            )}

            {step === "testimonial" && (
              <>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[1px] text-[#C084FC]">
                  <Quote className="h-3 w-3" /> In your words
                </p>
                <h3 className="mt-1 pr-6 text-base font-bold text-white">
                  What would you tell another dance parent?
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                  A sentence or two. The honest version — that&rsquo;s the one other families trust.
                </p>
                {rewardBadge}
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  maxLength={600}
                  placeholder="It told her the exact thing her teacher has been saying for months — she finally believed it."
                  className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[#C084FC]/60 focus:outline-none"
                />
                <label className="mt-2 flex items-start gap-2 text-[11px] leading-snug text-[#A1A1AA]">
                  <input
                    type="checkbox"
                    checked={allowPublish}
                    onChange={(e) => setAllowPublish(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 accent-[#C084FC]"
                  />
                  <span>Okay to share this on routinex.org. Nothing about your dancer, ever.</span>
                </label>
                {allowPublish && (
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={60}
                    placeholder="First name + state (optional) — e.g. Megan, CA"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/25 focus:border-[#C084FC]/60 focus:outline-none"
                  />
                )}
                <button
                  onClick={() => submit(true)}
                  disabled={sending || feedback.trim().length < 3}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Sending…" : "Send it"}
                </button>
              </>
            )}

            {step === "feedback" && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#C084FC]">
                  We want to fix that
                </p>
                <h3 className="mt-1 pr-6 text-base font-bold text-white">What missed the mark?</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                  Shaun reads every one of these personally. If the report didn&rsquo;t give you
                  something you can use, we credit your account — that&rsquo;s the guarantee.
                </p>
                {rewardBadge}
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  maxLength={1500}
                  placeholder="Too harsh, too vague, missed a section, wrong style…"
                  className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#C084FC]/60 focus:outline-none"
                />
                <button
                  onClick={() => submit(false)}
                  disabled={sending || feedback.trim().length < 3}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Sending…" : "Send to Shaun"}
                </button>
              </>
            )}

            {step === "founder" && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#C084FC]">
                  Straight to the founder
                </p>
                <h3 className="mt-1 pr-6 text-base font-bold text-white">What should we build next?</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                  Shaun built this after one too many score sheets with three numbers and no
                  explanation. Tell him what&rsquo;s still missing.
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  maxLength={1500}
                  placeholder="I'd love to compare two dancers side by side…"
                  className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#C084FC]/60 focus:outline-none"
                />
                <button
                  onClick={() => submit(false)}
                  disabled={sending || feedback.trim().length < 3}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Sending…" : "Send to Shaun"}
                </button>
              </>
            )}

            {step === "thanks" && (
              <>
                {creditGranted ? (
                  <>
                    <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#FBBF24]">
                      Free analysis added
                    </p>
                    <h3 className="mt-1 text-base font-bold text-white">+1 credit, on the house.</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                      It&rsquo;s already in your account. Thank you — notes like yours are how the
                      scoring gets sharper every season.
                    </p>
                    <button
                      onClick={dismiss}
                      className="mt-3 w-full rounded-xl border border-white/12 bg-white/5 py-2.5 text-xs font-semibold text-white/85 hover:bg-white/10"
                    >
                      Back to the report
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-white">Thank you. 💛</h3>
                    <p className="mt-1 text-xs text-[#A1A1AA]">
                      {rating >= 4
                        ? "Every review helps another dancer walk in prepared."
                        : "Got it — you'll hear back from Shaun directly."}
                    </p>
                    <button
                      onClick={() => {
                        setFeedback("");
                        setStep("founder");
                      }}
                      className="mt-3 text-xs font-semibold text-[#C084FC] hover:text-white"
                    >
                      One more thing for Shaun →
                    </button>
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
