import { useState } from "react";
import { SectionHeader } from "@/components/shadui/SectionHeader";
import { Tag } from "@/components/shadui/Tag";
import {
  SwitchPricing,
  type PricingPeriod,
} from "@/components/shadui/SwitchPricing";
import { PricingCard, type PricingCardData } from "./PricingCard";
import { cn } from "@/lib/utils"; // Untuk animasi pulse

// --- Data Placeholder ---
// Ini akan disesuaikan oleh 'pricingPeriod'
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
  // Data Yearly (biasanya lebih murah)
  { ...monthlyData[0], price: "$990.00", period: "/ year" },
  { ...monthlyData[1], price: "$1990.00", period: "/ year" },
  { ...monthlyData[2], price: "$3990.00", period: "/ year" },
];
// --------------------

/**
 * Ini adalah "Konten Murni" untuk Section 5.
 * (Sesuai dengan 'WrapperMainContent5' di diagram Anda)
 */
export function MainContentSection5() {
  const [period, setPeriod] = useState<PricingPeriod>("monthly");
  const [isPulsing, setIsPulsing] = useState(false);

  const dataToDisplay = period === "monthly" ? monthlyData : yearlyData;

  const handleToggle = (newPeriod: PricingPeriod) => {
    if (newPeriod === period) return; // Tidak ada perubahan

    setPeriod(newPeriod);

    // Memicu animasi pulse
    setIsPulsing(true);
    // Hapus class animasi setelah selesai
    setTimeout(() => setIsPulsing(false), 500);
  };

  return (
    // Menggunakan React Fragment karena ini adalah konten murni
    <>
      {/* Container 'WrapperMainContent5' */}
      <div
        className="
          flex w-full flex-col items-center
          px-4 lg:px-[96.917px]
          gap-10 lg:gap-[53.979px]
        "
      >
        {/* 1. Instance Header (Varian Tengah) */}
        <div className="flex w-full flex-col items-center gap-4">
          <Tag iconSrc="/src/assets/images/landing/logo/logo_symbol.svg">
            ; Our pricing
          </Tag>
          <SectionHeader
            align="center"
            // Teks header baru
            text="Experience simple and fully transparent pricing"
            highlightLastWord={true}
          />
        </div>

        {/* 2. 'frame11' (Pricing Content) */}
        <div className="flex flex-col items-center gap-6 lg:gap-[26.99px]">
          {/* 2a. Switcher Pricing */}
          <SwitchPricing activePeriod={period} onToggle={handleToggle} />

          {/* 2b. 'MainContentPricing' (Card Container) */}
          <div
            className={cn(
              "flex flex-col items-center gap-4 lg:flex-row lg:items-stretch lg:gap-[16.064px]",
              // Animasi Pulse (seperti permintaan Anda)
              isPulsing && "animate-pulse"
            )}
          >
            {dataToDisplay.map((data) => (
              <PricingCard key={data.title} data={data} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
