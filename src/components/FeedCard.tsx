"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Aura } from "@/components/Aura";
import { Glass } from "@/components/ui/Glass";
import { ReactionBar } from "@/components/ReactionBar";
import { CommentThread } from "@/components/CommentThread";
import { fadeLift, springOut } from "@/lib/motion";

export type FeedItem = {
  id: string;
  award_level: "gold" | "high_gold" | "platinum" | "diamond";
  total_score: number;
  routine_name: string | null;
  style: string | null;
  competition_name: string | null;
  earned_at: string;
  source?: "follow" | "studio" | "bond" | "event" | "fair_reach" | "discovery";
  owner: {
    id: string;
    handle: string;
    display_name: string | null;
    aura_stops: string[] | null;
    aura_tier: "starter" | "gold" | "platinum" | "diamond" | null;
    glyph: string | null;
  };
};

const tierLabel: Record<FeedItem["award_level"], string> = {
  gold: "Gold",
  high_gold: "High Gold",
  platinum: "Platinum",
  diamond: "Diamond",
};

const sourceBadge: Record<NonNullable<FeedItem["source"]>, string> = {
  follow: "Following",
  studio: "Studio",
  bond: "Dance Bond",
  event: "Event",
  fair_reach: "Rising",
  discovery: "Discover",
};

export function FeedCard({ item }: { item: FeedItem }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  return (
    <motion.div variants={fadeLift} initial="initial" animate="animate" transition={springOut}>
      <Glass style={{ padding: 16 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <Link href={`/u/${item.owner.handle}`}>
            <Aura
              gradient_stops={item.owner.aura_stops ?? undefined}
              tier={item.owner.aura_tier ?? "starter"}
              glyph={item.owner.glyph ?? undefined}
              size={48}
            />
          </Link>
          <div style={{ flex: 1 }}>
            <Link href={`/u/${item.owner.handle}`} style={{ fontWeight: 600 }}>
              @{item.owner.handle}
            </Link>
            {item.source ? (
              <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.6 }}>
                · {sourceBadge[item.source]}
              </span>
            ) : null}
            <p style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
              {tierLabel[item.award_level]} · {Math.round(item.total_score)}
            </p>
          </div>
        </header>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>
          {item.routine_name ?? "Untitled routine"}
        </h3>
        <p style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>
          {[item.style, item.competition_name].filter(Boolean).join(" · ")}
        </p>
        <div style={{ marginTop: 10 }}>
          <ReactionBar postId={item.id} postType="achievement" />
        </div>
        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          style={{
            marginTop: 8,
            background: "transparent",
            border: "none",
            color: "var(--accent)",
            fontSize: 13,
            cursor: "pointer",
            padding: 0,
          }}
        >
          {commentsOpen ? "Hide comments" : "Comments"}
        </button>
        {commentsOpen ? <CommentThread postId={item.id} postType="achievement" /> : null}
      </Glass>
    </motion.div>
  );
}

export default FeedCard;
