"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

const DEADLINE = new Date("2026-04-21T07:59:59Z");

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
      const diff = DEADLINE.getTime() - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);

  if (expired) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-primary-700 via-accent-600 to-gold-600">
      <div className="flex items-center justify-center gap-2 px-3 h-10 text-white text-xs font-semibold">
        <Zap className="h-3.5 w-3.5 text-gold-300 shrink-0" />
        {/* Short label on mobile, full on sm+ */}
        <span className="sm:hidden">BOGO: 2 analyses for $8.99</span>
        <span className="hidden sm:inline">Launch Offer: <span className="text-gold-200">2 Analyses for $8.99</span> — Buy One, Get One Free</span>

        {/* Countdown */}
        {mounted && (
          <span className="flex items-center gap-1 font-mono font-bold shrink-0">
            {timeLeft.d > 0 && <span className="bg-white/20 rounded px-1.5 py-0.5">{timeLeft.d}d</span>}
            <span className="bg-white/20 rounded px-1.5 py-0.5">{pad(timeLeft.h)}h</span>
            <span className="bg-white/20 rounded px-1.5 py-0.5">{pad(timeLeft.m)}m</span>
            <span className="hidden sm:inline bg-white/20 rounded px-1.5 py-0.5">{pad(timeLeft.s)}s</span>
          </span>
        )}

        <a
          href="/signup"
          className="shrink-0 bg-white text-gray-900 text-xs font-bold rounded-full px-3 py-1 hover:bg-gray-100 transition-colors"
        >
          Claim
        </a>
      </div>
    </div>
  );
}
