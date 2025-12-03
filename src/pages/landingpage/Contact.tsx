import { HeroSection } from "./components/organisms/HeroSection";

export default function Contact() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="Contact Us"
        title="Get in Touch"
        description="Have questions? We're here to help. Reach out to our team for support or inquiries."
      />
      {/* Placeholders for other sections */}
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Contact Content Placeholder</p>
      </div>
    </div>
  );
}
