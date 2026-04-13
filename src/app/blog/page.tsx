import Link from "next/link";
import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/content";
import AdUnit from "@/components/AdUnit";

export const metadata: Metadata = {
  title: "Blog — Vibeproof",
  description:
    "Articles on faith traditions, group dynamics, religious trauma, and spiritual exploration.",
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <>
      <section className="py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-4 leading-tight">
            Blog
          </h1>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
            In-depth articles exploring faith traditions, group dynamics, and
            spiritual journeys.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <AdUnit slot="blog-top" format="horizontal" />

        <div className="mt-8 divide-y divide-cream-200">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block py-6 group"
            >
              <h2 className="font-serif text-xl font-semibold text-ink-900 group-hover:text-primary-600 transition-colors mb-1">
                {post.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-ink-400">
                {post.date && <time>{post.date}</time>}
                {post.author && <span>by {post.author}</span>}
              </div>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {post.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-cream-100 text-ink-500 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="text-center text-ink-400 py-12">
            No blog posts yet. Check back soon.
          </p>
        )}
      </section>
    </>
  );
}
