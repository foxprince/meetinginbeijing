import { Suspense } from "react";
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("@/components/navbar").then(mod => ({ default: mod.Navbar })), { ssr: false });
const Hero = dynamic(() => import("@/components/sections/hero").then(mod => ({ default: mod.Hero })), { ssr: false });
const WhoIHelp = dynamic(() => import("@/components/sections/who-i-help").then(mod => ({ default: mod.WhoIHelp })), { ssr: false });
const Services = dynamic(() => import("@/components/sections/services").then(mod => ({ default: mod.Services })), { ssr: false });
const HowItWorks = dynamic(() => import("@/components/sections/how-it-works").then(mod => ({ default: mod.HowItWorks })), { ssr: false });
const WhyChooseMe = dynamic(() => import("@/components/sections/testimonials-why").then(mod => ({ default: mod.WhyChooseMe })), { ssr: false });
const Testimonials = dynamic(() => import("@/components/sections/testimonials-why").then(mod => ({ default: mod.Testimonials })), { ssr: false });
const Pricing = dynamic(() => import("@/components/sections/pricing").then(mod => ({ default: mod.Pricing })), { ssr: false });
const FAQ = dynamic(() => import("@/components/sections/footer-faq-cta").then(mod => ({ default: mod.FAQ })), { ssr: false });
const FinalCTA = dynamic(() => import("@/components/sections/footer-faq-cta").then(mod => ({ default: mod.FinalCTA })), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/footer-faq-cta").then(mod => ({ default: mod.Footer })), { ssr: false });
const ContactForm = dynamic(() => import("@/components/sections/contact-form").then(mod => ({ default: mod.ContactForm })), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
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
