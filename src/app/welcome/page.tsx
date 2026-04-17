"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Glass } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { GradientText } from "@/components/ui/GradientText";
import { gradients } from "@/lib/gradients";
import { haptics } from "@/lib/haptics";

type MemberType = "dancer" | "parent" | "studio" | "choreographer";

const MEMBER_TYPES: { id: MemberType; title: string; tagline: string; gradient: keyof typeof gradients }[] = [
  {
    id: "dancer",
    title: "Dancer",
    tagline: "Post wins, earn trophies, build your year.",
    gradient: "sunset",
  },
  {
    id: "parent",
    title: "Parent",
    tagline: "Follow your kid, manage consent, one-tap pause.",
    gradient: "magentaRush",
  },
  {
    id: "studio",
    title: "Studio",
    tagline: "Claim your page, recruit, prove ROI.",
    gradient: "auraGold",
  },
  {
    id: "choreographer",
    title: "Choreographer",
    tagline: "Credited routines become your portfolio.",
    gradient: "berryGlow",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [picking, setPicking] = useState<MemberType | null>(null);

  async function choose(type: MemberType) {
    haptics.select();
    setPicking(type);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.push("/login");
      return;
    }

    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    const foundingSlot = (count ?? 0) < 1000;

    // age_tier is required by the profiles table; we default to "adult" — a later
    // step (or parent verification flow) can downgrade to "teen" or "minor".
    await supabase.from("profiles").upsert(
      {
        user_id: auth.user.id,
        handle: `user_${auth.user.id.slice(0, 8)}`,
        profile_type: type,
        age_tier: "adult",
        founding_member: foundingSlot,
      },
      { onConflict: "user_id" },
    );
    router.push("/onboarding/aura");
  }

  return (
    <main style={{ minHeight: "100vh", padding: 32, maxWidth: 820, margin: "0 auto" }}>
      <header style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, opacity: 0.6, textTransform: "uppercase", letterSpacing: 2 }}>
          Welcome to Coda
        </p>
        <h1 style={{ fontSize: 42, fontWeight: 800, marginTop: 8 }}>
          Who are you, <GradientText gradient="sunsetText">really</GradientText>?
        </h1>
        <p style={{ opacity: 0.7, marginTop: 10, fontSize: 16 }}>
          Pick one. You can switch later. Your whole Coda experience tunes to this.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {MEMBER_TYPES.map((m) => (
          <Glass key={m.id} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                height: 80,
                borderRadius: 14,
                backgroundImage: gradients[m.gradient],
              }}
            />
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>{m.title}</h2>
            <p style={{ fontSize: 14, opacity: 0.75, flex: 1 }}>{m.tagline}</p>
            <Button
              variant="primary"
              onClick={() => choose(m.id)}
              disabled={picking !== null}
            >
              {picking === m.id ? "Setting up…" : `I'm a ${m.title}`}
            </Button>
          </Glass>
        ))}
      </div>
    </main>
  );
}
