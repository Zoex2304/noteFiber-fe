// src/pages/landingpage/components/organisms/HeroSection.tsx
import { WrapperHeroSection } from './WrapperHeroSection';
import { MainContentHeroSection } from './MainContentHeroSection';
import type { ReactNode } from 'react';

interface HeroSectionProps {
  tagText?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  customHeroContent?: ReactNode;
}

/**
 * Section 1 (Frame 1 - Hero)
 *
 * Specs:
 * - flex, flex-col, items-flex-start (di wrapper-nya)
 * - w-full (Mobile)
 * - lg:max-w-[1766.593px] (Desktop)
 * - gap-3 (Mobile)
 * - lg:gap-[12.268px] (Desktop)
 * - px-4 (Mobile padding)
 * - lg:px-0 (Desktop no padding)
 */
export function HeroSection({
  tagText,
  title,
  description,
  imageSrc,
  customHeroContent,
}: HeroSectionProps) {
  return (
    <section
      className="flex w-full flex-col items-start gap-3 px-4 lg:max-w-[1766.593px] lg:gap-[12.268px] lg:px-0"
    >
      <WrapperHeroSection>
        <MainContentHeroSection
          tagText={tagText}
          title={title}
          description={description}
          imageSrc={imageSrc}
          customHeroContent={customHeroContent}
        />
      </WrapperHeroSection>
    </section>
  );
}

