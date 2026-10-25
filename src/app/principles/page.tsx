import type { Metadata } from "next";
import { Glass } from "@/components/ui/Glass";
import { GradientText } from "@/components/ui/GradientText";

const TITLE = "How posts get seen";
const SOCIAL_TITLE = "How posts get seen | RoutineX";
const DESCRIPTION =
  "Posts aren't given a guaranteed audience. The feed shows achievements from people you follow and your studio, newest first.";
const IMAGE_ALT =
  "How posts get seen. Posts aren't given a guaranteed audience.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/principles" },
  openGraph: {
    title: SOCIAL_TITLE,
    description: DESCRIPTION,
    url: "/principles",
    type: "website",
    siteName: "RoutineX",
    locale: "en_US",
    images: [
      {
        url: "/principles/opengraph-image",
        width: 1200,
        height: 630,
        alt: IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/principles/opengraph-image",
        alt: IMAGE_ALT,
      },
    ],
  },
};

export default function PrinciplesPage() {
  return (
    <main style={{ minHeight: "100vh", padding: 32, maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1 }}>
        How posts get <GradientText gradient="sunsetText">seen</GradientText>
      </h1>
      <p style={{ fontSize: 17, opacity: 0.8, marginTop: 20, lineHeight: 1.6 }}>
        Posts aren&apos;t given a guaranteed audience. A dance or cheer post isn&apos;t
        added to other people&apos;s feeds just because few people have seen it.
      </p>

      <Glass style={{ padding: 24, marginTop: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>How posts get seen</h2>
        <p style={{ fontSize: 15, opacity: 0.85, marginTop: 10, lineHeight: 1.6 }}>
          The feed shows achievements from people you follow and your studio, newest
          first. If you don&apos;t follow anyone and you aren&apos;t in a studio, you see
          recent achievements, still newest first. Those aren&apos;t chosen by style or
          region.
        </p>
        <p style={{ fontSize: 15, opacity: 0.85, marginTop: 10, lineHeight: 1.6 }}>
          The same person shows up at most three times. Posts aren&apos;t paid
          placements, and older ones aren&apos;t pushed down the list.
        </p>
      </Glass>
    </main>
  );
}
