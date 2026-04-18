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

// Each filter pill gets the tier's own gradient when active
const ACTIVE_BG: Record<FilterId, string> = {
  all: "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)",
  diamond: "linear-gradient(135deg, #C4B5FD, #67E8F9, #F0ABFC)",
  platinum: "linear-gradient(135deg, #F3F4F6, #9CA3AF, #4B5563)",
  high_gold: "linear-gradient(135deg, #FEF3C7, #FBBF24, #B45309)",
  gold: "linear-gradient(135deg, #FCD34D, #F59E0B, #D97706)",
};

export function TrophyWall({ handle, isOwner, trophies }: Props) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [shareFor, setShareFor] = useState<string | null>(null);
  const [local, setLocal] = useState(trophies);

  const filtered = useMemo(() => {
    if (filter === "all") return local;
    return local.filter((t) => t.award_level === filter);
  }, [local, filter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: local.length };
    for (const t of local) {
      map[t.award_level] = (map[t.award_level] ?? 0) + 1;
    }
    return map;
  }, [local]);

  if (!local.length) {
    return (
      <div
        style={{
          padding: 32,
          borderRadius: 18,
          background:
            "linear-gradient(135deg, rgba(236,72,153,0.06), rgba(249,115,22,0.04), rgba(251,191,36,0.06))",
          border: "1px dashed rgba(255,255,255,0.12)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 40,
            marginBottom: 8,
            opacity: 0.7,
          }}
          aria-hidden
        >
          ✦
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
          No trophies yet
        </p>
        <p style={{ fontSize: 13, opacity: 0.6 }}>
          {isOwner
            ? "Upload a routine to earn your first."
            : "Come back soon — trophies land here after competitions."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const count = counts[f.id] ?? 0;
          const disabled = f.id !== "all" && count === 0;
          return (
            <button
              key={f.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                haptics.select();
                setFilter(f.id);
              }}
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: disabled ? "not-allowed" : "pointer",
                background: active ? ACTIVE_BG[f.id] : "transparent",
                color: active ? "#0B0B10" : "inherit",
                opacity: disabled ? 0.35 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "transform 140ms ease, background 140ms ease",
                transform: active ? "scale(1.02)" : "scale(1)",
              }}
            >
              <span>{f.label}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "1px 7px",
                  borderRadius: 999,
                  background: active
                    ? "rgba(0,0,0,0.15)"
                    : "rgba(255,255,255,0.08)",
                  color: active ? "#0B0B10" : "inherit",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 18,
        }}
      >
        {filtered.map((trophy) => (
          <TrophyCard
            key={trophy.id}
            trophy={trophy}
            isOwner={isOwner}
            onVisibilityChange={(v) => {
              setLocal((prev) =>
                prev.map((t) =>
                  t.id === trophy.id ? { ...t, visibility: v } : t,
                ),
              );
              fetch("/api/visibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  item_type: "achievement",
                  item_id: trophy.id,
                  visibility: v,
                }),
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
