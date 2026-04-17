import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Glass } from "@/components/ui/Glass";

export const dynamic = "force-dynamic";

type ChoreoRow = {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  website: string | null;
  claimed_by: string | null;
  verified: boolean;
};

export default async function ChoreographerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("choreographers")
    .select("id, slug, name, bio, website, claimed_by, verified")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) notFound();
  const choreo = data as ChoreoRow;

  return (
    <main style={{ minHeight: "100vh", maxWidth: 760, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 40, fontWeight: 800, fontFamily: "var(--font-display, serif)" }}>
        {choreo.name}
      </h1>
      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        {choreo.verified ? <Tag tone="accent">Verified</Tag> : null}
        {choreo.claimed_by ? <Tag>Claimed</Tag> : <Tag>Unclaimed</Tag>}
      </div>

      {choreo.bio ? (
        <p style={{ marginTop: 20, opacity: 0.85, lineHeight: 1.6 }}>{choreo.bio}</p>
      ) : null}

      {choreo.website ? (
        <a
          href={choreo.website}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: 12, color: "#EC4899" }}
        >
          {choreo.website}
        </a>
      ) : null}

      <Glass style={{ padding: 20, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Credited routines</h2>
        <p style={{ opacity: 0.7, fontSize: 14, marginTop: 6 }}>
          Dancers can credit {choreo.name} on their routine uploads. Credited routines will appear here.
        </p>
      </Glass>

      {!choreo.claimed_by ? (
        <Glass style={{ padding: 20, marginTop: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600 }}>Is this you?</h3>
          <p style={{ fontSize: 14, opacity: 0.75, marginTop: 4 }}>
            Claim this page with your professional email. We'll verify.
          </p>
          <a
            href={`mailto:22tucker22@comcast.net?subject=Claim%20choreographer%3A%20${choreo.slug}&body=Please%20verify%20I%20am%20${choreo.name}.%20Proof%20email%3A%20`}
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "8px 16px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)",
              color: "#fff",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Claim this page
          </a>
        </Glass>
      ) : null}
    </main>
  );
}

function Tag({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "accent" }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 10px",
        borderRadius: 999,
        background: tone === "accent" ? "rgba(236,72,153,0.2)" : "rgba(0,0,0,0.06)",
        textTransform: "uppercase",
        letterSpacing: 1,
      }}
    >
      {children}
    </span>
  );
}
