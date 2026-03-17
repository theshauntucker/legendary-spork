import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://routinex.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "RoutineX | AI Dance & Cheer Competition Scoring & Feedback",
    template: "%s | RoutineX",
  },
  description:
    "Upload your dance or cheer video and get instant AI-powered competition-standard scoring from 3 expert judges. Gold, Platinum, Titanium — see your score before you hit the stage.",
  keywords: [
    "dance competition scoring app",
    "AI dance feedback",
    "dance video analysis app",
    "dance technique feedback",
    "competition dance scoring",
    "cheer competition scoring app",
    "dance judge feedback",
    "how to improve dance competition scores",
    "what do dance judges look for",
    "dance competition scoring rubric",
    "virtual dance judge",
    "AI dance coach",
    "dance performance analysis",
    "competitive dance",
    "dance competition prep",
    "dance scoring levels explained",
    "how to get platinum at dance competition",
    "how to score higher at dance competition",
    "dance competition tips",
    "StarQuest dance competition",
    "Starpower dance competition",
    "Showstopper dance competition",
    "JUMP dance convention",
    "NUVO dance convention",
    "RADIX dance convention",
    "The Dance Awards",
    "Star Power Talent Competition",
    "UCA cheer competition",
    "NCA cheer competition",
    "World of Dance",
    "dance competition gold platinum titanium",
    "AI cheer scoring",
    "dance competition practice tool",
    "dance competition judge simulator",
    "solo dance competition scoring",
    "group dance competition analysis",
    "lyrical dance feedback",
    "jazz dance scoring",
    "contemporary dance competition",
    "hip hop dance scoring",
    "ballet competition scoring",
    "tap dance competition",
    "acro dance scoring",
    "musical theater dance competition",
    "pom dance scoring",
  ],
  openGraph: {
    title: "RoutineX | AI Dance & Cheer Competition Scoring & Feedback",
    description:
      "Upload your dance or cheer video and get instant 3-judge scoring with detailed feedback. Gold, Platinum, Titanium — know your score before competition day.",
    type: "website",
    siteName: "RoutineX",
    url: BASE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoutineX | Your Dancer's Secret Weapon",
    description:
      "AI-powered 3-judge scoring for dance & cheer. Upload your video, get competition-standard feedback in under 2 minutes. See your Platinum potential.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "Sports Technology",
};

// JSON-LD Structured Data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RoutineX",
  url: BASE_URL,
  description:
    "AI-powered dance and cheer competition scoring platform that provides instant, competition-standard feedback from a simulated 3-judge panel.",
  sameAs: [],
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "RoutineX Beta — Early Access Pass",
  description:
    "AI-powered dance and cheer competition scoring. Upload your video and get instant 3-judge scoring with detailed technique, performance, choreography, and overall impression feedback on a 300-point scale.",
  brand: { "@type": "Brand", name: "RoutineX" },
  offers: {
    "@type": "Offer",
    price: "9.99",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `${BASE_URL}/#pricing`,
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does the AI dance analysis work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RoutineX uses advanced AI trained on real competition judging rubrics from major organizations. When you upload a video, our AI evaluates technique, performance quality, choreography, and overall impression — the same categories judges use — and generates a detailed scorecard with actionable feedback in under 5 minutes.",
      },
    },
    {
      "@type": "Question",
      name: "What video formats and lengths are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We accept MP4, MOV, AVI, and all standard video formats. Routines can be up to 10 minutes long. For best results, we recommend recording from a front-facing angle with good lighting, similar to how judges would view the performance.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is the AI scoring compared to real dance judges?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our AI is trained on thousands of real competition scores and judging rubrics. While no AI replaces the nuance of a live judge, RoutineX provides consistent, unbiased feedback that closely mirrors competition scoring. Beta testers report their RoutineX scores typically fall within 5-8 points of their actual competition scores.",
      },
    },
    {
      "@type": "Question",
      name: "Is RoutineX a replacement for dance judges or coaching?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not at all — RoutineX is a training tool, not a replacement. Think of it as having an extra set of expert eyes on every practice run. Use it between competitions and lessons to track progress, identify areas for improvement, and make the most of your studio time.",
      },
    },
    {
      "@type": "Question",
      name: "What dance age groups and styles does RoutineX work for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RoutineX works for all competitive age divisions — Mini, Petite, Junior, Teen, and Senior. We support Jazz, Contemporary, Lyrical, Hip Hop, Tap, Ballet, Musical Theater, Pom, Acro, and more. Our AI adapts its scoring criteria to each style.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use RoutineX for cheer routines?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! RoutineX analyzes cheer routines with the same level of detail, evaluating tumbling, stunts, formations, synchronization, and overall performance quality. It works for both All-Star and school cheer programs.",
      },
    },
    {
      "@type": "Question",
      name: "What do I get as a RoutineX beta member?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Beta members ($9.99 one-time) get priority access when we launch, 3 free video analyses to sample the full platform, founding member status with a profile badge, and a direct feedback channel to shape the product. Only 500 beta spots are available.",
      },
    },
    {
      "@type": "Question",
      name: "What dance competition scoring levels does RoutineX use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RoutineX uses a 300-point scale with award levels matching real competitions: Gold (developing skills), High Gold (approaching competitive level), Platinum (strong competitive routine), Platinum Star (top-tier regional competitor), and Titanium (national-level excellence). Three AI judges score Technique, Performance, Choreography, and Overall Impression independently.",
      },
    },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RoutineX",
  applicationCategory: "SportsApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "9.99",
    priceCurrency: "USD",
  },
  description:
    "AI-powered dance and cheer competition scoring app. Upload your video, get instant 3-judge feedback on a 300-point scale with Gold, Platinum, and Titanium award levels.",
  featureList: [
    "3-judge AI scoring panel",
    "300-point competition-standard scale",
    "Technique, Performance, Choreography scoring",
    "Timestamped feedback notes",
    "Improvement roadmap",
    "Competition comparison stats",
    "15+ dance style support",
    "All age divisions",
    "PDF report download",
    "Email results delivery",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareSchema),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
