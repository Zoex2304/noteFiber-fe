import { HeroSection } from "./components/organisms/HeroSection";

export default function Pricing() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="Pricing"
        title="Simple, Transparent Pricing"
        description="Choose the plan that fits your needs. No hidden fees, just straightforward pricing for powerful productivity tools."
      />
      {/* Placeholders for other sections */}
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Pricing Content Placeholder</p>
      </div>
    </div>
  );
}
