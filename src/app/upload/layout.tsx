import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload a routine",
  description: "Upload a dance or cheer routine for competition-calibrated AI scoring.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
