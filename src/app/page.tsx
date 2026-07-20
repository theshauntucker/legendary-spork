import type { Metadata } from "next";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import SampleAnalysis from "@/components/SampleAnalysis";
import Features from "@/components/Features";
import PrivacyTrust from "@/components/PrivacyTrust";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StickyBottomCTA from "@/components/StickyBottomCTA";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <div data-bright-page>
      <Hero />
      <HowItWorks />
      <SampleAnalysis />
      <Features />
      <PrivacyTrust />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
      <StickyBottomCTA />
    </div>
  );
}
