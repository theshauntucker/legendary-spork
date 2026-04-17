import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Aura } from "@/components/Aura";
import { Glass } from "@/components/ui/Glass";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, age_tier, profile_type, is_verified")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!profile) redirect("/welcome");

  const tier2 =
    profile.age_tier === "adult" ||
    ((profile.profile_type === "studio" || profile.profile_type === "choreographer") &&
      profile.is_verified);

  if (!tier2) {
    return (
      <main style={{ minHeight: "100vh", padding: 32, maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Inbox</h1>
        <Glass style={{ padding: 20, marginTop: 16 }}>
          <p style={{ fontSize: 14 }}>
            DMs are available for adult accounts and verified studios/choreographers. We&apos;ll open
            Tier 1 (supervised, parent-mirrored) DMs later this season.
          </p>
        </Glass>
      </main>
    );
  }

  const { data: parts } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("profile_id", profile.id);

  const conversationIds = (parts ?? []).map((p) => p.conversation_id);
  const { data: convs } = conversationIds.length
    ? await supabase
        .from("conversations")
        .select("id, last_message_at")
        .in("id", conversationIds)
        .order("last_message_at", { ascending: false })
    : { data: [] as { id: string; last_message_at: string }[] };

  const { data: otherParts } = conversationIds.length
    ? await supabase
        .from("conversation_participants")
        .select("conversation_id, profile_id")
        .in("conversation_id", conversationIds)
        .neq("profile_id", profile.id)
    : { data: [] as { conversation_id: string; profile_id: string }[] };

  const otherIds = Array.from(new Set((otherParts ?? []).map((p) => p.profile_id)));
  const { data: otherProfiles } = otherIds.length
    ? await supabase
        .from("profiles")
        .select("id, handle, aura_stops, aura_tier, glyph")
        .in("id", otherIds)
    : { data: [] as { id: string; handle: string; aura_stops: string[] | null; aura_tier: string | null; glyph: string | null }[] };

  type OtherProfile = {
    id: string;
    handle: string;
    aura_stops: string[] | null;
    aura_tier: string | null;
    glyph: string | null;
  };
  const profById = new Map<string, OtherProfile>(
    (otherProfiles ?? []).map((p) => [p.id, p as OtherProfile]),
  );
  const otherByConv = new Map<string, OtherProfile>();
  for (const op of otherParts ?? []) {
    const p = profById.get(op.profile_id);
    if (p) otherByConv.set(op.conversation_id, p);
  }

  return (
    <main style={{ minHeight: "100vh", padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Inbox</h1>

      {convs?.length ? (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {convs.map((c) => {
            const other = otherByConv.get(c.id);
            return (
              <li key={c.id}>
                <Link
                  href={`/inbox/${c.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: 14,
                    background: "rgba(0,0,0,0.04)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <Aura
                    gradient_stops={other?.aura_stops ?? undefined}
                    tier={(other?.aura_tier as "starter" | "gold" | "platinum" | "diamond") ?? "starter"}
                    glyph={other?.glyph ?? undefined}
                    size={44}
                    tierRing={false}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600 }}>@{other?.handle ?? "unknown"}</p>
                    <p style={{ fontSize: 12, opacity: 0.6 }}>
                      Last activity · {new Date(c.last_message_at).toLocaleString()}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <Glass style={{ padding: 20, marginTop: 16 }}>
          <p style={{ fontSize: 14, opacity: 0.7 }}>No conversations yet.</p>
        </Glass>
      )}
    </main>
  );
}
