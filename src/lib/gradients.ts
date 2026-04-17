export const gradients = {
  sunset: "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)",
  sunsetText: "linear-gradient(to right, #C084FC, #F472B6, #FBBF24)",
  magentaRush: "linear-gradient(135deg, #A855F7, #EC4899, #FF6B6B)",
  berryGlow: "linear-gradient(135deg, #9333EA, #DB2777, #F472B6)",
  hotOrchid: "linear-gradient(135deg, #7C3AED, #D63384, #FF6B6B)",
  auraGold: "linear-gradient(135deg, #FCD34D, #F59E0B, #D97706)",
  auraPlatinum: "linear-gradient(135deg, #E5E7EB, #9CA3AF, #4B5563)",
  auraDiamond: "linear-gradient(135deg, #C4B5FD, #67E8F9, #F0ABFC)",
  glass: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
  shadowRim:
    "0 1px 0 rgba(255,255,255,0.12) inset, 0 0 0 1px rgba(255,255,255,0.06), 0 30px 60px -20px rgba(0,0,0,0.6)",
} as const;

export type GradientKey = keyof typeof gradients;
