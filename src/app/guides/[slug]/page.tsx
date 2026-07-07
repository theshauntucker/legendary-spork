import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import { GUIDES, getGuide } from "@/data/guides";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) {
    return { title: "Guide Not Found" };
  }
  const url = `/guides/${guide.slug}`;
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      type: "article",
      url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const canonical = `${BASE_URL}/guides/${guide.slug}`;

  const related = guide.relatedSlugs
    .map((s) => getGuide(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    author: {
      "@type": "Organization",
      name: "RoutineX",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "RoutineX",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.svg`,
      },
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <article className="min-h-screen py-16 sm:py-20 px-4">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All guides
          </Link>

          {/* Title */}
          <h1 className="mt-6 text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] leading-tight">
            {guide.title}
          </h1>
          <p className="mt-4 text-sm text-surface-200/70">{guide.readingTime}</p>

          {/* Body */}
          <div className="mt-10 space-y-10 text-surface-200 leading-relaxed">
            {guide.sections.map((section, i) => (
              <section key={i}>
                {section.heading && (
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                    {section.heading}
                  </h2>
                )}
                <div className="space-y-4">
                  {section.paragraphs.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
                {section.list && (
                  <ul className="mt-4 space-y-2">
                    {section.list.map((item, k) => (
                      <li key={k} className="flex items-start gap-2">
                        <span className="text-primary-400 mt-1.5 shrink-0">
                          &#x2022;
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* FAQ */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {guide.faq.map((item, i) => (
                <div key={i} className="glass rounded-2xl p-5 sm:p-6">
                  <h3 className="text-base font-semibold text-white">
                    {item.q}
                  </h3>
                  <p className="mt-2 text-sm text-surface-200 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Related guides */}
          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="text-xl font-bold text-white mb-5">
                Keep reading
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/guides/${r.slug}`}
                    className="group glass rounded-2xl p-5 flex flex-col transition-transform hover:-translate-y-0.5"
                  >
                    <h3 className="text-base font-semibold text-white leading-snug group-hover:text-primary-300 transition-colors">
                      {r.title}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary-400 group-hover:gap-2 transition-all">
                      Read guide
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary-700/20 to-accent-600/20 border border-white/10 p-6 sm:p-8 text-center">
            <h2 className="text-2xl font-bold text-white">
              See where your routine stands
            </h2>
            <p className="mt-3 text-surface-200 leading-relaxed max-w-xl mx-auto">
              Get an objective, competition-style score of a practice video with
              specific, timestamped notes on what to polish — for both dance and
              cheer. It is a friendly extra set of eyes between lessons, never a
              replacement for your coach.
            </p>
            <div className="mt-6">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Try your first analysis — $1.99
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-4 text-xs text-surface-200/60">
              First analysis on us. Then just $1.99 each, or $4.99/mo for Season
              Member.
            </p>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
