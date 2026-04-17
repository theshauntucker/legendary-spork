"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Aura } from "@/components/Aura";
import { Button } from "@/components/ui/Button";
import { GradientText } from "@/components/ui/GradientText";
import { haptics } from "@/lib/haptics";
import { AURA_SEEDS, type AuraSeed } from "@/data/aura-seeds";

type AuraRow = {
  id: string;
  name: string;
  category: string;
  gradient_stops: string[];
  unlock_tier: string;
};

export default function AuraPickerPage() {
  const router = useRouter();
  const [auras, setAuras] = useState<AuraRow[]>([]);
  const [selected, setSelected] = useState<AuraRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // fallback: use local seed if table not yet populated
        setAuras(
          AURA_SEEDS.filter((a: AuraSeed) => a.unlock_tier === "starter").map((a) => ({
            id: a.id,
            name: a.name,
            category: a.category,
            gradient_stops: [...a.gradient_stops],
            unlock_tier: a.unlock_tier,
          })),
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

  async function saveAndContinue() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: session } = await supabase.auth.getUser();
    if (!session.user) {
      router.push("/login");
      return;
    }
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        aura_style: selected.id,
        aura_stops: selected.gradient_stops,
      })
      .eq("user_id", session.user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    haptics.success();
    router.push("/onboarding/handle");
  }

  return (
    <main style={{ minHeight: "100vh", padding: 32, maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700 }}>
          Pick your <GradientText gradient="sunsetText">aura</GradientText>
        </h1>
        <p style={{ opacity: 0.7, marginTop: 8 }}>
          This is how you show up in Coda. You can change it any time. No photos — ever.
        </p>
      </header>

      {Object.entries(grouped).map(([category, list]) => (
        <section key={category} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, textTransform: "capitalize", marginBottom: 12 }}>
            {category}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
              gap: 16,
            }}
          >
            {list.map((aura) => {
              const isSelected = selected?.id === aura.id;
              return (
                <button
                  key={aura.id}
                  type="button"
                  onClick={() => {
                    haptics.select();
                    setSelected(aura);
                  }}
                  style={{
                    border: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                    background: "transparent",
                    borderRadius: 16,
                    padding: 8,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                  aria-pressed={isSelected}
                >
                  <Aura gradient_stops={aura.gradient_stops} size={72} tierRing={false} />
                  <span style={{ fontSize: 12, opacity: 0.8, textAlign: "center" }}>{aura.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {error ? <p style={{ color: "#DC2626", marginBottom: 12 }}>{error}</p> : null}

      <div style={{ position: "sticky", bottom: 24, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="primary" disabled={!selected || saving} onClick={saveAndContinue}>
          {saving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </main>
  );
}
