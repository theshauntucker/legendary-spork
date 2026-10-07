import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyzing your routine",
  description: "Your routine is being analyzed.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
