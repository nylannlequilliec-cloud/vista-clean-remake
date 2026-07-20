import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { TrustBanner } from "@/components/sections/trust-banner";
import { QuickEstimate } from "@/components/sections/quick-estimate";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { Team } from "@/components/sections/team";
import { Pricing } from "@/components/sections/pricing";
import { BeforeAfter } from "@/components/sections/before-after";
import { Testimonials } from "@/components/sections/testimonials";
import { TikTokBanner } from "@/components/sections/tiktok-banner";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBanner />
        <QuickEstimate />
        <Services />
        <Process />
        <Team />
        <Pricing />
        <BeforeAfter />
        <Testimonials />
        <TikTokBanner />
        <CTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
