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
};

function gradientId(stops: string[]) {
  return `aura-${stops.join("-").replace(/#/g, "")}`;
}

export function Aura({
  profile,
  gradient_stops,
  size = 64,
  tierRing = true,
  glyph,
  tier,
}: AuraProps) {
  const stops =
    gradient_stops ??
    profile?.aura_stops ??
    ["#C4B5FD", "#67E8F9", "#F0ABFC"];
  const effectiveTier = tier ?? profile?.aura_tier ?? "starter";
  const effectiveGlyph = glyph ?? profile?.glyph ?? "";
  const id = gradientId(stops);

  const ringStroke =
    effectiveTier === "gold"
      ? "#F59E0B"
      : effectiveTier === "platinum"
        ? "#9CA3AF"
        : effectiveTier === "diamond"
          ? "url(#diamond-ring)"
          : "transparent";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-label={profile?.handle ? `Aura for @${profile.handle}` : "Aura avatar"}
      role="img"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="50%" stopColor={stops[1]} />
          <stop offset="100%" stopColor={stops[2]} />
        </linearGradient>
        <linearGradient id="diamond-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="50%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#F0ABFC" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${id})`} />
      {tierRing && effectiveTier !== "starter" ? (
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke={ringStroke}
          strokeWidth="3"
          className={effectiveTier === "diamond" ? "animate-aura-pulse" : undefined}
        />
      ) : null}
      {effectiveGlyph ? (
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fontSize="36"
          fontWeight="700"
          fill="rgba(255,255,255,0.92)"
          style={{ fontFamily: "var(--font-display, serif)" }}
        >
          {effectiveGlyph}
        </text>
      ) : null}
    </svg>
  );
}

export default Aura;
