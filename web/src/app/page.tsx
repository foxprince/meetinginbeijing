import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/sections/hero";
import { WhoIHelp } from "@/components/sections/who-i-help";
import { Services } from "@/components/sections/services";
import { HowItWorks } from "@/components/sections/how-it-works";
import { WhyChooseMe, Testimonials } from "@/components/sections/testimonials-why";
import { Pricing } from "@/components/sections/pricing";
import { FAQ, FinalCTA, Footer } from "@/components/sections/footer-faq-cta";
import { ContactForm } from "@/components/sections/contact-form";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div className="h-28 w-full" />}>
        <Navbar />
      </Suspense>
      <Hero />
      <WhoIHelp />
      <Services />
      <HowItWorks />
      <WhyChooseMe />
      <Testimonials />
      <Pricing />
      <FAQ />
      <ContactForm />
      <FinalCTA />
      <Footer />
    </main>
  );
}
