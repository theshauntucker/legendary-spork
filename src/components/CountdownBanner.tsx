"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

// Launch offer deadline: Sunday April 20, 2026 at 11:59:59 PM PT
const DEADLINE = new Date("2026-04-21T07:59:59Z"); // midnight PT = 7:59:59 AM UTC next day

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [expired, setExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    function calc() {
      const now = Date.now();
      const diff = DEADLINE.getTime() - now;
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({ d, h, m, s });
    }

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, []);

  if (expired) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-primary-700 via-accent-600 to-gold-600 shadow-lg shadow-primary-900/50">
      <div className="mx-auto max-w-7xl px-4 py-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-white text-sm">
        {/* Left: offer text */}
        <div className="flex items-center gap-2 font-semibold">
          <Zap className="h-4 w-4 text-gold-300 shrink-0" />
          <span>
            Launch Offer: <span className="text-gold-200">2 Analyses for $8.99</span> — Buy One, Get One Free
          </span>
        </div>

        {/* Countdown */}
        {mounted && (
          <div className="flex items-center gap-1 font-mono font-bold text-white">
            {timeLeft.d > 0 && (
              <span className="bg-white/20 rounded px-1.5 py-0.5 text-xs">
                {timeLeft.d}d
              </span>
            )}
            <span className="bg-white/20 rounded px-1.5 py-0.5 text-xs">
              {pad(timeLeft.h)}h
            </span>
            <span className="bg-white/20 rounded px-1.5 py-0.5 text-xs">
              {pad(timeLeft.m)}m
            </span>
            <span className="bg-white/20 rounded px-1.5 py-0.5 text-xs hidden sm:inline-block">
              {pad(timeLeft.s)}s
            </span>
          </div>
        )}

        {/* CTA */}
        <a
          href="/signup"
          className="shrink-0 inline-flex items-center gap-1 bg-white text-gray-900 text-xs font-bold rounded-full px-3 py-1 hover:bg-gray-100 transition-colors"
        >
          Claim Launch Offer
        </a>
      </div>
    </div>
  );
}
