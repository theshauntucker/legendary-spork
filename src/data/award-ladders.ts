// Cross-competition award ladder reference for RoutineX guides.
//
// ACCURACY RULE: We list tier ORDER (top -> bottom) and the general scale
// type only. We deliberately do NOT publish exact numeric cutoffs for any
// company, because ladders and thresholds change season to season and often
// vary by age division and level. Always defer to the company's own current
// rules / awards page.

export const AWARD_LADDER_DISCLAIMER =
  "Award ladders and point cutoffs change season to season and often vary by age division, level, and region. The tiers below show the order companies use, not exact scores. Always check the competition company's current, official rules or awards page before drawing conclusions — this chart is a general orientation, not an official scoring guide.";

export interface AwardLadder {
  company: string;
  scaleNote: string;
  /** Top tier first, lowest listed tier last. Order only — not exact cutoffs. */
  tiers: string[];
  notes: string;
  website: string;
  /** RoutineX's own reference row, rendered first and highlighted. */
  isReference?: boolean;
}

export const AWARD_LADDERS: AwardLadder[] = [
  {
    company: "RoutineX (our reference score)",
    scaleNote: "Out of 300",
    tiers: ["Diamond", "Platinum", "High Gold", "Gold"],
    notes:
      "Our own consistent baseline so you can compare a routine to itself across the season. Diamond 290-300, Platinum 280-289, High Gold 270-279, Gold 260-269. Because it never changes, it's the one ruler that stays the same no matter which company you compete with next.",
    website: "https://routinex.org",
    isReference: true,
  },
  {
    company: "StarQuest",
    scaleNote: "Out of 300",
    tiers: [
      "Ultimate Platinum",
      "Platinum Plus",
      "Platinum",
      "High Gold",
      "Gold",
    ],
    notes:
      "A layered Platinum ladder at the top. Exact point bands vary by season and division — check StarQuest's current adjudication chart.",
    website: "https://starquestdance.com",
  },
  {
    company: "NUVO Dance Convention",
    scaleNote: "Out of 300",
    tiers: ["DJ's Pick", "Palladium", "High Gold", "Gold", "High Silver"],
    notes:
      "Palladium sits at the top of the standard ladder, with DJ's Pick as a special recognition above it. Confirm current cutoffs on NUVO's site.",
    website: "https://nuvodanceconvention.com",
  },
  {
    company: "24Seven Dance Convention",
    scaleNote: "Out of 300",
    tiers: ["Stop The Clock", "Palladium", "High Gold", "Gold", "High Silver"],
    notes:
      "Palladium tops the standard adjudication ladder; Stop The Clock is a top special award. Bands shift by season — see 24Seven's current rules.",
    website: "https://24sevendance.com",
  },
  {
    company: "Radix Dance Convention",
    scaleNote: "Out of 300",
    tiers: ["On The Edge", "Palladium", "High Gold", "Gold", "High Silver"],
    notes:
      "Palladium is the top adjudicated tier, with On The Edge as a special top recognition. Always verify against Radix's published awards page for the season.",
    website: "https://radixdance.com",
  },
  {
    company: "Encore DCS (Dance Championships)",
    scaleNote: "Out of 300",
    tiers: ["Mic Drop (Elite)", "Diamond", "Platinum", "High Gold", "Gold"],
    notes:
      "A Diamond/Platinum ladder with a top Mic Drop / elite recognition. Point ranges vary by event and level — check Encore's current rulebook.",
    website: "https://encoredcs.com",
  },
  {
    company: "KAR (Karisma / Kids Artistic Revue)",
    scaleNote: "Per-judge, out of 100",
    tiers: [
      "Elite Ultimate Performance",
      "Elite Top First",
      "Top First",
      "First",
      "High Second",
    ],
    notes:
      "Scored per judge on a 100-point scale rather than a combined 300. A First-place adjudication here is not the same math as a 300-scale tier — read KAR's current adjudication guide.",
    website: "https://kardance.com",
  },
  {
    company: "Showstopper",
    scaleNote: "Roughly a 120-point scale (thresholds vary)",
    tiers: ["Crystal", "Double Platinum", "Platinum", "Gold", "Silver"],
    notes:
      "Uses its own scale with cutoffs that vary by age and level, so the same raw number can land differently across divisions. Check Showstopper's current scoring for the exact bands.",
    website: "https://goshowstopper.com",
  },
  {
    company: "Hall of Fame",
    scaleNote: "Out of 300 (baseball-themed, varies by league)",
    tiers: ["Walk-Off", "Grand Slam", "Platinum", "High Gold", "Gold"],
    notes:
      "A baseball-themed ladder where the top awards sit above the standard Platinum/Gold tiers. Names and bands vary by league and season — confirm on Hall of Fame's current site.",
    website: "https://hofnationals.com",
  },
  {
    company: "Starbound National Talent Competition",
    scaleNote: "Out of 300",
    tiers: ["Elite Gold", "High Gold", "Gold", "High Silver", "Silver"],
    notes:
      "A Gold-centered ladder with Elite Gold at the top. Exact point ranges vary by season — see Starbound's current rules.",
    website: "https://starbound.dance",
  },
  {
    company: "Velocity Dance Convention",
    scaleNote: "Per-judge, out of 100",
    tiers: ["Platinum", "High Gold", "Gold", "Silver"],
    notes:
      "An extended per-judge ladder; adjudication results are typically delivered privately rather than announced on stage. Check Velocity's current materials for the tier bands.",
    website: "https://velocitydance.com",
  },
];
