import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";

const perspectiveLabels: Record<string, { label: string; color: string }> = {
  neutral: { label: "Neutral", color: "bg-blue-100 text-blue-700" },
  pro: { label: "Supportive", color: "bg-green-100 text-green-700" },
  critical: { label: "Critical", color: "bg-amber-100 text-amber-700" },
  academic: { label: "Academic", color: "bg-purple-100 text-purple-700" },
};

export default function ArticleCard({ article }: { article: ArticleMeta }) {
  const perspective = article.perspective
    ? perspectiveLabels[article.perspective]
    : null;

  return (
    <Link href={`/articles/${article.slug}`}>
      <article className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md hover:border-primary-300 transition-all duration-200">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold text-surface-900 leading-snug">
            {article.title}
          </h3>
          {perspective && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${perspective.color}`}
            >
              {perspective.label}
            </span>
          )}
        </div>
        <p className="text-sm text-surface-600 leading-relaxed mb-3">
          {article.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-surface-400">
          <span className="capitalize">{article.topic}</span>
          {article.date && (
            <>
              <span>&middot;</span>
              <span>
                {new Date(article.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </>
          )}
        </div>
      </article>
    </Link>
  );
}
