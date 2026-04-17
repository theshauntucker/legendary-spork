"use client";

import { useMemo, useState } from "react";
import { TrophyCard, type TrophyCardData } from "@/components/TrophyCard";
import { ShareCardModal } from "@/components/ShareCardModal";
import { haptics } from "@/lib/haptics";

type Props = {
  handle: string;
  isOwner: boolean;
  trophies: TrophyCardData[];
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "diamond", label: "Diamond" },
  { id: "platinum", label: "Platinum" },
  { id: "high_gold", label: "High Gold" },
  { id: "gold", label: "Gold" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export function TrophyWall({ handle, isOwner, trophies }: Props) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [shareFor, setShareFor] = useState<string | null>(null);
  const [local, setLocal] = useState(trophies);

  const filtered = useMemo(() => {
    if (filter === "all") return local;
    return local.filter((t) => t.award_level === filter);
  }, [local, filter]);

  if (!local.length) {
    return (
      <div style={{ padding: 24, borderRadius: 12, background: "rgba(0,0,0,0.04)" }}>
        <p style={{ fontSize: 14, opacity: 0.7 }}>
          No trophies yet. {isOwner ? "Upload a routine to earn your first." : "Come back soon."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              haptics.select();
              setFilter(f.id);
            }}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              cursor: "pointer",
              background:
                filter === f.id
                  ? "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)"
                  : "transparent",
              color: filter === f.id ? "#fff" : "inherit",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {filtered.map((trophy) => (
          <TrophyCard
            key={trophy.id}
            trophy={trophy}
            isOwner={isOwner}
            onVisibilityChange={(v) => {
              setLocal((prev) =>
                prev.map((t) => (t.id === trophy.id ? { ...t, visibility: v } : t)),
              );
              fetch("/api/visibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_type: "achievement", item_id: trophy.id, visibility: v }),
              }).catch(() => {});
            }}
            onShare={() => setShareFor(trophy.id)}
          />
        ))}
      </div>

      <ShareCardModal
        open={!!shareFor}
        onClose={() => setShareFor(null)}
        trophyId={shareFor ?? ""}
        handle={handle}
      />
    </div>
  );
}

export default TrophyWall;
