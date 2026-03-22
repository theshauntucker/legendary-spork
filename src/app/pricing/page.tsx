import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RoutineX pricing: $4.99 one-time Founding Member Pass with 1 analysis included, or $4.99 per video. No subscriptions, no hidden fees.",
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
      <Navbar />
      <Pricing />
      <Footer />
    </main>
  );
}
