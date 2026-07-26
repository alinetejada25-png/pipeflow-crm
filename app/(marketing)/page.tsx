import { Hero } from "@/components/marketing/hero";
import { Stats } from "@/components/marketing/stats";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { CtaSection } from "@/components/marketing/cta-section";

export default function MarketingHomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Pricing />
      <CtaSection />
    </>
  );
}
