import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PotIconProps {
  /**
   * Ikon dari lucide-react.
   */
  icon: LucideIcon;
  /**
   * ClassName untuk kustomisasi (cth: warna background).
   */
  className?: string;
}

/**
 * Komponen Reusable "Pot Icon"
 *
 * Specs: flex, h-[61.34px], p-[18.588px...], items-center, gap-[9.294px]
 * Dibuat responsif.
 */
export function PotIcon({ icon: Icon, className }: PotIconProps) {
  return (
    // Container Pot Icon
    <div
      className={cn(
        "flex items-center rounded-lg", // Rounded ditambahkan untuk estetika
        // Padding mobile
        "h-auto gap-2 p-3",
        // Padding desktop (dari Figma)
        "lg:h-[61.34px] lg:gap-[9.294px] lg:p-[18.588px]",
        className // Memungkinkan background/warna kustom
      )}
    >
      {/* Ikon dari Lucide */}
      <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
    </div>
  );
}
