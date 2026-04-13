import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getGroupBySlug, getAllGroupSlugs } from "@/lib/groups";
import { getResourcesByTradition } from "@/lib/resources";
import ResourceCard from "@/components/ResourceCard";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllGroupSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const group = getGroupBySlug(slug);
  if (!group) return { title: "Not Found" };
  return {
    title: `${group.name} — Resources & Information — [SiteName]`,
    description: `Explore resources, perspectives, and community discussions about ${group.name}. Books, documentaries, podcasts, and personal stories.`,
  };
}

export default async function GroupPage({ params }: Props) {
  const { slug } = await params;
  const group = getGroupBySlug(slug);
  if (!group) notFound();

  const relatedResources = getResourcesByTradition(group.religion).slice(0, 9);

  return (
    <>
      <section className="py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/traditions"
            className="text-sm text-primary-500 hover:text-primary-600 transition-colors mb-6 inline-block"
          >
            &larr; All traditions
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink-900 mb-3 leading-tight">
            {group.name}
          </h1>
          {group.aliases.length > 0 && (
            <p className="text-sm text-ink-400 mb-4">
              Also known as: {group.aliases.join(", ")}
            </p>
          )}
          <p className="text-ink-600 leading-relaxed">
            Explore resources, perspectives, and information about {group.name}.
            This page aggregates books, documentaries, podcasts, personal stories,
            and scholarly analysis from multiple viewpoints.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <AdUnit slot="group-top" format="horizontal" />
      </section>

      {relatedResources.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
          <h2 className="font-serif text-2xl text-ink-900 mb-6">
            Related resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedResources.map((r) => (
              <ResourceCard key={r.slug} resource={r} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href={`/library?tradition=${group.religion}`}
              className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
            >
              View all {group.religion} resources &rarr;
            </Link>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/tools/belief-explorer"
            className="bg-cream-100 border border-cream-200 rounded-xl p-6 hover:border-primary-500/30 transition-all"
          >
            <h3 className="font-serif font-semibold text-ink-900 mb-2">
              Belief Environment Explorer
            </h3>
            <p className="text-sm text-ink-500">
              Use the BITE Model assessment tool to explore structural influence
              patterns in any group.
            </p>
          </Link>
          <Link
            href="/stories"
            className="bg-cream-100 border border-cream-200 rounded-xl p-6 hover:border-primary-500/30 transition-all"
          >
            <h3 className="font-serif font-semibold text-ink-900 mb-2">
              Personal Stories
            </h3>
            <p className="text-sm text-ink-500">
              Read personal accounts from people entering, deepening,
              questioning, leaving, and returning to faith.
            </p>
          </Link>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-14">
        <EmailCapture />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
        <AdUnit slot="group-bottom" format="horizontal" />
      </div>
    </>
  );
}
