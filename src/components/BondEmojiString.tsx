"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BOND_EMOJI, rankBonds, type BondType } from "@/lib/dance-bonds";

type Props = {
  viewerProfileId: string | null;
  targetProfileId: string;
  compact?: boolean;
};

export function BondEmojiString({ viewerProfileId, targetProfileId, compact }: Props) {
  const [bonds, setBonds] = useState<BondType[] | null>(null);

  useEffect(() => {
    if (!viewerProfileId) return;
    if (viewerProfileId === targetProfileId) return;

    const [lo, hi] = [viewerProfileId, targetProfileId].sort();
    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("dance_bonds")
        .select("bond_types")
        .eq("profile_a_id", lo)
        .eq("profile_b_id", hi)
        .maybeSingle();
      if (cancelled) return;
      if (data?.bond_types) {
        setBonds(rankBonds(data.bond_types as BondType[]));
      } else {
        setBonds([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [viewerProfileId, targetProfileId]);

  if (!bonds || bonds.length === 0) return null;

  return (
    <span
      aria-label={`Dance Bonds: ${bonds.join(", ")}`}
      title={bonds.map((b) => b.replace("_", " ")).join(" · ")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        fontSize: compact ? 14 : 16,
        marginLeft: 4,
      }}
    >
      {bonds.map((b) => (
        <span key={b}>{BOND_EMOJI[b]}</span>
      ))}
    </span>
  );
}

export default BondEmojiString;
