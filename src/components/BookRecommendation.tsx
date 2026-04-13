interface BookRecommendationProps {
  title: string;
  author: string;
  description: string;
  affiliateUrl: string;
  imageUrl?: string;
}

export default function BookRecommendation({
  title,
  author,
  description,
  affiliateUrl,
  imageUrl,
}: BookRecommendationProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4">
      {/* Cover image or placeholder */}
      <div className="flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Cover of ${title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center px-1">
            <svg
              className="w-8 h-8 text-slate-300 mx-auto mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-[10px] text-slate-400 leading-tight block">Book</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 text-sm leading-snug mb-0.5">
          {title}
        </h4>
        <p className="text-xs text-slate-500 mb-2">by {author}</p>
        <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-2">
          {description}
        </p>

        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors"
        >
          View on Amazon
        </a>

        <p className="text-[11px] text-slate-400 mt-2">
          Affiliate link &mdash; we may earn a small commission at no extra cost to you.
        </p>
      </div>
    </div>
  );
}
