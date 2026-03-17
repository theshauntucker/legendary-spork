import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://routinex.org";

interface CompData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  scoringSystem: string;
  awardLevels: string[];
  stylesOffered: string[];
  ageDivisions: string[];
  proTips: string[];
  howRoutinexHelps: string[];
}

const COMPETITIONS: Record<string, CompData> = {
  starquest: {
    name: "StarQuest",
    slug: "starquest",
    tagline: "One of the largest dance competition circuits in North America",
    description:
      "StarQuest Dance Competition is one of the premier dance competition organizations in the US, hosting events in cities nationwide. Known for their supportive judging environment and detailed score sheets, StarQuest attracts studios from coast to coast. Their scoring system uses a point-based rubric across technique, performance, and choreography categories.",
    scoringSystem:
      "StarQuest uses a point-based scoring system where judges evaluate routines across multiple categories. Scores are totaled and converted to award levels. Each judge provides independent scores with written feedback.",
    awardLevels: [
      "Gold — Developing skills with room for growth",
      "High Gold — Strong foundation approaching competitive level",
      "Platinum — Polished, competitive routine with consistent execution",
      "Platinum Star — Outstanding performance, top regional competitor",
      "Titanium — Elite, national-level excellence",
    ],
    stylesOffered: [
      "Jazz", "Lyrical", "Contemporary", "Ballet", "Tap", "Hip Hop",
      "Musical Theater", "Acro", "Modern", "Open/Freestyle", "Pointe",
    ],
    ageDivisions: [
      "Mini (5 & Under)", "Petite (6-8)", "Junior (9-11)",
      "Teen (12-14)", "Senior (15-19)",
    ],
    proTips: [
      "StarQuest judges are known for encouraging feedback — use their comments as specific practice goals",
      "Film your routine from the judges' table height and distance to see what they see",
      "At StarQuest regionals, Platinum is the target for competitive studios — aim for 270+ on a 300-point scale",
      "Pay attention to the detailed score breakdown — StarQuest provides category-by-category feedback that pinpoints exactly where to improve",
    ],
    howRoutinexHelps: [
      "Get StarQuest-calibrated AI scoring before your competition to identify weak spots",
      "Practice with instant feedback between competitions — don't wait months for your next score",
      "Compare your RoutineX score to StarQuest award levels and know where you stand",
      "Use the improvement roadmap to focus practice time on high-impact areas",
    ],
  },
  showstopper: {
    name: "Showstopper",
    slug: "showstopper",
    tagline: "America's premier dance competition and talent showcase",
    description:
      "Showstopper Dance Competition is one of the most prestigious competition circuits in the United States, known for attracting top studios and providing high-caliber judging. Their events feature detailed adjudication with both scores and audio critiques, giving dancers actionable feedback alongside their rankings.",
    scoringSystem:
      "Showstopper uses a comprehensive scoring system with individual judge scores that are averaged. Judges evaluate technique, performance quality, choreography, and overall impression. Audio critiques accompany written scores.",
    awardLevels: [
      "Gold — Foundational level with developing skills",
      "High Gold — Approaching competitive level with standout moments",
      "Platinum — Strong competitive routine with polished execution",
      "Platinum Star — Exceptional, top-tier regional performer",
      "Titanium — National-level excellence, virtually flawless",
    ],
    stylesOffered: [
      "Jazz", "Lyrical", "Contemporary", "Ballet", "Tap", "Hip Hop",
      "Musical Theater", "Acro", "Modern", "Pointe", "Clogging",
    ],
    ageDivisions: [
      "Mini (5 & Under)", "Petite (6-8)", "Junior (9-11)",
      "Teen (12-14)", "Senior (15-19)", "Adult",
    ],
    proTips: [
      "Showstopper judges provide audio critiques — listen to these repeatedly and take notes on specific feedback",
      "Presentation and stage presence are weighted heavily at Showstopper — the best technique won't win without performance quality",
      "Showstopper nationals are extremely competitive — routines scoring below Platinum at regionals typically need significant improvement",
      "Watch the awards ceremony closely — note what award levels the top-placing routines received to calibrate your expectations",
    ],
    howRoutinexHelps: [
      "Get Showstopper-style 3-judge scoring between events to track your progress",
      "RoutineX provides the same type of detailed category feedback Showstopper judges give",
      "Use timestamped notes to identify the exact moments in your routine that need work",
      "Analyze multiple run-throughs to track improvement over time",
    ],
  },
  jump: {
    name: "JUMP Dance Convention & Competition",
    slug: "jump",
    tagline: "The world's largest dance convention and competition tour",
    description:
      "JUMP Dance Convention is the world's largest dance convention tour, combining world-class master classes with competition events. Known for attracting top industry choreographers and talent scouts, JUMP is where serious dancers go to be seen. Their competition division features detailed scoring with industry-professional judges.",
    scoringSystem:
      "JUMP uses a scoring system that emphasizes artistry alongside technique. Judges are working industry professionals (choreographers, directors, agents) who evaluate from a real-world performance perspective as well as a technical one.",
    awardLevels: [
      "Gold — Developing dancer with growth potential",
      "High Gold — Solid skills approaching professional quality",
      "Platinum — Industry-ready technique and performance",
      "Diamond — Exceptional, stand-out performer",
    ],
    stylesOffered: [
      "Jazz", "Contemporary", "Lyrical", "Ballet", "Hip Hop",
      "Tap", "Musical Theater", "Open",
    ],
    ageDivisions: [
      "Junior (8-10)", "Teen (11-13)", "Senior (14-18)",
    ],
    proTips: [
      "JUMP judges are industry professionals — they're watching for real-world hireability, not just competition technique",
      "Take the convention classes before competing — judges notice dancers who show growth and take notes",
      "JUMP values artistry and individuality over cookie-cutter competition choreography",
      "The VIP competition at JUMP is where agents and talent scouts watch — treat every performance as an audition",
    ],
    howRoutinexHelps: [
      "Get scored before JUMP events to know where your routine ranks on a competitive scale",
      "RoutineX feedback covers the same categories JUMP judges evaluate",
      "Use the competitive edge analysis to understand what sets your routine apart (or what's missing)",
      "Analyze your routine from a performance quality perspective, not just technique",
    ],
  },
  nuvo: {
    name: "NUVO Dance Convention",
    slug: "nuvo",
    tagline: "Where artistry meets technique in competitive dance",
    description:
      "NUVO Dance Convention is known for its artistic approach to dance education and competition. NUVO events emphasize versatility, creativity, and artistry alongside technical excellence. Their judging panels include respected choreographers and educators who value well-rounded dancers.",
    scoringSystem:
      "NUVO scoring reflects their artistic philosophy — judges evaluate technical proficiency, artistic expression, musicality, and originality. Their feedback tends to focus on artistry and musicality as much as technical execution.",
    awardLevels: [
      "Gold — Building skills and artistry",
      "High Gold — Strong technique with developing artistry",
      "Platinum — Excellent technique and artistic expression",
      "Platinum Star — Outstanding artistry and technical excellence",
    ],
    stylesOffered: [
      "Jazz", "Contemporary", "Lyrical", "Ballet", "Hip Hop",
      "Tap", "Musical Theater", "Modern",
    ],
    ageDivisions: [
      "Mini (7 & Under)", "Junior (8-10)", "Teen (11-14)", "Senior (15-19)",
    ],
    proTips: [
      "NUVO rewards versatility — dancers who take multiple convention classes and show range tend to catch judges' eyes",
      "Musicality is paramount at NUVO — your movement should feel inseparable from the music",
      "NUVO judges value creative choreography over difficulty for difficulty's sake",
      "Bring genuine artistry — NUVO is where the 'artist dancers' thrive",
    ],
    howRoutinexHelps: [
      "RoutineX evaluates musicality and artistic expression — the categories NUVO values most",
      "Get feedback on your choreographic choices and whether they enhance or distract from the music",
      "Use AI scoring to identify if your routine leans too far toward technique or too far toward artistry",
      "Prepare for NUVO by analyzing your routine's artistic impact alongside technical scores",
    ],
  },
  "the-dance-awards": {
    name: "The Dance Awards",
    slug: "the-dance-awards",
    tagline: "The most prestigious title in competitive dance",
    description:
      "The Dance Awards (TDA) is widely considered the most prestigious competition in competitive dance. Held annually in Las Vegas, TDA attracts the absolute best dancers in the country competing for title positions. The judging panel features the biggest names in the dance industry, and the competition is a launching pad for professional dance careers.",
    scoringSystem:
      "TDA uses a multi-round format with preliminary, semi-final, and final rounds. Scoring is based on technique, artistry, performance quality, and overall impact. Judges are top industry professionals and their standards are the highest in competitive dance.",
    awardLevels: [
      "Finalist — Top performers who make it through preliminary rounds",
      "Semi-Finalist — Advancing to the semi-final round",
      "Title Winner — Best Dancer in their age/category division",
    ],
    stylesOffered: [
      "Junior Best Dancer", "Teen Best Dancer", "Senior Best Dancer",
      "Mini Best Dancer", "Improv", "Multiple Styles",
    ],
    ageDivisions: [
      "Mini (8 & Under)", "Junior (9-12)", "Teen (13-15)", "Senior (16-19)",
    ],
    proTips: [
      "TDA is the Olympics of competitive dance — the standard is national-level excellence in every round",
      "Versatility wins at TDA — the Best Dancer titles require strength in multiple styles",
      "The improv round at TDA separates good dancers from great ones — practice freestyle weekly",
      "Watch past TDA finals on YouTube — understand the caliber you're competing against before you go",
    ],
    howRoutinexHelps: [
      "Score your prepared pieces before TDA to ensure they're at a national-competitive level",
      "Use RoutineX to analyze routines in multiple styles to build your versatility portfolio",
      "The competition comparison feature shows how your score stacks up against top 5% thresholds",
      "Get honest, unbiased feedback to supplement your coaching — TDA-caliber prep requires multiple perspectives",
    ],
  },
  "world-of-dance": {
    name: "World of Dance",
    slug: "world-of-dance",
    tagline: "The world's largest dance entertainment brand",
    description:
      "World of Dance (WOD) is a global dance competition platform known for its open-format structure that welcomes all styles, ages, and skill levels. Made famous by the NBC TV series, WOD events attract diverse talent from street dancers to trained competitors. Their scoring emphasizes performance, creativity, and crowd impact alongside technique.",
    scoringSystem:
      "WOD uses a 100-point scoring system per judge with criteria including Performance (musicality, showmanship), Technique (execution, difficulty), Choreography (creativity, formations), and Presentation (costume, staging). Scores are averaged across judges.",
    awardLevels: [
      "Bronze — Developing competitor",
      "Silver — Solid performance with room to grow",
      "Gold — Strong competitor at regional level",
      "World of Dance Qualifier — Top performers advancing to finals",
    ],
    stylesOffered: [
      "All styles welcome", "Upper Division (trained)", "Lower Division (untrained)",
      "Solos", "Duos", "Teams",
    ],
    ageDivisions: [
      "Junior (under 18)", "Adult (18+)", "All ages in some divisions",
    ],
    proTips: [
      "WOD rewards creativity and entertainment value more than any other competition — give the audience a show",
      "Crowd reaction matters at WOD — build moments that create audible reactions",
      "WOD is more open to non-traditional dance styles — if you have a unique style, lean into it",
      "Production value (costumes, staging, concept) is part of the score at WOD — invest in the full package",
    ],
    howRoutinexHelps: [
      "Get pre-competition scoring to understand where your routine ranks before WOD events",
      "RoutineX evaluates performance quality and audience engagement — key WOD criteria",
      "Use the improvement roadmap to boost your weakest scoring areas before competition day",
      "Analyze your routine's 'entertainment factor' through the Overall Impression category",
    ],
  },
};

const ALL_SLUGS = Object.keys(COMPETITIONS);

export function generateStaticParams() {
  return ALL_SLUGS.map((comp) => ({ comp }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ comp: string }>;
}): Promise<Metadata> {
  return params.then(({ comp }) => {
    const data = COMPETITIONS[comp];
    if (!data) return { title: "Not Found" };

    return {
      title: `${data.name} Scoring Guide — How to Score Higher`,
      description: `Complete guide to scoring at ${data.name}. Award levels, scoring system, pro tips from judges, and how to reach Platinum. Prepare with AI-powered scoring.`,
      keywords: [
        `${data.name} scoring`,
        `${data.name} competition`,
        `${data.name} award levels`,
        `how to score platinum at ${data.name}`,
        `${data.name} dance competition tips`,
        `${data.name} judging criteria`,
      ],
      alternates: { canonical: `${BASE_URL}/competitions/${comp}` },
      openGraph: {
        title: `${data.name} Competition Scoring Guide — RoutineX`,
        description: `How to score higher at ${data.name}. Award levels, judging criteria, and pro tips.`,
        type: "article",
      },
    };
  });
}

export default async function CompetitionPage({
  params,
}: {
  params: Promise<{ comp: string }>;
}) {
  const { comp } = await params;
  const data = COMPETITIONS[comp];

  if (!data) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${data.name} Scoring Guide — How to Score Higher`,
    description: `Complete guide to ${data.name} dance competition scoring and award levels.`,
    author: { "@type": "Organization", name: "RoutineX" },
    publisher: { "@type": "Organization", name: "RoutineX" },
    mainEntityOfPage: `${BASE_URL}/competitions/${comp}`,
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl">
        <nav className="mb-8 text-sm text-surface-200">
          <Link href="/" className="hover:text-white transition-colors">RoutineX</Link>
          <span className="mx-2">/</span>
          <Link href="/competitions" className="hover:text-white transition-colors">Competitions</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{data.name}</span>
        </nav>

        <header className="mb-12">
          <p className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-2">Competition Guide</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] leading-tight">
            {data.name} Competition Scoring
          </h1>
          <p className="mt-2 text-lg text-accent-400 font-medium">{data.tagline}</p>
          <p className="mt-4 text-surface-200 leading-relaxed">{data.description}</p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Scoring System</h2>
          <p className="text-surface-200 leading-relaxed">{data.scoringSystem}</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Award Levels</h2>
          <div className="space-y-3">
            {data.awardLevels.map((level, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">{i + 1}</span>
                <p className="text-surface-200">{level}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Styles & Divisions</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-3">Styles Offered</h3>
              <div className="flex flex-wrap gap-2">
                {data.stylesOffered.map((s) => (
                  <span key={s} className="rounded-full bg-white/10 px-3 py-1 text-sm">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-3">Age Divisions</h3>
              <div className="flex flex-wrap gap-2">
                {data.ageDivisions.map((a) => (
                  <span key={a} className="rounded-full bg-white/10 px-3 py-1 text-sm">{a}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Pro Tips for {data.name}</h2>
          <div className="space-y-3">
            {data.proTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4">
                <span className="text-green-400 font-bold shrink-0">TIP {i + 1}</span>
                <p className="text-surface-200 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="glass rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Prepare for {data.name} with RoutineX</h2>
            <div className="text-left space-y-3 mb-6 max-w-lg mx-auto">
              {data.howRoutinexHelps.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-surface-200">
                  <span className="text-primary-400 mt-0.5 shrink-0">&#10003;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Link href="/#pricing" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-8 py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity">
              Try RoutineX — $9.99 Beta Access
            </Link>
            <p className="mt-3 text-xs text-surface-200">Includes 3 free analyses. No subscription.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">More Competition Guides</h2>
          <div className="flex flex-wrap gap-3">
            {ALL_SLUGS.filter((s) => s !== comp).map((slug) => (
              <Link key={slug} href={`/competitions/${slug}`} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors">
                {COMPETITIONS[slug].name}
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
