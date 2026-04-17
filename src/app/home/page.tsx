import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Glass } from "@/components/ui/Glass";
import { GradientText } from "@/components/ui/GradientText";
import { FeedCard } from "@/components/FeedCard";
import { buildFeed } from "@/lib/fair-feed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, display_name, studio_id, aura_stops, aura_tier, glyph")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/welcome");
  }

  const { items } = await buildFeed({
    viewerProfileId: profile.id,
    viewerStudioId: profile.studio_id ?? null,
    limit: 20,
    cursor: null,
  });

  const reachToday = null as number | null;

  return (
    <main style={{ minHeight: "100vh", padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <Glass style={{ padding: 20, marginBottom: 24 }}>
        <p style={{ fontSize: 12, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1 }}>
          Your reach today
        </p>
        <p style={{ fontSize: 36, fontWeight: 700, marginTop: 4 }}>
          <GradientText gradient="sunsetText">
            {reachToday === null ? "—" : reachToday.toLocaleString()}
          </GradientText>
        </p>
        <p style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
          Every post you make reaches at least 50 people in 24 hours.{" "}
          <Link href="/principles" style={{ color: "#EC4899" }}>How it works →</Link>
        </p>
      </Glass>

      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Feed</h2>
        {items.length === 0 ? (
          <Glass style={{ padding: 24 }}>
            <p style={{ fontSize: 14, opacity: 0.7 }}>
              Your feed is quiet. Follow some dancers on{" "}
              <Link href="/find" style={{ color: "#EC4899" }}>Find</Link> to fill it up.
            </p>
          </Glass>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
