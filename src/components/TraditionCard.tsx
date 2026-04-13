import Link from "next/link";
import type { Tradition } from "@/lib/traditions";

interface TraditionCardProps {
  tradition: Tradition;
}

export default function TraditionCard({ tradition }: TraditionCardProps) {
  return (
    <Link
      href={`/traditions/${tradition.slug}`}
      className="group block border border-cream-200 border-l-4 rounded-r-lg p-5 hover:border-l-[6px] transition-all duration-200 hover:shadow-sm"
      style={{
        borderLeftColor: tradition.accentColor,
        backgroundColor: "var(--color-cream-50)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${tradition.accentColor}08`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-cream-50)";
      }}
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: tradition.accentColor }}
        />
        <h3 className="font-serif font-semibold text-lg text-ink-900 group-hover:text-primary-600 transition-colors">
          {tradition.name}
        </h3>
      </div>
      {tradition.adherentCount && (
        <p className="text-xs text-ink-400 mb-2 ml-[18px]">{tradition.adherentCount}</p>
      )}
      <p className="text-sm text-ink-500 leading-relaxed line-clamp-2 ml-[18px]">
        {tradition.summary}
      </p>
    </Link>
  );
}
