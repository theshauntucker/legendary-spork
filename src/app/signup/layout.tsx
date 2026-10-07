import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your RoutineX account",
  description: "Score your first routine for 99¢. Create a RoutineX account to upload a dance or cheer routine and get competition-style scoring in minutes.",
  alternates: { canonical: "/signup" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
