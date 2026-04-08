import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";

import Navbar from "@/components/Navbar";
import CountdownBanner from "@/components/CountdownBanner";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "RoutineX — AI-Powered Dance & Cheer Video Analysis",
    template: "%s | RoutineX",
  },
  description:
    "Get competition-standard scoring and actionable feedback on every routine. Upload your video, receive detailed AI analysis of technique, performance, choreography & more. Built for competitive dancers, cheer teams, parents & coaches.",
  keywords: [
    "dance competition",
    "cheer competition",
    "dance video analysis",
    "dance scoring",
    "AI dance analysis",
    "dance feedback",
    "competitive dance",
    "dance routine scoring",
    "cheer routine analysis",
    "dance judge scoring",
    "Star Power dance",
    "JUMP dance convention",
    "NUVO dance convention",
    "UCA cheer",
    "NCA cheer",
    "dance competition prep",
    "dance technique feedback",
    "dance parent tools",
    "dance coach tools",
    "routine improvement",
    "dance score calculator",
  ],
  alternates: {},
  openGraph: {
    title: "RoutineX — AI-Powered Dance & Cheer Video Analysis",
    description:
      "Competition-standard scoring and feedback for every routine. Upload your video and get detailed AI analysis in under 5 minutes.",
    type: "website",
    siteName: "RoutineX",
    url: BASE_URL,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "RoutineX — AI-Powered Dance & Cheer Video Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RoutineX — Your Dancer's Secret Weapon",
    description:
      "AI-powered video analysis for competitive dancers & cheer teams. First analysis FREE — then from $6/video.",
    images: ["/opengraph-image"],
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
  verification: {
    // Add your Google Search Console verification code here
    // google: "your-verification-code",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "RoutineX",
      url: BASE_URL,
      description:
        "AI-powered dance and cheer video analysis with competition-standard scoring.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "RoutineX",
      applicationCategory: "SportApplication",
      operatingSystem: "Web",
      description:
        "Upload any dance or cheer routine and get competition-standard scoring with detailed, actionable feedback powered by AI trained on real judging rubrics.",
      offers: [
        {
          "@type": "Offer",
          name: "Single Analysis",
          price: "8.99",
          priceCurrency: "USD",
          description: "One AI-powered competition-standard dance routine analysis",
        },
        {
          "@type": "Offer",
          name: "Competition Pack (5 Analyses)",
          price: "29.99",
          priceCurrency: "USD",
          description: "5 AI-powered dance routine analyses — only $6 each",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        ratingCount: "48",
        bestRating: "5",
        worstRating: "1",
      },
    },
    {
      "@type": "Organization",
      name: "RoutineX",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.svg`,
      sameAs: [],
    },
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <CountdownBanner />
        <Navbar />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
