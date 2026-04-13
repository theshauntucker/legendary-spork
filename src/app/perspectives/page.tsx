import type { Metadata } from "next";
import Link from "next/link";
import { getResourcesByPerspective } from "@/lib/resources";
import ResourceCard from "@/components/ResourceCard";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "Perspectives",
  description:
    "Every topic explored from multiple angles — devotional, questioning, academic, and personal.",
};

const sections = [
  {
    type: "devotional" as const,
    title: "Devotional Perspectives",
    description: "Writings and resources from within faith traditions.",
  },
  {
    type: "questioning" as const,
    title: "Questioning Perspectives",
    description: "Critical examinations and honest doubts.",
  },
  {
    type: "academic" as const,
    title: "Academic Perspectives",
    description: "Scholarly research and historical analysis.",
  },
  {
    type: "personal" as const,
    title: "Personal Perspectives",
    description: "First-hand accounts and lived experiences.",
  },
];

export default function PerspectivesPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-cream-100 via-cream-50 to-primary-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-5 leading-tight">
            Perspectives
          </h1>
          <p className="text-lg sm:text-xl text-ink-500 max-w-2xl mx-auto leading-relaxed">
            Every topic explored from multiple angles &mdash; devotional,
            questioning, academic, and personal.
          </p>
        </div>
      </section>

      {/* Perspective sections */}
      {sections.map((section, idx) => {
        const resources = getResourcesByPerspective(section.type).slice(0, 4);

        return (
          <div key={section.type}>
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
              <h2 className="font-serif text-3xl text-ink-900 mb-2">
                {section.title}
              </h2>
              <p className="text-ink-500 mb-8">{section.description}</p>

              {resources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {resources.map((r) => (
                    <ResourceCard key={r.slug} resource={r} />
                  ))}
                </div>
              ) : (
                <p className="text-ink-400 italic">
                  No {section.type} resources yet. Check back soon.
                </p>
              )}

              <div className="mt-6">
                <Link
                  href="/library"
                  className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                >
                  View all in library &rarr;
                </Link>
              </div>
            </section>

            {/* Ad between sections (not after the last one) */}
            {idx < sections.length - 1 && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <AdUnit
                  slot={`perspectives-${section.type}`}
                  format="horizontal"
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Email Capture */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <EmailCapture />
      </div>
    </>
  );
}
