import { HeroSection } from "./components/organisms/HeroSection";
import { AboutUsSection2 } from "./components/organisms/AboutUsSection2";
import { Section8 } from "./components/organisms/Section8";

export default function AboutUs() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="About Us"
        title="We Help You Work Smarter"
        description="Our mission is to empower teams with tools that simplify complexity and drive productivity."
        imageSrc="/src/assets/images/landing/illustrations/podium.svg"
      />
      <AboutUsSection2 />
      <Section8 />
    </div>
  );
}
