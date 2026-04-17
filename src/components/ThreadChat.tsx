"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type Msg = {
  id: string;
  body: string;
  profile_id: string;
  created_at: string;
};

type Props = { competitionId: string; date: string };

export function ThreadChat({ competitionId, date }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [handles, setHandles] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("thread_messages")
        .select("id, body, profile_id, created_at")
        .eq("competition_id", competitionId)
        .eq("competition_date", date)
        .order("created_at", { ascending: true })
        .limit(200);
      if (cancelled) return;
      const list = (data ?? []) as Msg[];
      setMessages(list);
      if (list.length) {
        const ids = Array.from(new Set(list.map((m) => m.profile_id)));
        const { data: profs } = await supabase.from("profiles").select("id, handle").in("id", ids);
        if (!cancelled) {
          const map: Record<string, string> = {};
          for (const p of profs ?? []) map[p.id] = p.handle;
          setHandles(map);
        }
      }
    })();

    const ch = supabase
      .channel(`thread:${competitionId}:${date}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "thread_messages",
          filter: `competition_id=eq.${competitionId}`,
        },
        (payload) => {
          const m = payload.new as Msg & { competition_date: string };
          if (m.competition_date === date) {
            setMessages((prev) => [...prev, m]);
          }
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [competitionId, date]);

  async function send() {
    if (!body.trim()) return;
    setPending(true);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setPending(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (!profile) {
      setPending(false);
      return;
    }
    const { error } = await supabase.from("thread_messages").insert({
      competition_id: competitionId,
      competition_date: date,
      profile_id: profile.id,
      body: body.trim().slice(0, 500),
    });
    setPending(false);
    if (!error) setBody("");
  }

  return (
    <div>
      <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ padding: 8, borderRadius: 10, background: "rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>
              @{handles[m.profile_id] ?? "unknown"}
            </p>
            <p style={{ fontSize: 14 }}>{m.body}</p>
          </div>
        ))}
        {messages.length === 0 ? (
          <p style={{ fontSize: 13, opacity: 0.6 }}>No messages yet. Be the first.</p>
        ) : null}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Say hi to the weekend…"
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 10,
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
    </div>
  );
}

export default ThreadChat;
