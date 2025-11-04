import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Definisikan varian untuk alignment (rata kiri/tengah)
const headerVariants = cva(
  // Style dasar (termasuk font-size mobile/desktop)
  "font-normal text-customFont-dark-base text-display-h3 lg:text-display-h2 leading-[1.2] lg:leading-[1.3] w-full",
  {
    variants: {
      align: {
        left: "text-left",
        center: "text-center",
      },
    },
    defaultVariants: {
      align: "left",
    },
  }
);

// Definisikan Props
export interface SectionHeaderProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headerVariants> {
  /**
   * Teks string yang akan ditampilkan.
   */
  text: string;
  /**
   * Jika true, kata terakhir dari 'text' akan
   * secara otomatis di-highlight dengan warna ungu.
   */
  highlightLastWord?: boolean;
}

/**
 * Komponen Reusable Header (H2)
 *
 * DIPERBARUI: Sekarang "pintar". Menerima 'text' string
 * dan dapat secara otomatis mewarnai kata terakhir.
 * Otomatis wrap setelah 23 kata per baris.
 */
const SectionHeader = React.forwardRef<HTMLHeadingElement, SectionHeaderProps>(
  ({ className, align, text, highlightLastWord, ...props }, ref) => {
    // Logic "Pintar" dengan line wrapping
    const renderContent = () => {
      const words = text.split(" ");
      const maxWordsPerLine = 4;
      const lines: string[][] = [];

      // Pecah kata-kata menjadi baris dengan max 23 kata
      for (let i = 0; i < words.length; i += maxWordsPerLine) {
        lines.push(words.slice(i, i + maxWordsPerLine));
      }

      if (!highlightLastWord) {
        return lines.map((line, idx) => (
          <React.Fragment key={idx}>
            {line.join(" ")}
            {idx < lines.length - 1 && <br />}
          </React.Fragment>
        ));
      }

      // Dengan highlight kata terakhir
      return lines.map((line, idx) => {
        const isLastLine = idx === lines.length - 1;

        if (isLastLine && line.length > 0) {
          const lastWord = line.pop();
          const restOfLine = line.join(" ");

          return (
            <React.Fragment key={idx}>
              {restOfLine}
              {restOfLine && " "}
              <span className="text-royal-violet-base">{lastWord}</span>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={idx}>
            {line.join(" ")}
            {idx < lines.length - 1 && <br />}
          </React.Fragment>
        );
      });
    };

    return (
      <h2
        className={cn(headerVariants({ align, className }))}
        ref={ref}
        {...props}
      >
        {renderContent()}
      </h2>
    );
  }
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader, headerVariants };
