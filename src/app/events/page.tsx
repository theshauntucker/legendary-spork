import { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Dance Competition & Convention Calendar 2026 | RoutineX",
  description: "The complete guide to competitive dance events in 2026. Find competitions, conventions, and nationals near you — StarPower, Jump, NYCDA, Tremaine, Hollywood Vibe, and more.",
  keywords: [
    "dance competition 2026", "dance convention 2026", "competitive dance events",
    "StarPower dance", "Jump dance convention", "NYCDA", "Tremaine dance",
    "Hollywood Vibe dance", "Monsters of Hip Hop", "dance nationals 2026",
    "dance competition schedule", "dance mom competition calendar",
  ],
  openGraph: {
    title: "Dance Competition & Convention Calendar 2026 | RoutineX",
    description: "Find every major dance competition and convention near you. Updated for the 2025–2026 season.",
  },
};

export default function EventsPage() {
  return <EventsClient />;
}
