import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";

const perspectiveLabels: Record<string, { label: string; color: string }> = {
  neutral: { label: "Neutral", color: "bg-sky-100 text-sky-700" },
  pro: { label: "Supportive", color: "bg-emerald-100 text-emerald-700" },
  critical: { label: "Critical", color: "bg-amber-100 text-amber-700" },
  academic: { label: "Academic", color: "bg-violet-100 text-violet-700" },
};

export default function ArticleCard({ article }: { article: ArticleMeta }) {
  const perspective = article.perspective
    ? perspectiveLabels[article.perspective]
    : null;

  return (
    <Link href={`/articles/${article.slug}`}>
      <article className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-accent-300 transition-all duration-200">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold text-slate-900 leading-snug">
            {article.title}
          </h3>
          {perspective && (
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${perspective.color}`}
            >
              {perspective.label}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          {article.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-400">
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
