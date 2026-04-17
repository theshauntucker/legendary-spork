import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Aura } from "@/components/Aura";
import { Glass } from "@/components/ui/Glass";

type ProfileRow = {
  id: string;
  handle: string;
  display_name: string | null;
  profile_type: "dancer" | "parent" | "studio" | "choreographer";
  aura_stops: string[] | null;
  aura_tier: "starter" | "gold" | "platinum" | "diamond" | null;
  glyph: string | null;
  founding_member: boolean;
  is_diamond_club: boolean;
  is_verified: boolean;
};

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id,handle,display_name,profile_type,aura_stops,aura_tier,glyph,founding_member,is_diamond_club,is_verified",
    )
    .ilike("handle", handle)
    .maybeSingle();

  if (!data) notFound();
  const profile = data as ProfileRow;

  return (
    <main style={{ minHeight: "100vh", padding: 32, maxWidth: 760, margin: "0 auto" }}>
      <section
        style={{
          display: "flex",
          gap: 24,
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Aura
          gradient_stops={profile.aura_stops ?? undefined}
          tier={profile.aura_tier ?? "starter"}
          glyph={profile.glyph ?? undefined}
          size={128}
        />
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>
            {profile.display_name ?? `@${profile.handle}`}
          </h1>
          <p style={{ opacity: 0.6, marginTop: 4 }}>@{profile.handle}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <Badge>{profile.profile_type}</Badge>
            {profile.founding_member ? <Badge tone="gold">Founding</Badge> : null}
            {profile.is_diamond_club ? <Badge tone="diamond">Diamond Club</Badge> : null}
            {profile.is_verified ? <Badge tone="accent">Verified</Badge> : null}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 14, opacity: 0.7 }}>
            <span><strong>—</strong> followers</span>
            <span><strong>—</strong> following</span>
          </div>
        </div>
      </section>

      <Glass style={{ padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Trophy Wall</h2>
        <p style={{ opacity: 0.7, fontSize: 14 }}>
          Trophies are coming. When this user scores Gold or higher, their wins will land here.
        </p>
      </Glass>
    </main>
  );
}

function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "gold" | "diamond" | "accent" }) {
  const toneMap: Record<string, string> = {
    default: "rgba(0,0,0,0.08)",
    gold: "linear-gradient(135deg, #FCD34D, #F59E0B, #D97706)",
    diamond: "linear-gradient(135deg, #C4B5FD, #67E8F9, #F0ABFC)",
    accent: "rgba(236, 72, 153, 0.15)",
  };
  const isGradient = tone === "gold" || tone === "diamond";
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 999,
        background: toneMap[tone],
        color: isGradient ? "#1A1A1F" : "inherit",
        textTransform: "capitalize",
      }}
    >
      {children}
    </span>
  );
}
