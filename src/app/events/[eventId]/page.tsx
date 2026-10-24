import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_EVENTS, MONTH_NAMES, TYPE_LABELS, type DanceEvent } from "@/data/competitions";
import { GUIDES } from "@/data/guides";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://routinex.org";

export function generateStaticParams() {
  return ALL_EVENTS.map((e) => ({ eventId: e.id }));
}

const isCheer = (e: DanceEvent) => e.discipline === "cheer" || e.type === "cheer_competition" || e.type === "cheer_nationals";
const kindWord = (e: DanceEvent) => (e.type === "convention" ? "convention" : e.type.includes("nationals") ? "nationals" : "competition");
const monthsText = (e: DanceEvent) => {
  const m = e.typicalMonths.map((x) => MONTH_NAMES[x]);
  if (m.length === 0) return "";
  if (m.length === 1) return m[0];
  return `${m[0]}–${m[m.length - 1]}`;
};

export async function generateMetadata({ params }: { params: Promise<{ eventId: string }> }): Promise<Metadata> {
  const { eventId } = await params;
  const event = ALL_EVENTS.find((e) => e.id === eventId);
  if (!event) return {};
  const cheer = isCheer(event);
  const kind = kindWord(event);
  const when = monthsText(event);
  const year = new Date().getFullYear();
  const title = event.name.length > 40
    ? `${event.name} ${year}: Guide, Scoring & Prep`
    : `${event.name} ${year}: ${cheer ? "Cheer" : "Dance"} ${kind[0].toUpperCase() + kind.slice(1)} Guide, Scoring & Prep`;
  const description = `${event.name}${when ? `, typically ${when}` : ""}: what to expect, how routines are scored, and how to prep your ${cheer ? "athlete" : "dancer"} with an AI practice score before you go.`;
  return {
    title,
    description,
    alternates: { canonical: `/events/${event.id}` },
    openGraph: { title, description, url: `/events/${event.id}`, type: "article", images: [{ url: "/stage/og.jpg", width: 1200, height: 630, alt: "RoutineX" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/stage/og.jpg"] },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = ALL_EVENTS.find((e) => e.id === eventId);
  if (!event) notFound();

  const cheer = isCheer(event);
  const kind = kindWord(event);
  const when = monthsText(event);
  const months = event.typicalMonths.map((m) => MONTH_NAMES[m]).join(", ");
  const related = ALL_EVENTS.filter((e) => e.id !== event.id && (isCheer(e) === cheer) && (e.type === event.type || e.regions.some((r) => event.regions.includes(r)))).slice(0, 6);
  const guides = GUIDES.filter((g) => (cheer ? /cheer/i.test(g.slug) : !/cheer/i.test(g.slug))).slice(0, 4);
  const who = cheer ? "athlete" : "dancer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Event",
        name: event.name,
        description: event.description,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        organizer: { "@type": "Organization", name: event.organizer, url: event.website },
        location: { "@type": "Place", name: event.regions.join(", ") || "United States", address: { "@type": "PostalAddress", addressCountry: "US" } },
        url: `${BASE_URL}/events/${event.id}`,
        sameAs: event.website,
        ...(event.typicalMonths.length ? { startDate: `${new Date().getFullYear()}-${String(event.typicalMonths[0]).padStart(2, "0")}` } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: cheer ? "Cheer competitions" : "Dance competitions", item: `${BASE_URL}/events` },
          { "@type": "ListItem", position: 3, name: event.name, item: `${BASE_URL}/events/${event.id}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: `When is ${event.name}?`, acceptedAnswer: { "@type": "Answer", text: when ? `${event.name} typically runs ${when}. Exact city dates are posted on the official site (${event.website}) a few months out.` : `${event.name} dates vary by season; check ${event.website}.` } },
          { "@type": "Question", name: `How is ${event.name} scored?`, acceptedAnswer: { "@type": "Answer", text: cheer ? "Cheer panels score difficulty and execution per skill category (stunts, tumbling, jumps, dance), apply deductions for falls and safety violations, and the team that 'hits zero' with the highest raw score wins the division." : "A panel of three judges scores each routine on technique, performance, choreography and overall impression, usually out of 100 each for a 300-point total, and routines earn an adjudication award level (Gold, High Gold, Platinum, Diamond or the circuit's equivalent) plus overall placements." } },
          { "@type": "Question", name: `How do I prepare my ${who} for ${event.name}?`, acceptedAnswer: { "@type": "Answer", text: `Film a full run-through two to three weeks out, get an AI practice score, and fix the top two priorities before you travel. RoutineX scores a routine in minutes (first one is 99¢) and Spotlight gives one ${who} a frame-by-frame technique breakdown for $14.99. The score is an estimate for practice, not an official result.` } },
        ],
      },
    ],
  };

  return (
    <div data-stage-page>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="relative pt-28 pb-20 sm:pt-32">
        <div className="st-wrap max-w-4xl">
          <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-300">Home</Link> <span aria-hidden>/</span> <Link href="/events" className="hover:text-zinc-300">{cheer ? "Cheer competitions" : "Dance competitions & conventions"}</Link> <span aria-hidden>/</span> <span className="text-zinc-300">{event.name}</span>
          </nav>

          <p className="st-runner mt-8">{TYPE_LABELS[event.type]}{event.featured ? " · Featured" : ""}</p>
          <h1 className="st-display mt-3 text-4xl sm:text-6xl">{event.name}</h1>
          <p className="mt-3 text-zinc-400">{event.organizer}{when ? ` · typically ${when}` : ""}{event.regions.length ? ` · ${event.regions.join(", ")}` : ""}</p>
          <p className="st-lede mt-6">{event.description}</p>
          {event.notes && <p className="mt-3 text-[15px] text-zinc-400">{event.notes}</p>}

          <dl className="mt-10 grid gap-4 sm:grid-cols-2">
            <Fact label="Styles">{event.styles.join(", ")}</Fact>
            <Fact label="Where it runs">{event.regions.join(", ") || "Varies"}</Fact>
            <Fact label="Typical months">{months || "Varies by season"}</Fact>
            <Fact label="Official site"><a href={event.website} target="_blank" rel="noopener noreferrer" className="break-all text-amber-200 underline-offset-4 hover:underline">{event.website.replace(/^https?:\/\//, "")}</a></Fact>
          </dl>

          <section className="mt-14">
            <p className="st-runner">What to expect</p>
            <h2 className="st-h2 mt-3 text-3xl sm:text-4xl">How {event.name} weekend actually goes</h2>
            <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-zinc-300">
              {kind === "convention" ? (
                <>
                  <p>{event.name} is a convention first: the weekend is built around classes with the faculty, and the competition runs alongside it, usually in the evenings or on one dedicated day. Plan on long days in the ballroom, a packed schedule, and a lot of waiting between your {who}&apos;s classes and the awards.</p>
                  <p>Scholarship auditions and the competition both happen in front of the faculty, so what the judges see on stage is the same thing they watched in class that morning. Clean technique and a committed performance travel better than tricks.</p>
                </>
              ) : cheer ? (
                <>
                  <p>{event.name} runs on a cheer score sheet: each skill category — stunts, pyramids, tosses, tumbling, jumps and dance — is scored for difficulty and execution, and deductions come off for falls, bobbles and safety violations. The team that hits zero (no deductions) with the highest raw score wins the division.</p>
                  <p>Expect a tight warm-up rotation, a single two-and-a-half-minute run, and results that hinge on execution more than on adding difficulty. One clean routine beats one ambitious one.</p>
                </>
              ) : (
                <>
                  <p>{event.name} is a {kind}: a panel of judges scores every routine, usually three judges each out of 100 for a 300-point total, with audio critiques recorded during the performance. Routines earn an adjudication award level (the circuit&apos;s version of Gold, High Gold, Platinum or Diamond) and then compete for overall placements in their division.</p>
                  <p>Expect blocks of solos, duets and groups by age division, a long day between your {who}&apos;s performance and awards, and critiques that land with the studio owner on a drive or a link afterward.</p>
                </>
              )}
            </div>
          </section>

          <section className="mt-14">
            <p className="st-runner">Prep</p>
            <h2 className="st-h2 mt-3 text-3xl sm:text-4xl">Three things to do before {event.name}</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              <li className="rounded-2xl border border-white/10 p-5"><p className="text-xs uppercase tracking-[0.18em] text-zinc-500">1 · Two to three weeks out</p><p className="mt-2 text-[15.5px] leading-relaxed text-zinc-300">Film a full run-through from the front, the way the panel sees it. Get an AI practice score so the first time you see a number isn&apos;t at awards. It&apos;s an estimate, not an official result.</p></li>
              <li className="rounded-2xl border border-white/10 p-5"><p className="text-xs uppercase tracking-[0.18em] text-zinc-500">2 · The week before</p><p className="mt-2 text-[15.5px] leading-relaxed text-zinc-300">Fix the top two priorities only. {cheer ? "Clean execution on the skills already in the routine beats adding one more." : "A finished knee and a held landing earn more than a new trick."}</p></li>
              <li className="rounded-2xl border border-white/10 p-5"><p className="text-xs uppercase tracking-[0.18em] text-zinc-500">3 · The night before</p><p className="mt-2 text-[15.5px] leading-relaxed text-zinc-300">Walk the opening eight counts and the hardest moment in the hotel room. Decide where the eyes go on the walk-on. Then stop.</p></li>
            </ol>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/signup?ref=event-${event.id}`} className="st-btn st-btn-sunset">Score a routine — first one is 99¢</Link>
              <Link href="/spotlight" className="st-btn st-btn-ghost">Spotlight: one {who}, frame by frame — $14.99</Link>
            </div>
          </section>

          {guides.length > 0 && (
            <section className="mt-14">
              <p className="st-runner">Read before you go</p>
              <ul className="mt-4 divide-y divide-white/10">
                {guides.map((g) => (
                  <li key={g.slug} className="py-3"><Link href={`/guides/${g.slug}`} className="text-[16px] text-zinc-200 underline-offset-4 hover:underline">{g.title}</Link></li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-14">
              <p className="st-runner">Also on the calendar</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {related.map((e) => (
                  <li key={e.id}><Link href={`/events/${e.id}`} className="inline-block rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">{e.name}</Link></li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-zinc-500"><Link href="/events" className="underline-offset-4 hover:underline">← The full {cheer ? "cheer" : "dance"} calendar</Link></p>
            </section>
          )}

          <p className="mt-14 text-xs text-zinc-600">RoutineX is not affiliated with {event.organizer}. Dates, cities and formats change each season — confirm on the official site.</p>
        </div>
      </main>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <dt className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</dt>
      <dd className="mt-1.5 text-[15.5px] text-zinc-100">{children}</dd>
    </div>
  );
}
