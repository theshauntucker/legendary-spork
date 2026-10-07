import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About RoutineX — Built by Dance Parents, for Every Dancer",
  description: "RoutineX was built by a competitive-dance family: AI video analysis that scores routines like a competition panel and a Spotlight technique breakdown of one dancer. Privacy-first, no faces, no photos.",
  alternates: { canonical: "/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
