/**
 * RoutineXLogo — the official sunset X brand mark + optional wordmark.
 *
 * Single source of truth for RoutineX branding across nav, hero, emails that
 * import from the app, auth screens, and marketing surfaces. If the mark
 * changes, change it here.
 *
 * The mark is the exact brand asset `/public/sunset-x.png` (1080×1080 RGBA,
 * transparent background). We render it through next/image. The wordmark is
 * "RoutineX" with the trailing "X" painted in the matching sunset gradient so
 * mark and wordmark feel like one object.
 */
"use client";

import Image from "next/image";

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  size?: Size;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
  stacked?: boolean; // vertical layout (mark above wordmark) — for hero lockup
};

const TILE_SIZES: Record<Size, { box: number }> = {
  sm: { box: 28 },
  md: { box: 36 },
  lg: { box: 56 },
  xl: { box: 84 },
};

const WORDMARK_SIZE: Record<Size, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
  xl: "text-5xl sm:text-6xl",
};

export default function RoutineXLogo({
  size = "md",
  showWordmark = true,
  className = "",
  wordmarkClassName = "",
  stacked = false,
}: Props) {
  const t = TILE_SIZES[size];

  const mark = (
    <Image
      src="/sunset-x.png"
      alt="RoutineX"
      width={t.box}
      height={t.box}
      priority
      style={{
        width: t.box,
        height: t.box,
        flexShrink: 0,
      }}
    />
  );

  const wordmark = showWordmark ? (
    <span
      className={`font-extrabold tracking-tight font-[family-name:var(--font-display)] ${WORDMARK_SIZE[size]} ${wordmarkClassName}`}
      style={{ letterSpacing: "-0.02em", lineHeight: 1 }}
    >
      Routine
      <span
        style={{
          background:
            "linear-gradient(135deg, #EC4899 0%, #F97316 55%, #FBBF24 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        X
      </span>
    </span>
  ) : null;

  if (stacked) {
    return (
      <span
        className={`inline-flex flex-col items-center gap-3 ${className}`}
        aria-label="RoutineX"
      >
        {mark}
        {wordmark}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="RoutineX"
    >
      {mark}
      {wordmark}
    </span>
  );
}
