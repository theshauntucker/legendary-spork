import type { Metadata } from "next";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RoutineX pricing: first analysis always free. Single analysis $1.99, BOGO 2 for $2.99, Competition Pack 5 for $9.99, or Season Member $4.99/mo for 4 analyses.",
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
