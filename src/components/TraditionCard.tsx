import Link from "next/link";
import type { Tradition } from "@/lib/traditions";

interface TraditionCardProps {
  tradition: Tradition;
}

export default function TraditionCard({ tradition }: TraditionCardProps) {
  return (
    <Link
      href={`/traditions/${tradition.slug}`}
      className="group block bg-cream-50 border border-cream-200 border-l-4 rounded-r-lg p-5 hover:bg-cream-100 hover:border-l-[6px] transition-all duration-200"
      style={{ borderLeftColor: tradition.accentColor }}
    >
      <h3 className="font-serif font-semibold text-lg text-ink-900 mb-1 group-hover:text-primary-600 transition-colors">
        {tradition.name}
      </h3>
      {tradition.adherentCount && (
        <p className="text-xs text-ink-400 mb-2">{tradition.adherentCount}</p>
      )}
      <p className="text-sm text-ink-500 leading-relaxed line-clamp-2">
        {tradition.summary}
      </p>
    </Link>
  );
}
