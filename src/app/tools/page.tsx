import type { Metadata } from "next";
import Link from "next/link";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "Tools — Vibeproof",
  description:
    "Interactive tools for exploring faith traditions, comparing beliefs, and understanding group dynamics.",
};

const tools = [
  {
    href: "/tools/belief-explorer",
    icon: (
      <svg
        className="w-8 h-8 text-primary-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    title: "Belief Environment Explorer",
    description:
      "Understand structural influence patterns in religious and ideological groups",
  },
  {
    href: "/tools/tradition-compare",
    icon: (
      <svg
        className="w-8 h-8 text-primary-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
        />
      </svg>
    ),
    title: "Tradition Compare",
    description:
      "Place traditions side by side to see where they converge and diverge",
  },
  {
    href: "/tools/glossary",
    icon: (
      <svg
        className="w-8 h-8 text-primary-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    title: "Glossary of Terms",
    description:
      "Look up terms, concepts, and names from every major faith tradition",
  },
];

export default function ToolsPage() {
  return (
    <>
      {/* Header */}
      <section className="py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-4 leading-tight">
            Tools for Exploration
          </h1>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
            Interactive resources to deepen your understanding of the
            world&rsquo;s faith traditions.
          </p>
        </div>
      </section>

      {/* Tool cards */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="block bg-cream-100 border border-cream-200 rounded-2xl p-6 hover:shadow-md hover:border-primary-500/30 transition-all"
            >
              <span className="mb-4 block">{tool.icon}</span>
              <h2 className="font-serif font-semibold text-lg text-ink-900 mb-1">
                {tool.title}
              </h2>
              <p className="text-sm text-ink-500 leading-relaxed">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <AdUnit slot="tools-page" format="horizontal" />
      </div>

      {/* Email capture */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <EmailCapture />
      </div>
    </>
  );
}
