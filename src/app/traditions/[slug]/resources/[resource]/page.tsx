import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTraditionSlugs, getTraditionBySlug } from "@/lib/traditions";
import {
  getAllResources,
  getResourceBySlug,
  getResourcesByTradition,
  getPairedResource,
} from "@/lib/resources";
import ResourceCard from "@/components/ResourceCard";
import PairedPerspective from "@/components/PairedPerspective";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";

/* ── Static params ── */
export function generateStaticParams() {
  const resources = getAllResources();
  return resources.map((r) => ({
    slug: r.traditionSlug,
    resource: r.slug,
  }));
}

/* ── Metadata ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; resource: string }>;
}): Promise<Metadata> {
  const { resource: resourceSlug } = await params;
  const resource = getResourceBySlug(resourceSlug);
  if (!resource) return {};
  return {
    title: resource.title,
    description: resource.summary,
  };
}

/* ── Perspective badge colors ── */
const perspectiveColors: Record<string, string> = {
  devotional: "bg-primary-50 text-primary-700",
  questioning: "bg-amber-50 text-amber-700",
  academic: "bg-blue-50 text-blue-700",
  personal: "bg-purple-50 text-purple-700",
};

/* ── Page ── */
export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string; resource: string }>;
}) {
  const { slug, resource: resourceSlug } = await params;

  const tradition = getTraditionBySlug(slug);
  const resource = getResourceBySlug(resourceSlug);
  if (!tradition || !resource) notFound();

  const pairedResource = getPairedResource(resourceSlug);

  const relatedResources = getResourcesByTradition(slug)
    .filter((r) => r.slug !== resource.slug)
    .slice(0, 3);

  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: resource.title,
    description: resource.summary,
    author: resource.author
      ? { "@type": "Person", name: resource.author }
      : undefined,
    url: `${BASE_URL}/traditions/${slug}/resources/${resource.slug}`,
    publisher: {
      "@type": "Organization",
      name: "[SiteName]",
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Breadcrumb ── */}
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 text-sm text-ink-400">
        <ol className="flex items-center gap-1 flex-wrap">
          <li>
            <Link href="/" className="hover:text-primary-500 transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href="/traditions"
              className="hover:text-primary-500 transition-colors"
            >
              Traditions
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={`/traditions/${slug}`}
              className="hover:text-primary-500 transition-colors"
            >
              {tradition.name}
            </Link>
          </li>
          <li>/</li>
          <li className="text-ink-700 font-medium truncate max-w-[200px]">
            {resource.title}
          </li>
        </ol>
      </nav>

      {/* ── Header ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-ink-900 mb-3 leading-tight">
          {resource.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Type badge */}
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-cream-200 text-ink-600">
            {resource.type}
          </span>

          {/* Perspective badge */}
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              perspectiveColors[resource.perspectiveType] ??
              "bg-cream-100 text-ink-600"
            }`}
          >
            {resource.perspectiveType}
          </span>
        </div>

        {resource.author && (
          <p className="text-ink-500 mb-4">by {resource.author}</p>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {resource.sourceUrl && (
            <a
              href={resource.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
            >
              Visit original
              <span aria-hidden="true">&rarr;</span>
            </a>
          )}
          {resource.hostedLocally && (
            <a
              href={`/downloads/${resource.slug}`}
              className="inline-flex items-center gap-1.5 border-2 border-primary-500 text-primary-500 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-500 hover:text-white transition-colors"
            >
              Download
            </a>
          )}
        </div>

        {/* Editorial summary */}
        {resource.editorialSummary && (
          <div className="bg-cream-100 border border-cream-200 rounded-2xl p-6">
            <h2 className="font-serif text-lg font-semibold text-ink-900 mb-2">
              Editorial summary
            </h2>
            <p className="text-ink-600 leading-relaxed">
              {resource.editorialSummary}
            </p>
          </div>
        )}
      </section>

      {/* ── Ad: article-top ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <AdUnit slot="article-top" format="horizontal" />
      </div>

      {/* ── Paired Perspectives ── */}
      {pairedResource && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-10">
          <PairedPerspective resource={resource} paired={pairedResource} />
        </section>
      )}

      {/* ── Tags ── */}
      {resource.tags.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-10">
          <h2 className="font-serif text-xl text-ink-900 mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-3 py-1 rounded-full bg-cream-200 text-ink-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Related Resources ── */}
      {relatedResources.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="font-serif text-2xl text-ink-900 mb-6">
            More from {tradition.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedResources.map((r) => (
              <ResourceCard key={r.slug} resource={r} />
            ))}
          </div>
        </section>
      )}

      {/* ── Email Capture ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <EmailCapture />
      </div>

      {/* ── Ad: bottom ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <AdUnit slot="article-bottom" format="horizontal" />
      </div>
    </>
  );
}
