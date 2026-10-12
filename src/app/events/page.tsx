import { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Dance Competition & Convention Calendar 2026 | RoutineX",
  description: "The complete guide to competitive dance events in 2026. Find competitions, conventions, and nationals near you.",
  keywords: [
    "dance competition 2026", "dance convention 2026", "competitive dance events",
    "dance nationals 2026",
    "dance competition schedule", "dance mom competition calendar",
  ],
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Dance Competition & Convention Calendar 2026 | RoutineX",
    description: "Find every major dance competition and convention near you. Updated for the 2025–2026 season.",
  },
};

export default function EventsPage() {
  return <EventsClient />;
}
