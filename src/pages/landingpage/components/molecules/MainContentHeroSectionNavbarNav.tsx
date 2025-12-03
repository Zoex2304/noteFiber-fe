import { useState } from "react";
import { Menu, X } from "lucide-react";
import { MainContentHeroSectionNavbarLogo } from "../atoms/MainContentHeroSectionNavbarLogo";
import { MainContentHeroSectionNavbarNavlink } from "../atoms/MainContentHeroSectionNavbarNavlink";
import { Button } from "@/components/shadui/button";
import { cn } from "@/lib/utils";

/**
 * Navbar Nav (Container Utama)
 * * FIXED: Mobile menu sekarang absolute dengan backdrop overlay
 * UPDATED: Header mobile sekarang full width dengan background putih
 * FIXED (Gap): Menghilangkan mt-2 pada dropdown dan mengubah radius header
 * secara dinamis (rounded-lg saat close, rounded-t-lg saat open)
 * untuk menghilangkan gap transparan.
 */
export function MainContentHeroSectionNavbarNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Backdrop Overlay (hanya muncul saat menu mobile terbuka) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Wrapper: relative, flex-col */}
      {/* FIXED: Tambah bg-white dan padding di mobile agar tidak transparan */}
      {/* FIXED: Menggunakan cn() untuk radius dinamis */}
      <div className={cn(
        "relative z-50 flex w-full flex-col bg-white p-4 lg:bg-transparent lg:p-0",
        isOpen ? "rounded-t-lg" : "rounded-lg",
        "lg:rounded-none" // Selalu non-aktifkan radius di lg
      )}>
        {/* Baris Atas (Desktop Layout & Mobile Header) */}
        <div className="flex w-full items-center justify-between">
          {/* [KIRI] Logo */}
          <MainContentHeroSectionNavbarLogo />

          {/* [TENGAH] Links Navigasi (Hanya Desktop) */}
          <div className="hidden lg:flex">
            <MainContentHeroSectionNavbarNavlink />
          </div>

          {/* [KANAN] Tombol (Desktop) & Hamburger (Mobile) */}
          <div>
            {/* Tombol Sign Up (Hanya Desktop) */}
            <div className="hidden lg:block">
              <Button variant="default" size="default">
                Sign Up
              </Button>
            </div>

            {/* Tombol Hamburger (Hanya Mobile) */}
            <button
              className="rounded p-1 text-customFont-dark-base transition-all hover:ring-1 hover:ring-customBorder-primary active:scale-95 lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* --- Menu Mobile (Absolute Positioned) --- */}
        {/* FIXED: Menghilangkan mt-2 untuk hapus gap */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 flex w-full flex-col gap-4 rounded-b-lg border-t border-customBorder-primary bg-white p-4 shadow-lg lg:hidden">
            <MainContentHeroSectionNavbarNavlink />
            <Button
              variant="default"
              size="default"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
