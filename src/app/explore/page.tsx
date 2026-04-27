import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Aura } from "@/components/Aura";
import { FollowButton } from "@/components/FollowButton";
import { Glass } from "@/components/ui/Glass";
import { GradientText } from "@/components/ui/GradientText";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  user_id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  aura_stops: string[] | null;
  aura_tier: "starter" | "gold" | "platinum" | "diamond" | null;
  glyph: string | null;
  founding_member: boolean | null;
  is_diamond_club: boolean | null;
  is_verified: boolean | null;
};

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/explore");
  }

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("id,handle")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!viewerProfile?.handle) {
    redirect("/onboarding/aura");
  }

  // Pull a wide sample of public profiles, filter test, exclude self
  const { data: profilesData } = await supabase
    .from("profiles")
    .select(
      "id,user_id,handle,display_name,bio,aura_stops,aura_tier,glyph,founding_member,is_diamond_club,is_verified",
    )
    .eq("is_test", false)
    .neq("user_id", user.id)
    .not("handle", "is", null)
    .order("created_at", { ascending: false })
    .limit(60);

  const profiles = (profilesData ?? []) as ProfileRow[];

  // Resolve who the viewer already follows so FollowButton starts in the right state
  let followingSet = new Set<string>();
  if (profiles.length > 0) {
    const { data: followsData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", viewerProfile.id)
      .in(
        "following_id",
        profiles.map((p) => p.id),
      );
    followingSet = new Set(
      ((followsData ?? []) as Array<{ following_id: string }>).map(
        (r) => r.following_id,
      ),
    );
  }

  // Bucket: featured (founding/diamond/verified) vs everyone else
  const featured = profiles.filter(
    (p) => p.founding_member || p.is_diamond_club || p.is_verified,
  );
  const rest = profiles.filter(
    (p) => !p.founding_member && !p.is_diamond_club && !p.is_verified,
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px 96px",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          <GradientText gradient="sunsetText">Explore</GradientText>
        </h1>
        <p style={{ opacity: 0.65, marginTop: 6, fontSize: 14 }}>
          Find dancers, studios, and choreographers to follow. Tap an aura to
          see their profile.
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <Link
            href="/find"
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "inherit",
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Search by name
          </Link>
          <Link
            href="/feed"
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "inherit",
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Your feed
          </Link>
        </div>
      </header>

      {profiles.length === 0 ? (
        <Glass style={{ padding: 28, textAlign: "center" }}>
          <p style={{ opacity: 0.7, fontSize: 14 }}>
            No public profiles to show yet. Check back soon.
          </p>
        </Glass>
      ) : null}

      {featured.length > 0 ? (
        <section style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              opacity: 0.7,
              marginBottom: 12,
            }}
          >
            Featured
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {featured.map((p) => (
              <ProfileCardServer
                key={p.id}
                profile={p}
                initialFollowing={followingSet.has(p.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              opacity: 0.7,
              marginBottom: 12,
            }}
          >
            New on Coda
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {rest.map((p) => (
              <ProfileCardServer
                key={p.id}
                profile={p}
                initialFollowing={followingSet.has(p.id)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function ProfileCardServer({
  profile,
  initialFollowing,
}: {
  profile: ProfileRow;
  initialFollowing: boolean;
}) {
  return (
    <Glass
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href={`/u/${profile.handle}`}
          aria-label={`Open @${profile.handle} profile`}
        >
          <Aura
            gradient_stops={profile.aura_stops ?? undefined}
            tier={profile.aura_tier ?? "starter"}
            glyph={profile.glyph ?? undefined}
            size={56}
          />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            href={`/u/${profile.handle}`}
            style={{
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            @{profile.handle}
          </Link>
          {profile.display_name ? (
            <p
              style={{
                fontSize: 12,
                opacity: 0.7,
                marginTop: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {profile.display_name}
            </p>
          ) : null}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 4,
              flexWrap: "wrap",
            }}
          >
            {profile.founding_member ? (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 999,
                  background: "rgba(251,191,36,0.15)",
                  color: "#FBBF24",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Founding
              </span>
            ) : null}
            {profile.is_diamond_club ? (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 999,
                  background: "rgba(244,114,182,0.15)",
                  color: "#F472B6",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Diamond
              </span>
            ) : null}
            {profile.is_verified ? (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 999,
                  background: "rgba(96,165,250,0.15)",
                  color: "#60A5FA",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Verified
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {profile.bio ? (
        <p
          style={{
            fontSize: 13,
            opacity: 0.7,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            margin: 0,
          }}
        >
          {profile.bio}
        </p>
      ) : null}
      <div style={{ marginTop: "auto" }}>
        <FollowButton
          targetProfileId={profile.id}
          initialFollowing={initialFollowing}
        />
      </div>
    </Glass>
  );
}
