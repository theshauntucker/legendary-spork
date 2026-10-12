import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RoutineX Studio — Private Routine Analysis for Dance & Cheer Studios",
  description: "Give every routine in the studio an AI practice score before it leaves the building. RoutineX Studio: unlimited analyses, season tracking and Spotlight breakdowns, $99/mo with a 30-day free trial.",
  alternates: { canonical: "/studio/signup" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
