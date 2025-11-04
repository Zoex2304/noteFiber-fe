import { PotIcon } from "@/components/shadui/PotIcon";
import type { LucideIcon } from "lucide-react";

interface FeatureInfoCardPotProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Komponen Reusable "Feature Info Card Pot"
 *
 * DIPERBARUI:
 * 1. Font size 'h3' (title) dikecilkan lagi.
 * 2. 'whitespace-nowrap' ditambahkan untuk mencegah 'wrap'.
 */
export function FeatureInfoCardPot({
  icon,
  title,
  description,
}: FeatureInfoCardPotProps) {
  return (
    <div
      className="
        flex flex-col items-start self-stretch 
        gap-3 lg:gap-[13.495px]
      "
    >
      {/* 1. Pot Icon */}
      <PotIcon icon={icon} size="small" />

      {/* 2. Teks Judul (Font size dikecilkan + nowrap) */}
      <h3
        className="
          font-normal text-customFont-dark-base
          whitespace-nowrap 
          text-body-base 
          lg:text-body-1 
        "
      >
        {title}
      </h3>

      {/* 3. Teks Deskripsi */}
      <p
        className="
          font-normal text-customFont-base
          text-body-base
          self-stretch
        "
      >
        {description}
      </p>
    </div>
  );
}
