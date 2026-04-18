"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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

/**
 * Tier visuals — each tier gets its own treatment.
 * Gold = warm embossed metal, Platinum = cool brushed silver,
 * Diamond = iridescent holo with shimmer sweep.
 * The higher the tier, the more depth, motion, and light.
 */
const tierGradient: Record<TrophyCardData["award_level"], string> = {
  gold: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 45%, #D97706 100%)",
  high_gold: "linear-gradient(135deg, #FEF3C7 0%, #FBBF24 40%, #B45309 100%)",
  platinum: "linear-gradient(135deg, #F3F4F6 0%, #9CA3AF 50%, #4B5563 100%)",
  diamond:
    "linear-gradient(135deg, #C4B5FD 0%, #67E8F9 35%, #F0ABFC 70%, #FBCFE8 100%)",
};

// Second accent gradient for depth / rim light
const tierRim: Record<TrophyCardData["award_level"], string> = {
  gold: "linear-gradient(180deg, rgba(254,243,199,0.9), rgba(146,64,14,0.0) 60%)",
  high_gold: "linear-gradient(180deg, rgba(254,243,199,0.95), rgba(180,83,9,0.0) 55%)",
  platinum: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(75,85,99,0.0) 55%)",
  diamond:
    "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(103,232,249,0.0) 60%)",
};

// Shadow depth — higher tiers float higher
const tierShadow: Record<TrophyCardData["award_level"], string> = {
  gold:
    "0 6px 18px rgba(245,158,11,0.20), 0 2px 4px rgba(0,0,0,0.10)",
  high_gold:
    "0 10px 26px rgba(251,191,36,0.28), 0 3px 6px rgba(0,0,0,0.12)",
  platinum:
    "0 16px 36px rgba(156,163,175,0.35), 0 4px 10px rgba(0,0,0,0.18)",
  diamond:
    "0 24px 54px rgba(139,92,246,0.45), 0 8px 20px rgba(103,232,249,0.30), 0 3px 8px rgba(0,0,0,0.20)",
};

const tierLabel: Record<TrophyCardData["award_level"], string> = {
  gold: "Gold",
  high_gold: "High Gold",
  platinum: "Platinum",
  diamond: "Diamond",
};

// Which tiers get the animated shimmer sweep
const tierShimmer: Record<TrophyCardData["award_level"], boolean> = {
  gold: false,
  high_gold: false,
  platinum: true,
  diamond: true,
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function CountUpNumber({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
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

export function TrophyCard({
  trophy,
  isOwner,
  onVisibilityChange,
  onShare,
}: Props) {
  // 3D tilt — subtle, cursor-driven. Disabled on touch / reduced-motion.
  const ref = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotX = useSpring(useTransform(my, [0, 1], [6, -6]), {
    stiffness: 160,
    damping: 18,
  });
  const rotY = useSpring(useTransform(mx, [0, 1], [-6, 6]), {
    stiffness: 160,
    damping: 18,
  });
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(my, [0, 1], ["0%", "100%"]);

  const tier = trophy.award_level;
  const isHighTier = tier === "platinum" || tier === "diamond";

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      variants={fadeLift}
      initial="initial"
      animate="animate"
      transition={springOut}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: "preserve-3d",
          boxShadow: tierShadow[tier],
          borderRadius: 18,
          position: "relative",
          willChange: "transform",
        }}
      >
        <Glass
          style={{
            padding: 0,
            borderRadius: 18,
            border: "1px solid transparent",
            backgroundImage: `linear-gradient(var(--surface), var(--surface)) padding-box, ${tierGradient[tier]} border-box`,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Gradient rim-light along the top inner edge */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: tierRim[tier],
              mixBlendMode: "screen",
              opacity: 0.55,
            }}
          />

          {/* Cursor-follow glare for higher tiers */}
          {isHighTier ? (
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: `radial-gradient(160px circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 55%)`,
                mixBlendMode: "screen",
              }}
            />
          ) : null}

          {/* Shimmer sweep — platinum/diamond only */}
          {tierShimmer[tier] ? (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                overflow: "hidden",
                borderRadius: 18,
              }}
            >
              <div
                className="trophy-shimmer"
                style={{
                  position: "absolute",
                  top: -20,
                  left: 0,
                  width: "40%",
                  height: "140%",
                  transform: "skewX(-20deg)",
                  background:
                    tier === "diamond"
                      ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)"
                      : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                  mixBlendMode: "screen",
                }}
              />
            </div>
          ) : null}

          {/* Ribbon tier badge — angled corner flag */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 14,
              left: -36,
              width: 140,
              transform: "rotate(-30deg)",
              padding: "4px 0",
              textAlign: "center",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: tier === "diamond" || tier === "platinum" ? "#0B0B10" : "#0B0B10",
              backgroundImage: tierGradient[tier],
              boxShadow:
                "0 4px 10px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.25)",
              pointerEvents: "none",
            }}
          >
            {tierLabel[tier]}
          </div>

          {/* Content */}
          <div
            style={{
              padding: "22px 22px 20px 22px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <header
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                minHeight: 28,
                marginBottom: 6,
              }}
            >
              {isOwner && onVisibilityChange && trophy.visibility ? (
                <VisibilityPicker
                  value={trophy.visibility}
                  onChange={onVisibilityChange}
                  size="sm"
                />
              ) : null}
            </header>

            {/* Engraved-metal score */}
            <div
              style={{
                fontFamily: "var(--font-display, 'Playfair Display', serif)",
                fontSize: 56,
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                backgroundImage: tierGradient[tier],
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow:
                  tier === "diamond"
                    ? "0 2px 18px rgba(103,232,249,0.35)"
                    : tier === "platinum"
                      ? "0 2px 12px rgba(156,163,175,0.30)"
                      : "0 2px 10px rgba(245,158,11,0.25)",
                marginTop: 4,
              }}
            >
              <CountUpNumber target={Math.round(trophy.total_score)} />
              <span
                style={{
                  fontSize: 16,
                  marginLeft: 8,
                  opacity: 0.55,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  verticalAlign: "super",
                }}
              >
                / 300
              </span>
            </div>

            {/* Hairline divider with tier accent */}
            <div
              aria-hidden
              style={{
                height: 1,
                margin: "14px 0 14px 0",
                background: `linear-gradient(90deg, transparent, currentColor 30%, currentColor 70%, transparent)`,
                backgroundImage: tierGradient[tier],
                opacity: 0.35,
              }}
            />

            <h3
              style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                lineHeight: 1.25,
              }}
            >
              {trophy.routine_name ?? "Untitled routine"}
            </h3>
            <p
              style={{
                fontSize: 12.5,
                opacity: 0.65,
                marginTop: 4,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
              }}
            >
              {[trophy.style, trophy.entry_type].filter(Boolean).join(" · ") ||
                "Routine"}
            </p>

            {trophy.competition_name || trophy.competition_date ? (
              <p style={{ fontSize: 13, opacity: 0.85, marginTop: 10 }}>
                <span style={{ opacity: 0.8 }}>
                  {trophy.competition_name ?? "Competition"}
                </span>
                {trophy.competition_date ? (
                  <>
                    <span style={{ opacity: 0.4 }}> · </span>
                    <span>{formatDate(trophy.competition_date)}</span>
                  </>
                ) : null}
              </p>
            ) : null}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
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
          </div>

          {/* Decorative corner flourish — bottom right */}
          <svg
            aria-hidden
            width="48"
            height="48"
            viewBox="0 0 48 48"
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              opacity: 0.22,
              pointerEvents: "none",
            }}
          >
            <defs>
              <linearGradient id={`tc-flourish-${trophy.id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="currentColor" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M24 4 L28 20 L44 24 L28 28 L24 44 L20 28 L4 24 L20 20 Z"
              fill={`url(#tc-flourish-${trophy.id})`}
              style={{
                color:
                  tier === "diamond"
                    ? "#C4B5FD"
                    : tier === "platinum"
                      ? "#9CA3AF"
                      : "#F59E0B",
              }}
            />
          </svg>
        </Glass>
      </motion.div>

      <style jsx>{`
        :global(.trophy-shimmer) {
          animation: trophy-shimmer-sweep 5.5s ease-in-out infinite;
        }
        @keyframes trophy-shimmer-sweep {
          0% {
            transform: translateX(-60%) skewX(-20deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          60% {
            transform: translateX(320%) skewX(-20deg);
            opacity: 1;
          }
          100% {
            transform: translateX(320%) skewX(-20deg);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.trophy-shimmer) {
            animation: none;
            display: none;
          }
        }
      `}</style>
    </motion.div>
  );
}

export default TrophyCard;
