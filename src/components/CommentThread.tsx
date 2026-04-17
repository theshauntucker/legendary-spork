"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type Comment = {
  id: string;
  body: string;
  profile_id: string;
  parent_comment_id: string | null;
  created_at: string;
};

type AuthorLite = { id: string; handle: string; aura_stops: string[] | null };

type Props = {
  postId: string;
  postType: "achievement" | "post";
};

export function CommentThread({ postId, postType }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authors, setAuthors] = useState<Record<string, AuthorLite>>({});
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/comments?post_id=${postId}&post_type=${postType}`);
      if (!res.ok) return;
      const json = await res.json();
      if (cancelled) return;
      const list = (json.items ?? []) as Comment[];
      setComments(list);
      if (list.length) {
        const ids = Array.from(new Set(list.map((c) => c.profile_id)));
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("id, handle, aura_stops")
          .in("id", ids);
        const map: Record<string, AuthorLite> = {};
        for (const a of data ?? []) map[a.id] = a as AuthorLite;
        if (!cancelled) setAuthors(map);
      }
    }
    load();

    const supabase = createClient();
    const ch = supabase
      .channel(`comments:${postType}:${postId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
        (payload) => {
          const next = payload.new as Comment;
          setComments((prev) => [...prev, next]);
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [postId, postType]);

  async function submit() {
    if (!body.trim()) return;
    setPending(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, post_type: postType, body }),
    });
    setPending(false);
    if (res.ok) setBody("");
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {comments.map((c) => (
          <div
            key={c.id}
            style={{
              padding: 10,
              borderRadius: 10,
              background: "rgba(0,0,0,0.04)",
              fontSize: 14,
              marginLeft: c.parent_comment_id ? 20 : 0,
            }}
          >
            <p style={{ fontWeight: 600, fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
              @{authors[c.profile_id]?.handle ?? "unknown"}
            </p>
            <p>{c.body}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
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
        <Button variant="primary" onClick={submit} disabled={!body.trim() || pending}>
          Post
        </Button>
      </div>
    </div>
  );
}

export default CommentThread;
