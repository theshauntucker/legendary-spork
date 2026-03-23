import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to RoutineX Beta",
  description:
    "You're officially a RoutineX founding member. Upload your first dance or cheer video and get AI-powered competition scoring.",
  robots: { index: false, follow: false },
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
