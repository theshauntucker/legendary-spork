import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Glass } from "@/components/ui/Glass";

export const dynamic = "force-dynamic";

type StudioRow = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  state: string | null;
  website: string | null;
  logo_gradient: string[] | null;
  claimed_by: string | null;
  verified: boolean;
};

export default async function StudioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("studios")
    .select("id, slug, name, city, state, website, logo_gradient, claimed_by, verified")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) notFound();
  const studio = data as StudioRow;

  const { data: dancers } = await supabase
    .from("profiles")
    .select("id, handle, display_name, aura_stops, aura_tier")
    .eq("studio_id", studio.id)
    .limit(40);

  const stops = studio.logo_gradient ?? ["#EC4899", "#F97316", "#FBBF24"];

  return (
    <main style={{ minHeight: "100vh", maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <header
        style={{
          padding: 32,
          borderRadius: 20,
          backgroundImage: `linear-gradient(135deg, ${stops.join(", ")})`,
          color: "#fff",
          position: "relative",
        }}
      >
        <h1 style={{ fontSize: 40, fontWeight: 800 }}>{studio.name}</h1>
        <p style={{ marginTop: 6, opacity: 0.9 }}>
          {[studio.city, studio.state].filter(Boolean).join(", ") || "—"}
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          {studio.verified ? <Tag>Verified</Tag> : null}
          {studio.claimed_by ? <Tag>Claimed</Tag> : <Tag>Unclaimed</Tag>}
        </div>
        {studio.website ? (
          <a
            href={studio.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", marginTop: 16, color: "#fff", textDecoration: "underline" }}
          >
            {studio.website}
          </a>
        ) : null}
      </header>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Dancers</h2>
        {!dancers?.length ? (
          <Glass style={{ padding: 16 }}>
            <p style={{ opacity: 0.7, fontSize: 14 }}>No dancers have linked this studio yet.</p>
          </Glass>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {dancers.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/u/${d.handle}`}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.06)",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  @{d.handle}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!studio.claimed_by ? (
        <Glass style={{ padding: 20, marginTop: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600 }}>Own this studio?</h3>
          <p style={{ fontSize: 14, opacity: 0.75, marginTop: 4 }}>
            Claim this page with your studio email. We'll verify within 48h.
          </p>
          <ClaimLink entityType="studio" slug={studio.slug} />
        </Glass>
      ) : null}
    </main>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 10px",
        borderRadius: 999,
        background: "rgba(0,0,0,0.15)",
        color: "#fff",
        textTransform: "uppercase",
        letterSpacing: 1,
      }}
    >
      {children}
    </span>
  );
}

function ClaimLink({ entityType, slug }: { entityType: "studio" | "choreographer"; slug: string }) {
  return (
    <a
      href={`mailto:22tucker22@comcast.net?subject=Claim%20${entityType}%3A%20${slug}&body=Please%20verify%20I%20own%20this%20${entityType}%20page.%20My%20proof%20email%3A%20`}
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
  );
}
