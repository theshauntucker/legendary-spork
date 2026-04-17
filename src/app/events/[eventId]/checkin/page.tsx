"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GradientText } from "@/components/ui/GradientText";
import { haptics } from "@/lib/haptics";

export default function CheckinPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const { eventId } = use(params);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);
    haptics.tap();
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competition_id: eventId, competition_date: date }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Could not check in.");
        setPending(false);
        return;
      }
      haptics.success();
      router.push(`/threads/${eventId}/${date}`);
    } catch {
      setError("Network error.");
      setPending(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: 32, maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36, fontWeight: 700 }}>
        <GradientText gradient="sunsetText">I&apos;m here.</GradientText>
      </h1>
      <p style={{ opacity: 0.7, marginTop: 12 }}>
        Check in so your studio, your bonds, and everyone at this event can see you&apos;re in the house.
      </p>

      <label style={{ display: "block", marginTop: 24 }}>
        <span style={{ fontSize: 13, opacity: 0.7 }}>Competition date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            marginTop: 6,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "transparent",
            width: "100%",
            color: "inherit",
          }}
        />
      </label>

      {error ? <p style={{ color: "#DC2626", marginTop: 12 }}>{error}</p> : null}

      <div style={{ marginTop: 24 }}>
        <Button variant="primary" onClick={submit} disabled={pending}>
          {pending ? "Checking in…" : "Check in"}
        </Button>
      </div>
    </main>
  );
}
