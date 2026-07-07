import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import {
  GUIDES,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getGuidesByCategory,
} from "@/data/guides";

export const metadata: Metadata = {
  title: "Dance & Cheer Competition Guides for Parents",
  description:
    "Plain-English guides to how dance and cheer competitions really work — award levels, scoring rubrics, judging, costs, competition companies, cheer bids and more. Written by dance parents, for dance and cheer parents.",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    title: "Dance & Cheer Competition Guides for Parents | RoutineX",
    description:
      "Plain-English guides to how dance and cheer competitions really work — award levels, scoring, judging, costs and more.",
    type: "website",
    url: "/guides",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GuidesHubPage() {
  return (
    <main>
      <div className="min-h-screen py-20 px-4">
        <div className="mx-auto max-w-5xl">
          {/* Hero */}
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
              Competition Guides
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)] leading-tight">
              How Dance & Cheer Competitions{" "}
              <span className="gradient-text">Really Work</span>
            </h1>
            <p className="mt-6 text-lg text-surface-200 leading-relaxed">
              Award levels, score sheets, judging, costs, competition companies,
              cheer bids — it can all feel like a mystery from the stands. These
              are calm, honest, plain-English guides written by dance parents,
              for dance and cheer parents. No jargon, no drama, no blame — just a
              clear explanation of how things work and how to help your athlete
              grow.
            </p>
          </div>

          {/* Category-grouped grid */}
          <div className="mt-14 space-y-14">
            {CATEGORY_ORDER.map((category) => {
              const guides = getGuidesByCategory(category);
              if (guides.length === 0) return null;
              return (
                <section key={category}>
                  <h2 className="text-xl font-bold text-white mb-5">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {guides.map((guide) => (
                      <Link
                        key={guide.slug}
                        href={`/guides/${guide.slug}`}
                        className="group glass rounded-2xl p-6 flex flex-col transition-transform hover:-translate-y-0.5"
                      >
                        <h3 className="text-lg font-semibold text-white leading-snug group-hover:text-primary-300 transition-colors">
                          {guide.title}
                        </h3>
                        <p className="mt-3 text-sm text-surface-200 leading-relaxed flex-1">
                          {guide.metaDescription}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-xs text-surface-200/80">
                          <span>{guide.readingTime}</span>
                          <span className="inline-flex items-center gap-1 text-primary-400 group-hover:gap-2 transition-all">
                            Read guide
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Neutral positioning note */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary-700/20 to-accent-600/20 border border-white/10 p-6 sm:p-8">
            <p className="text-white font-medium mb-2">
              A neutral explainer for both dance and cheer.
            </p>
            <p className="text-sm text-surface-200 leading-relaxed">
              RoutineX is not affiliated with any competition company or event
              producer. We wrote these guides to explain the systems fairly and
              generously — validating the real frustrations families feel while
              being honest about how much careful, good-faith work goes into
              running events and judging routines. Cheer and dance both get a
              full seat at the table here.
            </p>
            <div className="mt-5">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Score a practice routine — first analysis $1.99
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <p className="mt-10 text-xs text-surface-200/60">
            {GUIDES.length} guides and counting.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
