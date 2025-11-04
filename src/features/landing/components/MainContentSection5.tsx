import { useState } from "react";
import { SectionHeader } from "@/components/shadui/SectionHeader";
import {
  SwitchPricing,
  type PricingPeriod,
} from "@/components/shadui/SwitchPricing";
// 1. Hapus import 'PricingCard' (sudah tidak diperlukan di sini)
// import { PricingCard, type PricingCardData } from '@/components/shadui/PricingCard';
//    Import 'PricingCardData' masih diperlukan untuk 'monthlyData'
import type { PricingCardData } from "@/components/shadui/PricingCard";

// 2. Impor "Trailer" reusable yang baru
import { PricingCardTrailer } from "@/components/shadui/PricingCardTrailer";
// 3. Hapus 'cn' (sudah tidak diperlukan di sini)
// import { cn } from '@/lib/utils';

// --- Data Placeholder (Tetap di sini) ---
const monthlyData: PricingCardData[] = [
  {
    title: "Basic plan",
    price: "$99.00",
    period: "/ month",
    description:
      "Perfect for small businesses or startups, our Starter Plan gives you the essential tools.",
    features: [
      "Unlimited Invoices",
      "Basic Reporting",
      "Email Support",
      "10 Team Members",
      "5GB Storage",
    ],
  },
  {
    title: "Pro plan",
    price: "$199.00",
    period: "/ month",
    description:
      "Ideal for growing businesses that need more power, features, and support.",
    features: [
      "Everything in Basic",
      "Advanced Reporting",
      "Priority Support",
      "50 Team Members",
      "50GB Storage",
    ],
  },
  {
    title: "Enterprise plan",
    price: "$399.00",
    period: "/ month",
    description:
      "For large organizations with complex needs and dedicated support requirements.",
    features: [
      "Everything in Pro",
      "Custom Reporting",
      "Dedicated Account Manager",
      "Unlimited Team Members",
      "500GB Storage",
    ],
  },
];

const yearlyData: PricingCardData[] = [
  { ...monthlyData[0], price: "$990.00", period: "/ year" },
  { ...monthlyData[1], price: "$1990.00", period: "/ year" },
  { ...monthlyData[2], price: "$3990.00", period: "/ year" },
];
// --------------------

/**
 * Ini adalah "Konten Murni" untuk Section 5.
 *
 * DIPERBARUI: Logic .map() telah diekstraksi
 * ke <PricingCardTrailer />
 */
export function MainContentSection5() {
  const [period, setPeriod] = useState<PricingPeriod>("monthly");
  const [isPulsing, setIsPulsing] = useState(false);

  const dataToDisplay = period === "monthly" ? monthlyData : yearlyData;

  const handleToggle = (newPeriod: PricingPeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 500);
  };

  return (
    <>
      {/* Container 'WrapperMainContent5' */}
      <div
        className="
          flex w-full flex-col items-center
          px-4 lg:px-[96.917px]
          gap-10 lg:gap-[53.979px]
        "
      >
        {/* 2. Instance Header (Varian Tengah) */}
        <SectionHeader
          align="center"
          tagText="Pricing"
          headerText="Experience simple and fully transparent pricing"
          highlightLastWord={true}
        />

        {/* 3. 'frame11' (Pricing Content) */}
        <div className="flex flex-col items-center gap-6 lg:gap-[26.99px]">
          {/* 3a. Switcher Pricing */}
          <SwitchPricing activePeriod={period} onToggle={handleToggle} />

          {/* 3b. 'MainContentPricing' (Card Container) */}
          {/* --- PERBAIKAN ARSITEKTUR --- */}
          {/* Logic .map() dan 'cn' dihapus dari sini */}
          {/* dan diganti dengan satu panggilan komponen reusable */}
          <PricingCardTrailer cardsData={dataToDisplay} isPulsing={isPulsing} />
          {/* --------------------------- */}
        </div>
      </div>
    </>
  );
}
