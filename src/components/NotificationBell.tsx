"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { haptics } from "@/lib/haptics";
import {
  pushSupported,
  subscribePush,
  ensureServiceWorker,
  getPushPermission,
} from "@/lib/push-client";

interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pushAsked, setPushAsked] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { notifications: Notification[]; unreadCount: number };
        setItems(data.notifications);
        setUnread(data.unreadCount);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!pushSupported()) return;
    ensureServiceWorker();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    refresh();
  }

  async function askEnablePush() {
    setPushAsked(true);
    const perm = await getPushPermission();
    if (perm === "granted") return;
    await subscribePush();
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => { haptics.tap(); setOpen((v) => !v); }}
        aria-label="Notifications"
        style={{
          position: "relative",
          width: 40, height: 40,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 999,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff", cursor: "pointer",
        }}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            minWidth: 16, height: 16, padding: "0 4px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #EC4899, #F97316)",
            color: "#fff", fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: 48, right: 0, width: 340,
          maxHeight: 480, overflowY: "auto",
          background: "rgba(9,9,11,0.96)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          zIndex: 60,
        }}>
          <div style={{
            padding: "12px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{
                background: "transparent", border: "none",
                color: "rgba(255,255,255,0.65)", fontSize: 12, cursor: "pointer",
              }}>Mark all read</button>
            )}
          </div>

          {pushSupported() && !pushAsked && (
            <button onClick={askEnablePush} style={{
              width: "100%", padding: "10px 14px",
              background: "linear-gradient(90deg, rgba(236,72,153,0.15), rgba(249,115,22,0.15))",
              border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)",
              color: "#fff", fontSize: 12, textAlign: "left", cursor: "pointer",
            }}>
              Enable push notifications →
            </button>
          )}

          {loading && items.length === 0 && (
            <div style={{ padding: 20, color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center" }}>
              Loading…
            </div>
          )}
          {!loading && items.length === 0 && (
            <div style={{ padding: 20, color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center" }}>
              You&apos;re all caught up.
            </div>
          )}

          {items.map((n) => (
            <Link
              key={n.id}
              href={n.href || "#"}
              onClick={() => setOpen(false)}
              style={{
                display: "block", padding: "10px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                textDecoration: "none",
                background: n.read_at ? "transparent" : "rgba(236,72,153,0.06)",
              }}
            >
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{n.title}</div>
              {n.body && (
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 }}>{n.body}</div>
              )}
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 4 }}>
                {new Date(n.created_at).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
