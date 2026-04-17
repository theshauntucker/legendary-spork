import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Aura } from "@/components/Aura";
import { Glass } from "@/components/ui/Glass";
import { ThreadChat } from "@/components/ThreadChat";
import { ALL_EVENTS } from "@/data/competitions";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ competitionId: string; date: string }>;
}) {
  const { competitionId, date } = await params;
  const event = ALL_EVENTS.find((e) => e.id === competitionId);
  const supabase = await createClient();

  const { data: checkins } = await supabase
    .from("competition_checkins")
    .select("profile_id")
    .eq("competition_id", competitionId)
    .eq("competition_date", date);

  const profileIds = (checkins ?? []).map((c) => c.profile_id);
  const { data: profiles } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, handle, aura_stops, aura_tier, glyph, age_tier")
        .in("id", profileIds)
    : { data: [] as Array<{ id: string; handle: string; aura_stops: string[] | null; aura_tier: string | null; glyph: string | null; age_tier: string }> };

  return (
    <main style={{ minHeight: "100vh", padding: 24, maxWidth: 760, margin: "0 auto" }}>
      <Link href={`/events/${competitionId}`} style={{ fontSize: 13, color: "#EC4899" }}>
        ← {event?.name ?? "Event"}
      </Link>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>
        {event?.name ?? competitionId}
      </h1>
      <p style={{ opacity: 0.7 }}>{date}</p>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>
          Who&apos;s here ({profileIds.length})
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(profiles ?? []).map((p) => (
            <div key={p.id} style={{ textAlign: "center" }}>
              {p.age_tier === "minor" ? (
                <Aura gradient_stops={p.aura_stops ?? undefined} glyph={p.glyph ?? undefined} size={48} tierRing={false} />
              ) : (
                <Link href={`/u/${p.handle}`}>
                  <Aura
                    gradient_stops={p.aura_stops ?? undefined}
                    tier={(p.aura_tier as "starter" | "gold" | "platinum" | "diamond") ?? "starter"}
                    glyph={p.glyph ?? undefined}
                    size={48}
                  />
                </Link>
              )}
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                {p.age_tier === "minor" ? "" : `@${p.handle}`}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Glass style={{ padding: 16, marginTop: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Thread chat</h2>
        <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 12 }}>
          Adults 18+ can post. Minors can read.
        </p>
        <ThreadChat competitionId={competitionId} date={date} />
      </Glass>
    </main>
  );
}
