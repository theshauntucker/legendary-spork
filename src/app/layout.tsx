import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Vibeproof — Explore the World's Faith Traditions",
    template: "%s | Vibeproof",
  },
  description:
    "A neutral, academic platform for religious literacy. Explore the history, beliefs, and practices of the world's faith traditions with equal care and scholarly rigor.",
  keywords: [
    "world religions",
    "religious literacy",
    "comparative religion",
    "faith traditions",
    "religious studies",
    "theology",
    "philosophy of religion",
    "interfaith",
    "religious history",
  ],
  openGraph: {
    title: "Vibeproof — Explore the World's Faith Traditions",
    description:
      "A neutral, academic platform for religious literacy. Explore the history, beliefs, and practices of every major faith tradition with equal care.",
    type: "website",
    siteName: "Vibeproof",
    url: BASE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibeproof — Explore the World's Faith Traditions",
    description:
      "A neutral, academic platform for religious literacy. Every tradition explored with equal care.",
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
      name: "Vibeproof",
      url: BASE_URL,
      description:
        "A neutral, academic platform for religious literacy. Explore the world's faith traditions with equal care and scholarly rigor.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "Vibeproof",
      url: BASE_URL,
      description:
        "An educational platform presenting the world's faith traditions with neutrality and academic rigor.",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ezoicId = process.env.NEXT_PUBLIC_EZOIC_ID;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="google-adsense-account" content="ca-pub-7833856993657379" />
        <Script
          id="adsbygoogle-init"
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7833856993657379"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-cream-50 text-ink-800 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        {ezoicId && (
          <Script
            src="//www.ezojs.com/ezoic/sa.min.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
