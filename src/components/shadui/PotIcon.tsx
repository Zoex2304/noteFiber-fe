import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

// 1. Definisikan varian untuk ukuran pot
const potIconVariants = cva(
  "flex items-center justify-center rounded-full bg-royal-violet-base text-white",
  {
    variants: {
      size: {
        default:
          "h-auto gap-2 p-3 lg:h-[61.34px] lg:w-[61.34px] lg:gap-[9.294px] lg:p-[18.588px]",
        small:
          "h-auto gap-2 p-3 lg:h-[56.433px] lg:w-[56.433px] lg:gap-[8.55px] lg:p-[17.101px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

// 2. Definisikan Props
export interface PotIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof potIconVariants> {
  icon: LucideIcon;
}

/**
 * Komponen Reusable "Pot Icon"
 *
 * DIPERBARUI: Sekarang memiliki varian 'size' (default, small).
 */
const PotIcon = React.forwardRef<HTMLDivElement, PotIconProps>(
  ({ className, icon: Icon, size, ...props }, ref) => {
    return (
      <div
        className={cn(potIconVariants({ size, className }))}
        ref={ref}
        {...props}
      >
        <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
      </div>
    );
  }
);
PotIcon.displayName = "PotIcon";

export { PotIcon, potIconVariants };
