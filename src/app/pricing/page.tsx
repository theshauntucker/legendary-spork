import type { Metadata } from "next";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RoutineX pricing: First analysis FREE. $8.99 per single analysis or $29.99 for 5 (Competition Pack). No subscriptions, no hidden fees.",
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
