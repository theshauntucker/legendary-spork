"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GREETING =
  "Welcome! I can help you explore any faith tradition, find resources, or navigate the site. What are you curious about?";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      const reply = data.reply || "I'm not sure how to help with that. Try browsing our topics!";

      setMessages([...updatedMessages, { role: "assistant", content: reply }]);

      // Show email capture after a few exchanges
      if (
        updatedMessages.length >= 4 &&
        !showEmailCapture &&
        !emailSent &&
        reply.toLowerCase().includes("email")
      ) {
        setShowEmailCapture(true);
      }
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Try browsing the site directly!",
        },
      ]);
    }

    setLoading(false);
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setEmailSent(true);
      setShowEmailCapture(false);
    } catch {
      // Silently fail
    }
  };

  // Render markdown-style links as clickable
  function renderContent(content: string) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | { text: string; href: string })[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      parts.push({ text: match[1], href: match[2] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.map((part, i) =>
      typeof part === "string" ? (
        <span key={i}>{part}</span>
      ) : (
        <a
          key={i}
          href={part.href}
          className="text-primary-600 underline hover:text-primary-700"
          target={part.href.startsWith("http") ? "_blank" : undefined}
          rel={part.href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {part.text}
        </a>
      )
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-primary-500 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl hover:bg-primary-600 transition-all hover:scale-105"
          aria-label="Open chat"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="bg-cream-50 rounded-2xl shadow-2xl w-[360px] h-[480px] flex flex-col overflow-hidden border border-cream-200 max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:rounded-none">
          {/* Header */}
          <div className="bg-primary-500 text-white px-4 py-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="font-semibold">Ask a Question</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white text-lg"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Greeting */}
            <div className="bg-cream-100 rounded-2xl rounded-tl-sm p-3 text-sm text-ink-700 mr-8">
              {GREETING}
            </div>

            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-2xl p-3 text-sm ${
                  m.role === "user"
                    ? "bg-primary-50 text-ink-800 ml-8 rounded-tr-sm"
                    : "bg-cream-100 text-ink-700 mr-8 rounded-tl-sm"
                }`}
              >
                {m.role === "assistant" ? renderContent(m.content) : m.content}
              </div>
            ))}

            {loading && (
              <div className="bg-cream-100 rounded-2xl rounded-tl-sm p-3 text-sm text-ink-400 mr-8 animate-pulse">
                Thinking...
              </div>
            )}

            {/* Inline email capture */}
            {showEmailCapture && !emailSent && (
              <div className="bg-primary-50 border border-primary-500/20 rounded-2xl p-3 mr-4">
                <p className="text-xs text-ink-600 mb-2">
                  Enter your email for a curated resource list:
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-1 text-xs border border-cream-200 bg-cream-50 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                  />
                  <button
                    onClick={handleEmailSubmit}
                    className="bg-primary-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-primary-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {emailSent && (
              <div className="bg-primary-50 border border-primary-500/20 rounded-2xl p-3 mr-4 text-xs text-primary-700">
                Thank you! We will send you a curated resource list.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-cream-200 flex gap-2">
            <input
              className="flex-1 border border-cream-200 bg-cream-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-ink-800 placeholder:text-ink-400"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-primary-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
