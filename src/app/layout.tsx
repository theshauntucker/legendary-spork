import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";

import Navbar from "@/components/Navbar";
import { AtmosphereProvider } from "@/components/AtmosphereProvider";
import { BottomNav } from "@/components/BottomNav";
import NativeIapBoot from "@/components/NativeIapBoot";
import { isNativeIosShell } from "@/lib/native-shell";
import MarketingPixels from "@/components/MarketingPixels";

// iPhone / mobile rendering tuned to match modern app sites:
// - viewportFit: "cover" lets the page render under the notch / home
//   indicator and exposes env(safe-area-inset-*) so fixed nav bars sit
//   correctly on iPhone X+
// - maximumScale 5 keeps accessibility pinch-to-zoom intact
// - themeColor sets the iOS Safari URL bar / Android status bar
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // 1.0 minimum — the app should fit the viewport perfectly with no
  // need to zoom out. Pinch-in for accessibility is still allowed
  // up to 5x. (Earlier we briefly allowed 0.5 to work around an
  // overflow; the right fix is to make the layout actually fit.)
  minimumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F2" },
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  // Smart App Banner — iOS Safari shows the native "Open in App Store"
  // banner at the top of every page, the same way the big consumer apps
  // do it. Does not render inside the Capacitor WKWebView shell.
  itunes: {
    appId: "6763345348",
  },
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
    "cheer parent tools",
    "cheer scoring",
    "all-star cheer analysis",
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
    title: "RoutineX — Know the Score Before the Judges Do",
    description:
      "AI video analysis for competitive dance & cheer. Three judges, a 300-point scorecard, and timestamped notes on every routine.",
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
      operatingSystem: "iOS, Web",
      installUrl:
        "https://apps.apple.com/us/app/routinex-dance-cheer-ai/id6763345348",
      description:
        "Upload any dance or cheer routine and get competition-standard scoring with detailed, actionable feedback powered by AI trained on real judging rubrics.",
      offers: [
        {
          "@type": "Offer",
          name: "Single Analysis",
          price: "1.99",
          priceCurrency: "USD",
          description: "One AI-powered competition-standard dance or cheer routine analysis",
        },
        {
          "@type": "Offer",
          name: "Competition Pack (5 Analyses)",
          price: "9.99",
          priceCurrency: "USD",
          description: "5 AI-powered dance or cheer routine analyses — only $1.99 each",
        },
      ],
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // When the page is served inside the native iOS Capacitor shell, strip
  // all the marketing chrome (CountdownBanner, top Navbar, "coming soon"
  // cues) so the WebView feels like a real app, not a website preview.
  // Detection is via a User-Agent suffix appended by Capacitor —
  // see mobile/capacitor.config.ts and src/lib/native-shell.ts.
  const inIosApp = await isNativeIosShell();

  return (
    <html
      lang="en"
      className="antialiased"
      data-native-shell={inIosApp ? "ios" : undefined}
    >
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
        <AtmosphereProvider atmosphere="daytime">
          {/* Pre-warms StoreKit inside the iOS Capacitor shell so the
              first Buy click doesn't race the Capacitor bridge. No-op
              everywhere else. */}
          <NativeIapBoot />
          {/* Top Navbar always renders (web + iOS shell). Apple's reviewer
              must be able to reach Settings -> Delete Account, and the
              Navbar is the only durable cross-surface nav. */}
          <Navbar />
          {/* Top padding is tightened inside the iOS shell via the
              `[data-native-shell="ios"] main` rule in globals.css so
              the hero isn't pushed ~250px down by stacked safe-area
              + navbar + main padding. Web keeps the pt-24 spacing. */}
          <main className="pt-24 pb-24 md:pb-0">
            {children}
          </main>
          <BottomNav />
        </AtmosphereProvider>
        <Analytics />
        <SpeedInsights />
        {/* Marketing / advertising pixels — public marketing pages only.
            Gated by pathname inside the component so they never load on
            logged-in surfaces (dashboard, upload, analysis, settings). */}
        <MarketingPixels />
      </body>
    </html>
  );
}
