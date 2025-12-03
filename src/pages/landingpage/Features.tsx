import { HeroSection } from "./components/organisms/HeroSection";

export default function Features() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="Features"
        title="Powerful Features for You"
        description="Explore the tools that will revolutionize your workflow and boost your team's efficiency."
      />
      {/* Placeholders for other sections */}
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Features Content Placeholder</p>
      </div>
    </div>
  );
}
