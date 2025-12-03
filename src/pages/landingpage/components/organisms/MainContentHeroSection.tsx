import { MainContentHeroSectionNavbar } from "./MainContentHeroSectionNavbar";
import { BodyContentHeroSection } from "./BodyContentHeroSection";

/**
 * Kontainer *konten* untuk Hero Section (Frame 1)
 * Wrapper div (panel) telah dipindahkan ke SectionContainer/ContentPanel.
 */
export function MainContentHeroSection() {
  return (
    // Menggunakan React Fragment karena tidak perlu div wrapper lagi
    <>
      {/* Navbar - Sudah selesai */}
      <MainContentHeroSectionNavbar />

      {/* Body Content - Sudah selesai */}
      <BodyContentHeroSection />

      {/* Gambar "interface.svg" (dipindahkan ke sini) */}
      <img
        src="/src/assets/images/landing/illustrations/interface.svg"
        alt="Interface Illustration"
        className="w-full max-w-6xl rounded-lg" // Diberi max-width agar responsif
      />
    </>
  );
}

