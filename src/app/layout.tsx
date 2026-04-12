import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://faithlens.org";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:
      "FaithLens — Explore the World's Religions Without Bias",
    template: "%s | FaithLens",
  },
  description:
    "An unbiased, all-encompassing guide to the world's religions. Explore Mormonism, Christianity, Islam, Catholicism, Jehovah's Witnesses and more. Every faith gets equal space — no bias, just information.",
  keywords: [
    "religion",
    "mormonism",
    "christianity",
    "islam",
    "catholicism",
    "jehovah's witnesses",
    "CES letter",
    "book of mormon",
    "bible",
    "quran",
    "religious comparison",
    "world religions",
    "LDS church",
    "church of jesus christ",
    "faith exploration",
    "religious studies",
    "comparative religion",
  ],
  openGraph: {
    title: "FaithLens — Explore the World's Religions Without Bias",
    description:
      "An unbiased guide to every major religion. Documents, official links, missionary info, critical analysis — all viewpoints represented fairly.",
    type: "website",
    siteName: "FaithLens",
    url: BASE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FaithLens — Explore the World's Religions Without Bias",
    description:
      "An unbiased, all-encompassing guide to the world's religions. Every faith gets equal space.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "FaithLens",
      url: BASE_URL,
      description:
        "An unbiased, all-encompassing guide to the world's religions.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "FaithLens",
      url: BASE_URL,
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Merriweather:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
