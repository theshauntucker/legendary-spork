import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import VideoDemo from "@/components/VideoDemo";
import HowItWorks from "@/components/HowItWorks";
import SampleAnalysis from "@/components/SampleAnalysis";
import Competitions from "@/components/Competitions";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <VideoDemo />
      <HowItWorks />
      <SampleAnalysis />
      <Competitions />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
