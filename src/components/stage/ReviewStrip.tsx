/**
 * Real words only. Every quote here came from a customer (App Store
 * rating, in-app report feedback, or an email to the founder). Short,
 * faded at the edges, drifting — a slim window, never a billboard.
 */
export const REAL_REVIEWS: Array<{ quote: string; who: string; stars?: number }> = [
  { quote: "slay", who: "Dancer, after her report", stars: 5 },
  { quote: "I really love the idea of this product — something I’ve been looking for.", who: "Stephanie F., dance parent" },
  { quote: "I truly appreciate that you built this from the eye of a parent and protecting the privacy of children.", who: "Stephanie F., dance parent" },
  { quote: "Thank you so much! I am adding my review in now!", who: "Jana R., dance parent" },
  { quote: "5.0 on the App Store", who: "RoutineX: Dance & Cheer AI", stars: 5 },
];

export default function ReviewStrip() {
  const items = [...REAL_REVIEWS, ...REAL_REVIEWS];
  return (
    <section aria-label="What families say" className="relative py-10 sm:py-12">
      <div className="st-hairline" />
      <div className="st-fade-x mt-8 overflow-hidden">
        <ul className="st-marquee items-center">
          {items.map((r, i) => (
            <li key={i} className="flex items-center gap-4 whitespace-nowrap text-[15px] text-zinc-300">
              {r.stars ? <span aria-hidden className="text-amber-300/90 tracking-tight">{"★".repeat(r.stars)}</span> : <span aria-hidden className="h-1 w-1 rounded-full bg-zinc-600" />}
              <span className="font-[family-name:var(--font-display)] italic text-zinc-100">“{r.quote}”</span>
              <span className="text-zinc-500">{r.who}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="st-hairline mt-8" />
    </section>
  );
}
