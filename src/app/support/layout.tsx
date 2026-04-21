import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with RoutineX. FAQs, contact form, and 24-hour response promise. We're here for dancers, cheerleaders, coaches, and parents.",
  alternates: {
    canonical: "/support",
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
