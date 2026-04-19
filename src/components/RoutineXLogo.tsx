/**
 * RoutineXLogo — the official sunset X brand mark + optional wordmark.
 *
 * Single source of truth for RoutineX branding across nav, hero, emails that
 * import from the app, auth screens, and marketing surfaces. If the mark
 * changes, change it here.
 *
 * The mark is two crossing brush-stroke curves forming an X:
 *   - one pink → orange curve (top-left to bottom-right diagonal)
 *   - one pink → yellow curve (top-right to bottom-left diagonal)
 * Rounded stroke caps give it the hand-drawn sunset feel. The wordmark is
 * "RoutineX" with the trailing "X" painted in the same sunset gradient so
 * mark and wordmark feel like one object.
 */
"use client";

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  size?: Size;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
  stacked?: boolean; // vertical layout (mark above wordmark) — for hero lockup
};

const TILE_SIZES: Record<Size, { box: number; stroke: number }> = {
  sm: { box: 28, stroke: 6 },
  md: { box: 36, stroke: 7 },
  lg: { box: 56, stroke: 10 },
  xl: { box: 84, stroke: 14 },
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

  // Unique gradient IDs so multiple instances on the same page don't collide
  const gid = `rx-${size}`;

  const mark = (
    <svg
      width={t.box}
      height={t.box}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        {/* pink → orange — the top-left to bottom-right stroke */}
        <linearGradient id={`${gid}-a`} x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="55%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        {/* pink → yellow — the top-right to bottom-left stroke */}
        <linearGradient id={`${gid}-b`} x1="90" y1="10" x2="10" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>

      {/* First brush curve — gentle arc, NW → SE */}
      <path
        d="M 14 20 Q 50 55 86 82"
        stroke={`url(#${gid}-a)`}
        strokeWidth={t.stroke}
        strokeLinecap="round"
        fill="none"
      />
      {/* Second brush curve — gentle arc, NE → SW, layered on top */}
      <path
        d="M 86 18 Q 50 48 14 82"
        stroke={`url(#${gid}-b)`}
        strokeWidth={t.stroke}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
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
