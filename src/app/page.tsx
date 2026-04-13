import Link from "next/link";
import { getAllTraditions } from "@/lib/traditions";
import { getResourcesByPerspective } from "@/lib/resources";
import TraditionCard from "@/components/TraditionCard";
import ResourceCard from "@/components/ResourceCard";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";
import Ornament from "@/components/Ornament";
import PullQuote from "@/components/PullQuote";
import SearchBar from "@/components/SearchBar";

export default function HomePage() {
  const traditions = getAllTraditions();

  const devotional = getResourcesByPerspective("devotional")[0];
  const questioning = getResourcesByPerspective("questioning")[0];
  const academic = getResourcesByPerspective("academic")[0];
  const featured = [devotional, questioning, academic].filter(Boolean);

  const tools = [
    {
      href: "/tools/belief-explorer",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "Belief Explorer",
      description: "Understand influence patterns in religious and ideological groups.",
      color: "#d97706",
      bgColor: "#fef8ee",
    },
    {
      href: "/tools/tradition-compare",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      ),
      title: "Tradition Compare",
      description: "Place traditions side by side to see where they converge and diverge.",
      color: "#0d6b6b",
      bgColor: "#e8f4f4",
    },
    {
      href: "/tools/glossary",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Glossary",
      description: "Look up terms, concepts, and names from every major faith tradition.",
      color: "#7c3aed",
      bgColor: "#f3f0ff",
    },
  ];

  const quickLinks = [
    "Christianity",
    "Islam",
    "Mormonism",
    "Buddhism",
    "Scientology",
    "Judaism",
  ];

  return (
    <>
      {/* ── Hero — search-first ── */}
      <section className="relative py-20 sm:py-28 overflow-hidden" style={{ background: "linear-gradient(135deg, #e8f4f4 0%, #fdfcf8 40%, #fef8ee 70%, #fdf2f2 100%)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink-900 mb-4 leading-tight" style={{ fontWeight: 300 }}>
            Explore anything spiritual
          </h1>
          <p className="text-lg text-ink-500 max-w-xl mx-auto leading-relaxed mb-8">
            The open encyclopedia of beliefs, practices, perspectives, and personal stories.
          </p>

          {/* Search bar — the primary CTA */}
          <SearchBar large className="max-w-2xl mx-auto" />

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-6 text-sm text-ink-400">
            {quickLinks.map((name, i) => (
              <span key={name} className="flex items-center gap-3">
                <Link
                  href={`/traditions/${name.toLowerCase()}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {name}
                </Link>
                {i < quickLinks.length - 1 && (
                  <span className="text-cream-200">&middot;</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ad: top banner ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <AdUnit slot="top-banner" format="horizontal" />
      </div>

      {/* ── Traditions grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <h2 className="font-serif text-3xl text-ink-900 mb-8">
          Explore by tradition
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {traditions.map((t) => (
            <TraditionCard key={t.slug} tradition={t} />
          ))}
        </div>
      </section>

      <Ornament variant="rule" />

      {/* ── Featured Perspectives ── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="font-serif text-2xl text-ink-900 mb-6">
            Featured perspectives
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((r) => (
              <ResourceCard key={r.slug} resource={r} />
            ))}
          </div>
        </section>
      )}

      {/* ── Ad: mid-page ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <AdUnit slot="mid-page" format="horizontal" />
      </div>

      {/* ── Pull Quote ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <PullQuote
          quote="The first step toward understanding is to set aside the need to agree or disagree, and simply listen."
        />
      </div>

      <Ornament variant="dinkus" />

      {/* ── What You'll Find Here — editorial block ── */}
      <section className="py-14" style={{ background: "linear-gradient(180deg, #fdfcf8 0%, #e8f4f4 50%, #fdfcf8 100%)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 className="font-serif text-2xl text-ink-900 mb-8 text-center">
          What you&rsquo;ll find here
        </h2>
        <div className="space-y-6 text-ink-600 leading-relaxed">
          <p>
            <em className="font-serif text-ink-700 not-italic font-medium">Every tradition, presented with care.</em>{" "}
            We cover the beliefs, practices, history, and lived experience of the world&rsquo;s
            faith traditions — from the largest denominations to lesser-known movements. Every
            tradition gets the same depth of treatment.
          </p>
          <p>
            <em className="font-serif text-ink-700 not-italic font-medium">Multiple perspectives, side by side.</em>{" "}
            For every topic, you&rsquo;ll find devotional, questioning, and academic viewpoints
            presented together. We believe informed exploration requires hearing from those who
            believe, those who question, and those who study.
          </p>
          <p>
            <em className="font-serif text-ink-700 not-italic font-medium">Real stories from real people.</em>{" "}
            Personal accounts from those entering, deepening, questioning, leaving, and returning to
            faith — every journey treated with dignity.
          </p>
        </div>
        </div>
      </section>

      <Ornament variant="rule" />

      {/* ── Tools ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-serif text-2xl text-ink-900 mb-6 text-center">
          Tools for exploration
        </h2>
        <div className="divide-y divide-cream-200">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-4 py-4 group hover:bg-cream-100/50 -mx-3 px-3 rounded-lg transition-colors"
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105"
                style={{ backgroundColor: tool.bgColor, color: tool.color }}
              >
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-medium text-ink-900 group-hover:text-primary-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-ink-500 leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <svg className="w-4 h-4 text-ink-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Email Capture ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <EmailCapture />
      </div>

      {/* ── Ad: bottom banner ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <AdUnit slot="bottom-banner" format="horizontal" />
      </div>
    </>
  );
}
