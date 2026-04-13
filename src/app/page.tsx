import Link from "next/link";
import { getAllTraditions } from "@/lib/traditions";
import {
  getResourcesByPerspective,
} from "@/lib/resources";
import TraditionCard from "@/components/TraditionCard";
import ResourceCard from "@/components/ResourceCard";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";

export default function HomePage() {
  const traditions = getAllTraditions();

  const devotional = getResourcesByPerspective("devotional")[0];
  const questioning = getResourcesByPerspective("questioning")[0];
  const academic = getResourcesByPerspective("academic")[0];
  const featured = [devotional, questioning, academic].filter(Boolean);

  const tools = [
    {
      href: "/tools/belief-explorer",
      icon: "\uD83E\uDDED",
      title: "Belief Explorer",
      description:
        "Map the core beliefs of any tradition side-by-side in an interactive viewer.",
    },
    {
      href: "/tools/tradition-compare",
      icon: "\u2696\uFE0F",
      title: "Tradition Compare",
      description:
        "Place two or more traditions next to each other and see where they converge and diverge.",
    },
    {
      href: "/tools/glossary",
      icon: "\uD83D\uDCD6",
      title: "Glossary",
      description:
        "Look up terms, concepts, and names from every major faith tradition.",
    },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-cream-100 via-cream-50 to-primary-50 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-5 leading-tight">
            Explore the world&rsquo;s faith traditions
          </h1>
          <p className="text-lg sm:text-xl text-ink-500 max-w-2xl mx-auto leading-relaxed">
            A neutral library of beliefs, practices, perspectives, and personal
            stories.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              href="/traditions"
              className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors font-semibold"
            >
              Browse traditions
            </Link>
            <Link
              href="/stories"
              className="border-2 border-primary-500 text-primary-500 px-6 py-3 rounded-xl hover:bg-primary-500 hover:text-white transition-colors font-semibold"
            >
              Read stories
            </Link>
            <Link
              href="/community"
              className="border-2 border-primary-500 text-primary-500 px-6 py-3 rounded-xl hover:bg-primary-500 hover:text-white transition-colors font-semibold"
            >
              Join discussions
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ad: top banner ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <AdUnit slot="top-banner" format="horizontal" />
      </div>

      {/* ── Traditions grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-serif text-3xl text-ink-900 mb-8">
          Explore by tradition
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {traditions.map((t) => (
            <TraditionCard key={t.slug} tradition={t} />
          ))}
        </div>
      </section>

      {/* ── Featured Perspectives ── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-serif text-3xl text-ink-900 mb-8">
            Featured perspectives
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* ── Popular Tools ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-serif text-3xl text-ink-900 mb-8">
          Tools for exploration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="block bg-cream-100 border border-cream-200 rounded-2xl p-6 hover:shadow-md hover:border-primary-500/30 transition-all"
            >
              <span className="text-3xl mb-3 block">{tool.icon}</span>
              <h3 className="font-serif font-semibold text-lg text-ink-900 mb-1">
                {tool.title}
              </h3>
              <p className="text-sm text-ink-500 leading-relaxed">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How This Works ── */}
      <section className="bg-cream-100 py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl text-ink-900 mb-10">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                label: "Choose a tradition",
              },
              {
                step: 2,
                label: "See all perspectives",
              },
              {
                step: 3,
                label: "Join the conversation",
              },
            ].map(({ step, label }) => (
              <div key={step} className="flex flex-col items-center">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-500 text-white font-semibold text-lg mb-4">
                  {step}
                </span>
                <p className="text-ink-700 font-medium">{label}</p>
              </div>
            ))}
          </div>
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
