"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hey! I'm Bayda, your competition assistant. Whether you're prepping for a competition, curious about scoring, or want to know how RoutineX works — I'm here to help! What's on your mind?",
};

const QUICK_PROMPTS = [
  "How does RoutineX work?",
  "What's the scoring system?",
  "Is it really free to try?",
  "What competitions do you cover?",
  "What are all the features of RoutineX?",
];

export default function BaydaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [isFirstUserMessage, setIsFirstUserMessage] = useState(true);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasAutoOpened) return;
    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasAutoOpened(true);
      setShowPulse(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [hasAutoOpened]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = { role: "user", content: text.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      try {
        const apiMessages = updatedMessages.filter(
          (_, i) => i > 0 || updatedMessages[0].role === "user"
        );

        const res = await fetch("/api/bayda", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            isFirstMessage: isFirstUserMessage,
          }),
        });

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);

        if (isFirstUserMessage) {
          setIsFirstUserMessage(false);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I'm having a moment! Try again or check out our FAQ section above.",
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

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setShowPulse(false);
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-white font-semibold shadow-2xl hover:scale-105 transition-transform"
          style={{
            background: "linear-gradient(135deg, #9333EA, #EC4899, #F59E0B)",
            animation: "fadeInUp 0.4s ease-out",
          }}
        >
          {showPulse && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500"></span>
            </span>
          )}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Ask Bayda
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{
            width: "min(380px, calc(100vw - 48px))",
            height: "min(540px, calc(100vh - 120px))",
            background: "#18181B",
            border: "1px solid rgba(255,255,255,0.1)",
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(147,51,234,0.3), rgba(236,72,153,0.3))",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: "linear-gradient(135deg, #9333EA, #EC4899, #F59E0B)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M12 3l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 12l-4 2.5 1.5-4.5L6 7.5h4.5z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Bayda</p>
                <p className="text-green-400 text-xs leading-tight">Online now</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
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
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user" ? "text-white rounded-br-md" : "text-zinc-200 rounded-bl-md"
                  }`}
                  style={
                    msg.role === "user"
                      ? { background: "linear-gradient(135deg, #9333EA, #EC4899)" }
                      : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)" }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {messages.length === 1 && !isLoading && (
              <div className="flex flex-wrap gap-2 mt-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105"
                    style={{
                      borderColor: "rgba(147,51,234,0.4)",
                      color: "#C084FC",
                      background: "rgba(147,51,234,0.1)",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-md px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
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
              placeholder="Ask me anything about dance..."
              disabled={isLoading}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
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
            <p className="text-zinc-600 text-[10px]">Powered by RoutineX AI</p>
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
