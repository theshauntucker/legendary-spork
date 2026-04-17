// Auto-generated from supabase-coda-002-aura-seed.sql.
// 50 starter/unlockable auras used for onboarding fallback and UI lookups.

export type AuraSeed = {
  id: string;
  name: string;
  category: 'warm' | 'cool' | 'jewel' | 'mono' | 'rare' | 'founding';
  gradient_stops: string[];
  unlock_tier: 'starter' | 'gold' | 'platinum' | 'diamond';
  unlock_condition: string | null;
};

export const AURA_SEEDS: AuraSeed[] = [
  { id: "sunset_mist", name: "Sunset Mist", category: "warm", gradient_stops: ["#FBBF24", "#F97316", "#EC4899"], unlock_tier: "starter", unlock_condition: null },
  { id: "coral_drift", name: "Coral Drift", category: "warm", gradient_stops: ["#FDBA74", "#F472B6", "#DB2777"], unlock_tier: "starter", unlock_condition: null },
  { id: "golden_hour", name: "Golden Hour", category: "warm", gradient_stops: ["#FEF3C7", "#FBBF24", "#D97706"], unlock_tier: "starter", unlock_condition: null },
  { id: "ember", name: "Ember", category: "warm", gradient_stops: ["#FCA5A5", "#EF4444", "#7F1D1D"], unlock_tier: "starter", unlock_condition: null },
  { id: "peach_fizz", name: "Peach Fizz", category: "warm", gradient_stops: ["#FED7AA", "#FB923C", "#EA580C"], unlock_tier: "starter", unlock_condition: null },
  { id: "rose_flame", name: "Rose Flame", category: "warm", gradient_stops: ["#FECDD3", "#F43F5E", "#881337"], unlock_tier: "starter", unlock_condition: null },
  { id: "saffron", name: "Saffron", category: "warm", gradient_stops: ["#FDE68A", "#F59E0B", "#B45309"], unlock_tier: "starter", unlock_condition: null },
  { id: "terracotta", name: "Terracotta", category: "warm", gradient_stops: ["#FCA5A5", "#F97316", "#92400E"], unlock_tier: "starter", unlock_condition: null },
  { id: "desert_bloom", name: "Desert Bloom", category: "warm", gradient_stops: ["#FBCFE8", "#F472B6", "#BE185D"], unlock_tier: "starter", unlock_condition: null },
  { id: "magma", name: "Magma", category: "warm", gradient_stops: ["#FBBF24", "#DC2626", "#450A0A"], unlock_tier: "starter", unlock_condition: null },
  { id: "lagoon", name: "Lagoon", category: "cool", gradient_stops: ["#67E8F9", "#22D3EE", "#0E7490"], unlock_tier: "starter", unlock_condition: null },
  { id: "twilight", name: "Twilight", category: "cool", gradient_stops: ["#C4B5FD", "#818CF8", "#3730A3"], unlock_tier: "starter", unlock_condition: null },
  { id: "glacier", name: "Glacier", category: "cool", gradient_stops: ["#E0F2FE", "#7DD3FC", "#0369A1"], unlock_tier: "starter", unlock_condition: null },
  { id: "mint_breeze", name: "Mint Breeze", category: "cool", gradient_stops: ["#A7F3D0", "#34D399", "#065F46"], unlock_tier: "starter", unlock_condition: null },
  { id: "violet_haze", name: "Violet Haze", category: "cool", gradient_stops: ["#DDD6FE", "#A855F7", "#6B21A8"], unlock_tier: "starter", unlock_condition: null },
  { id: "ocean_deep", name: "Ocean Deep", category: "cool", gradient_stops: ["#38BDF8", "#2563EB", "#1E1B4B"], unlock_tier: "starter", unlock_condition: null },
  { id: "sea_foam", name: "Sea Foam", category: "cool", gradient_stops: ["#CFFAFE", "#22D3EE", "#155E75"], unlock_tier: "starter", unlock_condition: null },
  { id: "steel_iris", name: "Steel Iris", category: "cool", gradient_stops: ["#A5B4FC", "#6366F1", "#312E81"], unlock_tier: "starter", unlock_condition: null },
  { id: "aurora_north", name: "Aurora North", category: "cool", gradient_stops: ["#86EFAC", "#22D3EE", "#7C3AED"], unlock_tier: "starter", unlock_condition: null },
  { id: "periwinkle", name: "Periwinkle", category: "cool", gradient_stops: ["#E0E7FF", "#818CF8", "#4338CA"], unlock_tier: "starter", unlock_condition: null },
  { id: "ruby", name: "Ruby", category: "jewel", gradient_stops: ["#FECACA", "#DC2626", "#450A0A"], unlock_tier: "starter", unlock_condition: null },
  { id: "sapphire", name: "Sapphire", category: "jewel", gradient_stops: ["#93C5FD", "#1D4ED8", "#172554"], unlock_tier: "starter", unlock_condition: null },
  { id: "emerald", name: "Emerald", category: "jewel", gradient_stops: ["#86EFAC", "#059669", "#064E3B"], unlock_tier: "starter", unlock_condition: null },
  { id: "amethyst", name: "Amethyst", category: "jewel", gradient_stops: ["#C4B5FD", "#7C3AED", "#4C1D95"], unlock_tier: "starter", unlock_condition: null },
  { id: "topaz", name: "Topaz", category: "jewel", gradient_stops: ["#FDE68A", "#F59E0B", "#78350F"], unlock_tier: "starter", unlock_condition: null },
  { id: "garnet", name: "Garnet", category: "jewel", gradient_stops: ["#FDA4AF", "#BE123C", "#4C0519"], unlock_tier: "starter", unlock_condition: null },
  { id: "citrine", name: "Citrine", category: "jewel", gradient_stops: ["#FEF3C7", "#EAB308", "#713F12"], unlock_tier: "starter", unlock_condition: null },
  { id: "tanzanite", name: "Tanzanite", category: "jewel", gradient_stops: ["#A5B4FC", "#6D28D9", "#1E1B4B"], unlock_tier: "starter", unlock_condition: null },
  { id: "aquamarine", name: "Aquamarine", category: "jewel", gradient_stops: ["#A5F3FC", "#0891B2", "#164E63"], unlock_tier: "starter", unlock_condition: null },
  { id: "peridot", name: "Peridot", category: "jewel", gradient_stops: ["#D9F99D", "#84CC16", "#365314"], unlock_tier: "starter", unlock_condition: null },
  { id: "ink", name: "Ink", category: "mono", gradient_stops: ["#71717A", "#27272A", "#09090B"], unlock_tier: "starter", unlock_condition: null },
  { id: "pearl", name: "Pearl", category: "mono", gradient_stops: ["#FAFAFA", "#E4E4E7", "#A1A1AA"], unlock_tier: "starter", unlock_condition: null },
  { id: "graphite", name: "Graphite", category: "mono", gradient_stops: ["#D4D4D8", "#52525B", "#18181B"], unlock_tier: "starter", unlock_condition: null },
  { id: "oyster", name: "Oyster", category: "mono", gradient_stops: ["#F5F5F4", "#A8A29E", "#57534E"], unlock_tier: "starter", unlock_condition: null },
  { id: "onyx", name: "Onyx", category: "mono", gradient_stops: ["#52525B", "#18181B", "#000000"], unlock_tier: "starter", unlock_condition: null },
  { id: "prism", name: "Prism", category: "rare", gradient_stops: ["#FF6B6B", "#C084FC", "#67E8F9"], unlock_tier: "gold", unlock_condition: "Hit Gold" },
  { id: "iridescent", name: "Iridescent", category: "rare", gradient_stops: ["#F0ABFC", "#67E8F9", "#FDE68A"], unlock_tier: "gold", unlock_condition: "Hit Gold" },
  { id: "nebula", name: "Nebula", category: "rare", gradient_stops: ["#F472B6", "#7C3AED", "#1E1B4B"], unlock_tier: "gold", unlock_condition: "Hit Gold" },
  { id: "holographic", name: "Holographic", category: "rare", gradient_stops: ["#FBCFE8", "#C4B5FD", "#67E8F9"], unlock_tier: "platinum", unlock_condition: "Hit Platinum" },
  { id: "quartz_spark", name: "Quartz Spark", category: "rare", gradient_stops: ["#FDE68A", "#F472B6", "#A78BFA"], unlock_tier: "platinum", unlock_condition: "Hit Platinum" },
  { id: "aurora_veil", name: "Aurora Veil", category: "rare", gradient_stops: ["#86EFAC", "#F0ABFC", "#67E8F9"], unlock_tier: "platinum", unlock_condition: "Hit Platinum" },
  { id: "titan_gold", name: "Titan Gold", category: "rare", gradient_stops: ["#FEF08A", "#F59E0B", "#7C2D12"], unlock_tier: "platinum", unlock_condition: "Hit Platinum" },
  { id: "celestial", name: "Celestial", category: "rare", gradient_stops: ["#C4B5FD", "#F0ABFC", "#FEF3C7"], unlock_tier: "diamond", unlock_condition: "Hit Diamond" },
  { id: "meteor", name: "Meteor", category: "rare", gradient_stops: ["#FDA4AF", "#F0ABFC", "#1E1B4B"], unlock_tier: "diamond", unlock_condition: "Hit Diamond" },
  { id: "diamond_flare", name: "Diamond Flare", category: "rare", gradient_stops: ["#F0ABFC", "#67E8F9", "#FEF3C7"], unlock_tier: "diamond", unlock_condition: "Hit Diamond" },
  { id: "founding_gold", name: "Founding Gold", category: "founding", gradient_stops: ["#FEF3C7", "#F59E0B", "#7C2D12"], unlock_tier: "starter", unlock_condition: "Founding Member" },
  { id: "founding_rose", name: "Founding Rose", category: "founding", gradient_stops: ["#FECDD3", "#F43F5E", "#881337"], unlock_tier: "starter", unlock_condition: "Founding Member" },
  { id: "founding_ink", name: "Founding Ink", category: "founding", gradient_stops: ["#C4B5FD", "#7C3AED", "#1E1B4B"], unlock_tier: "starter", unlock_condition: "Founding Member" },
  { id: "founding_mint", name: "Founding Mint", category: "founding", gradient_stops: ["#A7F3D0", "#10B981", "#064E3B"], unlock_tier: "starter", unlock_condition: "Founding Member" },
  { id: "founding_prism", name: "Founding Prism", category: "founding", gradient_stops: ["#F0ABFC", "#67E8F9", "#FDE68A"], unlock_tier: "starter", unlock_condition: "Founding Member" },
];
