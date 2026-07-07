"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AWARD_LADDER_DISCLAIMER } from "@/data/award-ladders";

type Scale = "300" | "100";

interface Interpretation {
  tier: string;
  line: string;
}

function interpret(scaled: number): Interpretation {
  if (scaled >= 290) {
    return {
      tier: "Diamond / top-tier territory",
      line: "That's elite, finals-caliber work — the kind of routine that turns heads no matter whose ruler is being used.",
    };
  }
  if (scaled >= 280) {
    return {
      tier: "Platinum territory",
      line: "That's a strong, polished routine — here's what usually separates the very top tier: cleaner unison, sharper finishes, and confident performance quality all the way through.",
    };
  }
  if (scaled >= 270) {
    return {
      tier: "High Gold territory",
      line: "That's competition-ready work with real strengths — a little more consistency and control is often what nudges a routine into the next band.",
    };
  }
  if (scaled >= 260) {
    return {
      tier: "Gold territory",
      line: "That's a solid, capable routine — a great baseline to build on as technique and performance keep sharpening.",
    };
  }
  return {
    tier: "Below the typical Gold band",
    line: "There's a lot of room to grow here, and that's completely normal — every dancer starts somewhere, and steady, specific feedback is how the numbers climb.",
  };
}

export default function ScoreLookup() {
  const [scale, setScale] = useState<Scale>("300");
  const [raw, setRaw] = useState("");

  const parsed = raw.trim() === "" ? null : Number(raw);
  const valid =
    parsed !== null && !Number.isNaN(parsed) && parsed >= 0 && parsed <= 300;

  const scaled = valid ? (scale === "100" ? parsed! * 3 : parsed!) : null;
  const result = scaled !== null ? interpret(scaled) : null;

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-white">
        Score lookup: where does your number usually land?
      </h3>
      <p className="mt-2 text-sm text-surface-200 leading-relaxed">
        Enter your routine&apos;s score and we&apos;ll show the{" "}
        <span className="text-white">typical range seen across the industry</span>{" "}
        on a 300-point ladder. These are common patterns, not universal rules —
        every company sets its own cutoffs.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">Score scale</label>
          <select
            value={scale}
            onChange={(e) => setScale(e.target.value as Scale)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
          >
            <option value="300">Out of 300 (combined judges)</option>
            <option value="100">Per-judge, out of 100</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Your score</label>
          <input
            type="number"
            inputMode="decimal"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={scale === "100" ? "e.g. 92" : "e.g. 285"}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      {scale === "100" && (
        <p className="mt-3 text-xs text-surface-200/70">
          We multiply a per-judge /100 score by 3 to compare it against a
          300-point ladder. Real events combine multiple judges, so treat this
          as a rough orientation only.
        </p>
      )}

      {raw.trim() !== "" && !valid && (
        <p className="mt-4 text-sm text-accent-400">
          Enter a number between 0 and {scale === "100" ? "100" : "300"}.
        </p>
      )}

      {result && scaled !== null && (
        <div className="mt-5 rounded-2xl bg-gradient-to-r from-primary-700/25 to-accent-600/25 border border-white/10 p-5">
          <p className="text-xs uppercase tracking-wider text-primary-300 font-semibold">
            Typical range (not universal)
          </p>
          <p className="mt-1 text-xl font-bold text-white">
            {scale === "100"
              ? `${raw} / 100 ≈ ${scaled} / 300`
              : `${scaled} / 300`}{" "}
            — {result.tier}
          </p>
          <p className="mt-2 text-sm text-surface-200 leading-relaxed">
            {result.line}
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Get one consistent baseline score — first analysis $1.99
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <p className="mt-5 text-xs text-surface-200/60 leading-relaxed">
        {AWARD_LADDER_DISCLAIMER}
      </p>
    </div>
  );
}
