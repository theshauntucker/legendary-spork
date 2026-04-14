import type { Metadata } from "next";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RoutineX pricing: Launch offer — 2 analyses for $8.99 (buy one, get one free). Competition Pack: 5 analyses for $29.99. No subscriptions, no hidden fees.",
  alternates: {
    canonical: "/pricing",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PricingPage() {
  return (
    <main>
      <Pricing />
      <Footer />
    </main>
  );
}
