export const atmospheres = {
  daytime: {
    bg: "#FAF7F2",
    surface: "#FFFFFF",
    surfaceAlt: "#F3EFE8",
    text: "#1A1A1F",
    textMuted: "#52525B",
    textFaint: "#71717A",
    border: "rgba(0,0,0,0.08)",
    accent: "#EC4899",
  },
  showtime: {
    bg: "#09090B",
    surface: "#18181B",
    surfaceAlt: "#1F1F23",
    text: "#FFFFFF",
    textMuted: "#A1A1AA",
    textFaint: "#71717A",
    border: "rgba(255,255,255,0.08)",
    accent: "#C084FC",
  },
} as const;

export type Atmosphere = keyof typeof atmospheres;
export type AtmosphereTokens = (typeof atmospheres)[Atmosphere];
