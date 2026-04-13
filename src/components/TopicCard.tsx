import Link from "next/link";
import type { TopicMeta } from "@/lib/content";

const colorMap: Record<string, string> = {
  blue: "bg-sky-50 border-sky-200 hover:border-sky-400 hover:bg-sky-100",
  green: "bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100",
  purple: "bg-violet-50 border-violet-200 hover:border-violet-400 hover:bg-violet-100",
  amber: "bg-amber-50 border-amber-200 hover:border-amber-400 hover:bg-amber-100",
  rose: "bg-rose-50 border-rose-200 hover:border-rose-400 hover:bg-rose-100",
  teal: "bg-teal-50 border-teal-200 hover:border-teal-400 hover:bg-teal-100",
};

export default function TopicCard({ topic }: { topic: TopicMeta }) {
  const colors = colorMap[topic.color] || colorMap.teal;

  return (
    <Link href={`/topics/${topic.slug}`}>
      <div
        className={`rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${colors}`}
      >
        <div className="text-4xl mb-3">{topic.icon}</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {topic.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {topic.description}
        </p>
      </div>
    </Link>
  );
}
