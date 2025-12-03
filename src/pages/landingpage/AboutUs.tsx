import { HeroSection } from "./components/organisms/HeroSection";

export default function AboutUs() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="About Us"
        title="We Help You Work Smarter"
        description="Our mission is to empower teams with tools that simplify complexity and drive productivity."
      />
      {/* Placeholders for other sections */}
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">About Us Content Placeholder</p>
      </div>
    </div>
  );
}
