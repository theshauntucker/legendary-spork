import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/content";
import AdUnit from "@/components/AdUnit";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — [SiteName]`,
    description: `Read "${post.title}" on [SiteName].`,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <section className="py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/blog"
            className="text-sm text-primary-500 hover:text-primary-600 transition-colors mb-6 inline-block"
          >
            &larr; All posts
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink-900 mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-ink-400 mb-8">
            {post.date && <time>{post.date}</time>}
            {post.author && <span>by {post.author}</span>}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <AdUnit slot="blog-post-top" format="horizontal" />

        <div
          className="article-content mt-8"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <div className="mt-10">
          <AdUnit slot="blog-post-bottom" format="horizontal" />
        </div>
      </section>
    </>
  );
}
