import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Tag } from './Tag'; // Pastikan Tag diimpor

// Varian untuk wrapper (div)
const wrapperVariants = cva(
  'flex w-full flex-col gap-4', // Style dasar: flex, col, gap
  {
    variants: {
      align: {
        left: 'items-start',
        center: 'items-center',
      },
    },
    defaultVariants: {
      align: 'left',
    },
  }
);

// Varian untuk teks header (h2)
const headerTextVariants = cva(
  'font-normal text-customFont-dark-base text-display-h3 lg:text-display-h2 leading-[1.2] lg:leading-[1.3] w-full',
  {
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center',
      },
    },
    defaultVariants: {
      align: 'left',
    },
  }
);

// Definisikan Props
export interface SectionHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof wrapperVariants> {
  tagText?: string;
  headerText: string;
  highlightLastWord?: boolean;
  align?: 'left' | 'center';
}

/**
 * Komponen Reusable Header (H2)
 *
 * DIPERBARUI: Ditambahkan 'guard clause' untuk 'headerText'.
 */
const SectionHeader = React.forwardRef<
  HTMLDivElement,
  SectionHeaderProps
>(({ className, align, tagText, headerText, highlightLastWord, ...props }, ref) => {
  
  // Logic "Pintar"
  const renderContent = () => {
    // --- PERBAIKAN BUG ---
    // Tambahkan 'guard clause' untuk mencegah crash jika headerText undefined
    if (!headerText) {
      return null; // Tidak merender apa-apa jika teks tidak ada
    }
    // --------------------

    const words = headerText.split(' ');
    const maxWordsPerLine = 4; // Logic wrapping kustom Anda
    const lines: string[][] = [];
    
    for (let i = 0; i < words.length; i += maxWordsPerLine) {
      lines.push(words.slice(i, i + maxWordsPerLine));
    }
    
    if (!highlightLastWord) {
      return lines.map((line, idx) => (
        <React.Fragment key={idx}>
          {line.join(' ')}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      ));
    }

    // Dengan highlight kata terakhir
    return lines.map((line, idx) => {
      const isLastLine = idx === lines.length - 1;
      
      if (isLastLine && line.length > 0) {
        const lastWord = line.pop();
        const restOfLine = line.join(' ');
        
        return (
          <React.Fragment key={idx}>
            {restOfLine}{restOfLine && ' '}
            <span className="text-royal-violet-base">{lastWord}</span>
          </React.Fragment>
        );
      }
      
      return (
        <React.Fragment key={idx}>
          {line.join(' ')}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div
      className={cn(wrapperVariants({ align, className }))}
      ref={ref}
      {...props}
    >
      {tagText && (
        <Tag iconSrc="/src/assets/images/landing/logo/logo_symbol.svg">
          {tagText}
        </Tag>
      )}
      <h2 className={cn(headerTextVariants({ align }))}>
        {renderContent()}
      </h2>
    </div>
  );
});
SectionHeader.displayName = 'SectionHeader';

export { SectionHeader };

