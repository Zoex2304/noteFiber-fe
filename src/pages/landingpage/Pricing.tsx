import { HeroSection } from "./components/organisms/HeroSection";
import { PricingContent } from "./components/organisms/PricingContent";
import { FAQSection } from "./components/organisms/FAQSection";

export default function Pricing() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="Pricing"
        title="Simple, Transparent Pricing"
        description="Choose the plan that fits your needs. No hidden fees, just straightforward pricing for powerful productivity tools."
        customHeroContent={<PricingContent />}
      />
      <FAQSection />
    </div>
  );
}
