import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug, getAllPages } from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Not Found" };
  return {
    title: `${page.title} — [SiteName]`,
  };
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <h1 className="font-serif text-3xl sm:text-4xl text-ink-900 mb-8 leading-tight">
        {page.title}
      </h1>
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: page.contentHtml }}
      />
    </section>
  );
}
