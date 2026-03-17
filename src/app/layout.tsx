import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoutineX | AI Dance & Cheer Competition Scoring & Feedback",
  description:
    "Upload your dance or cheer video and get instant AI-powered competition-standard scoring and feedback. See your Platinum potential before you hit the stage.",
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
    "StarQuest",
    "Starpower",
    "Showstopper",
    "JUMP dance",
    "NUVO dance",
    "RADIX",
    "UCA cheer",
    "NCA cheer",
    "dance scoring levels explained",
    "how to get platinum at dance competition",
  ],
  openGraph: {
    title: "RoutineX | AI Dance & Cheer Competition Scoring & Feedback",
    description:
      "Upload your dance or cheer video and get instant AI-powered competition-standard scoring and feedback. See your Platinum potential before you hit the stage.",
    type: "website",
    siteName: "RoutineX",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoutineX | Your Dancer's Secret Weapon",
    description:
      "AI-powered competition-standard scoring for dancers & cheer teams. Upload your video, get 3-judge scoring and detailed feedback for $2.99.",
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
