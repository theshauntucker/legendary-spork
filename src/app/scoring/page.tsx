import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dance Competition Scoring Guides — Every Style Explained",
  description:
    "Complete guides to dance competition scoring for every style: Jazz, Contemporary, Lyrical, Ballet, Hip Hop, Tap, Acro, Musical Theater, Pom, Cheer, and more. Learn what judges look for and how to score higher.",
  keywords: [
    "dance competition scoring guide",
    "what do dance judges look for",
    "dance competition scoring rubric",
    "how to score higher at dance competition",
    "dance competition tips by style",
    "dance competition deductions",
  ],
  alternates: {
    canonical: "/scoring",
  },
};

const styles = [
  { slug: "jazz", name: "Jazz", emoji: "Jazz" },
  { slug: "contemporary", name: "Contemporary", emoji: "Contemporary" },
  { slug: "lyrical", name: "Lyrical", emoji: "Lyrical" },
  { slug: "ballet", name: "Ballet", emoji: "Ballet" },
  { slug: "hip-hop", name: "Hip Hop", emoji: "Hip Hop" },
  { slug: "tap", name: "Tap", emoji: "Tap" },
  { slug: "acro", name: "Acro", emoji: "Acro" },
  { slug: "musical-theater", name: "Musical Theater", emoji: "Musical Theater" },
  { slug: "pom", name: "Pom", emoji: "Pom" },
  { slug: "cheer", name: "Cheer", emoji: "Cheer" },
  { slug: "modern", name: "Modern", emoji: "Modern" },
  { slug: "pointe", name: "Pointe", emoji: "Pointe" },
  { slug: "open-freestyle", name: "Open / Freestyle", emoji: "Open" },
];

export default function ScoringIndexPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl">
        <nav className="mb-8 text-sm text-surface-200">
          <Link href="/" className="hover:text-white transition-colors">
            RoutineX
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">Scoring Guides</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] leading-tight">
            Dance Competition Scoring Guides
          </h1>
          <p className="mt-4 text-lg text-surface-200 leading-relaxed">
            Learn exactly what judges evaluate for every dance style. Each guide
            covers scoring criteria, tips to score higher, common deductions, and
            pro insights from competition judges.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-4">
          {styles.map((style) => (
            <Link
              key={style.slug}
              href={`/scoring/${style.slug}`}
              className="group rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 hover:border-primary-500/30 transition-all"
            >
              <h2 className="text-xl font-bold group-hover:text-primary-400 transition-colors">
                {style.name}
              </h2>
              <p className="mt-2 text-sm text-surface-200">
                What judges look for, scoring tips, and common deductions for{" "}
                {style.name.toLowerCase()} competition routines.
              </p>
              <span className="mt-3 inline-block text-sm text-primary-400 font-medium">
                Read guide →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center glass rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-3">
            Get Your Routine Scored by AI
          </h2>
          <p className="text-surface-200 mb-6">
            Upload any routine and get instant 3-judge scoring with detailed
            feedback on Technique, Performance, Choreography, and Overall
            Impression.
          </p>
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-8 py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity"
          >
            Try RoutineX — $9.99 Beta Access
          </Link>
        </div>
      </div>
    </div>
  );
}
