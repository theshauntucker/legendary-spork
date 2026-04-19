/**
 * RoutineXLogo — the official sunset X brand mark + optional wordmark.
 *
 * Single source of truth for RoutineX branding across nav, hero, emails that
 * import from the app, auth screens, and marketing surfaces. If the mark
 * changes, change it here.
 *
 * The tile itself is a rounded square filled with the sunset gradient
 * (pink → orange → yellow) with a bold "X" centered in it. The wordmark is
 * "RoutineX" with the trailing "X" rendered in the same gradient so that the
 * mark and the wordmark feel like the same object.
 */
"use client";

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  size?: Size;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
  stacked?: boolean; // vertical layout (tile above wordmark) — for hero lockup
};

const TILE_SIZES: Record<Size, { box: number; radius: number; font: number; shadow: string }> = {
  sm: { box: 28, radius: 8, font: 16, shadow: "0 4px 12px -2px rgba(236,72,153,0.45)" },
  md: { box: 36, radius: 10, font: 20, shadow: "0 6px 16px -4px rgba(236,72,153,0.5)" },
  lg: { box: 56, radius: 14, font: 30, shadow: "0 12px 32px -8px rgba(236,72,153,0.6)" },
  xl: { box: 84, radius: 20, font: 46, shadow: "0 20px 48px -12px rgba(236,72,153,0.7)" },
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

  const tile = (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: t.box,
        height: t.box,
        borderRadius: t.radius,
        background:
          "linear-gradient(135deg, #EC4899 0%, #F97316 55%, #FBBF24 100%)",
        boxShadow: t.shadow,
        fontSize: t.font,
        fontWeight: 900,
        color: "#0a0118",
        letterSpacing: "-0.08em",
        lineHeight: 1,
        fontFamily: "var(--font-display), -apple-system, system-ui, sans-serif",
        flexShrink: 0,
      }}
    >
      X
    </span>
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
        {tile}
        {wordmark}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="RoutineX"
    >
      {tile}
      {wordmark}
    </span>
  );
}
