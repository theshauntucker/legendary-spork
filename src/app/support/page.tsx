"use client";

import { useState } from "react";
import { Send, CheckCircle, ChevronDown, Mail, Clock, Sparkles } from "lucide-react";
import RoutineXLogo from "@/components/RoutineXLogo";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is my first analysis really free?",
    a: "Yes. Every new account gets one complete analysis free — no card required. Your second analysis is a one-time 99¢ welcome price. After that it's $1.99 per analysis, 2 for $2.99, 5 for $9.99, or Season Member at $4.99/month for 4 analyses every month.",
  },
  {
    q: "How does the video analysis actually work?",
    a: "You upload a routine and your phone pulls still frames from it — the video itself never leaves your device. Three simulated judges score those frames on Technique (35), Performance (35), Choreography (20), and Overall Impression (10), and you get a total on the 300-point competition scale, an award level, timestamped notes, and an improvement roadmap. Most analyses finish in 1–3 minutes.",
  },
  {
    q: "Is my video private? Who can see it?",
    a: "Your video never leaves your device — only still frames are analyzed, and those are deleted automatically within 24 hours (or instantly with \"Delete My Video Frames\" on any report). No person ever watches your video. Reports are private to your account.",
  },
  {
    q: "I paid but my credits aren't showing.",
    a: "Open your dashboard — it re-checks your payment automatically. In the iPhone app, go to Profile and tap \"Restore Purchases\", or close and reopen the app. Still missing after a few minutes? Email us with your account email and we'll fix it the same day.",
  },
  {
    q: "My analysis failed or got stuck.",
    a: "On the processing screen, tap \"Retry Analysis\" or \"Re-upload Video\". A credit is only used when a report is actually delivered, so a failed attempt never costs you anything.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "On the web, tap \"Manage subscription\" at the bottom of your dashboard to open billing and cancel. If you subscribed in the iOS app, cancel in iPhone Settings > Apple ID > Subscriptions > RoutineX. Cancellation takes effect at the end of your current billing period — you keep your credits until then.",
  },
  {
    q: "I forgot my password.",
    a: "On the login screen, tap \"Forgot password?\", enter your email, and we'll send you a link to set a new one.",
  },
  {
    q: "Does RoutineX work for cheer, or only dance?",
    a: "Both. Choose Cheer as the style when you upload and the judging language adjusts for stunts, tumbling, jumps, motions, and synchronization.",
  },
  {
    q: "What's the Studio Plan?",
    a: "$99/month for your whole studio, with a 30-day free trial and no card required. Includes Team Board, Coach's Playbook, Music Hub with song collision detection, Dancer Roster, Season Schedule, and a shared pool of 100 analyses per month. No per-seat pricing.",
  },
  {
    q: "Can I delete my account and data?",
    a: "Yes — go to Settings and tap \"Delete Account\". This permanently removes your account, routines, reports, and credits. You can also email us to request deletion.",
  },
  {
    q: "How do I reach a real human?",
    a: "Use the form below or email danceroutinex@gmail.com. A real person (usually Shaun, our founder) reads every message and replies within 24 hours — typically much faster.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left hover:text-primary-300 transition-colors"
      >
        <span className="text-sm sm:text-base font-medium text-white pr-4">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-surface-200 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="text-sm text-surface-200 leading-relaxed pb-4 pr-8">{a}</p>
      )}
    </div>
  );
}

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: subject ? `[${subject}]\n\n${message}` : message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to send");
      }

      setStatus("sent");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error && err.message === "Email service not configured"
          ? "Our email system is being set up. Please email us directly at support@routinex.org."
          : "Something went wrong. Please try again, or email us at support@routinex.org."
      );
    }
  };

  return (
    <div className="min-h-screen px-4 py-16 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="inline-flex mb-10">
          <RoutineXLogo size="md" />
        </a>

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] mb-4">
            How can we help?
          </h1>
          <p className="text-surface-200 text-base sm:text-lg max-w-2xl mx-auto">
            Real humans. 24-hour response. Built by people who grew up in the competition circuit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="glass rounded-2xl p-5 text-center">
            <Clock className="h-6 w-6 text-primary-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">24-hour response</p>
            <p className="text-xs text-surface-200 mt-1">Usually much faster</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <Mail className="h-6 w-6 text-primary-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Direct reply</p>
            <p className="text-xs text-surface-200 mt-1">To the email you provide</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <Sparkles className="h-6 w-6 text-primary-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Real humans</p>
            <p className="text-xs text-surface-200 mt-1">No bots, no phone trees</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 mb-10">
          <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-display)] mb-2">
            Frequently asked
          </h2>
          <p className="text-sm text-surface-200 mb-4">
            Tap any question to expand. If you don&apos;t see your answer, the form below goes straight to our inbox.
          </p>
          <div className="divide-y divide-white/10">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-display)] mb-2">
            Send us a message
          </h2>
          <p className="text-sm text-surface-200 mb-6">
            We read every message and reply within 24 hours.
          </p>

          {status === "sent" ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-white">Message sent!</p>
              <p className="text-sm text-surface-200 mt-2">
                We&apos;ll reply to your email within 24 hours.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-surface-200 mb-1.5">
                    Your name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-surface-200/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-surface-200 mb-1.5">
                    Your email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-surface-200/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-surface-200 mb-1.5">
                  Topic <span className="text-surface-200/60">(optional)</span>
                </label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-colors"
                >
                  <option value="" className="bg-surface-900">Choose a topic...</option>
                  <option value="Billing" className="bg-surface-900">Billing or refund</option>
                  <option value="Analysis issue" className="bg-surface-900">Analysis didn&apos;t work</option>
                  <option value="Studio Plan" className="bg-surface-900">Studio Plan question</option>
                  <option value="Account" className="bg-surface-900">Account or login</option>
                  <option value="Feature request" className="bg-surface-900">Feature request</option>
                  <option value="Press/partnerships" className="bg-surface-900">Press or partnerships</option>
                  <option value="Other" className="bg-surface-900">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-surface-200 mb-1.5">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's going on — the more detail, the faster we can help."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-surface-200/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-colors resize-none"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-400">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === "sending" ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send message
                  </>
                )}
              </button>

              <p className="text-xs text-surface-200/70 text-center pt-2">
                Prefer email? Write to{" "}
                <a href="mailto:support@routinex.org" className="text-primary-400 hover:text-primary-300">
                  support@routinex.org
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
