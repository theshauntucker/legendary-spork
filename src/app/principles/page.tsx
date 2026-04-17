import Link from "next/link";
import { Glass } from "@/components/ui/Glass";
import { GradientText } from "@/components/ui/GradientText";

export const metadata = {
  title: "The Fair Feed — how Coda guarantees reach",
  description:
    "Every post in Coda reaches at least 50 people in 24 hours. Here is how our feed works and why.",
};

const WEIGHTS: [string, number, string][] = [
  ["Following", 35, "Accounts you already follow get the biggest share of your feed."],
  ["Studio + Dance Bonds", 25, "Your studio mates and people you share wins with get priority."],
  ["Events", 15, "Dancers checked in to the same competition this weekend surface higher."],
  ["Fair-reach floor", 15, "Every active post gets a guaranteed minimum audience."],
  ["Discovery", 10, "New creators you'd probably love, matched by style + region."],
];

export default function PrinciplesPage() {
  return (
    <main style={{ minHeight: "100vh", padding: 32, maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1 }}>
        Every post reaches at least{" "}
        <GradientText gradient="sunsetText">50 people in 24 hours</GradientText>.
      </h1>
      <p style={{ fontSize: 17, opacity: 0.8, marginTop: 20, lineHeight: 1.6 }}>
        We built Coda for dancers and cheer kids who post their heart out and get ignored by
        every other algorithm. So we rewrote the rules. Here&apos;s how.
      </p>

      <Glass style={{ padding: 24, marginTop: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>The blend</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          {WEIGHTS.map(([label, weight, copy]) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{label}</span>
                <span style={{ opacity: 0.7 }}>{weight}%</span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  background: "rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${weight}%`,
                    background: "linear-gradient(90deg, #EC4899, #F97316, #FBBF24)",
                  }}
                />
              </div>
              <p style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>{copy}</p>
            </div>
          ))}
        </div>
      </Glass>

      <Glass style={{ padding: 24, marginTop: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>The guarantee</h2>
        <p style={{ fontSize: 15, opacity: 0.85, marginTop: 10, lineHeight: 1.6 }}>
          Every post you make is enrolled in a <strong>reach floor</strong>. If it hasn&apos;t been
          seen by at least 50 relevant people within 24 hours, Coda&apos;s system injects it into
          matching dancers&apos; feeds until it is.
        </p>
        <p style={{ fontSize: 15, opacity: 0.85, marginTop: 10, lineHeight: 1.6 }}>
          &ldquo;Relevant&rdquo; means: your age tier, your studio, your competition region, your
          style — in that order.
        </p>
      </Glass>

      <Glass style={{ padding: 24, marginTop: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>The anti-patterns</h2>
        <ul style={{ paddingLeft: 20, marginTop: 10, lineHeight: 1.8, fontSize: 15 }}>
          <li>No single account shows more than 3 times in any 20 items.</li>
          <li>Posts older than 7 days are scored 0.3×, unless you directly follow the author.</li>
          <li>We never show minors&apos; reach numbers to the public — only to the kid and the parent.</li>
          <li>No boosted posts. No paid placement. Ever.</li>
        </ul>
      </Glass>

      <p style={{ marginTop: 32, fontSize: 14, opacity: 0.7 }}>
        Want the math?{" "}
        <Link href="/our-approach" style={{ color: "#EC4899" }}>
          Read the longer version →
        </Link>
      </p>
    </main>
  );
}
