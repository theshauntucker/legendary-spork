import Link from "next/link";
import type { Resource } from "@/lib/resources";

interface ResourceCardProps {
  resource: Resource;
}

const perspectiveColors: Record<string, string> = {
  devotional: "bg-primary-50 text-primary-700",
  questioning: "bg-amber-50 text-amber-700",
  academic: "bg-blue-50 text-blue-700",
  personal: "bg-purple-50 text-purple-700",
};

export default function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Link
      href={`/traditions/${resource.traditionSlug}/resources/${resource.slug}`}
      className="block bg-cream-50 border border-cream-200 rounded-2xl p-5 hover:shadow-md hover:border-primary-500/30 transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            perspectiveColors[resource.perspectiveType] ?? "bg-cream-100 text-ink-600"
          }`}
        >
          {resource.perspectiveType}
        </span>
        <span className="text-xs text-ink-400">{resource.type}</span>
        {resource.pairedWith && (
          <span className="text-xs bg-accent-500/10 text-accent-600 px-2 py-0.5 rounded-full font-medium">
            paired
          </span>
        )}
      </div>
      <h3 className="font-serif font-semibold text-ink-900 mb-1 leading-snug">
        {resource.title}
      </h3>
      {resource.author && (
        <p className="text-xs text-ink-400 mb-2">by {resource.author}</p>
      )}
      <p className="text-sm text-ink-500 leading-relaxed line-clamp-2">
        {resource.summary}
      </p>
    </Link>
  );
}
