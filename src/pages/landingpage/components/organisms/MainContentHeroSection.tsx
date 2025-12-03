// src/pages/landingpage/components/organisms/MainContentHeroSection.tsx
import { MainContentHeroSectionNavbar } from "./MainContentHeroSectionNavbar";
import { BodyContentHeroSection } from "./BodyContentHeroSection";

interface MainContentHeroSectionProps {
  tagText?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
}

/**
 * Kontainer *konten* untuk Hero Section (Frame 1)
 * Wrapper div (panel) telah dipindahkan ke SectionContainer/ContentPanel.
 */
export function MainContentHeroSection({
  tagText,
  title,
  description,
  imageSrc = "/src/assets/images/landing/illustrations/interface.svg",
}: MainContentHeroSectionProps) {
  return (
    // Menggunakan React Fragment karena tidak perlu div wrapper lagi
    <>
      {/* Navbar - Sudah selesai */}
      <MainContentHeroSectionNavbar />

      {/* Body Content - Sudah selesai */}
      <BodyContentHeroSection
        tagText={tagText}
        title={title}
        description={description}
      />

      {/* Gambar "interface.svg" (dipindahkan ke sini) */}
      <img
        src={imageSrc}
        alt="Interface Illustration"
        className="w-full max-w-6xl rounded-lg" // Diberi max-width agar responsif
      />
    </>
  );
}

