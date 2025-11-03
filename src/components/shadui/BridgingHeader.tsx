import { Tag } from '@/components/shadui/Tag';

interface BridgingHeaderProps {
  /**
   * Teks yang akan ditampilkan di dalam Tag.
   * Cth: "Our workflow"
   */
  tagText: string;
  /**
   * Teks untuk header utama.
   * Cth: "How our platform makes your workflow easier"
   */
  headerText: string;
}

/**
 * Komponen Reusable untuk header section.
 * Terdiri dari Tag kecil dan Header h2.
 */
export function BridgingHeader({ tagText, headerText }: BridgingHeaderProps) {
  return (
    // Container untuk reusable header
    <div className="flex w-full flex-col items-center gap-3 lg:gap-4">
      {/* Tag (reusable) */}
      <Tag iconSrc="/src/assets/images/landing/logo/logo_symbol.svg">
        {tagText}
      </Tag>

      {/* Header Utama (responsif) */}
      <h2
        className="
          text-center text-customFont-dark-base 
          font-semibold
          text-display-h3
          lg:text-display-h2
          leading-[1.2] lg:leading-[1.3]
          max-w-xl
        "
      >
        {headerText}
      </h2>
    </div>
  );
}
