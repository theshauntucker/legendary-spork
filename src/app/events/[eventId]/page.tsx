import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_EVENTS, MONTH_NAMES, TYPE_LABELS } from "@/data/competitions";

export function generateStaticParams() {
  return ALL_EVENTS.map((e) => ({ eventId: e.id }));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = ALL_EVENTS.find((e) => e.id === eventId);
  if (!event) notFound();

  const months = event.typicalMonths.map((m) => MONTH_NAMES[m]).join(", ");

  return (
    <main className="min-h-screen pt-24 pb-20 px-4">
      <div className="mx-auto max-w-4xl">
        <Link href="/events" className="text-sm text-primary-400 hover:underline">
          ← All events
        </Link>

        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold font-[family-name:var(--font-display)]">
          {event.name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-surface-200">
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
            {TYPE_LABELS[event.type]}
          </span>
          <span>{event.organizer}</span>
          {event.featured ? (
            <span className="rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 px-3 py-1">
              Featured
            </span>
          ) : null}
        </div>

        <p className="mt-6 text-lg text-surface-200 leading-relaxed">
          {event.description}
        </p>

        <section className="mt-8 grid sm:grid-cols-2 gap-4">
          <Card title="Styles">{event.styles.join(", ")}</Card>
          <Card title="Regions">{event.regions.join(", ")}</Card>
          <Card title="Typical months">{months || "Varies"}</Card>
          <Card title="Website">
            <a
              href={event.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:underline break-all"
            >
              {event.website}
            </a>
          </Card>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={`/signup?ref=event-${event.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-bold text-white hover:opacity-90 transition-opacity text-sm"
          >
            Prep for this competition
          </Link>
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors text-sm"
          >
            Visit official site
          </a>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-surface-200">
          Check-ins and weekend threads for this event will appear here once Coda launches.
        </div>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-xs uppercase tracking-wider text-surface-200/70 mb-1">{title}</h3>
      <p className="text-sm text-white">{children}</p>
    </div>
  );
}
