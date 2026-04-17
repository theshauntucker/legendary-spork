"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { haptics } from "@/lib/haptics";

type Msg = {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  body: string;
  created_at: string;
};

type Props = {
  conversationId: string;
  selfProfileId: string;
};

export function ConversationView({ conversationId, selfProfileId }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_profile_id, body, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (!cancelled) setMessages((data ?? []) as Msg[]);
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
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Msg]);
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    if (!body.trim()) return;
    setPending(true);
    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: conversationId, body: body.trim() }),
    });
    if (res.ok) {
      setBody("");
      haptics.success();
    }
    setPending(false);
  }

  return (
    <main style={{ minHeight: "100vh", padding: 16, maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          paddingBottom: 16,
        }}
      >
        {messages.map((m) => {
          const isMine = m.sender_profile_id === selfProfileId;
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isMine ? "flex-end" : "flex-start",
                maxWidth: "72%",
                padding: "8px 14px",
                borderRadius: 18,
                backgroundImage: isMine
                  ? "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)"
                  : undefined,
                background: isMine ? undefined : "rgba(0,0,0,0.06)",
                color: isMine ? "#fff" : "inherit",
                fontSize: 14,
              }}
            >
              {m.body}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 6, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
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
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid var(--border)",
            background: "transparent",
            fontSize: 14,
            color: "inherit",
          }}
        />
        <Button variant="primary" onClick={send} disabled={!body.trim() || pending}>
          Send
        </Button>
      </div>
    </main>
  );
}

export default ConversationView;
