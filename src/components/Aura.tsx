"use client";

type AuraTier = "starter" | "gold" | "platinum" | "diamond";

type AuraProfile = {
  aura_stops?: string[] | null;
  aura_tier?: AuraTier | null;
  glyph?: string | null;
  handle?: string | null;
};

type AuraProps = {
  profile?: AuraProfile;
  gradient_stops?: string[];
  size?: number;
  tierRing?: boolean;
  glyph?: string;
  tier?: AuraTier;
  ambient?: boolean; // soft glow halo behind the orb
};

function gradientId(stops: string[]) {
  return `aura-${stops.join("-").replace(/#/g, "")}`;
}

/**
 * Aura avatar — no-photo identity primitive.
 * Renders a radial-gradient orb with:
 *  - soft inner highlight (top-left "light source")
 *  - tier ring (gold / platinum solid; diamond iridescent + pulse)
 *  - optional glyph letter/icon
 *  - optional ambient halo for featured placements
 */
export function Aura({
  profile,
  gradient_stops,
  size = 64,
  tierRing = true,
  glyph,
  tier,
  ambient = false,
}: AuraProps) {
  const stops =
    gradient_stops ?? profile?.aura_stops ?? ["#C4B5FD", "#67E8F9", "#F0ABFC"];
  const effectiveTier = tier ?? profile?.aura_tier ?? "starter";
  const effectiveGlyph = glyph ?? profile?.glyph ?? "";
  const id = gradientId(stops);
  const highlightId = `${id}-hl`;
  const ambientId = `${id}-amb`;
  const ringId = `${id}-ring`;

  const ringStroke =
    effectiveTier === "gold"
      ? "#F59E0B"
      : effectiveTier === "platinum"
        ? "#9CA3AF"
        : effectiveTier === "diamond"
          ? `url(#${ringId})`
          : "transparent";

  const ringWidth =
    effectiveTier === "diamond" ? 4 : effectiveTier === "starter" ? 0 : 3;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-label={
        profile?.handle ? `Aura for @${profile.handle}` : "Aura avatar"
      }
      role="img"
    >
      <defs>
        {/* Base orb gradient — diagonal */}
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="50%" stopColor={stops[1]} />
          <stop offset="100%" stopColor={stops[2]} />
        </linearGradient>

        {/* Inner highlight — simulates a light source from top-left */}
        <radialGradient
          id={highlightId}
          cx="35%"
          cy="28%"
          r="55%"
          fx="30%"
          fy="22%"
        >
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Ambient halo — used when ambient=true */}
        <radialGradient id={ambientId} cx="50%" cy="50%" r="50%">
          <stop offset="30%" stopColor={stops[1]} stopOpacity="0.55" />
          <stop offset="100%" stopColor={stops[1]} stopOpacity="0" />
        </radialGradient>

        {/* Diamond ring — iridescent sweep */}
        <linearGradient
          id={ringId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="50%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#F0ABFC" />
        </linearGradient>

        {/* Used so the inner highlight doesn't bleed outside the orb */}
        <clipPath id={`${id}-clip`}>
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>

      {ambient ? (
        <circle cx="50" cy="50" r="50" fill={`url(#${ambientId})`} opacity="0.8" />
      ) : null}

      {/* Main orb */}
      <circle cx="50" cy="50" r="46" fill={`url(#${id})`} />

      {/* Inner highlight (clipped to orb) */}
      <g clipPath={`url(#${id}-clip)`}>
        <circle cx="50" cy="50" r="46" fill={`url(#${highlightId})`} />
      </g>

      {/* Tier ring */}
      {tierRing && effectiveTier !== "starter" ? (
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke={ringStroke}
          strokeWidth={ringWidth}
          className={
            effectiveTier === "diamond" ? "animate-aura-pulse" : undefined
          }
        />
      ) : null}

      {/* Glyph */}
      {effectiveGlyph ? (
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fontSize="38"
          fontWeight="700"
          fill="rgba(255,255,255,0.95)"
          style={{
            fontFamily: "var(--font-display, 'Playfair Display', serif)",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
          }}
        >
          {effectiveGlyph}
        </text>
      ) : null}
    </svg>
  );
}

export default Aura;
