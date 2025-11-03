import * as React from "react";

// Definisikan props untuk komponen Tag yang reusable
interface TagProps {
  /**
   * Path ke file ikon/logo.
   */
  iconSrc: string;
  /**
   * Konten teks yang akan ditampilkan.
   */
  children: React.ReactNode;
  /**
   * ClassName tambahan untuk kustomisasi.
   */
  className?: string;
}

/**
 * Komponen Tag Reusable
 *
 * DIPERBAIKI (Hierarki Font):
 * 1. Ukuran font mobile: text-body-3 (13px)
 * 2. Ukuran font desktop: lg:text-body-base (16px)
 */
export function Tag({ iconSrc, children, className }: TagProps) {
  return (
    // Container Tag
    <div
      className={`
        flex items-center bg-white rounded-full 
        border-[0.613px] border-customBorder-primary 
        py-1.5 px-3 gap-2 
        lg:py-[7.361px] lg:px-[14.722px] lg:gap-[8.588px]
        ${className || ""}
      `}
    >
      {/* Ikon Logo */}
      <img
        src={iconSrc}
        alt="Tag Icon"
        className="h-3 w-3 lg:h-5 lg:w-5" // Ukuran ikon dibuat responsif
      />

      {/* Teks Tag (Ukuran font mobile: text-body-3 / 13px) */}
      <span
        className="
          font-normal text-body-5
          lg:text-body-base 
          bg-gradient-secondary bg-clip-text text-transparent
        "
      >
        {children}
      </span>
    </div>
  );
}
