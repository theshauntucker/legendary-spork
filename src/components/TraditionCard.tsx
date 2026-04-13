import Link from "next/link";
import type { Tradition } from "@/lib/traditions";

interface TraditionCardProps {
  tradition: Tradition;
}

export default function TraditionCard({ tradition }: TraditionCardProps) {
  return (
    <Link
      href={`/traditions/${tradition.slug}`}
      className="block bg-cream-50 border border-cream-200 rounded-2xl p-6 hover:shadow-md hover:border-primary-500/30 transition-all"
    >
      {tradition.iconEmoji && (
        <span className="text-3xl mb-3 block">{tradition.iconEmoji}</span>
      )}
      <h3 className="font-serif font-semibold text-lg text-ink-900 mb-1">
        {tradition.name}
      </h3>
      <p className="text-sm text-ink-500 leading-relaxed">
        {tradition.summary}
      </p>
    </Link>
  );
}
