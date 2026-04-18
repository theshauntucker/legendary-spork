"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Aura } from "@/components/Aura";
import { haptics } from "@/lib/haptics";

type Msg = {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  body: string;
  created_at: string;
};

type OtherProfile = {
  id: string;
  handle: string;
  display_name: string | null;
  aura_stops: string[] | null;
  aura_tier: "starter" | "gold" | "platinum" | "diamond" | null;
  glyph: string | null;
};

type Props = {
  conversationId: string;
  selfProfileId: string;
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// Group consecutive messages from the same sender within 5 minutes
function shouldGroup(prev: Msg | undefined, curr: Msg) {
  if (!prev) return false;
  if (prev.sender_profile_id !== curr.sender_profile_id) return false;
  const dt =
    new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime();
  return dt < 5 * 60 * 1000;
}

export function ConversationView({ conversationId, selfProfileId }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [other, setOther] = useState<OtherProfile | null>(null);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load initial history + other participant, subscribe to realtime inserts
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const [{ data: msgs }, { data: parts }] = await Promise.all([
        supabase
          .from("messages")
          .select("id, conversation_id, sender_profile_id, body, created_at")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })
          .limit(200),
        supabase
          .from("conversation_participants")
          .select("profile_id")
          .eq("conversation_id", conversationId)
          .neq("profile_id", selfProfileId),
      ]);

      if (cancelled) return;
      setMessages((msgs ?? []) as Msg[]);

      const otherId = parts?.[0]?.profile_id;
      if (otherId) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, handle, display_name, aura_stops, aura_tier, glyph")
          .eq("id", otherId)
          .maybeSingle();
        if (!cancelled && prof) setOther(prof as OtherProfile);
      }

      // Mark read on open
      await supabase.rpc("mark_conversation_read", { conv_id: conversationId });
    })();

    const ch = supabase
      .channel(`conv:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          setMessages((prev) => [...prev, payload.new as Msg]);
          // Incoming message — touch last_read_at so unread badges clear
          await supabase.rpc("mark_conversation_read", {
            conv_id: conversationId,
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [conversationId, selfProfileId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setPending(true);
    setError(null);

    // Optimistic add
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      conversation_id: conversationId,
      sender_profile_id: selfProfileId,
      body: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setBody("");

    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          body: trimmed,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not send");
        // Roll back optimistic
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setBody(trimmed);
      } else {
        haptics.success();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setBody(trimmed);
    } finally {
      setPending(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
      }}
    >
      {/* Sticky header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(14px)",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <Link
          href="/inbox"
          aria-label="Back to inbox"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: 4,
            borderRadius: 999,
            color: "inherit",
            opacity: 0.7,
          }}
        >
          <ChevronLeft size={22} />
        </Link>
        {other ? (
          <Link
            href={`/u/${other.handle}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Aura
              gradient_stops={other.aura_stops ?? undefined}
              tier={other.aura_tier ?? "starter"}
              glyph={other.glyph ?? undefined}
              size={36}
              tierRing={false}
            />
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>
                {other.display_name ?? `@${other.handle}`}
              </p>
              <p style={{ fontSize: 12, opacity: 0.55 }}>@{other.handle}</p>
            </div>
          </Link>
        ) : (
          <p style={{ fontWeight: 600 }}>Conversation</p>
        )}
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          padding: "16px",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              margin: "auto",
              textAlign: "center",
              opacity: 0.5,
              fontSize: 13,
            }}
          >
            Say hi.
          </div>
        ) : null}
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const isMine = m.sender_profile_id === selfProfileId;
          const grouped = shouldGroup(prev, m);
          const showTime =
            !grouped ||
            (prev && i === messages.length - 1) ||
            i === messages.length - 1;
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMine ? "flex-end" : "flex-start",
                marginTop: grouped ? 1 : 8,
              }}
            >
              <div
                style={{
                  maxWidth: "76%",
                  padding: "9px 14px",
                  borderRadius: 20,
                  borderTopRightRadius: isMine ? (grouped ? 20 : 6) : 20,
                  borderTopLeftRadius: !isMine ? (grouped ? 20 : 6) : 20,
                  backgroundImage: isMine
                    ? "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)"
                    : undefined,
                  background: isMine ? undefined : "rgba(255,255,255,0.06)",
                  color: isMine ? "#fff" : "inherit",
                  fontSize: 14.5,
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  boxShadow: isMine
                    ? "0 2px 8px rgba(236,72,153,0.25)"
                    : "0 1px 2px rgba(0,0,0,0.15)",
                }}
              >
                {m.body}
              </div>
              {showTime ? (
                <span
                  style={{
                    fontSize: 10.5,
                    opacity: 0.45,
                    marginTop: 3,
                    paddingInline: 6,
                  }}
                >
                  {formatTime(m.created_at)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "10px 12px 14px 12px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.20)",
          backdropFilter: "blur(14px)",
        }}
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          maxLength={2000}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            fontSize: 14.5,
            color: "inherit",
            outline: "none",
          }}
        />
        <Button
          variant="primary"
          onClick={send}
          disabled={!body.trim() || pending}
        >
          Send
        </Button>
      </div>

      {error ? (
        <div
          style={{
            padding: "6px 16px 10px",
            fontSize: 12,
            color: "#EF4444",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      ) : null}
    </main>
  );
}

export default ConversationView;
