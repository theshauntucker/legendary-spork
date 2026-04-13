"use client";

import { useState, FormEvent } from "react";

interface EmailCaptureProps {
  compact?: boolean;
}

export default function EmailCapture({ compact = false }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "You're subscribed! Check your inbox.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-primary-50 border border-primary-500/20 rounded-2xl p-6 text-center">
        <p className="text-primary-700 font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6 transition-colors duration-300 border border-primary-500/20 has-[input:focus]:border-primary-500/40" style={{ background: "linear-gradient(135deg, #e8f4f4 0%, #f9f6ed 100%)" }}>
      <h3 className="text-lg font-serif font-semibold text-ink-900 mb-1">
        Stay Informed
      </h3>
      <p className="text-sm text-ink-500 mb-4">
        Get weekly summaries of new resources, articles, and community discussions.
      </p>

      <form
        onSubmit={handleSubmit}
        className={compact ? "flex flex-col gap-3" : "flex flex-col sm:flex-row gap-3"}
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {status === "error" && (
        <p className="text-red-600 text-sm mt-2">{message}</p>
      )}
    </div>
  );
}
