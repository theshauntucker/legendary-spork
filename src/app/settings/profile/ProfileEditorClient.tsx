"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Aura } from "@/components/Aura";
import { Button } from "@/components/ui/Button";
import { GradientText } from "@/components/ui/GradientText";
import { Glass } from "@/components/ui/Glass";
import { validateHandle } from "@/lib/handle-validator";
import { haptics } from "@/lib/haptics";
import { AURA_SEEDS, type AuraSeed } from "@/data/aura-seeds";

type AuraTier = "starter" | "gold" | "platinum" | "diamond";

type AuraRow = {
  id: string;
  name: string;
  category: string;
  gradient_stops: string[];
  unlock_tier: string;
};

type ProfileInput = {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  aura_style: string | null;
  aura_stops: string[] | null;
  aura_tier: AuraTier;
  glyph: string | null;
};

type HandleCheck =
  | { status: "idle" }
  | { status: "unchanged" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "unavailable"; reason: string };

export default function ProfileEditorClient({
  profile,
}: {
  profile: ProfileInput;
}) {
  const router = useRouter();
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [auras, setAuras] = useState<AuraRow[]>([]);
  const [selectedAuraId, setSelectedAuraId] = useState<string | null>(
    profile.aura_style,
  );
  const [auraStops, setAuraStops] = useState<string[] | null>(
    profile.aura_stops,
  );
  const [handleCheck, setHandleCheck] = useState<HandleCheck>({
    status: "unchanged",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Debounced handle availability check (only when handle has actually changed)
  useEffect(() => {
    const trimmed = handle.trim();
    if (trimmed.toLowerCase() === profile.handle.trim().toLowerCase()) {
      setHandleCheck({ status: "unchanged" });
      return;
    }
    if (!trimmed) {
      setHandleCheck({ status: "idle" });
      return;
    }
    const local = validateHandle(trimmed);
    if (!local.valid) {
      setHandleCheck({ status: "unavailable", reason: local.reason });
      return;
    }
    setHandleCheck({ status: "checking" });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/handle/check?h=${encodeURIComponent(trimmed)}`,
        );
        const json = await res.json();
        setHandleCheck(
          json.available
            ? { status: "available" }
            : {
                status: "unavailable",
                reason: json.reason ?? "Not available.",
              },
        );
      } catch {
        setHandleCheck({
          status: "unavailable",
          reason: "Could not check handle. Try again.",
        });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [handle, profile.handle]);

  // Load aura catalog (DB first, fallback to local seeds)
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("aura_catalog")
        .select("id,name,category,gradient_stops,unlock_tier")
        .eq("unlock_tier", "starter")
        .order("name");
      if (data && data.length) {
        setAuras(data as AuraRow[]);
      } else {
        setAuras(
          AURA_SEEDS.filter((a: AuraSeed) => a.unlock_tier === "starter").map(
            (a) => ({
              id: a.id,
              name: a.name,
              category: a.category,
              gradient_stops: [...a.gradient_stops],
              unlock_tier: a.unlock_tier,
            }),
          ),
        );
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, AuraRow[]> = {};
    for (const a of auras) {
      (map[a.category] ??= []).push(a);
    }
    return map;
  }, [auras]);

  const canSave = useMemo(() => {
    if (saving) return false;
    // Block save if a handle change is pending or invalid
    if (
      handleCheck.status === "checking" ||
      handleCheck.status === "unavailable" ||
      handleCheck.status === "idle"
    ) {
      return false;
    }
    return true;
  }, [saving, handleCheck.status]);

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.push("/login");
      return;
    }

    // Build patch — only include fields that changed
    const patch: Record<string, unknown> = {};
    const trimmedHandle = handle.trim();
    if (
      handleCheck.status === "available" &&
      trimmedHandle.toLowerCase() !== profile.handle.trim().toLowerCase()
    ) {
      patch.handle = trimmedHandle;
    }
    if ((displayName ?? "").trim() !== (profile.display_name ?? "").trim()) {
      patch.display_name = displayName.trim() || null;
    }
    if ((bio ?? "").trim() !== (profile.bio ?? "").trim()) {
      patch.bio = bio.trim() ? bio.trim().slice(0, 280) : null;
    }
    if (selectedAuraId && selectedAuraId !== profile.aura_style) {
      patch.aura_style = selectedAuraId;
      if (auraStops && auraStops.length === 3) {
        patch.aura_stops = auraStops;
      }
    }

    if (Object.keys(patch).length === 0) {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      return;
    }

    const { error: upErr } = await supabase
      .from("profiles")
      .update(patch)
      .eq("user_id", auth.user.id);

    if (upErr) {
      setError(upErr.message);
      setSaving(false);
      return;
    }

    haptics.success();
    setSaving(false);
    setSuccess(true);

    // If handle changed, refresh on the new handle URL
    if (patch.handle && typeof patch.handle === "string") {
      setTimeout(() => {
        router.refresh();
        router.push(`/u/${patch.handle as string}`);
      }, 600);
      return;
    }

    setTimeout(() => setSuccess(false), 2500);
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px 96px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <Link
          href="/settings"
          style={{ fontSize: 13, opacity: 0.6, textDecoration: "none" }}
        >
          ← Settings
        </Link>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginTop: 8,
          }}
        >
          Edit your <GradientText gradient="sunsetText">profile</GradientText>
        </h1>
        <p style={{ opacity: 0.65, marginTop: 6, fontSize: 14 }}>
          Your handle, bio, and aura. Visible on your public profile at /u/
          {profile.handle || "you"}.
        </p>
      </header>

      {/* Live preview */}
      <Glass style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Aura
            gradient_stops={auraStops ?? undefined}
            tier={profile.aura_tier}
            glyph={profile.glyph ?? undefined}
            size={72}
          />
          <div>
            <p style={{ fontSize: 18, fontWeight: 700 }}>
              @{handle.trim() || profile.handle || "you"}
            </p>
            {displayName.trim() ? (
              <p style={{ fontSize: 14, opacity: 0.75 }}>
                {displayName.trim()}
              </p>
            ) : null}
            {bio.trim() ? (
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.6,
                  marginTop: 4,
                  maxWidth: 420,
                }}
              >
                {bio.trim()}
              </p>
            ) : null}
          </div>
        </div>
      </Glass>

      {/* Handle */}
      <section style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: 8,
          }}
        >
          Handle
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--border, rgba(255,255,255,0.12))",
            background: "var(--surface, rgba(255,255,255,0.04))",
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
              color: "inherit",
            }}
          />
        </div>
        <p style={{ marginTop: 6, fontSize: 12, minHeight: 18 }}>
          {handleCheck.status === "unchanged" ? (
            <span style={{ opacity: 0.4 }}>Current handle.</span>
          ) : null}
          {handleCheck.status === "checking" ? (
            <span style={{ opacity: 0.6 }}>Checking…</span>
          ) : null}
          {handleCheck.status === "available" ? (
            <span style={{ color: "#16A34A" }}>Available</span>
          ) : null}
          {handleCheck.status === "unavailable" ? (
            <span style={{ color: "#F87171" }}>{handleCheck.reason}</span>
          ) : null}
        </p>
      </section>

      {/* Display name */}
      <section style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: 8,
          }}
        >
          Display name
        </h2>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value.slice(0, 60))}
          placeholder="Optional — your studio name or first name"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--border, rgba(255,255,255,0.12))",
            background: "var(--surface, rgba(255,255,255,0.04))",
            color: "inherit",
            fontSize: 16,
            outline: "none",
          }}
        />
      </section>

      {/* Bio */}
      <section style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: 8,
          }}
        >
          Bio
        </h2>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 280))}
          placeholder="A line or two — style, studio, goals."
          rows={4}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--border, rgba(255,255,255,0.12))",
            background: "var(--surface, rgba(255,255,255,0.04))",
            color: "inherit",
            fontSize: 15,
            outline: "none",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
        <div
          style={{
            fontSize: 11,
            opacity: 0.5,
            marginTop: 4,
            textAlign: "right",
          }}
        >
          {bio.length} / 280
        </div>
      </section>

      {/* Aura */}
      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: 12,
          }}
        >
          Aura
        </h2>
        <p
          style={{
            fontSize: 13,
            opacity: 0.6,
            marginBottom: 16,
            marginTop: -4,
          }}
        >
          No photos — ever. Pick how you show up in Coda.
        </p>

        {Object.entries(grouped).map(([category, list]) => (
          <div key={category} style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: "capitalize",
                opacity: 0.85,
                marginBottom: 10,
              }}
            >
              {category}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                gap: 12,
              }}
            >
              {list.map((aura) => {
                const isSelected = selectedAuraId === aura.id;
                return (
                  <button
                    key={aura.id}
                    type="button"
                    onClick={() => {
                      haptics.select();
                      setSelectedAuraId(aura.id);
                      setAuraStops(aura.gradient_stops);
                    }}
                    style={{
                      border: isSelected
                        ? "2px solid var(--accent, #F0ABFC)"
                        : "2px solid transparent",
                      background: "transparent",
                      borderRadius: 14,
                      padding: 6,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                    aria-pressed={isSelected}
                    title={aura.name}
                  >
                    <Aura
                      gradient_stops={aura.gradient_stops}
                      size={64}
                      tierRing={false}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        opacity: 0.75,
                        textAlign: "center",
                      }}
                    >
                      {aura.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {error ? (
        <p
          style={{
            color: "#F87171",
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          style={{
            color: "#34D399",
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          Saved.
        </p>
      ) : null}

      <div
        style={{
          position: "sticky",
          bottom: 16,
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          paddingTop: 16,
        }}
      >
        <Link
          href={profile.handle ? `/u/${profile.handle}` : "/dashboard"}
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "inherit",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Cancel
        </Link>
        <Button variant="primary" disabled={!canSave} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </main>
  );
}
