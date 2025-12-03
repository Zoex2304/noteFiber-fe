import { SectionContainer } from "@/components/shadui/SectionContainer";
import { MainContentHeroSection } from "./MainContentHeroSection";

/**
 * Wrapper spesifik untuk Hero Section.
 * Menggunakan komponen SectionContainer reusable untuk layout.
 * Meneruskan 'panelStyle' untuk background image.
 */
export function WrapperHeroSection() {
  return (
    <SectionContainer
      // Prop 'panelStyle' akan diteruskan ke ContentPanel di dalam
      panelStyle={{
        backgroundImage: `url('/src/assets/images/landing/backgrounds/gradient-dots-sec1-landingpage.svg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* MainContentHeroSection sekarang hanya berisi konten murni */}
      <MainContentHeroSection />
    </SectionContainer>
  );
}
