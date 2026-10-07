import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in to RoutineX",
  description: "Log in to your RoutineX account.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
