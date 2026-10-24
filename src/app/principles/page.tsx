import type { Metadata } from "next";
import { Glass } from "@/components/ui/Glass";
import { GradientText } from "@/components/ui/GradientText";

const TITLE = "How posts get seen";
const SOCIAL_TITLE = "How posts get seen | RoutineX";
const DESCRIPTION =
  "RoutineX does not give posts a minimum audience. The feed helper lists achievements from people you follow and your studio, newest first, and no page calls it.";
const IMAGE_ALT =
  "How posts get seen. RoutineX does not give posts a minimum audience.";

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
        RoutineX does not give a dance or cheer post a minimum audience. Nothing
        running on the site places a post into other people&apos;s feeds because it
        has not been seen enough.
      </p>

      <Glass style={{ padding: 24, marginTop: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>How posts get seen</h2>
        <p style={{ fontSize: 15, opacity: 0.85, marginTop: 10, lineHeight: 1.6 }}>
          There is no live step that keeps showing a post until a set number of
          people have seen it. The product does not pick viewers by age tier,
          studio, competition region, or style in order to fill an audience.
        </p>
        <p style={{ fontSize: 15, opacity: 0.85, marginTop: 10, lineHeight: 1.6 }}>
          The only feed helper in the app is not connected to a page or an API
          route, so it is not choosing what anyone sees.
        </p>
      </Glass>

      <Glass style={{ padding: 24, marginTop: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>What that helper does</h2>
        <p style={{ fontSize: 15, opacity: 0.85, marginTop: 10, lineHeight: 1.6 }}>
          If it is called, it lists achievements, newest first.
        </p>
        <ul style={{ paddingLeft: 20, marginTop: 10, lineHeight: 1.8, fontSize: 15 }}>
          <li>
            When you follow someone, or you belong to a studio, the list is
            limited to those accounts. People you follow are tagged follow.
            Studio mates you do not follow are tagged studio.
          </li>
          <li>
            When you follow no one and have no studio, the list is recent
            achievements, tagged discovery. They are not chosen by style or region.
          </li>
          <li>The same person appears at most three times.</li>
          <li>
            Accounts flagged as test data are left out, unless the viewer is on
            the admin ghost list.
          </li>
        </ul>
        <p style={{ fontSize: 15, opacity: 0.85, marginTop: 10, lineHeight: 1.6 }}>
          A weight table in that helper is not used to sort or fill the list. The
          helper does not read event check-ins, dance bonds, or a queue of posts
          that still need viewers. It does not move older posts down. It does not
          filter by public, followers, studio, or private. It has no paid placement.
        </p>
      </Glass>
    </main>
  );
}
