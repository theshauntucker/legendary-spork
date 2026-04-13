import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllTraditionSlugs,
  getTraditionBySlug,
} from "@/lib/traditions";
import { getResourcesByTradition } from "@/lib/resources";
import type { Resource } from "@/lib/resources";
import ResourceCard from "@/components/ResourceCard";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";

/* ── Static params ── */
export function generateStaticParams() {
  return getAllTraditionSlugs().map((slug) => ({ slug }));
}

/* ── Metadata ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tradition = getTraditionBySlug(slug);
  if (!tradition) return {};
  return {
    title: `${tradition.name} \u2014 Vibeproof`,
    description: tradition.summary,
  };
}

/* ── Perspective subsection helper ── */
const PERSPECTIVE_LABELS: Record<Resource["perspectiveType"], string> = {
  devotional: "Devotional",
  questioning: "Questioning",
  academic: "Academic",
  personal: "Personal",
};

/* ── Page ── */
export default async function TraditionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tradition = getTraditionBySlug(slug);
  if (!tradition) notFound();

  const resources = getResourcesByTradition(slug);

  const byPerspective = (type: Resource["perspectiveType"]) =>
    resources.filter((r) => r.perspectiveType === type);

  return (
    <>
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
          <li className="text-ink-700 font-medium">{tradition.name}</li>
        </ol>
      </nav>

      {/* ── Header ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-10">
        <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-3 leading-tight">
          {tradition.name}
        </h1>

        {tradition.alternateNames && tradition.alternateNames.length > 0 && (
          <p className="text-ink-400 text-sm mb-3">
            Also known as: {tradition.alternateNames.join(", ")}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-ink-500 mb-6">
          {tradition.adherentCount && (
            <span>Adherents: {tradition.adherentCount}</span>
          )}
          {tradition.foundedDate && (
            <span>Founded: {tradition.foundedDate}</span>
          )}
        </div>

        <p className="text-lg text-ink-600 leading-relaxed">
          {tradition.summary}
        </p>

        {/* Practitioner links */}
        {tradition.introductionLinks.length > 0 && (
          <div className="mt-8 bg-cream-100 border border-cream-200 rounded-2xl p-6">
            <h2 className="font-serif text-lg font-semibold text-ink-900 mb-2">
              Want to learn from practitioners directly?
            </h2>
            <ul className="space-y-2">
              {tradition.introductionLinks.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
                  >
                    {link.label}
                    <span className="text-ink-400 ml-1">&rarr;</span>
                  </a>
                  {link.description && (
                    <span className="text-sm text-ink-400 ml-2">
                      {link.description}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ── Ad: top ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <AdUnit slot="tradition-top" format="horizontal" />
      </div>

      {/* ── Overview ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: tradition.overviewHtml }}
        />
      </section>

      {/* ── Ad: mid ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <AdUnit slot="tradition-mid" format="horizontal" />
      </div>

      {/* ── Perspectives ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-serif text-3xl text-ink-900 mb-8">Perspectives</h2>

        {(
          ["devotional", "questioning", "academic", "personal"] as const
        ).map((type) => {
          const items = byPerspective(type);
          if (items.length === 0) return null;
          return (
            <div key={type} className="mb-10">
              <h3 className="font-serif text-xl text-ink-800 mb-4">
                {PERSPECTIVE_LABELS[type]}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((r) => (
                  <ResourceCard key={r.slug} resource={r} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── All Resources ── */}
      {resources.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
          <h2 className="font-serif text-3xl text-ink-900 mb-8">
            All Resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((r) => (
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
        <AdUnit slot="tradition-bottom" format="horizontal" />
      </div>
    </>
  );
}
