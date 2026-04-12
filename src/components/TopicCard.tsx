import Link from "next/link";
import type { TopicMeta } from "@/lib/content";

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 hover:border-blue-400",
  green: "bg-green-50 border-green-200 hover:border-green-400",
  purple: "bg-purple-50 border-purple-200 hover:border-purple-400",
  amber: "bg-amber-50 border-amber-200 hover:border-amber-400",
  rose: "bg-rose-50 border-rose-200 hover:border-rose-400",
  teal: "bg-teal-50 border-teal-200 hover:border-teal-400",
};

export default function TopicCard({ topic }: { topic: TopicMeta }) {
  const colors = colorMap[topic.color] || colorMap.blue;

  return (
    <Link href={`/topics/${topic.slug}`}>
      <div
        className={`rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${colors}`}
      >
        <div className="text-4xl mb-3">{topic.icon}</div>
        <h3 className="text-lg font-bold text-surface-900 mb-2">
          {topic.title}
        </h3>
        <p className="text-sm text-surface-600 leading-relaxed">
          {topic.description}
        </p>
      </div>
    </Link>
  );
}
