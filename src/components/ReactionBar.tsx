"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { haptics } from "@/lib/haptics";

export const EMOJI_MAP: Record<string, string> = {
  diamond: "💎",
  fire: "🔥",
  crown: "👑",
  sparkle: "✨",
  heart: "❤️",
  clap: "👏",
  star: "⭐",
  trophy: "🏆",
  microphone: "🎤",
  fire_heart: "❤️‍🔥",
  eyes: "👀",
  kiss: "😘",
  tears: "🥹",
  bow: "🎀",
  mind_blown: "🤯",
  pointing: "👉",
  muscle: "💪",
  rose: "🌹",
};

export const PRIMARY_REACTIONS = ["diamond", "fire", "crown", "sparkle"] as const;
export const ALL_REACTIONS = Object.keys(EMOJI_MAP);

type Props = {
  postId: string;
  postType: "achievement" | "post";
};

export function ReactionBar({ postId, postType }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("post_reactions")
        .select("emoji_code, profile_id")
        .eq("post_id", postId)
        .eq("post_type", postType);
      const tally: Record<string, number> = {};
      for (const r of data ?? []) tally[r.emoji_code] = (tally[r.emoji_code] ?? 0) + 1;
      setCounts(tally);

      const { data: session } = await supabase.auth.getUser();
      if (session.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (profile) {
          const mineRows = (data ?? []).filter((r) => r.profile_id === profile.id);
          setMine(new Set(mineRows.map((r) => r.emoji_code)));
        }
      }
    })();

    const channel = supabase
      .channel(`reactions:${postType}:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_reactions",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          type ReactionRow = { emoji_code: string };
          if (payload.eventType === "INSERT") {
            const row = payload.new as ReactionRow;
            setCounts((c) => ({ ...c, [row.emoji_code]: (c[row.emoji_code] ?? 0) + 1 }));
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as ReactionRow;
            setCounts((c) => ({
              ...c,
              [row.emoji_code]: Math.max(0, (c[row.emoji_code] ?? 0) - 1),
            }));
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, postType]);

  async function toggleReaction(code: string) {
    const had = mine.has(code);
    haptics.tap();
    const nextMine = new Set(mine);
    if (had) nextMine.delete(code);
    else nextMine.add(code);
    setMine(nextMine);
    setCounts((c) => ({ ...c, [code]: Math.max(0, (c[code] ?? 0) + (had ? -1 : 1)) }));
    try {
      await fetch("/api/reactions", {
        method: had ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, post_type: postType, emoji_code: code }),
      });
    } catch {
      // revert on failure
      setMine(mine);
    }
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      {PRIMARY_REACTIONS.map((code) => (
        <ReactionChip
          key={code}
          emoji={EMOJI_MAP[code]}
          count={counts[code] ?? 0}
          active={mine.has(code)}
          onClick={() => toggleReaction(code)}
        />
      ))}
      <button
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        style={{
          padding: "4px 10px",
          borderRadius: 999,
          border: "1px solid var(--border)",
          background: "transparent",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        +
      </button>
      {pickerOpen ? (
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            padding: 6,
            borderRadius: 12,
            background: "rgba(0,0,0,0.06)",
            marginLeft: 8,
          }}
        >
          {ALL_REACTIONS.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                toggleReaction(code);
                setPickerOpen(false);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                border: "none",
                background: mine.has(code) ? "rgba(236,72,153,0.2)" : "transparent",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              {EMOJI_MAP[code]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ReactionChip({
  emoji,
  count,
  active,
  onClick,
}: {
  emoji: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 10px",
        borderRadius: 999,
        border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
        background: active ? "rgba(236,72,153,0.1)" : "transparent",
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      <span>{emoji}</span>
      {count > 0 ? <span style={{ fontSize: 12, fontWeight: 600 }}>{count}</span> : null}
    </button>
  );
}

export default ReactionBar;
