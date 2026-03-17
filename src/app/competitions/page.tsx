import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dance Competition Guides — Scoring Systems & Tips",
  description:
    "Complete guides to major dance competitions: StarQuest, Showstopper, JUMP, NUVO, The Dance Awards, World of Dance. Award levels, scoring systems, and pro tips to score higher.",
  keywords: [
    "dance competition guide",
    "dance competition scoring",
    "StarQuest dance competition",
    "Showstopper dance competition",
    "JUMP dance convention",
    "NUVO dance convention",
    "The Dance Awards",
    "World of Dance competition",
    "dance competition award levels",
    "how to score platinum at dance competition",
  ],
  alternates: {
    canonical: "/competitions",
  },
};

const competitions = [
  {
    slug: "starquest",
    name: "StarQuest",
    tagline: "One of the largest dance competition circuits in North America",
  },
  {
    slug: "showstopper",
    name: "Showstopper",
    tagline: "America's premier dance competition and talent showcase",
  },
  {
    slug: "jump",
    name: "JUMP Dance Convention",
    tagline: "The world's largest dance convention and competition tour",
  },
  {
    slug: "nuvo",
    name: "NUVO Dance Convention",
    tagline: "Where artistry meets technique in competitive dance",
  },
  {
    slug: "the-dance-awards",
    name: "The Dance Awards",
    tagline: "The most prestigious title in competitive dance",
  },
  {
    slug: "world-of-dance",
    name: "World of Dance",
    tagline: "The world's largest dance entertainment brand",
  },
];

export default function CompetitionsIndexPage() {
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
          <span className="text-white">Competition Guides</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] leading-tight">
            Dance Competition Scoring Guides
          </h1>
          <p className="mt-4 text-lg text-surface-200 leading-relaxed">
            Know what judges look for at every major competition. Each guide
            covers the scoring system, award levels, pro tips, and how to
            prepare with AI-powered practice scoring.
          </p>
        </header>

        <div className="grid gap-4">
          {competitions.map((comp) => (
            <Link
              key={comp.slug}
              href={`/competitions/${comp.slug}`}
              className="group rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 hover:border-primary-500/30 transition-all"
            >
              <h2 className="text-xl font-bold group-hover:text-primary-400 transition-colors">
                {comp.name}
              </h2>
              <p className="mt-1 text-sm text-accent-400 font-medium">
                {comp.tagline}
              </p>
              <p className="mt-2 text-sm text-surface-200">
                Scoring system, award levels, judging criteria, and tips to
                score higher at {comp.name}.
              </p>
              <span className="mt-3 inline-block text-sm text-primary-400 font-medium">
                Read guide →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center glass rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-3">
            Practice Before Competition Day
          </h2>
          <p className="text-surface-200 mb-6">
            Upload your routine and get instant AI scoring calibrated to real
            competition standards. Know your score before you hit the stage.
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
