import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import SampleAnalysis from "@/components/SampleAnalysis";
import Competitions from "@/components/Competitions";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
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
