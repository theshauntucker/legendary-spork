"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Glass } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { VisibilityPicker } from "@/components/VisibilityPicker";
import type { Visibility } from "@/lib/visibility";
import { fadeLift, springOut } from "@/lib/motion";
import { haptics } from "@/lib/haptics";

export type TrophyCardData = {
  id: string;
  award_level: "gold" | "high_gold" | "platinum" | "diamond";
  total_score: number;
  routine_name: string | null;
  style: string | null;
  entry_type: string | null;
  competition_name: string | null;
  competition_date: string | null;
  visibility?: Visibility;
};

type Props = {
  trophy: TrophyCardData;
  isOwner?: boolean;
  onVisibilityChange?: (v: Visibility) => void;
  onShare?: () => void;
};

const tierGradient: Record<TrophyCardData["award_level"], string> = {
  gold: "linear-gradient(135deg, #FCD34D, #F59E0B, #D97706)",
  high_gold: "linear-gradient(135deg, #FEF3C7, #F59E0B, #92400E)",
  platinum: "linear-gradient(135deg, #E5E7EB, #9CA3AF, #4B5563)",
  diamond: "linear-gradient(135deg, #C4B5FD, #67E8F9, #F0ABFC)",
};

const tierLabel: Record<TrophyCardData["award_level"], string> = {
  gold: "Gold",
  high_gold: "High Gold",
  platinum: "Platinum",
  diamond: "Diamond",
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

function CountUpNumber({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1000;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <span>{value}</span>;
}

export function TrophyCard({ trophy, isOwner, onVisibilityChange, onShare }: Props) {
  return (
    <motion.div variants={fadeLift} initial="initial" animate="animate" transition={springOut}>
      <Glass
        style={{
          padding: 20,
          borderTop: `3px solid transparent`,
          backgroundImage: `linear-gradient(var(--surface), var(--surface)) padding-box, ${tierGradient[trophy.award_level]} border-box`,
          border: "2px solid transparent",
        }}
      >
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              padding: "3px 10px",
              borderRadius: 999,
              backgroundImage: tierGradient[trophy.award_level],
              color: trophy.award_level === "diamond" ? "#1A1A1F" : "#1A1A1F",
            }}
          >
            {tierLabel[trophy.award_level]}
          </span>
          {isOwner && onVisibilityChange && trophy.visibility ? (
            <VisibilityPicker value={trophy.visibility} onChange={onVisibilityChange} size="sm" />
          ) : null}
        </header>

        <div style={{ fontFamily: "var(--font-display, serif)", fontSize: 48, fontWeight: 700, lineHeight: 1 }}>
          <CountUpNumber target={Math.round(trophy.total_score)} />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 600, marginTop: 10 }}>
          {trophy.routine_name ?? "Untitled routine"}
        </h3>
        <p style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>
          {[trophy.style, trophy.entry_type].filter(Boolean).join(" · ")}
        </p>

        {trophy.competition_name || trophy.competition_date ? (
          <p style={{ fontSize: 13, opacity: 0.8, marginTop: 10 }}>
            {trophy.competition_name ?? "Competition"}
            {trophy.competition_date ? ` · ${formatDate(trophy.competition_date)}` : ""}
          </p>
        ) : null}

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Button
            variant="secondary"
            onClick={() => {
              haptics.tap();
              onShare?.();
            }}
          >
            Share
          </Button>
        </div>
      </Glass>
    </motion.div>
  );
}

export default TrophyCard;
