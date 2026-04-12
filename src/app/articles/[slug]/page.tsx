import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getArticleBySlug,
  getAllArticleSlugs,
  getArticlesByTopic,
} from "@/lib/content";
import AdUnit from "@/components/AdUnit";
import ArticleCard from "@/components/ArticleCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: `${article.title} — FaithLens`,
      description: article.description,
      type: "article",
      publishedTime: article.date,
    },
  };
}

const perspectiveLabels: Record<string, { label: string; color: string }> = {
  neutral: { label: "Neutral Perspective", color: "bg-blue-100 text-blue-700" },
  pro: {
    label: "Supportive Perspective",
    color: "bg-green-100 text-green-700",
  },
  critical: {
    label: "Critical Perspective",
    color: "bg-amber-100 text-amber-700",
  },
  academic: {
    label: "Academic Perspective",
    color: "bg-purple-100 text-purple-700",
  },
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const relatedArticles = getArticlesByTopic(article.topic)
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  const perspective = article.perspective
    ? perspectiveLabels[article.perspective]
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    publisher: {
      "@type": "Organization",
      name: "FaithLens",
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-surface-400 mb-6">
        <Link href="/" className="hover:text-primary-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/topics/${article.topic}`}
          className="hover:text-primary-600 capitalize"
        >
          {article.topic}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-surface-600">{article.title}</span>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-3 leading-tight">
          {article.title}
        </h1>
        <p className="text-lg text-surface-600 mb-4">
          {article.description}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {perspective && (
            <span
              className={`px-3 py-1 rounded-full font-medium ${perspective.color}`}
            >
              {perspective.label}
            </span>
          )}
          <Link
            href={`/topics/${article.topic}`}
            className="text-primary-600 hover:text-primary-800 capitalize"
          >
            {article.topic}
          </Link>
          {article.date && (
            <span className="text-surface-400">
              {new Date(article.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </header>

      <AdUnit slot="article-top" format="horizontal" />

      {/* Article Body */}
      <div
        className="article-content mt-8"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      <AdUnit slot="article-mid" format="rectangle" className="my-8" />

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-surface-200">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-surface-100 text-surface-600 px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <AdUnit
        slot="article-bottom"
        format="horizontal"
        className="mt-8"
      />

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="mt-12 pt-8 border-t border-surface-200">
          <h2 className="text-xl font-bold text-surface-900 mb-4">
            More on {article.topic}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {relatedArticles.map((related) => (
              <ArticleCard key={related.slug} article={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
