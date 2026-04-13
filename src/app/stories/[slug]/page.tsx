import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllStories,
  getStoryBySlug,
  JOURNEY_LABELS,
  JOURNEY_COLORS,
  getTraditionName,
} from "@/lib/stories";
import StoryCard from "@/components/StoryCard";
import EmailCapture from "@/components/EmailCapture";
import AdUnit from "@/components/AdUnit";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllStories().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlug(slug);

  if (!story) {
    return { title: "Story Not Found" };
  }

  return {
    title: story.title,
    description: story.excerpt,
    openGraph: {
      title: `${story.title} | Vibeproof`,
      description: story.excerpt,
      type: "article",
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);

  if (!story) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-3xl text-ink-900 mb-4">
          Story Not Found
        </h1>
        <p className="text-ink-500 mb-6">
          The story you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/stories"
          className="inline-block bg-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-600 transition-colors text-sm"
        >
          Back to Stories
        </Link>
      </div>
    );
  }

  // Related stories: same tradition or same journey type, excluding current
  const allStories = getAllStories();
  const related = allStories
    .filter(
      (s) =>
        s.slug !== story.slug &&
        (s.traditionSlug === story.traditionSlug ||
          s.journeyType === story.journeyType)
    )
    .slice(0, 3);

  return (
    <>
      {/* Top Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <AdUnit slot="story-detail-top" format="horizontal" />
      </div>

      {/* Breadcrumb */}
      <nav className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-400">
          <li>
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
          </li>
          <li>&rsaquo;</li>
          <li>
            <Link
              href="/stories"
              className="hover:text-primary-600 transition-colors"
            >
              Stories
            </Link>
          </li>
          <li>&rsaquo;</li>
          <li className="text-ink-700 font-medium truncate max-w-[200px] sm:max-w-none">
            {story.title}
          </li>
        </ol>
      </nav>

      {/* Story header */}
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${JOURNEY_COLORS[story.journeyType]}`}
          >
            {JOURNEY_LABELS[story.journeyType]}
          </span>
          <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-cream-200 text-ink-600">
            {getTraditionName(story.traditionSlug)}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-ink-900 mb-3 leading-tight">
          {story.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-ink-400">
          <span>{story.authorName}</span>
          <span>&middot;</span>
          <time dateTime={story.date}>
            {new Date(story.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </header>

      {/* Story content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <div
          className="prose prose-lg prose-ink max-w-none leading-relaxed text-ink-700 [&>p]:mb-5"
          dangerouslySetInnerHTML={{ __html: story.contentHtml }}
        />
      </article>

      {/* Share your story CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-cream-100 border border-cream-200 rounded-2xl p-8 text-center">
          <h2 className="font-serif text-2xl text-ink-900 mb-3">
            Share Your Story
          </h2>
          <p className="text-ink-500 mb-6 max-w-lg mx-auto">
            Every journey matters. Your experience can help others feel seen and
            understood, no matter where they are on their path.
          </p>
          <Link
            href="/stories/submit"
            className="inline-block bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
          >
            Submit Your Story
          </Link>
        </div>
      </section>

      {/* Related stories */}
      {related.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-14">
          <h2 className="font-serif text-2xl text-ink-900 mb-6">
            Related Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        </section>
      )}

      {/* Email Capture */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-14">
        <EmailCapture />
      </div>

      {/* Bottom Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
        <AdUnit slot="story-detail-bottom" format="horizontal" />
      </div>
    </>
  );
}
