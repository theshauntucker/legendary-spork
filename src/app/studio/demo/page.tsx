import type { Metadata } from "next";
import StudioDemoClient from "./StudioDemoClient";

export const metadata: Metadata = {
  title: "RoutineX for Studios — Live Demo",
  description:
    "See how a real RoutineX studio roster, team board, and MRR dashboard work before you start your trial.",
  alternates: { canonical: "/studio/demo" },
  openGraph: {
    title: "RoutineX for Studios — Live Demo",
    description:
      "A five-minute walkthrough of the roster, team board, and MRR dashboard — no signup required.",
    url: "https://routinex.org/studio/demo",
    siteName: "RoutineX",
    type: "website",
  },
};

export const dynamic = "force-static";

export default function StudioDemoPage() {
  return <StudioDemoClient />;
}
