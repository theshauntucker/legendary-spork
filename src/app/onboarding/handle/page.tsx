"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { GradientText } from "@/components/ui/GradientText";
import { validateHandle } from "@/lib/handle-validator";
import { haptics } from "@/lib/haptics";

type CheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "unavailable"; reason: string };

export default function HandlePickerPage() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [check, setCheck] = useState<CheckState>({ status: "idle" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = handle.trim();
    if (!trimmed) {
      setCheck({ status: "idle" });
      return;
    }
    const local = validateHandle(trimmed);
    if (!local.valid) {
      setCheck({ status: "unavailable", reason: local.reason });
      return;
    }
    setCheck({ status: "checking" });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/handle/check?h=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        setCheck(
          json.available
            ? { status: "available" }
            : { status: "unavailable", reason: json.reason ?? "Not available." },
        );
      } catch {
        setCheck({ status: "unavailable", reason: "Could not check handle. Try again." });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [handle]);

  async function saveAndContinue() {
    if (check.status !== "available") return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/login");
      return;
    }
    const { error: upErr } = await supabase
      .from("profiles")
      .update({ handle: handle.trim() })
      .eq("user_id", data.user.id);
    if (upErr) {
      setError(upErr.message);
      setSaving(false);
      return;
    }
    haptics.success();
    router.push(`/u/${handle.trim()}`);
  }

  return (
    <main style={{ minHeight: "100vh", padding: 32, maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
        Claim your <GradientText gradient="sunsetText">@handle</GradientText>
      </h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        This is your address in Coda. Pick carefully — changes cost goodwill.
      </p>

      <label style={{ display: "block", marginBottom: 16 }}>
        <span style={{ display: "block", fontSize: 13, opacity: 0.7, marginBottom: 6 }}>Handle</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <span style={{ opacity: 0.5 }}>@</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="your_handle"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 16,
              color: "var(--text)",
            }}
          />
        </div>
        <p style={{ marginTop: 8, fontSize: 13, minHeight: 20 }}>
          {check.status === "checking" ? <span style={{ opacity: 0.6 }}>Checking…</span> : null}
          {check.status === "available" ? (
            <span style={{ color: "#16A34A" }}>Available</span>
          ) : null}
          {check.status === "unavailable" ? (
            <span style={{ color: "#DC2626" }}>{check.reason}</span>
          ) : null}
        </p>
      </label>

      {error ? <p style={{ color: "#DC2626", marginBottom: 12 }}>{error}</p> : null}

      <Button variant="primary" disabled={check.status !== "available" || saving} onClick={saveAndContinue}>
        {saving ? "Saving…" : "Continue"}
      </Button>
    </main>
  );
}
