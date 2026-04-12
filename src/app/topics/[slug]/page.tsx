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
      <nav className="text-sm text-surface-400 mb-6">
        <Link href="/" className="hover:text-primary-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-surface-600">{topic.title}</span>
      </nav>

      {/* Topic Header */}
      <div className="mb-8">
        <div className="text-5xl mb-3">{topic.icon}</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-3">
          {topic.title}
        </h1>
        <p className="text-lg text-surface-600">{topic.description}</p>

        {/* Official links */}
        <div className="flex flex-wrap gap-3 mt-4">
          {topic.officialWebsite && (
            <a
              href={topic.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Official Website &rarr;
            </a>
          )}
          {topic.missionaryLink && (
            <a
              href={topic.missionaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
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
          <h2 className="text-2xl font-bold text-surface-900 mb-4">
            Articles about {topic.title}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      <AdUnit
        slot="topic-bottom"
        format="horizontal"
        className="mt-8"
      />
    </div>
  );
}
