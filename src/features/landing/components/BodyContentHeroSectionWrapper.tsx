// 1. Import komponen baru
import { BodyContentHeroSectionWrapperBodyTop } from './BodyContentHeroSectionWrapperBodyTop';

/**
 * Wrapper untuk Body Content
 * Memanggil 'Body-content-hero-section-wrapper-body-top'
 *
 * (flex-col sudah ada di sini sesuai permintaan Anda)
 */
export function BodyContentHeroSectionWrapper() {
  return (
    <div className="flex w-full flex-col items-center">
      {/* 2. Placeholder diganti dengan komponen baru */}
      <BodyContentHeroSectionWrapperBodyTop />
    </div>
  );
}

