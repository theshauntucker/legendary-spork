"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FeedCard, type FeedItem } from "@/components/FeedCard";
import { GradientText } from "@/components/ui/GradientText";
import { Glass } from "@/components/ui/Glass";

type FeedResponse = {
  items: FeedItem[];
  nextCursor: string | null;
};

export default function FeedClient() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(
    async (initial = false) => {
      if (loading || done) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: "20" });
        if (cursor && !initial) params.set("cursor", cursor);
        const res = await fetch(`/api/feed?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Couldn't load feed");
        const json: FeedResponse = await res.json();
        setItems((prev) => {
          const seen = new Set(prev.map((i) => i.id));
          const merged = [...prev];
          for (const item of json.items) {
            if (!seen.has(item.id)) merged.push(item);
          }
          return merged;
        });
        setCursor(json.nextCursor);
        if (!json.nextCursor || json.items.length === 0) {
          setDone(true);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't load feed");
      } finally {
        setLoading(false);
      }
    },
    [cursor, loading, done],
  );

  // Initial load
  useEffect(() => {
    loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px 96px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Your <GradientText gradient="sunsetText">feed</GradientText>
        </h1>
        <p style={{ opacity: 0.65, marginTop: 6, fontSize: 14 }}>
          Recent trophies and routines from people you follow, your studio, and
          rising dancers in Coda.
        </p>
      </header>

      {error ? (
        <Glass style={{ padding: 16, marginBottom: 16 }}>
          <p style={{ color: "#F87171", fontSize: 14 }}>{error}</p>
        </Glass>
      ) : null}

      {!loading && items.length === 0 && done ? (
        <Glass style={{ padding: 28, textAlign: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
            Nothing here yet.
          </h3>
          <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 16 }}>
            Follow a few dancers or studios and your feed will fill up with
            their wins.
          </p>
          <Link
            href="/explore"
            style={{
              display: "inline-block",
              padding: "10px 18px",
              borderRadius: 12,
              background:
                "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)",
              color: "#0B0B10",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Explore
          </Link>
        </Glass>
      ) : null}

      <div
        style={{ display: "grid", gap: 14 }}
        role="feed"
        aria-busy={loading}
      >
        {items.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>

      <div ref={sentinelRef} style={{ height: 24, marginTop: 24 }} />

      {loading ? (
        <p
          style={{
            textAlign: "center",
            opacity: 0.6,
            fontSize: 13,
            marginTop: 12,
          }}
        >
          Loading…
        </p>
      ) : null}

      {done && items.length > 0 ? (
        <p
          style={{
            textAlign: "center",
            opacity: 0.4,
            fontSize: 12,
            marginTop: 16,
          }}
        >
          You're all caught up.
        </p>
      ) : null}
    </main>
  );
}
