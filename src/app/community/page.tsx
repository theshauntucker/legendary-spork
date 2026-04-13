import type { Metadata } from "next";
import Link from "next/link";
import { getAllTraditions } from "@/lib/traditions";
import EmailCapture from "@/components/EmailCapture";
import AdUnit from "@/components/AdUnit";

export const metadata: Metadata = {
  title: "Community",
  description:
    "A space for respectful dialogue across all perspectives. Join conversations about religion, spirituality, faith transitions, and scholarly research.",
  openGraph: {
    title: "Community | Vibeproof",
    description:
      "A space for respectful dialogue across all perspectives.",
    type: "website",
  },
};

interface ForumCategory {
  title: string;
  description: string;
  icon: string;
  subLinks?: { label: string; href: string }[];
}

export default function CommunityPage() {
  const traditions = getAllTraditions().slice(0, 6);

  const categories: ForumCategory[] = [
    {
      title: "General Discussion",
      description:
        "Open conversations about religion, spirituality, and meaning.",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      title: "Tradition-Specific",
      description:
        "Dedicated spaces for discussing individual traditions.",
      icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      subLinks: traditions.map((t) => ({
        label: t.name,
        href: `/traditions/${t.slug}`,
      })),
    },
    {
      title: "Faith Transitions",
      description:
        "Support and stories from those navigating changes in belief.",
      icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
    },
    {
      title: "Academic & Scholarly",
      description:
        "Research, history, and textual analysis.",
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-4 leading-tight">
            Community
          </h1>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
            A space for respectful dialogue across all perspectives.
          </p>
        </div>
      </section>

      {/* Top Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <AdUnit slot="community-top" format="horizontal" />
      </div>

      {/* Forum categories */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="bg-white border border-cream-200 rounded-2xl p-6 relative"
            >
              {/* Coming soon badge */}
              <span className="absolute top-4 right-4 inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                Coming soon
              </span>

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={cat.icon} />
                </svg>
              </div>

              <h3 className="font-serif font-semibold text-lg text-ink-900 mb-2">
                {cat.title}
              </h3>
              <p className="text-sm text-ink-500 leading-relaxed mb-4">
                {cat.description}
              </p>

              {/* Tradition sub-links */}
              {cat.subLinks && (
                <div className="flex flex-wrap gap-2">
                  {cat.subLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-xs px-3 py-1 rounded-full bg-cream-100 text-ink-600 hover:bg-cream-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Interim CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-14">
        <div className="bg-cream-100 border border-cream-200 rounded-2xl p-8 text-center">
          <h2 className="font-serif text-2xl text-ink-900 mb-3">
            In the Meantime, Share Your Story
          </h2>
          <p className="text-ink-500 mb-6 max-w-lg mx-auto">
            While the forum is being built, you can contribute to the community
            by sharing your personal faith journey.
          </p>
          <Link
            href="/stories/submit"
            className="inline-block bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
          >
            Share Your Story
          </Link>
        </div>
      </section>

      {/* Email Capture */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-14">
        <EmailCapture />
      </div>

      {/* Bottom Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
        <AdUnit slot="community-bottom" format="horizontal" />
      </div>
    </>
  );
}
