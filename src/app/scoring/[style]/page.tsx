import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://routinex.org";

interface StyleData {
  name: string;
  slug: string;
  description: string;
  whatJudgesLookFor: string[];
  scoringTips: string[];
  commonDeductions: string[];
  proTip: string;
  ageGroups: string;
  relatedStyles: string[];
}

const STYLES: Record<string, StyleData> = {
  jazz: {
    name: "Jazz",
    slug: "jazz",
    description:
      "Jazz dance competition routines are evaluated on isolations, attack and sharpness of movement, stylistic clarity, rhythmic accuracy, tricks execution, and showmanship. Whether it's classic jazz, commercial, or funk — judges want to see clean technique with personality.",
    whatJudgesLookFor: [
      "Sharp isolations — head, rib cage, and hip isolations executed with precision and control",
      "Attack and energy — explosive movements with dynamic contrast between sharp and smooth",
      "Stylistic clarity — whether the routine is classic jazz, commercial, or funk, the style should be consistent",
      "Rhythmic accuracy — hitting accents, syncopation, and musicality with precision",
      "Trick execution — turns, leaps, and aerials performed with proper technique and clean landings",
      "Showmanship and stage presence — audience engagement, facials, and confident performance quality",
    ],
    scoringTips: [
      "Practice isolations daily — clean isolations are the #1 separator between Gold and Platinum jazz routines",
      "Work on your transitions — judges notice when dancers 'pose and wait' between combo sections",
      "Match your energy to the music — don't peak too early, build throughout the routine",
      "Film yourself from the judges' angle and watch for alignment issues you can't feel",
    ],
    commonDeductions: [
      "Sloppy isolations or movements that bleed into each other",
      "Landing tricks with a step or hop (unstable landings)",
      "Breaking character between sections",
      "Not using the full stage or getting stuck in center stage",
    ],
    proTip:
      "At competitions like StarQuest and Showstopper, jazz routines that score Platinum consistently have one thing in common: the dancer never breaks character. From the first pose to the last, every moment is performed — even the transitions.",
    ageGroups: "Jazz is competed across all age divisions from Mini (5 & Under) through Senior (15-19) and Adult (20+).",
    relatedStyles: ["contemporary", "lyrical", "musical-theater", "hip-hop"],
  },
  contemporary: {
    name: "Contemporary",
    slug: "contemporary",
    description:
      "Contemporary dance routines are judged on weight shifts, use of gravity, floorwork quality, breath integration, emotional authenticity, movement initiation, and three-dimensional movement quality. Judges want to see genuine artistry combined with strong technical foundation.",
    whatJudgesLookFor: [
      "Use of weight and gravity — fall and recovery, suspension, and release with control",
      "Floorwork quality — seamless transitions to and from the floor, not just rolling around",
      "Breath integration — visible breath connection that drives the movement quality",
      "Emotional authenticity — genuine vulnerability and storytelling, not performative emotion",
      "Movement initiation — clear understanding of where movement originates (core vs. peripheral)",
      "Three-dimensional quality — spiral patterns, use of all planes, not just frontal presentation",
    ],
    scoringTips: [
      "Invest in genuine emotional connection — judges can tell the difference between feeling it and faking it",
      "Practice your floorwork until transitions are invisible — getting up and down should look effortless",
      "Work on breath — it's the single biggest difference between a High Gold and Platinum contemporary piece",
      "Choose music that challenges you emotionally — your authentic reaction will read better than rehearsed faces",
    ],
    commonDeductions: [
      "Floorwork that looks like the dancer is just getting down and getting up",
      "Facial expressions that don't match the movement quality or music",
      "Relying too heavily on tricks over genuine contemporary technique",
      "Lacking core engagement — movements look floppy instead of controlled",
    ],
    proTip:
      "The highest-scoring contemporary routines at nationals have one secret: they make the audience forget they're watching a competition. The movement feels necessary, not choreographed. Judges at The Dance Awards and JUMP consistently reward authenticity over difficulty.",
    ageGroups: "Contemporary is one of the most popular competition styles across all age divisions, with especially strong competition in Teen (12-14) and Senior (15-19).",
    relatedStyles: ["lyrical", "modern", "ballet", "jazz"],
  },
  lyrical: {
    name: "Lyrical",
    slug: "lyrical",
    description:
      "Lyrical dance competition routines blend ballet and jazz technique with emotional storytelling. Judges evaluate musicality, lyrical interpretation, seamless transitions, emotional clarity, port de bras, upper body fluidity, and the dancer's ability to convey narrative through movement.",
    whatJudgesLookFor: [
      "Musicality and lyrical interpretation — does the movement genuinely match the song's emotional arc?",
      "Seamless transitions — no visible 'resetting' between phrases or sections",
      "Emotional storytelling clarity — the audience should understand the narrative without a program",
      "Balance of technique and expression — neither should overpower the other",
      "Port de bras and upper body fluidity — arms should move with purpose and breath",
      "Song choice and interpretation — the routine should feel inevitable with that music",
    ],
    scoringTips: [
      "Listen to your music 100 times before you start choreographing — know every breath, every crescendo",
      "Focus on your port de bras — beautiful arms can add 5+ points to a lyrical routine",
      "Don't over-emote — genuine, subtle emotion reads better than dramatic faces from 50 feet away",
      "Practice the transitions between your big moments — that's where Platinum routines separate from High Gold",
    ],
    commonDeductions: [
      "Movement that doesn't match the music's emotional quality (happy movement to sad music)",
      "Over-reliance on emotion without technical foundation",
      "Choppy transitions that break the flow",
      "Arms that look like an afterthought rather than an extension of the movement",
    ],
    proTip:
      "The #1 tip from judges at StarQuest and Starpower: your lyrical routine should make us feel something within the first 8 counts. If the opening doesn't establish an emotional connection, you're already behind.",
    ageGroups: "Lyrical is the most popular competition category for Teen and Senior divisions, with growing popularity in Junior (9-11) and Petite (6-8).",
    relatedStyles: ["contemporary", "ballet", "modern", "jazz"],
  },
  ballet: {
    name: "Ballet",
    slug: "ballet",
    description:
      "Ballet competition routines are evaluated on classical technique: turnout, placement, port de bras, adagio control, pirouettes, grand allegro, and use of classical vocabulary. Whether it's classical variations or contemporary ballet, judges expect clean lines and proper form.",
    whatJudgesLookFor: [
      "Turnout consistency — maintained through all positions and transitions, not just in static poses",
      "Port de bras and epaulement — classical upper body carriage with nuanced head and shoulder coordination",
      "Adagio control — balances held with stillness, not wobbling; extensions maintained with ease",
      "Classical line and placement — proper alignment from head through supporting foot",
      "Pirouette preparation and spotting — clean preparations, consistent spotting, controlled finishes",
      "Grand allegro — height, travel, landing quality, and proper classical form in the air",
    ],
    scoringTips: [
      "Work on your transitions between steps — judges watch the in-between moments as closely as the tricks",
      "Focus on your supporting leg — a strong, turned-out supporting leg elevates everything above it",
      "Practice finishing positions — every pirouette, every combination should end cleanly",
      "Record yourself from the side — alignment issues are most visible in profile",
    ],
    commonDeductions: [
      "Turnout that drops during movement or transitions",
      "Sickled feet, especially in releve and jumps",
      "Arms that arrive late or look tense",
      "Landing jumps with audible impact (no plié absorption)",
    ],
    proTip:
      "At YAGP and The Dance Awards, the ballet routines that win aren't always the most technically difficult — they're the ones where the technique is so clean it becomes invisible, and the artistry shines through.",
    ageGroups: "Ballet is competed in all divisions, with particularly strong fields at Junior (9-11) and Teen (12-14) levels. Pointe work is typically introduced at age 11-12.",
    relatedStyles: ["pointe", "contemporary", "lyrical", "modern"],
  },
  "hip-hop": {
    name: "Hip Hop",
    slug: "hip-hop",
    description:
      "Hip hop dance competition routines are judged on groove, musicality, isolation sharpness, stylistic authenticity, freestyle elements, and stage command. Whether it's popping, locking, breaking, or commercial hip hop — judges want to see genuine style with technical control.",
    whatJudgesLookFor: [
      "Groove and bounce — the foundational pocket that makes hip hop feel authentic",
      "Musicality — hitting beats, accents, and rhythmic patterns with precision",
      "Isolation sharpness — body control that makes each hit feel intentional and powerful",
      "Stylistic authenticity — knowledge of and respect for hip hop foundations and culture",
      "Personality and swagger — confidence and individuality that can't be choreographed",
      "Crew synchronization — for groups, tight unison with room for individual flavor",
    ],
    scoringTips: [
      "Master your groove first — without the pocket, all the tricks in the world won't score Platinum",
      "Study the foundations — judges can tell if you understand popping, locking, and breaking or if you're just doing moves",
      "Let your personality show — hip hop rewards individuality more than any other style",
      "Don't over-choreograph — leave space for musicality and natural reactions to the music",
    ],
    commonDeductions: [
      "No groove or bounce — looks like jazz with hip hop music",
      "Every move is the same intensity — no dynamic contrast",
      "Lacking personality or performing someone else's style",
      "Groups that are in unison but have no energy or flavor",
    ],
    proTip:
      "At JUMP and World of Dance, the highest-scoring hip hop routines always have moments where the dancers react to the music in real-time. Choreograph the structure, but leave room for the pocket. That's what separates Platinum from Titanium.",
    ageGroups: "Hip hop is competed across all divisions and is one of the fastest-growing competition styles, especially in Mini (5 & Under) and Petite (6-8) age groups.",
    relatedStyles: ["jazz", "open-freestyle"],
  },
  tap: {
    name: "Tap",
    slug: "tap",
    description:
      "Tap dance competition routines are judged on clarity and crispness of sound, rhythmic complexity, musicality, weight transfer efficiency, dynamics, and the integration of upper body performance with precise footwork.",
    whatJudgesLookFor: [
      "Clarity and crispness of sound — every tap should be distinct and intentional",
      "Rhythmic complexity and musicality — interesting patterns that complement the music",
      "Weight transfer efficiency — clean, efficient movement between feet",
      "Dynamics — effective use of loud and soft, fast and slow to create musical contrast",
      "Upper body carriage — maintaining performance quality while executing complex footwork",
      "Improvisation elements — the ability to play with the music beyond the choreography",
    ],
    scoringTips: [
      "Record your sound separately — listen to your routine as pure audio to check clarity",
      "Work on your heel drops and toe stands — clean basics score higher than sloppy advanced steps",
      "Practice with different tempos — speed shouldn't compromise clarity",
      "Don't forget your upper body — judges watch everything above the ankles too",
    ],
    commonDeductions: [
      "Muddy sounds where individual taps blend together",
      "Rushing through complex rhythms instead of letting them breathe",
      "Stiff or disconnected upper body",
      "Same dynamic level throughout — no contrast or musicality",
    ],
    proTip:
      "The tap routines that score Platinum Star and above at Showstopper and StarQuest share one quality: you can close your eyes and still enjoy the routine. The sounds alone tell a musical story.",
    ageGroups: "Tap is competed across all age divisions, with particularly strong competition in Junior (9-11) and Teen (12-14). Rhythm tap and Broadway tap are both represented.",
    relatedStyles: ["musical-theater", "jazz"],
  },
  acro: {
    name: "Acro",
    slug: "acro",
    description:
      "Acro dance competition routines combine dance technique with acrobatic elements. Judges evaluate skill difficulty, seamless integration of acro with dance, control and body awareness, flexibility, strength elements, landing quality, and the balance between acro and dance content.",
    whatJudgesLookFor: [
      "Skill difficulty and progression — tricks should build in complexity throughout the routine",
      "Seamless integration — acrobatic elements should flow naturally within the choreography",
      "Control and body awareness — every trick should look controlled, not thrown",
      "Flexibility demonstration — active flexibility used within the context of choreography",
      "Strength elements — handstands, press-ups, and holds that show genuine power",
      "Balance of acro and dance — the routine should be a dance piece with acro, not a tumbling pass with music",
    ],
    scoringTips: [
      "Make sure your dance is as strong as your tricks — judges deduct heavily if the dance sections feel like filler",
      "Stick every landing — a controlled landing scores higher than a harder trick with a stumble",
      "Use your flexibility in dance moments, not just tricks — it shows versatility",
      "Choreograph transitions into and out of tricks — the setup and exit matter as much as the skill",
    ],
    commonDeductions: [
      "Tricks that look disconnected from the choreography",
      "Unstable landings or visible wobbles",
      "Dance sections that are clearly weaker than acro sections",
      "Too many tricks without enough dance content",
    ],
    proTip:
      "At every major competition, the acro routines that place highest are the ones where you can't tell where the dance ends and the acro begins. Judges want to see a dancer who does tricks, not a gymnast who does choreography.",
    ageGroups: "Acro is hugely popular in Mini (5 & Under) through Junior (9-11) age groups, with increasing technical difficulty expected at Teen (12-14) and Senior (15-19) levels.",
    relatedStyles: ["jazz", "contemporary", "ballet"],
  },
  "musical-theater": {
    name: "Musical Theater",
    slug: "musical-theater",
    description:
      "Musical theater competition routines are judged on character commitment, storytelling, facial expression, stylistic accuracy, timing, and entertainment value. Judges want to see performers who can act, sing (with their body), and dance simultaneously.",
    whatJudgesLookFor: [
      "Character commitment — fully embodied character from start to finish, not just during 'acting parts'",
      "Storytelling through movement — clear narrative arc that the audience can follow",
      "Facial expression and projection — expressions that read to the back of the auditorium",
      "Stylistic accuracy — appropriate technique for the era or show being referenced",
      "Timing and comedic/dramatic skill — knowing when to hold a moment and when to move on",
      "Entertainment value — the audience should be engaged and entertained throughout",
    ],
    scoringTips: [
      "Pick a character you can fully commit to — half-hearted character work is worse than no character at all",
      "Watch the original show or movie if you're referencing one — stylistic accuracy matters",
      "Project to the back row — facial expressions and energy should fill the entire venue",
      "Practice your transitions between 'dance' and 'act' sections until they're seamless",
    ],
    commonDeductions: [
      "Breaking character during technical sections",
      "Choosing a show/era without understanding the style required",
      "Over-acting to compensate for weaker dance technique",
      "Not projecting energy and expression beyond the first few rows",
    ],
    proTip:
      "Musical theater is the style where personality wins more than any other. At Showstopper and Star Power, the Platinum Star musical theater routines are the ones where the judges are smiling, tapping their feet, or leaning forward in their seats.",
    ageGroups: "Musical theater is popular across all divisions, with particularly strong entries in Junior (9-11) and Teen (12-14). Song choice and age-appropriateness are important factors.",
    relatedStyles: ["jazz", "tap", "lyrical"],
  },
  pom: {
    name: "Pom",
    slug: "pom",
    description:
      "Pom dance competition routines are judged on motion placement precision, synchronization, sharpness, energy projection, use of levels and formations, timing accuracy, and visual impact. This style requires razor-sharp precision and athletic power.",
    whatJudgesLookFor: [
      "Motion placement precision — every arm, hand, and pom position must be exact",
      "Synchronization and uniformity — the team must move as one unit",
      "Sharpness and clean lines — crisp, powerful movements with defined endpoints",
      "Energy level and projection — sustained high energy that fills the performance space",
      "Formation changes — creative, smooth transitions between formations",
      "Timing accuracy — perfect synchronization with the music's beat structure",
    ],
    scoringTips: [
      "Film from above to check formations — spacing issues are invisible from ground level",
      "Practice counts, not just choreography — exact timing is what makes pom look professional",
      "Work on visual unity — matching energy levels matters as much as matching positions",
      "Use levels and formation variety to keep the visual interest high throughout",
    ],
    commonDeductions: [
      "Inconsistent arm placement or angles within the group",
      "Formation transitions that look messy or take too long",
      "Energy that drops in the middle of the routine",
      "Timing that's close but not exact — pom requires precision",
    ],
    proTip:
      "At UCA and NCA, the difference between a good pom routine and a championship pom routine is uniformity under pressure. Practice your routine at 80% energy and focus on matching. Then bring it to 100% and maintain that precision.",
    ageGroups: "Pom is competed primarily in Junior (9-11) through Senior (15-19) divisions, with particularly strong competition at the high school level through UCA and NCA.",
    relatedStyles: ["cheer", "jazz", "hip-hop"],
  },
  cheer: {
    name: "Cheer",
    slug: "cheer",
    description:
      "Cheer competition routines are evaluated on motion technique, jumps, tumbling difficulty, stunts, crowd engagement, synchronization, and spirit projection. Whether All-Star or school cheer, judges want to see technical excellence combined with undeniable energy.",
    whatJudgesLookFor: [
      "Motion technique — sharp, placed motions with proper hand and arm positioning",
      "Jump technique — height, form, toe touch/pike/hurdler execution, and landing control",
      "Tumbling difficulty and execution — appropriate level with clean technique",
      "Stunt execution — stability, timing, dismount control (for group routines)",
      "Crowd engagement and energy — genuine spirit that fills the venue",
      "Synchronization and spacing — team unity in movements, formations, and timing",
    ],
    scoringTips: [
      "Clean basics beat sloppy difficulty every time — a perfect back tuck scores better than a sloppy full",
      "Work on your jumps daily — height and form are the fastest way to improve scores",
      "Energy needs to be at 110% from count one — judges notice slow starts",
      "For groups: practice formations until spacing is automatic, not conscious",
    ],
    commonDeductions: [
      "Tumbling with bent knees, piked hips, or under-rotation",
      "Jumps that lack height or have inconsistent form within the team",
      "Energy that feels forced rather than genuine",
      "Sloppy transitions between sections of the routine",
    ],
    proTip:
      "At Varsity, UCA, and NCA nationals, the winning teams share one trait: they look like they're having the time of their lives while executing at the highest level. Technical perfection with genuine joy is the formula.",
    ageGroups: "Cheer is competed from Youth (6-8) through Senior (15-18) in All-Star, and JV through Varsity in school programs. Age divisions vary by organization (USASF, USA Cheer).",
    relatedStyles: ["pom", "jazz", "hip-hop"],
  },
  modern: {
    name: "Modern",
    slug: "modern",
    description:
      "Modern dance competition routines are judged on use of weight and gravity, contraction and release, floorwork, spatial awareness, breath connection, movement sequencing, and personal movement voice. Modern technique requires a deep understanding of the body's relationship to gravity and space.",
    whatJudgesLookFor: [
      "Fall and recovery — controlled use of gravity with intentional weight play",
      "Contraction and release quality — visible core engagement driving movement",
      "Floorwork integration — floor as a partner, not just a surface",
      "Spatial awareness — use of all levels, dimensions, and pathways",
      "Breath connection — movement initiated and sustained through breath",
      "Personal movement voice — individual interpretation rather than mimicry",
    ],
    scoringTips: [
      "Study a specific modern technique (Graham, Horton, Limón, Cunningham) — grounded technique scores higher",
      "Let gravity be your partner — fighting gravity looks tense, working with it looks masterful",
      "Develop your personal movement quality — modern rewards individuality over uniformity",
      "Practice moving through space, not just in place — modern dance should travel",
    ],
    commonDeductions: [
      "Movement that looks like contemporary with a 'modern' label",
      "Lack of core engagement — floppy rather than controlled release",
      "Not using the full space — staying small when the movement wants to be big",
      "Breath that's invisible — modern should show the breathing",
    ],
    proTip:
      "Modern dance is often underrepresented at competitions, which means a strong modern piece stands out immediately. Judges at NUVO and RADIX consistently remark that well-executed modern routines are refreshing and memorable.",
    ageGroups: "Modern is competed primarily in Teen (12-14) and Senior (15-19) divisions, with growing participation in Junior (9-11). Understanding of modern technique fundamentals is expected.",
    relatedStyles: ["contemporary", "ballet", "lyrical"],
  },
  pointe: {
    name: "Pointe",
    slug: "pointe",
    description:
      "Pointe competition routines are judged on pointework quality, classical placement, port de bras, turnout consistency, adagio control, use of classical vocabulary, and proper alignment en pointe. This is the most technically demanding dance style in competition.",
    whatJudgesLookFor: [
      "Pointework quality — rolling through shoes, strong relevé, balance and control en pointe",
      "Classical placement and epaulement — proper alignment of the entire body while on pointe",
      "Port de bras — elegant, purposeful arm movements that complement the footwork",
      "Turnout consistency — maintained through all positions, especially en pointe",
      "Adagio control — sustained balances, slow développés, and controlled movements",
      "Ankle and knee alignment — safe, proper technique en pointe is paramount",
    ],
    scoringTips: [
      "Never sacrifice alignment for difficulty — judges prioritize safe, correct technique en pointe",
      "Strengthen your relevé daily — the quality of your rise onto pointe is the first thing judges notice",
      "Work on your transitions off pointe — rolling down should be as controlled as rising up",
      "Choose choreography appropriate for your pointe level — overreaching leads to visible struggle",
    ],
    commonDeductions: [
      "Sickled feet or rolling over en pointe (also a safety concern)",
      "Visible struggle to maintain balance — shaking, wobbling, gripping",
      "Collapsing off pointe rather than controlled descent",
      "Choreography that exceeds the dancer's pointe-ready level",
    ],
    proTip:
      "At YAGP, the judges care far more about the quality of your pointework than the quantity of your turns. A clean, musical, well-placed routine with controlled single pirouettes will outscore a shaky routine with triples every time.",
    ageGroups: "Pointe is typically competed starting at Junior (9-11) when dancers are physically ready, with the strongest competition at Teen (12-14) and Senior (15-19) levels.",
    relatedStyles: ["ballet", "contemporary", "lyrical"],
  },
  "open-freestyle": {
    name: "Open / Freestyle",
    slug: "open-freestyle",
    description:
      "Open and Freestyle competition routines allow dancers to blend multiple styles and create unique movement vocabularies. Judges evaluate creativity, originality, technical execution across elements, performance quality, cohesion of concept, and musicality.",
    whatJudgesLookFor: [
      "Creativity and originality — movement that feels fresh and personal",
      "Stylistic fusion quality — blending genres should feel intentional, not confused",
      "Technical execution — solid technique in whatever styles are incorporated",
      "Performance quality and audience engagement — compelling from start to finish",
      "Cohesion of concept — the routine should feel unified despite diverse movement",
      "Musicality and interpretation — dynamic relationship with the music throughout",
    ],
    scoringTips: [
      "Have a clear concept — 'freestyle' doesn't mean 'no plan.' The best open routines have a strong artistic vision",
      "Make sure your technique is solid in every style you incorporate — weak links are more visible in fusion",
      "Use music that supports your concept — unexpected music choices can work but they need to make sense",
      "Rehearse it as much as any other style — open/freestyle still requires polish",
    ],
    commonDeductions: [
      "Style-switching that feels random rather than artistic",
      "Technical weakness in one style undermining the whole routine",
      "Lacking a clear concept or throughline",
      "Music choices that don't support the movement vision",
    ],
    proTip:
      "Open/Freestyle is your chance to show judges something they've never seen before. At The Dance Awards and World of Dance, the routines that win the open category are the ones that make judges lean over to each other and say 'what was that?' — in the best possible way.",
    ageGroups: "Open/Freestyle is competed across all divisions but is most popular in Teen (12-14) and Senior (15-19) where dancers have enough training to blend styles effectively.",
    relatedStyles: ["contemporary", "jazz", "hip-hop"],
  },
};

const ALL_SLUGS = Object.keys(STYLES);

export function generateStaticParams() {
  return ALL_SLUGS.map((style) => ({ style }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ style: string }>;
}): Promise<Metadata> {
  // We need to handle this synchronously for static generation
  return params.then(({ style }) => {
    const data = STYLES[style];
    if (!data) return { title: "Not Found" };

    return {
      title: `${data.name} Dance Competition Scoring — What Judges Look For`,
      description: `Learn exactly what judges look for in ${data.name} dance competition routines. Scoring tips, common deductions, and how to reach Platinum. AI-powered analysis available.`,
      keywords: [
        `${data.name.toLowerCase()} dance competition scoring`,
        `${data.name.toLowerCase()} dance competition tips`,
        `what do judges look for in ${data.name.toLowerCase()} dance`,
        `how to score higher ${data.name.toLowerCase()} dance`,
        `${data.name.toLowerCase()} dance competition rubric`,
        `${data.name.toLowerCase()} dance feedback`,
        `${data.name.toLowerCase()} dance competition deductions`,
        `${data.name.toLowerCase()} dance platinum score`,
      ],
      alternates: {
        canonical: `${BASE_URL}/scoring/${style}`,
      },
      openGraph: {
        title: `${data.name} Dance Competition Scoring Guide — RoutineX`,
        description: `What judges look for in ${data.name} routines. Scoring tips, deductions to avoid, and pro insights from competition judges.`,
        type: "article",
      },
    };
  });
}

export default async function StyleScoringPage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;
  const data = STYLES[style];

  if (!data) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${data.name} Dance Competition Scoring — What Judges Look For`,
    description: `Complete guide to ${data.name} dance competition scoring. Learn what judges evaluate, how to score higher, and common deductions to avoid.`,
    author: { "@type": "Organization", name: "RoutineX" },
    publisher: { "@type": "Organization", name: "RoutineX" },
    mainEntityOfPage: `${BASE_URL}/scoring/${style}`,
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
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-surface-200">
          <Link href="/" className="hover:text-white transition-colors">
            RoutineX
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/scoring"
            className="hover:text-white transition-colors"
          >
            Scoring Guides
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{data.name}</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <p className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-2">
            Competition Scoring Guide
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] leading-tight">
            {data.name} Dance Competition Scoring
          </h1>
          <p className="mt-4 text-lg text-surface-200 leading-relaxed">
            {data.description}
          </p>
          <p className="mt-3 text-sm text-surface-200">{data.ageGroups}</p>
        </header>

        {/* What Judges Look For */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            What Judges Look for in {data.name} Routines
          </h2>
          <div className="space-y-4">
            {data.whatJudgesLookFor.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl bg-white/5 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 text-sm font-bold">
                  {i + 1}
                </span>
                <p className="text-surface-200 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Score Higher */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            How to Score Higher in {data.name}
          </h2>
          <div className="space-y-3">
            {data.scoringTips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4"
              >
                <span className="text-green-400 font-bold shrink-0">
                  TIP {i + 1}
                </span>
                <p className="text-surface-200 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Common Deductions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Common {data.name} Deductions to Avoid
          </h2>
          <div className="space-y-3">
            {data.commonDeductions.map((deduction, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4"
              >
                <span className="text-red-400 shrink-0">&#x2717;</span>
                <p className="text-surface-200 leading-relaxed">{deduction}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tip */}
        <section className="mb-12">
          <div className="rounded-2xl bg-gradient-to-r from-primary-700/30 to-accent-600/30 p-6">
            <h2 className="text-lg font-bold mb-3">
              Pro Tip from Competition Judges
            </h2>
            <p className="text-surface-200 leading-relaxed italic">
              &ldquo;{data.proTip}&rdquo;
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-12 text-center">
          <div className="glass rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-3">
              Get AI Scoring for Your {data.name} Routine
            </h2>
            <p className="text-surface-200 mb-6">
              Upload your {data.name.toLowerCase()} routine and get instant
              feedback from 3 AI judges scoring Technique, Performance,
              Choreography, and Overall Impression on a 300-point scale.
            </p>
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-8 py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity"
            >
              Try RoutineX — $9.99 Beta Access
            </Link>
            <p className="mt-3 text-xs text-surface-200">
              Includes 3 free analyses. No subscription.
            </p>
          </div>
        </section>

        {/* Related Styles */}
        <section>
          <h2 className="text-xl font-bold mb-4">
            Related Scoring Guides
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.relatedStyles.map((slug) => {
              const related = STYLES[slug];
              if (!related) return null;
              return (
                <Link
                  key={slug}
                  href={`/scoring/${slug}`}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  {related.name} Scoring Guide
                </Link>
              );
            })}
          </div>
        </section>
      </article>
    </div>
  );
}
