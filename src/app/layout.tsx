import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoutineX — AI-Powered Dance & Cheer Video Analysis",
  description:
    "Get competition-standard scoring and actionable feedback on every routine. Upload your video, receive detailed AI analysis of technique, performance, choreography & more. Built for competitive dancers, cheer teams, parents & coaches.",
  keywords: [
    "dance competition",
    "cheer competition",
    "dance video analysis",
    "dance scoring",
    "Star Power",
    "JUMP dance",
    "NUVO dance",
    "UCA cheer",
    "NCA cheer",
    "competitive dance",
    "dance feedback",
    "AI dance analysis",
  ],
  openGraph: {
    title: "RoutineX — AI-Powered Dance & Cheer Video Analysis",
    description:
      "Competition-standard scoring and feedback for every routine. Join 500 beta testers getting early access.",
    type: "website",
    siteName: "RoutineX",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoutineX — Your Dancer's Secret Weapon",
    description:
      "AI-powered video analysis for competitive dancers & cheer teams. Get competition-standard scoring for $2.99/video.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
      </head>
      <body>{children}</body>
    </html>
  );
}
