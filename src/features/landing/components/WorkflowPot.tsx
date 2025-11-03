import * as React from "react";
import { PotIcon } from "@/components/shadui/PotIcon";
import type { LucideIcon } from "lucide-react";

interface WorkflowPotProps {
  /**
   * Ikon yang akan ditampilkan di dalam PotIcon.
   */
  icon: LucideIcon;
  /**
   * ClassName kustom untuk PotIcon (cth: bg-blue-100).
   */
  iconClassName: string;
  /**
   * Teks judul (cth: "Sign up and customize").
   */
  title: string;
  /**
   * Teks deskripsi.
   */
  description: string;
  /**
   * Path ke gambar ilustrasi.
   */
  imageSrc: string;
}

/**
 * Komponen Reusable "Workflow Pot"
 * Merender 1 dari 4 pot workflow.
 */
export function WorkflowPot({
  icon,
  iconClassName,
  title,
  description,
  imageSrc,
}: WorkflowPotProps) {
  return (
    // Container Pot (Specs: w-[694.369px], h-[656.338px], p-[36.804px] pb-0)
    <div
      className="
        flex flex-shrink-0 flex-col items-start
        rounded-2xl border border-customBorder-primary
        w-full lg:w-[650.369px] 
        h-auto lg:h-[656.338px]
        p-6 pb-0 lg:p-[36.804px] lg:pb-0
      "
    >
      {/* Bagian "top" (Specs: flex-col, gap-[33.124px], self-stretch) */}
      <div className="flex flex-col items-start self-stretch gap-6 lg:gap-[33.124px]">
        {/* pot icon (reusable) */}
        <PotIcon icon={icon} className={iconClassName} />

        {/* frame (text) (Specs: flex-col, gap-[9.814px], self-stretch) */}
        <div className="flex flex-col items-start self-stretch gap-2 lg:gap-[9.814px]">
          {/* Teks Judul (Specs: 47.845px) */}
          <h3
            className="
              font-normal text-customFont-dark-base
              text-display-h3 
              lg:text-[47.845px] lg:leading-[1.4]
            "
          >
            {title}
          </h3>
          {/* Teks Deskripsi (Specs: 19.629px) */}
          <p
            className="
              font-normal text-customFont-base
              text-body-base
              lg:text-[19.629px] lg:leading-[1.4]
            "
          >
            {description}
          </p>
        </div>
      </div>

      {/* Bagian "group" (Specs: w-full, h-[375.401px]) */}
      <div
        className="
          flex w-full items-end justify-center 
          h-64 lg:h-[375.401px]
          mt-4 lg:mt-auto
        "
      >
        <img
          src={imageSrc}
          alt={title}
          className="h-full w-auto object-contain"
        />
      </div>
    </div>
  );
}
