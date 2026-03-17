import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Your Routine",
  description:
    "Upload your dance or cheer competition video to get instant AI-powered scoring from 3 expert judges. Supports Jazz, Contemporary, Lyrical, Hip Hop, Ballet, Tap, Acro, Musical Theater, Pom, and more.",
  alternates: {
    canonical: "/upload",
  },
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
