import type { Metadata } from "next";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Common questions about RoutineX: how AI dance analysis works, supported styles and age groups, scoring accuracy, pricing, and more.",
  alternates: {
    canonical: "/faq",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FAQPage() {
  return (
    <main>
      <FAQ />
      <Footer />
    </main>
  );
}
