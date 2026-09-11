"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";

type CtaKey = "signup" | "sample" | "pricing" | "upload" | "season" | "studio" | "founder";

interface Message {
  role: "user" | "assistant";
  content: string;
  chips?: string[];
  cta?: CtaKey | null;
}

/* ── Conversion buttons Bayda can attach to a reply ─────────────────────── */
const CTAS: Record<CtaKey, { label: string; href: string }> = {
  signup: { label: "Get my free analysis →", href: "/signup?ref=bayda" },
  sample: { label: "See a sample report →", href: "/sample-analysis" },
  pricing: { label: "See plans & pricing →", href: "/pricing" },
  upload: { label: "Upload a routine →", href: "/upload" },
  season: { label: "Become a Season Member →", href: "/pricing" },
  studio: { label: "Start the 30-day Studio trial →", href: "/studio/signup" },
  founder: {
    label: "Email the founder →",
    href: "mailto:danceroutinex@gmail.com?subject=Question%20from%20the%20Bayda%20chat",
  },
};

/* ── Openers — a different vibe every visit ─────────────────────────────── */
const WELCOMES: Message[] = [
  {
    role: "assistant",
    content:
      "Hey! I'm Bayda ✨ Think of me as the dance mom in the lobby who knows every score, every comp and every judge's pet peeve.\n\nAsk me literally anything — your comp, how scoring works, what judges look for. And **your first RoutineX analysis is free.** What are we working on?",
    chips: ["How does RoutineX work?", "Is the first one really free?", "We have a comp coming up 😬"],
  },
  {
    role: "assistant",
    content:
      "Hi, I'm Bayda! Quick question before anything else — are you a **dance parent, a dancer, or a studio owner?** I need to know how deep in the rhinestones you are. 💎",
    chips: ["Dance parent", "I'm the dancer", "Studio owner"],
  },
  {
    role: "assistant",
    content:
      "Hey there! I'm Bayda. Imagine knowing your dancer's score **before** you walk into the ballroom — that's what RoutineX does, for any competition and any scoring system.\n\nWant the 30-second tour, or do you have a question?",
    chips: ["Give me the 30-second tour", "What's in the report?", "What does it cost?"],
  },
];

const LOADING_LINES = [
  "Checking with the judges…",
  "Fixing my bun…",
  "Counting the 8s…",
  "Finding a parking spot…",
  "Glueing a rhinestone back on…",
  "Reading the score sheet…",
];

const TEASERS = [
  "Psst — your first analysis is free 👀",
  "Comp coming up? Ask me anything ✨",
  "Want to know what the judges see? 💎",
];

/* ── Tiny, safe markdown: **bold**, [links](url), bare URLs, "- " bullets ─ */
const INLINE_RE =
  /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))|(https?:\/\/[^\s)]+)|((?:www\.)?routinex\.org(?:\/[\w\-/?=&#.%]*)?)|([\w.+-]+@[\w-]+\.[\w.]+)/g;

function toHref(raw: string): string {
  const url = raw.replace(/[.,!?;:]+$/, "");
  if (/^mailto:|^https?:\/\//i.test(url)) return url;
  if (url.includes("@") && !url.includes("/")) return `mailto:${url}`;
  const m = url.match(/^(?:www\.)?routinex\.org(\/.*)?$/i);
  if (m) return m[1] || "/";
  return url;
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const match of text.matchAll(INLINE_RE)) {
    const idx = match.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const [tok] = match;
    const key = `${keyBase}-${i++}`;
    if (match[1]) {
      out.push(
        <strong key={key} className="font-semibold text-white">
          {tok.slice(2, -2)}
        </strong>
      );
    } else {
      let label = tok;
      let href: string;
      if (match[2]) {
        const lm = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        label = lm ? lm[1] : tok;
        href = toHref(lm ? lm[2] : tok);
      } else {
        // keep trailing punctuation outside the link
        const trail = tok.match(/[.,!?;:]+$/)?.[0] ?? "";
        label = trail ? tok.slice(0, -trail.length) : tok;
        href = toHref(label);
        if (trail) {
          out.push(
            <a key={key} href={href} {...linkProps(href)} className="underline decoration-pink-400/60 underline-offset-2 text-pink-300 hover:text-pink-200 break-words">
              {label}
            </a>
          );
          out.push(trail);
          last = idx + tok.length;
          continue;
        }
      }
      out.push(
        <a key={key} href={href} {...linkProps(href)} className="underline decoration-pink-400/60 underline-offset-2 text-pink-300 hover:text-pink-200 break-words">
          {label}
        </a>
      );
    }
    last = idx + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function linkProps(href: string) {
  return /^https?:\/\//i.test(href) && !/routinex\.org/i.test(href)
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = (k: number) => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`ul-${k}`} className="my-1 space-y-1">
        {bullets.map((b, j) => (
          <li key={j} className="flex gap-2">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "linear-gradient(135deg,#EC4899,#F59E0B)" }} />
            <span>{renderInline(b, `li-${k}-${j}`)}</span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };
  lines.forEach((line, k) => {
    const bm = line.match(/^\s*(?:[-•*]|\d+\.)\s+(.*)$/);
    if (bm) {
      bullets.push(bm[1]);
      return;
    }
    flush(k);
    if (!line.trim()) {
      blocks.push(<div key={`sp-${k}`} className="h-2" />);
    } else {
      blocks.push(<p key={`p-${k}`}>{renderInline(line.replace(/^#+\s*/, ""), `p-${k}`)}</p>);
    }
  });
  flush(lines.length);
  return <>{blocks}</>;
}

function trackCta(name: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ttq?.track?.("ClickButton", { content_name: `bayda_${name}` });
  } catch {
    /* analytics must never break the chat */
  }
}

export default function BaydaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOMES[0]]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0]);
  const [isFirstUserMessage, setIsFirstUserMessage] = useState(true);
  const [showPulse, setShowPulse] = useState(true);
  const [teaser, setTeaser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pick a random opener on the client (after hydration, so SSR markup matches).
  useEffect(() => {
    setMessages([WELCOMES[Math.floor(Math.random() * WELCOMES.length)]]);
  }, []);

  // Teaser bubble: one gentle nudge per browser session, never auto-opens the
  // panel (auto-open caused the iOS zoom jump — see 2026-05-07 note).
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("bayda_teaser") === "1";
    } catch {
      /* private mode etc. */
    }
    if (seen) return;
    const t = setTimeout(() => {
      setTeaser(TEASERS[Math.floor(Math.random() * TEASERS.length)]);
      try {
        sessionStorage.setItem("bayda_teaser", "1");
      } catch {
        /* ignore */
      }
    }, 7000);
    const hide = setTimeout(() => setTeaser(null), 7000 + 12000);
    return () => {
      clearTimeout(t);
      clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Rotate the fun "typing" lines while Bayda thinks.
  useEffect(() => {
    if (!isLoading) return;
    let n = Math.floor(Math.random() * LOADING_LINES.length);
    setLoadingLine(LOADING_LINES[n]);
    const iv = setInterval(() => {
      n = (n + 1) % LOADING_LINES.length;
      setLoadingLine(LOADING_LINES[n]);
    }, 2200);
    return () => clearInterval(iv);
  }, [isLoading]);

  const openChat = () => {
    setIsOpen(true);
    setShowPulse(false);
    setTeaser(null);
  };

  const sendMessage = useCallback(
    async (text: string, base?: Message[]) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = { role: "user", content: text.trim() };
      const updatedMessages = [...(base ?? messages), userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      try {
        // Drop the canned opener — the API wants the conversation to start
        // with the visitor's first message.
        const apiMessages = updatedMessages.filter(
          (_, i) => i > 0 || updatedMessages[0].role === "user"
        );

        const res = await fetch("/api/bayda", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages.map((m) => ({ role: m.role, content: m.content })),
            isFirstMessage: isFirstUserMessage,
            page: typeof window !== "undefined" ? window.location.pathname : undefined,
          }),
        });

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            chips: Array.isArray(data.chips) ? data.chips : [],
            cta: data.cta ?? null,
          },
        ]);

        if (isFirstUserMessage) setIsFirstUserMessage(false);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I tripped over a costume bag! Try that again — or email danceroutinex@gmail.com and a real human will help.",
            chips: ["Try again"],
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, isFirstUserMessage]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const onChip = (chip: string) => {
    if (chip === "Try again") {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      if (lastUser) {
        // Remove the failed exchange and resend.
        sendMessage(lastUser.content, messages.slice(0, messages.lastIndexOf(lastUser)));
        return;
      }
    }
    sendMessage(chip);
  };

  const lastIdx = messages.length - 1;

  return (
    <>
      {/* Floating Bubble — 52px gradient circle, bottom-right, inside the iOS
          safe area. Tap to expand into the full chat panel. */}
      {!isOpen && (
        <>
          {teaser && (
            <div
              className="fixed z-50 flex items-center gap-2 rounded-2xl rounded-br-md pl-3.5 pr-2 py-2 text-[13px] font-medium text-white shadow-2xl"
              style={{
                right: "16px",
                bottom: "calc(env(safe-area-inset-bottom) + 78px)",
                maxWidth: "min(260px, calc(100vw - 32px))",
                background: "rgba(24,24,27,0.92)",
                border: "1px solid rgba(236,72,153,0.35)",
                backdropFilter: "blur(10px)",
                animation: "fadeInUp 0.4s ease-out",
              }}
            >
              <button onClick={openChat} className="text-left leading-snug">
                {teaser}
              </button>
              <button
                onClick={() => setTeaser(null)}
                aria-label="Dismiss"
                className="shrink-0 rounded-full p-1 text-zinc-500 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <button
            onClick={openChat}
            aria-label="Ask Bayda"
            className="fixed z-50 flex items-center justify-center rounded-full text-white shadow-2xl active:scale-95 hover:scale-105 transition-transform"
            style={{
              right: "16px",
              bottom: "calc(env(safe-area-inset-bottom) + 16px)",
              width: "52px",
              height: "52px",
              background: "linear-gradient(135deg, #9333EA, #EC4899, #F59E0B)",
              animation: "fadeInUp 0.4s ease-out",
            }}
          >
            {showPulse && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
            )}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{
            right: "16px",
            bottom: "calc(env(safe-area-inset-bottom) + 16px)",
            width: "min(390px, calc(100vw - 32px))",
            height: "min(600px, calc(100dvh - 110px))",
            background: "#18181B",
            border: "1px solid rgba(255,255,255,0.1)",
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(147,51,234,0.3), rgba(236,72,153,0.3), rgba(245,158,11,0.18))",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="relative w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #9333EA, #EC4899, #F59E0B)" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M12 3l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 12l-4 2.5 1.5-4.5L6 7.5h4.5z" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[#2a1f33]" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Bayda</p>
                <p className="text-zinc-300 text-[11px] leading-tight">Your competition bestie · ask me anything</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-zinc-400 hover:text-white transition-colors p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className="space-y-2" style={{ animation: "fadeInUp 0.25s ease-out" }}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user" ? "text-white rounded-br-md whitespace-pre-wrap" : "text-zinc-200 rounded-bl-md"
                    }`}
                    style={
                      msg.role === "user"
                        ? { background: "linear-gradient(135deg, #9333EA, #EC4899)" }
                        : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)" }
                    }
                  >
                    {msg.role === "assistant" ? <RichText text={msg.content} /> : msg.content}
                  </div>
                </div>

                {/* CTA + follow-up chips only on the latest Bayda reply */}
                {msg.role === "assistant" && i === lastIdx && !isLoading && (
                  <>
                    {msg.cta && CTAS[msg.cta] && (
                      <a
                        href={CTAS[msg.cta].href}
                        onClick={() => trackCta(msg.cta as string)}
                        className="flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: "linear-gradient(135deg, #9333EA, #EC4899, #F59E0B)" }}
                      >
                        {CTAS[msg.cta].label}
                      </a>
                    )}
                    {msg.chips && msg.chips.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.chips.map((chip) => (
                          <button
                            key={chip}
                            onClick={() => onChip(chip)}
                            className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95"
                            style={{
                              borderColor: "rgba(192,132,252,0.4)",
                              color: "#E9D5FF",
                              background: "rgba(147,51,234,0.12)",
                            }}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-2.5 rounded-2xl rounded-bl-md px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-zinc-400 italic">{loadingLine}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 px-3 py-3 flex gap-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything — your comp, scoring, pricing…"
              disabled={isLoading}
              maxLength={1000}
              className="flex-1 min-w-0 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none disabled:opacity-50"
              // iOS WKWebView auto-zooms the page when a focused input is
              // < 16px. Keep exactly 16px.
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "16px",
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send"
              className="rounded-xl px-4 py-2.5 text-white text-sm font-semibold disabled:opacity-30 transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #9333EA, #EC4899, #F59E0B)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>

          <div className="shrink-0 text-center py-1.5" style={{ background: "rgba(0,0,0,0.4)" }}>
            <p className="text-zinc-500 text-[10px]">
              Rather talk to a human?{" "}
              <a href={CTAS.founder.href} className="underline hover:text-zinc-300">
                Email the founder
              </a>
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
