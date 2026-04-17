import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Aura } from "@/components/Aura";
import { TrophyWall } from "@/components/TrophyWall";
import type { TrophyCardData } from "@/components/TrophyCard";

type ProfileRow = {
  id: string;
  user_id: string;
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

  const { data: profileRow } = await supabase
    .from("profiles")
    .select(
      "id,user_id,handle,display_name,profile_type,aura_stops,aura_tier,glyph,founding_member,is_diamond_club,is_verified",
    )
    .ilike("handle", handle)
    .maybeSingle();

  if (!profileRow) notFound();
  const profile = profileRow as ProfileRow;

  const { data: auth } = await supabase.auth.getUser();
  const isOwner = auth.user?.id === profile.user_id;

  const { data: rawTrophies } = await supabase
    .from("achievements")
    .select("id, award_level, total_score, competition_name, competition_date, category, video_id")
    .eq("profile_id", profile.id)
    .order("earned_at", { ascending: false });

  const trophyList = rawTrophies ?? [];
  const videoIds = trophyList.map((t) => t.video_id).filter(Boolean) as string[];

  const { data: videos } = videoIds.length
    ? await supabase.from("videos").select("id, routine_name, style, entry_type").in("id", videoIds)
    : { data: [] as Array<{ id: string; routine_name: string | null; style: string | null; entry_type: string | null }> };

  const { data: visSettings } = trophyList.length
    ? await supabase
        .from("visibility_settings")
        .select("item_id, visibility")
        .eq("item_type", "achievement")
        .in(
          "item_id",
          trophyList.map((t) => t.id),
        )
    : { data: [] as Array<{ item_id: string; visibility: string }> };

  const videoMap = new Map((videos ?? []).map((v) => [v.id, v]));
  const visMap = new Map((visSettings ?? []).map((v) => [v.item_id, v.visibility]));

  const trophies: TrophyCardData[] = trophyList.map((t) => {
    const v = t.video_id ? videoMap.get(t.video_id) : undefined;
    return {
      id: t.id,
      award_level: t.award_level as TrophyCardData["award_level"],
      total_score: Number(t.total_score),
      routine_name: v?.routine_name ?? null,
      style: v?.style ?? t.category ?? null,
      entry_type: v?.entry_type ?? null,
      competition_name: t.competition_name,
      competition_date: t.competition_date,
      visibility: (visMap.get(t.id) as TrophyCardData["visibility"]) ?? "private",
    };
  });

  return (
    <main style={{ minHeight: "100vh", padding: 32, maxWidth: 960, margin: "0 auto" }}>
      <section style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 32 }}>
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

      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Trophies</h2>
        <TrophyWall handle={profile.handle} isOwner={isOwner} trophies={trophies} />
      </section>
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
