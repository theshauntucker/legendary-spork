import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Aura } from "@/components/Aura";
import { Glass } from "@/components/ui/Glass";

export const dynamic = "force-dynamic";

function relativeTime(iso: string) {
  try {
    const delta = Date.now() - new Date(iso).getTime();
    const m = Math.floor(delta / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return "";
  }
}

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
    ((profile.profile_type === "studio" ||
      profile.profile_type === "choreographer") &&
      profile.is_verified);

  if (!tier2) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 32,
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Inbox</h1>
        <Glass style={{ padding: 20, marginTop: 16 }}>
          <p style={{ fontSize: 14 }}>
            DMs are available for adult accounts and verified
            studios/choreographers. We&apos;ll open Tier 1 (supervised,
            parent-mirrored) DMs later this season.
          </p>
        </Glass>
      </main>
    );
  }

  const { data: parts } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("profile_id", profile.id);

  const partList = parts ?? [];
  const conversationIds = partList.map((p) => p.conversation_id);
  const lastReadByConv = new Map(
    partList.map((p) => [p.conversation_id, p.last_read_at as string | null]),
  );

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

  const otherIds = Array.from(
    new Set((otherParts ?? []).map((p) => p.profile_id)),
  );
  const { data: otherProfiles } = otherIds.length
    ? await supabase
        .from("profiles")
        .select("id, handle, display_name, aura_stops, aura_tier, glyph")
        .in("id", otherIds)
    : {
        data: [] as {
          id: string;
          handle: string;
          display_name: string | null;
          aura_stops: string[] | null;
          aura_tier: string | null;
          glyph: string | null;
        }[],
      };

  // Last message preview per conversation
  const { data: lastMessages } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("conversation_id, body, created_at, sender_profile_id")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
        .limit(conversationIds.length * 8) // rough cap — we'll reduce client-side
    : { data: [] as Array<{ conversation_id: string; body: string; created_at: string; sender_profile_id: string }> };

  const lastMsgByConv = new Map<
    string,
    { body: string; created_at: string; sender_profile_id: string }
  >();
  for (const m of lastMessages ?? []) {
    if (!lastMsgByConv.has(m.conversation_id)) {
      lastMsgByConv.set(m.conversation_id, m);
    }
  }

  type OtherProfile = {
    id: string;
    handle: string;
    display_name: string | null;
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
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px 48px 16px",
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Inbox
        </h1>
        <span style={{ fontSize: 13, opacity: 0.55 }}>
          {convs?.length ?? 0}{" "}
          {(convs?.length ?? 0) === 1 ? "conversation" : "conversations"}
        </span>
      </header>

      {convs?.length ? (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {convs.map((c) => {
            const other = otherByConv.get(c.id);
            const lastRead = lastReadByConv.get(c.id);
            const lastMsg = lastMsgByConv.get(c.id);
            const unread =
              !!lastMsg &&
              lastMsg.sender_profile_id !== profile.id &&
              (!lastRead ||
                new Date(lastMsg.created_at) > new Date(lastRead));
            const preview = lastMsg
              ? lastMsg.sender_profile_id === profile.id
                ? `You: ${lastMsg.body}`
                : lastMsg.body
              : "No messages yet.";
            return (
              <li key={c.id}>
                <Link
                  href={`/inbox/${c.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: unread
                      ? "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(249,115,22,0.06), rgba(251,191,36,0.06))"
                      : "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "background 150ms ease",
                  }}
                >
                  <Aura
                    gradient_stops={other?.aura_stops ?? undefined}
                    tier={
                      (other?.aura_tier as
                        | "starter"
                        | "gold"
                        | "platinum"
                        | "diamond") ?? "starter"
                    }
                    glyph={other?.glyph ?? undefined}
                    size={48}
                    tierRing={false}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "baseline",
                      }}
                    >
                      <p
                        style={{
                          fontWeight: unread ? 800 : 600,
                          fontSize: 15,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {other?.display_name ?? `@${other?.handle ?? "unknown"}`}
                      </p>
                      <span
                        style={{
                          fontSize: 11,
                          opacity: 0.55,
                          fontWeight: 500,
                          flexShrink: 0,
                        }}
                      >
                        {relativeTime(c.last_message_at)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        opacity: unread ? 0.95 : 0.55,
                        marginTop: 2,
                        fontWeight: unread ? 600 : 400,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {preview}
                    </p>
                  </div>
                  {unread ? (
                    <span
                      aria-label="Unread"
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background:
                          "linear-gradient(135deg, #EC4899, #F97316)",
                        boxShadow: "0 0 8px rgba(236,72,153,0.6)",
                        flexShrink: 0,
                      }}
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <Glass style={{ padding: 24, marginTop: 8 }}>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 8 }}>
            No conversations yet.
          </p>
          <p style={{ fontSize: 13, opacity: 0.55 }}>
            Find someone on{" "}
            <Link
              href="/find"
              style={{ color: "#EC4899", textDecoration: "none" }}
            >
              Find
            </Link>{" "}
            and tap Message to start one.
          </p>
        </Glass>
      )}
    </main>
  );
}
