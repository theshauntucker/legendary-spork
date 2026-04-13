import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getTopicBySlug,
  getAllTopicSlugs,
  getArticlesByTopic,
} from "@/lib/content";
import ArticleCard from "@/components/ArticleCard";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) return {};
  return {
    title: `${topic.title} — Religious Encyclopedia`,
    description: topic.description,
    openGraph: {
      title: `${topic.title} — FaithLens`,
      description: topic.description,
    },
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();

  const articles = getArticlesByTopic(slug);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-accent-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">{topic.title}</span>
      </nav>

      {/* Topic Header */}
      <div className="mb-8">
        <div className="text-5xl mb-3">{topic.icon}</div>
        <h1 className="text-3xl sm:text-4xl font-heading text-slate-900 mb-3">
          {topic.title}
        </h1>
        <p className="text-lg text-slate-600">{topic.description}</p>

        {/* Official links */}
        <div className="flex flex-wrap gap-3 mt-4">
          {topic.officialWebsite && (
            <a
              href={topic.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm bg-accent-50 text-accent-700 px-3 py-1.5 rounded-lg hover:bg-accent-100 transition-colors"
            >
              Official Website &rarr;
            </a>
          )}
          {topic.missionaryLink && (
            <a
              href={topic.missionaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors"
            >
              Meet with Missionaries &rarr;
            </a>
          )}
        </div>
      </div>

      <AdUnit slot="topic-top" format="horizontal" />

      {/* Topic Overview Content */}
      <div
        className="article-content mt-8 mb-10"
        dangerouslySetInnerHTML={{ __html: topic.contentHtml }}
      />

      <AdUnit slot="topic-mid" format="horizontal" className="my-8" />

      {/* Articles for this topic */}
      {articles.length > 0 && (
        <section>
          <h2 className="text-2xl font-heading text-slate-900 mb-4">
            Articles about {topic.title}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Community link */}
      <div className="mt-10 p-6 bg-accent-50 border border-accent-200 rounded-2xl text-center">
        <h3 className="font-heading text-xl text-slate-900 mb-2">
          Discuss {topic.title} with the community
        </h3>
        <p className="text-slate-600 text-sm mb-4">
          Share your thoughts, ask questions, and explore different perspectives.
        </p>
        <Link
          href={`/community/${slug}`}
          className="inline-block bg-accent-600 text-white px-5 py-2.5 rounded-lg hover:bg-accent-700 transition-colors font-semibold text-sm"
        >
          Join the Discussion
        </Link>
      </div>

      {/* Email capture */}
      <div className="mt-8">
        <EmailCapture compact />
      </div>

      <AdUnit
        slot="topic-bottom"
        format="horizontal"
        className="mt-8"
      />
    </div>
  );
}
