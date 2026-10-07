import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Choose a new RoutineX password.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
