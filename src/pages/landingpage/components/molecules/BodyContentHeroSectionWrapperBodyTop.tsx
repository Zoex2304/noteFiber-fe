// src/pages/landingpage/components/molecules/BodyContentHeroSectionWrapperBodyTop.tsx
import { Tag } from "@/components/shadui/Tag";
import { TextAreaIntro } from "./TextAreaIntro";

interface BodyContentHeroSectionWrapperBodyTopProps {
  tagText?: string;
  title?: string;
  description?: string;
}

/**
 * Komponen Body Top
 *
 * DIPERBAIKI: Streamline text di desktop diperkecil agar hanya 2 baris.
 */
export function BodyContentHeroSectionWrapperBodyTop({
  tagText = "Best Productivity Management",
  title,
  description,
}: BodyContentHeroSectionWrapperBodyTopProps) {
  const defaultDescription =
    "Streamline your business's productivity management with our intuitive, scalable SaaS platform. Designed for U.S. enterprises, our solutions simplify complex processes.";

  return (
    <div className="flex w-full flex-col items-center gap-4 lg:gap-7">
      {/* Tag (Ukuran font mobile: text-body-3 / 13px) */}
      <Tag iconSrc="/src/assets/images/landing/logo/logo_symbol.svg">
        {tagText}
      </Tag>

      {/* Wrapper untuk "Enhance..." dan "TextAreaIntro" */}
      <div className="flex w-full flex-col items-center gap-1 lg:gap-1">
        {title ? (
          <h1
            className="
            text-center text-customFont-dark-base 
            text-display-h3
            leading-[1.2] 
            lg:text-[74.835px] 
            lg:leading-[1.4]
          "
          >
            {title}
          </h1>
        ) : (
          <>
            {/* Teks "Enhance..." (Weight mobile: font-semibold) */}
            <h1
              className="
            text-center text-customFont-dark-base 
            text-display-h3
            leading-[1.2] 
            lg:text-[74.835px] 
            lg:leading-[1.4]
          "
            >
              Enhance your productivity
            </h1>

            {/* Komponen "textarea-intro" */}
            <TextAreaIntro />
          </>
        )}
      </div>

      {/* Teks "Streamline" dengan max-width untuk alignment */}
      <p
        className="
          text-center font-normal text-customFont-base 
          text-body-5
          tracking-wide
          lg:text-body-base lg:max-w-2xl
        "
      >
        {description || defaultDescription}
      </p>
    </div>
  );
}
