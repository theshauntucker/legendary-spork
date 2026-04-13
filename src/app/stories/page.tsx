import Link from "next/link";
import type { Metadata } from "next";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";
import { seedStories, type SeedStory } from "@/app/api/stories/seed-data";

export const metadata: Metadata = {
  title: "Real Stories of Faith Transition",
  description:
    "Read and share experiences of questioning, deconstructing, and rebuilding faith. Real stories from people who have left Mormonism, Christianity, Jehovah's Witnesses, Judaism, and more.",
  openGraph: {
    title: "Real Stories of Faith Transition | FaithLens",
    description:
      "Read and share experiences of questioning, deconstructing, and rebuilding faith.",
    type: "website",
  },
};

const RELIGION_COLORS: Record<string, string> = {
  mormonism: "bg-brand-100 text-brand-700",
  christianity: "bg-accent-100 text-accent-700",
  "jehovahs-witnesses": "bg-amber-100 text-amber-700",
  judaism: "bg-sky-100 text-sky-700",
  islam: "bg-brand-100 text-brand-800",
  catholicism: "bg-amber-100 text-amber-800",
  scientology: "bg-slate-200 text-slate-700",
  buddhism: "bg-accent-100 text-accent-800",
  hinduism: "bg-amber-200 text-amber-800",
  other: "bg-slate-100 text-slate-600",
};

function getStories(): SeedStory[] {
  // In production this would query the DB.
  // For now, we use the seed data directly.
  return seedStories;
}

export default function StoriesPage() {
  const stories = getStories();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-accent-50 via-white to-amber-50 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-heading text-slate-900 mb-4 leading-tight">
            Real Stories of Faith Transition
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Read and share experiences of questioning, deconstructing, and
            rebuilding faith.
          </p>
          <div className="mt-8">
            <Link
              href="/stories/submit"
              className="inline-block bg-accent-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent-700 transition-colors text-base"
            >
              Share Your Story
            </Link>
          </div>
        </div>
      </section>

      {/* Top Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <AdUnit slot="stories-top" format="horizontal" />
      </div>

      {/* Featured Stories */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl font-heading text-slate-900 mb-2">
          Featured Stories
        </h2>
        <p className="text-slate-500 mb-8">
          These are real experiences shared by people navigating faith
          transitions.
        </p>

        <div className="grid gap-6">
          {stories.map((story) => (
            <article
              key={story.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-accent-300 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span
                  className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${
                    RELIGION_COLORS[story.religion] || RELIGION_COLORS.other
                  }`}
                >
                  {story.religionLabel}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(story.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-xs text-slate-400">
                  {story.anonymous ? "Anonymous" : story.displayName}
                </span>
              </div>

              <h3 className="text-xl font-heading text-slate-900 mb-2">
                {story.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">{story.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Mid-page Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <AdUnit slot="stories-mid" format="rectangle" />
      </div>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-accent-50 border border-accent-200 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-heading text-slate-900 mb-3">
            Your Story Matters
          </h2>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">
            Whether you left last week or twenty years ago, your experience can
            help someone else feel less alone. Share anonymously or with your
            name.
          </p>
          <Link
            href="/stories/submit"
            className="inline-block bg-accent-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent-700 transition-colors"
          >
            Share Your Story
          </Link>
        </div>
      </section>

      {/* Email Capture */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-14">
        <EmailCapture />
      </div>

      {/* Bottom Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
        <AdUnit slot="stories-bottom" format="horizontal" />
      </div>
    </>
  );
}
