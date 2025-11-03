import { useSearchParams } from "react-router-dom";

// Impor 8 section untuk halaman utama
import { HeroSection } from "@/features/landing/components/HeroSection";
import { Section2 } from "@/features/landing/components/Section2";
import { Section3 } from "@/features/landing/components/Section3";
import { Section4 } from "@/features/landing/components/Section4";
import { Section5 } from "@/features/landing/components/Section5";
import { Section6 } from "@/features/landing/components/Section6";
import { Section7 } from "@/features/landing/components/Section7";
import { Section8 } from "@/features/landing/components/Section8";

// DIPERBARUI: Impor halaman-halaman baru dari direktori yang sama
import { Features } from "./Features";
import { Pricing } from "./Pricing";
import { AboutUs } from "./AboutUs";
import { Contact } from "./Contact";

/**
 * Halaman Landing Page Utama (Controller)
 * Lokasi baru: src/pages/landingpage/LandingPage.tsx
 */
export default function LandingPage() {
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page");

  // Fungsi untuk memilih konten yang akan dirender
  const renderPageContent = () => {
    // DIPERBARUI: Menggunakan komponen yang baru diimpor
    switch (page) {
      case "features":
        return <Features />;
      case "pricing":
        return <Pricing />;
      case "about-us":
        return <AboutUs />;
      case "contact":
        return <Contact />;
      default:
        // Default: Tampilkan 8 section utama
        return (
          <>
            <HeroSection />
            <Section2 />
            <Section3 />
            <Section4 />
            <Section5 />
            <Section6 />
            <Section7 />
            <Section8 />
          </>
        );
    }
  };

  return (
    // Style 'body' (main frame) dari Figma Anda
    <main className="mx-auto flex w-full max-w-screen-2xl flex-col items-center bg-white">
      {/* Style 'wrapper' dari Figma Anda */}
      <div className="flex w-full flex-col items-center">
        {renderPageContent()}
      </div>
    </main>
  );
}
