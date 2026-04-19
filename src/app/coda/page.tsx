import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import BaydaWidget from "@/components/BaydaWidget";

export const metadata: Metadata = {
  title: "Coda — the social home for dancers and cheerleaders",
  description:
    "Trophy Walls, auras instead of photos, fair-feed community for competitive dancers and cheerleaders. Built on RoutineX.",
  alternates: { canonical: "/coda" },
  openGraph: {
    title: "Coda — dance + cheer community without the photo feed",
    description:
      "Trophy Walls, auras instead of photos, a fair feed that gives everyone reach. Built for competitive dancers and cheerleaders.",
    url: "https://routinex.org/coda",
    siteName: "RoutineX",
    type: "website",
  },
};

const sunset = "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)";
const diamond = "linear-gradient(135deg, #C4B5FD, #67E8F9, #F0ABFC)";

export default function CodaLanding() {
  return (
    <main
      style={{
        background: "#0a0118",
        color: "#f3f4f6",
        minHeight: "100vh",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Mobile-first responsive styles (no Tailwind on this route) */}
      <style>{`
        .cx-shell { max-width: 960px; margin: 0 auto; padding: 56px 20px 24px 20px; }
        .cx-hero-h1 { font-size: clamp(36px, 8vw, 64px); line-height: 1.02; letter-spacing: -0.02em; font-weight: 900; }
        .cx-sub { font-size: clamp(16px, 4vw, 20px); line-height: 1.55; opacity: 0.82; max-width: 620px; }
        .cx-pill-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 20px 0 28px 0; }
        .cx-cta-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .cx-cta-primary { display:inline-flex; align-items:center; justify-content:center; padding: 14px 22px; border-radius: 14px; background: ${sunset}; color: #0a0118; font-weight: 800; font-size: 15px; box-shadow: 0 16px 40px -12px rgba(236,72,153,0.55); text-decoration: none; }
        .cx-cta-ghost { display:inline-flex; align-items:center; justify-content:center; padding: 14px 20px; border-radius: 14px; background: rgba(255,255,255,0.05); color: #fff; font-weight: 700; font-size: 15px; border: 1px solid rgba(255,255,255,0.12); text-decoration: none; }
        .cx-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin: 16px 0 56px 0; }
        .cx-card { padding: 22px; border-radius: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); }
        .cx-card h3 { font-size: 18px; font-weight: 700; letter-spacing: -0.01em; margin: 14px 0 6px 0; }
        .cx-card p { font-size: 14.5px; line-height: 1.6; opacity: 0.78; }
        .cx-icon { display:inline-flex; align-items:center; justify-content:center; width: 40px; height: 40px; border-radius: 12px; font-size: 20px; }
        .cx-section-title { font-size: clamp(24px, 5vw, 34px); font-weight: 800; letter-spacing: -0.02em; margin: 64px 0 10px 0; }
        .cx-section-sub { font-size: 15.5px; line-height: 1.6; opacity: 0.7; max-width: 640px; margin-bottom: 24px; }
        .cx-step-num { display:inline-flex; align-items:center; justify-content:center; width: 30px; height: 30px; border-radius: 50%; background: ${sunset}; color: #0a0118; font-weight: 800; font-size: 14px; flex-shrink: 0; }
        .cx-faq-q { font-size: 16px; font-weight: 700; color: #fff; }
        .cx-faq-a { font-size: 14.5px; line-height: 1.6; opacity: 0.78; margin-top: 6px; }
        .cx-safe { padding: 24px; border-radius: 20px; background: linear-gradient(135deg, rgba(196,181,253,0.12), rgba(103,232,249,0.10), rgba(240,171,252,0.12)); border: 1px solid rgba(196,181,253,0.28); }
        .cx-safe h3 { font-size: 20px; font-weight: 800; letter-spacing: -0.01em; }
        .cx-footer-cta { padding: 40px 20px; border-radius: 24px; text-align: center; margin: 56px 0 24px 0; background: linear-gradient(135deg, rgba(236,72,153,0.12), rgba(249,115,22,0.10), rgba(251,191,36,0.12)); border: 1px solid rgba(251,191,36,0.22); }
        .cx-hero-aura-row { display: flex; gap: 12px; align-items: center; margin-top: 32px; flex-wrap: wrap; }
        .cx-aura { width: 64px; height: 64px; border-radius: 50%; box-shadow: 0 16px 32px rgba(0,0,0,0.35); flex-shrink: 0; }
        @media (min-width: 720px) {
          .cx-shell { padding: 96px 32px 48px 32px; }
          .cx-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; }
        }
        @media (min-width: 1000px) {
          .cx-grid-3 { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* HERO */}
      <section
        style={{
          position: "relative",
          background:
            "radial-gradient(1200px 500px at 10% 0%, rgba(236,72,153,0.25), transparent 60%), radial-gradient(1000px 500px at 90% 10%, rgba(103,232,249,0.18), transparent 60%), #0a0118",
          paddingBottom: 16,
        }}
      >
        <div className="cx-shell">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: 3,
                background: sunset,
              }}
            />
            Coda · Live now
          </div>
          <h1 className="cx-hero-h1">
            <span
              style={{
                backgroundImage: sunset,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              The social home
            </span>
            <br />
            for dancers and cheerleaders.
          </h1>
          <p className="cx-sub" style={{ marginTop: 20 }}>
            Trophy Walls. Auras instead of photos. A fair feed where every
            studio shows up — not just the ones with the biggest followings.
            Built on RoutineX.
          </p>

          <div className="cx-pill-row">
            <Pill>No dancer photos, ever</Pill>
            <Pill>Safe DMs built in</Pill>
            <Pill>Fair-feed distribution</Pill>
            <Pill>Free credit when you join</Pill>
          </div>

          <div className="cx-cta-row">
            <Link href="/signup" className="cx-cta-primary">
              Join Coda — free credit inside →
            </Link>
            <Link href="/sample-analysis" className="cx-cta-ghost">
              See a sample analysis
            </Link>
          </div>

          <div className="cx-hero-aura-row" aria-hidden>
            <div
              className="cx-aura"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #C4B5FD, #67E8F9, #F0ABFC)",
              }}
            />
            <div
              className="cx-aura"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #FCD34D, #F59E0B, #D97706)",
              }}
            />
            <div
              className="cx-aura"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)",
              }}
            />
            <div
              className="cx-aura"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #F3F4F6, #9CA3AF, #4B5563)",
              }}
            />
            <span style={{ opacity: 0.55, fontSize: 13 }}>
              Every profile is an aura — never a face.
            </span>
          </div>
        </div>
      </section>

      <div className="cx-shell" style={{ paddingTop: 8 }}>
        {/* WHAT'S ON CODA */}
        <h2 className="cx-section-title">What you get on Coda</h2>
        <p className="cx-section-sub">
          Social built for the competition world. Every feature respects the
          fact that most dancers and cheerleaders are minors — so the rules are
          different here.
        </p>

        <div className="cx-grid cx-grid-3">
          <Feature
            icon="🏆"
            iconBg={sunset}
            title="Trophy Wall"
            body="Every Gold, High Gold, Platinum, and Diamond becomes a collectible trophy. Your profile fills up with the wins that matter."
          />
          <Feature
            icon="✨"
            iconBg={diamond}
            title="Auras, not photos"
            body="Every profile is a gradient aura and glyph. Safer, more beautiful, and impossible to doxx. Identity is yours — not a ring-light selfie."
          />
          <Feature
            icon="💬"
            iconBg="linear-gradient(135deg, #A855F7, #EC4899)"
            title="Safe DMs"
            body="Direct messages between verified accounts and adult profiles, with studio-scoped DMs for teammates. Predator-hostile by design."
          />
          <Feature
            icon="🎯"
            iconBg="linear-gradient(135deg, #FCD34D, #F59E0B)"
            title="Fair feed"
            body="Follows, studio, events, fair-reach, and discovery — weighted so every routine gets eyes. No pay-to-win ranking."
          />
          <Feature
            icon="🔗"
            iconBg="linear-gradient(135deg, #67E8F9, #F0ABFC)"
            title="Dance Bonds"
            body="Emoji relationships between dancers, coaches, and studios. Duet partners. Rival teams. Studio family. No algorithm reinvents who you are."
          />
          <Feature
            icon="🏢"
            iconBg="linear-gradient(135deg, #9333EA, #DB2777, #F472B6)"
            title="Studio Center"
            body="Shared credit pool, music-collision protection, competition schedule builder, and team dashboards. Priced for real studios."
          />
        </div>

        {/* SAFETY PROMISE */}
        <div className="cx-safe" style={{ marginTop: 8 }}>
          <h3>Our non-negotiable: no dancer photos. Ever.</h3>
          <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.6, opacity: 0.85 }}>
            Most of our community is under 18. We built Coda so identity lives
            in auras, glyphs, Trophy Wall badges, and routine names — never in a
            face. That's both a safety decision and the reason Coda looks
            nothing like anything else in dance.
          </p>
          <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.6, opacity: 0.85 }}>
            Visibility on every score, trophy, and post is user-controlled —
            public, followers, studio, or private — and enforced at the
            database level. Not just a UI toggle.
          </p>
        </div>

        {/* HOW IT WORKS */}
        <h2 className="cx-section-title">How to get started</h2>
        <div style={{ display: "grid", gap: 16, marginTop: 10 }}>
          {[
            {
              n: 1,
              t: "Create your account",
              b: "Pick a handle. Coda auto-generates your starter aura — you can refine it later.",
            },
            {
              n: 2,
              t: "Upload a routine",
              b: "Solo, duet, group, dance or cheer. The AI judges score it in ~2 minutes. You get a real score and an award level.",
            },
            {
              n: 3,
              t: "Watch your Trophy Wall fill up",
              b: "Scores ≥ 260 become collectible trophies. Share them to your feed, keep them private, or gift them to your studio.",
            },
            {
              n: 4,
              t: "Find your people",
              b: "Follow other dancers and cheerleaders. Join your studio. Spin up Dance Bonds with the teammates you compete with.",
            },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                padding: 18,
                borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="cx-step-num">{s.n}</span>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>
                  {s.t}
                </div>
                <div style={{ fontSize: 14.5, opacity: 0.76, marginTop: 4, lineHeight: 1.55 }}>
                  {s.b}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="cx-section-title">Questions</h2>
        <div style={{ display: "grid", gap: 16, marginTop: 8 }}>
          <Faq
            q="Is this just a social app, or does it do analysis too?"
            a="Both. Coda is the social layer — Trophy Walls, auras, feed, DMs. The AI analyzer that scores routines is the engine that feeds Coda. One account, one place, both things."
          />
          <Faq
            q="Is Coda safe for minors?"
            a="Yes. No photos of any kind, identity is gradient-based, DMs are gated to adult + verified studio/choreographer accounts, and visibility defaults to followers-only until a user opts in to public. Safety rules are enforced at the database level, not just the UI."
          />
          <Faq
            q="Do I need to pay to use Coda?"
            a="No — Coda itself is free. The only thing that costs money is running a new analysis. Your Trophy Wall, feed, DMs, and profile are all free forever."
          />
          <Faq
            q="What about cheer?"
            a="Cheer is first-class. Separate scoring rubric, separate copy, separate feed filters. Every feature speaks both languages."
          />
          <Faq
            q="I'm a studio owner — what do I get?"
            a="The Studio Center: shared credit pool across your dancers, a music-collision radar so two teams don't compete to the same song, a competition schedule builder, and a team dashboard. Built for directors who don't have time to log in twelve times."
          />
        </div>

        {/* FINAL CTA */}
        <div className="cx-footer-cta">
          <h2
            style={{
              fontSize: "clamp(22px, 5vw, 30px)",
              fontWeight: 800,
              letterSpacing: "-0.01em",
            }}
          >
            Come build the community we wish we'd had.
          </h2>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: 1.6,
              opacity: 0.82,
              marginTop: 10,
              maxWidth: 520,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            New members get a free credit, a starter aura, and room on the
            Trophy Wall for every Gold, Platinum, or Diamond coming their way.
          </p>
          <div className="cx-cta-row" style={{ justifyContent: "center", marginTop: 18 }}>
            <Link href="/signup" className="cx-cta-primary">
              Join Coda free →
            </Link>
            <Link href="/pricing" className="cx-cta-ghost">
              See pricing
            </Link>
          </div>
        </div>
      </div>

      <Footer />
      <BaydaWidget />
    </main>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 12.5,
        fontWeight: 700,
        padding: "6px 12px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#fff",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}

function Feature({
  icon,
  iconBg,
  title,
  body,
}: {
  icon: string;
  iconBg: string;
  title: string;
  body: string;
}) {
  return (
    <div className="cx-card">
      <span className="cx-icon" style={{ backgroundImage: iconBg, color: "#0a0118" }}>
        {icon}
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="cx-faq-q">{q}</div>
      <div className="cx-faq-a">{a}</div>
    </div>
  );
}
