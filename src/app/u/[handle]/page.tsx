import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Aura } from "@/components/Aura";
import { TrophyWall } from "@/components/TrophyWall";
import { FollowButton } from "@/components/FollowButton";
import { MessageButton } from "@/components/MessageButton";
import { AddTrophyButton } from "@/components/AddTrophyButton";
import { EditProfileButton } from "@/components/EditProfileButton";
import type { TrophyCardData } from "@/components/TrophyCard";

type ProfileRow = {
  id: string;
  user_id: string;
  handle: string;
  display_name: string | null;
  profile_type: "dancer" | "parent" | "studio" | "choreographer";
  age_tier: "minor" | "teen" | "adult" | null;
  aura_stops: string[] | null;
  aura_tier: "starter" | "gold" | "platinum" | "diamond" | null;
  glyph: string | null;
  founding_member: boolean;
  is_diamond_club: boolean;
  is_verified: boolean;
  bio: string | null;
};

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select(
      "id,user_id,handle,display_name,profile_type,age_tier,aura_stops,aura_tier,glyph,founding_member,is_diamond_club,is_verified,bio",
    )
    .ilike("handle", handle)
    .maybeSingle();

  if (!profileRow) notFound();
  const profile = profileRow as ProfileRow;

  const { data: auth } = await supabase.auth.getUser();
  const isOwner = auth.user?.id === profile.user_id;

  const [{ count: followerCount }, { count: followingCount }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile.id),
    ]);

  let isFollowing = false;
  let viewerCanDM = false;
  let viewerDMReason: string | undefined;
  if (auth.user && !isOwner) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("id, age_tier, profile_type, is_verified")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (viewerProfile) {
      const { data: followRow } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", viewerProfile.id)
        .eq("following_id", profile.id)
        .maybeSingle();
      isFollowing = !!followRow;

      // Both parties must be Tier 2 (adult OR verified studio/choreographer).
      const viewerT2 =
        viewerProfile.age_tier === "adult" ||
        ((viewerProfile.profile_type === "studio" ||
          viewerProfile.profile_type === "choreographer") &&
          viewerProfile.is_verified);
      const targetT2 =
        profile.profile_type === "studio" ||
        profile.profile_type === "choreographer"
          ? profile.is_verified
          : profile.age_tier === "adult";
      viewerCanDM = viewerT2 && targetT2;
      if (!viewerT2) viewerDMReason = "DMs require an adult account";
      else if (!targetT2) viewerDMReason = "This profile can't receive DMs yet";
    }
  }

  const { data: rawTrophies } = await supabase
    .from("achievements")
    .select(
      "id, award_level, total_score, competition_name, competition_date, category, video_id",
    )
    .eq("profile_id", profile.id)
    .order("earned_at", { ascending: false });

  const trophyList = rawTrophies ?? [];
  const videoIds = trophyList.map((t) => t.video_id).filter(Boolean) as string[];

  const { data: videos } = videoIds.length
    ? await supabase
        .from("videos")
        .select("id, routine_name, style, entry_type")
        .in("id", videoIds)
    : {
        data: [] as Array<{
          id: string;
          routine_name: string | null;
          style: string | null;
          entry_type: string | null;
        }>,
      };

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
  const visMap = new Map(
    (visSettings ?? []).map((v) => [v.item_id, v.visibility]),
  );

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
      visibility:
        (visMap.get(t.id) as TrophyCardData["visibility"]) ?? "private",
    };
  });

  const highestScore = trophies.reduce(
    (max, t) => (t.total_score > max ? t.total_score : max),
    0,
  );
  const diamondCount = trophies.filter((t) => t.award_level === "diamond").length;
  const platinumCount = trophies.filter((t) => t.award_level === "platinum")
    .length;

  const heroStops =
    profile.aura_stops ?? ["#C4B5FD", "#67E8F9", "#F0ABFC"];
  const heroGradient = `linear-gradient(135deg, ${heroStops[0]} 0%, ${heroStops[1]} 50%, ${heroStops[2]} 100%)`;

  return (
    <main
      style={{
        minHeight: "100vh",
        paddingBottom: 64,
      }}
    >
      {/* Hero banner — aura-tinted atmospheric gradient */}
      <style>{`
        .rx-hero { height: 140px; }
        .rx-profile-card { margin-top: -56px !important; padding: 18px !important; }
        .rx-profile-row { gap: 16px !important; }
        .rx-profile-aura { margin-top: -64px !important; padding: 3px !important; }
        .rx-profile-aura > div { width: 112px !important; height: 112px !important; }
        .rx-profile-name { font-size: 24px !important; }
        .rx-stats-row { grid-template-columns: repeat(auto-fit, minmax(84px, 1fr)) !important; gap: 10px !important; margin-top: 18px !important; padding-top: 16px !important; }
        .rx-stat-value { font-size: 20px !important; }
        @media (min-width: 640px) {
          .rx-hero { height: 200px; }
          .rx-profile-card { margin-top: -72px !important; padding: 24px !important; }
          .rx-profile-row { gap: 24px !important; }
          .rx-profile-aura { margin-top: -80px !important; padding: 4px !important; }
          .rx-profile-aura > div { width: 144px !important; height: 144px !important; }
          .rx-profile-name { font-size: 32px !important; }
          .rx-stats-row { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important; gap: 12px !important; margin-top: 24px !important; padding-top: 20px !important; }
          .rx-stat-value { font-size: 24px !important; }
        }
      `}</style>
      <section
        className="rx-hero"
        style={{
          position: "relative",
          background: heroGradient,
          opacity: 0.95,
        }}
      >
        {/* Soft top-down fade for legibility */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.45) 100%)",
          }}
        />
        {/* Grain / noise texture via layered gradient */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(800px 200px at 20% 10%, rgba(255,255,255,0.18), transparent 60%), radial-gradient(500px 180px at 85% 90%, rgba(255,255,255,0.10), transparent 60%)",
            mixBlendMode: "screen",
          }}
        />
      </section>

      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Profile card — pulled up over hero */}
        <section
          className="rx-profile-card"
          style={{
            borderRadius: 20,
            background: "var(--surface, rgba(255,255,255,0.04))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className="rx-profile-row"
            style={{
              display: "flex",
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div
              className="rx-profile-aura"
              style={{
                borderRadius: "50%",
                background: "var(--surface, #fff)",
                boxShadow: "0 16px 36px rgba(0,0,0,0.25)",
              }}
            >
              <Aura
                gradient_stops={profile.aura_stops ?? undefined}
                tier={profile.aura_tier ?? "starter"}
                glyph={profile.glyph ?? undefined}
                size={144}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1
                className="rx-profile-name"
                style={{
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                {profile.display_name ?? `@${profile.handle}`}
              </h1>
              <p
                style={{
                  opacity: 0.55,
                  marginTop: 4,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                @{profile.handle}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  flexWrap: "wrap",
                }}
              >
                <Badge>{profile.profile_type}</Badge>
                {profile.founding_member ? (
                  <Badge tone="gold">Founding</Badge>
                ) : null}
                {profile.is_diamond_club ? (
                  <Badge tone="diamond">Diamond Club</Badge>
                ) : null}
                {profile.is_verified ? (
                  <Badge tone="accent">Verified</Badge>
                ) : null}
              </div>
            </div>
            {!isOwner && auth.user ? (
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <FollowButton
                  targetProfileId={profile.id}
                  initialFollowing={isFollowing}
                />
                <MessageButton
                  targetProfileId={profile.id}
                  disabled={!viewerCanDM}
                  disabledReason={viewerDMReason}
                />
              </div>
            ) : null}
          </div>

          {/* Bio */}
          {profile.bio ? (
            <p
              style={{
                marginTop: 16,
                fontSize: 14,
                lineHeight: 1.5,
                opacity: 0.8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {profile.bio}
            </p>
          ) : null}

          {/* Stats row */}
          <div
            className="rx-stats-row"
            style={{
              display: "grid",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Stat label="Followers" value={followerCount ?? 0} />
            <Stat label="Following" value={followingCount ?? 0} />
            <Stat label="Trophies" value={trophies.length} />
            <Stat
              label="High Score"
              value={highestScore ? Math.round(highestScore) : "—"}
              accent
            />
            {diamondCount > 0 ? (
              <Stat label="Diamond" value={diamondCount} tone="diamond" />
            ) : null}
            {!diamondCount && platinumCount > 0 ? (
              <Stat label="Platinum" value={platinumCount} tone="platinum" />
            ) : null}
          </div>
        </section>

        <section style={{ marginTop: 40 }}>
          <header
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              Trophy Wall
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 13, opacity: 0.55 }}>
                {trophies.length}{" "}
                {trophies.length === 1 ? "trophy" : "trophies"}
              </span>
              {isOwner ? <AddTrophyButton /> : null}
            </div>
          </header>
          <TrophyWall
            handle={profile.handle}
            isOwner={isOwner}
            trophies={trophies}
          />
          {isOwner ? <EditProfileButton bio={profile.bio ?? ""} /> : null}
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  tone?: "diamond" | "platinum";
}) {
  const valueStyle: React.CSSProperties = accent
    ? {
        fontWeight: 800,
        letterSpacing: "-0.02em",
        backgroundImage:
          "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }
    : tone === "diamond"
      ? {
          fontWeight: 800,
          letterSpacing: "-0.02em",
          backgroundImage:
            "linear-gradient(135deg, #C4B5FD, #67E8F9, #F0ABFC)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }
      : tone === "platinum"
        ? {
            fontWeight: 800,
            letterSpacing: "-0.02em",
            backgroundImage:
              "linear-gradient(135deg, #F3F4F6, #9CA3AF, #4B5563)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }
        : {
            fontWeight: 700,
            letterSpacing: "-0.02em",
          };
  return (
    <div>
      <div className="rx-stat-value" style={valueStyle}>{value}</div>
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          opacity: 0.55,
          fontWeight: 600,
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "gold" | "diamond" | "accent";
}) {
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
        fontWeight: 700,
        padding: "5px 12px",
        borderRadius: 999,
        background: toneMap[tone],
        color: isGradient ? "#1A1A1F" : "inherit",
        textTransform: "capitalize",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}
