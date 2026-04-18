"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Glass } from "@/components/ui/Glass";
import { ALL_EVENTS } from "@/data/competitions";

type Tab = "all" | "dancers" | "studios" | "choreographers" | "events";

type ProfileHit = { id: string; handle: string; display_name: string | null };
type StudioHit = { id: string; slug: string; name: string; city: string | null; state: string | null };
type ChoreoHit = { id: string; slug: string; name: string };

export default function FindPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<ProfileHit[]>([]);
  const [studios, setStudios] = useState<StudioHit[]>([]);
  const [choreos, setChoreos] = useState<ChoreoHit[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setProfiles([]);
      setStudios([]);
      setChoreos([]);
      return;
    }
    const supabase = createClient();
    const t = setTimeout(async () => {
      const q = `%${query.trim()}%`;
      const [profRes, studioRes, chRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, handle, display_name")
          .or(`handle.ilike.${q},display_name.ilike.${q}`)
          .eq("is_test", false)
          .limit(15),
        supabase
          .from("studios")
          .select("id, slug, name, city, state")
          .ilike("name", q)
          .eq("is_test", false)
          .limit(15),
        supabase.from("choreographers").select("id, slug, name").ilike("name", q).limit(15),
      ]);
      setProfiles((profRes.data ?? []) as ProfileHit[]);
      setStudios((studioRes.data ?? []) as StudioHit[]);
      setChoreos((chRes.data ?? []) as ChoreoHit[]);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const eventMatches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_EVENTS.filter(
      (e) => e.name.toLowerCase().includes(q) || e.organizer.toLowerCase().includes(q),
    ).slice(0, 15);
  }, [query]);

  return (
    <main style={{ minHeight: "100vh", padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Find</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Handles, studios, choreographers, events…"
        style={{
          marginTop: 16,
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "transparent",
          width: "100%",
          fontSize: 15,
          color: "inherit",
        }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        {(["all", "dancers", "studios", "choreographers", "events"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              background:
                tab === t
                  ? "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)"
                  : "transparent",
              color: tab === t ? "#fff" : "inherit",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
        {(tab === "all" || tab === "dancers") && profiles.length > 0 ? (
          <Section title="Dancers">
            {profiles.map((p) => (
              <Link
                key={p.id}
                href={`/u/${p.handle}`}
                style={{ display: "block", padding: "10px 12px", borderRadius: 10, background: "rgba(0,0,0,0.04)", textDecoration: "none", color: "inherit" }}
              >
                <p style={{ fontWeight: 600 }}>{p.display_name ?? `@${p.handle}`}</p>
                <p style={{ fontSize: 12, opacity: 0.6 }}>@{p.handle}</p>
              </Link>
            ))}
          </Section>
        ) : null}

        {(tab === "all" || tab === "studios") && studios.length > 0 ? (
          <Section title="Studios">
            {studios.map((s) => (
              <Link
                key={s.id}
                href={`/studios/${s.slug}`}
                style={{ display: "block", padding: "10px 12px", borderRadius: 10, background: "rgba(0,0,0,0.04)", textDecoration: "none", color: "inherit" }}
              >
                <p style={{ fontWeight: 600 }}>{s.name}</p>
                <p style={{ fontSize: 12, opacity: 0.6 }}>
                  {[s.city, s.state].filter(Boolean).join(", ") || "Studio"}
                </p>
              </Link>
            ))}
          </Section>
        ) : null}

        {(tab === "all" || tab === "choreographers") && choreos.length > 0 ? (
          <Section title="Choreographers">
            {choreos.map((c) => (
              <Link
                key={c.id}
                href={`/choreographers/${c.slug}`}
                style={{ display: "block", padding: "10px 12px", borderRadius: 10, background: "rgba(0,0,0,0.04)", textDecoration: "none", color: "inherit" }}
              >
                <p style={{ fontWeight: 600 }}>{c.name}</p>
              </Link>
            ))}
          </Section>
        ) : null}

        {(tab === "all" || tab === "events") && eventMatches.length > 0 ? (
          <Section title="Events">
            {eventMatches.map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                style={{ display: "block", padding: "10px 12px", borderRadius: 10, background: "rgba(0,0,0,0.04)", textDecoration: "none", color: "inherit" }}
              >
                <p style={{ fontWeight: 600 }}>{e.name}</p>
                <p style={{ fontSize: 12, opacity: 0.6 }}>{e.organizer}</p>
              </Link>
            ))}
          </Section>
        ) : null}

        {!query.trim() ? (
          <Glass style={{ padding: 20 }}>
            <p style={{ fontSize: 14, opacity: 0.7 }}>
              Search for a handle, a studio, a choreographer, or a competition.
            </p>
          </Glass>
        ) : null}
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, opacity: 0.8 }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>
    </section>
  );
}
