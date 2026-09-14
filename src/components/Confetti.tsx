"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * A short burst of brand-gradient shards. No dependency, no canvas — twenty
 * divs that fall once and stop. Used for milestone celebrations and the
 * moment a free analysis lands in someone's account.
 */

const COLORS = ["#9333EA", "#EC4899", "#F59E0B", "#C084FC", "#FBBF24", "#F472B6"];

export default function Confetti({ count = 22, seed = 0 }: { count?: number; seed?: number }) {
  const shards = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        // Deterministic-ish spread so a re-render doesn't reshuffle mid-fall.
        const r = (n: number) => ((Math.sin((i + 1) * (n + 1) * (seed + 1.7)) + 1) / 2);
        return {
          left: r(1) * 100,
          delay: r(2) * 0.45,
          duration: 1.5 + r(3) * 1.1,
          drift: (r(4) - 0.5) * 120,
          rotate: (r(5) - 0.5) * 900,
          size: 5 + r(6) * 6,
          color: COLORS[i % COLORS.length],
          round: r(7) > 0.6,
        };
      }),
    [count, seed],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {shards.map((s, i) => (
        <motion.span
          key={i}
          initial={{ y: -20, x: 0, opacity: 0, rotate: 0 }}
          animate={{ y: 340, x: s.drift, opacity: [0, 1, 1, 0], rotate: s.rotate }}
          transition={{ duration: s.duration, delay: s.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: 0,
            width: s.size,
            height: s.round ? s.size : s.size * 2.2,
            borderRadius: s.round ? "9999px" : "2px",
            background: s.color,
          }}
        />
      ))}
    </div>
  );
}
