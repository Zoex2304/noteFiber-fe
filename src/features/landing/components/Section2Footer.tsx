import { WorkflowPot } from "./WorkflowPot";
// Import ikon placeholder dari lucide-react
import { UserPlus, Settings, Database, ClipboardList } from "lucide-react";

// Data untuk 4 pot
const potData = [
  {
    icon: UserPlus,
    iconClassName: "bg-blue-100 text-blue-700",
    title: "Sign up and customize",
    description:
      "Create your account in minutes and tailor the platform to meet your company's unique needs.",
    imageSrc: "/src/assets/images/landing/illustrations/singupilustaration.svg",
  },
  {
    icon: Settings,
    iconClassName: "bg-green-100 text-green-700",
    title: "Integrate your tools",
    description:
      "Connect seamlessly with your existing software stack, from accounting to project management.",
    imageSrc: "/src/assets/images/landing/illustrations/singupilustaration.svg",
  },
  {
    icon: ClipboardList,
    iconClassName: "bg-yellow-100 text-yellow-700",
    title: "Manage tasks efficiently",
    description:
      "Assign, track, and complete projects with our intuitive task management interface.",
    imageSrc: "/src/assets/images/landing/illustrations/singupilustaration.svg",
  },
  {
    icon: Database,
    iconClassName: "bg-red-100 text-red-700",
    title: "Analyze your data",
    description:
      "Gain valuable insights with powerful, real-time analytics and customizable reports.",
    imageSrc: "/src/assets/images/landing/illustrations/singupilustaration.svg",
  },
];

/**
 * Komponen Section 2 Footer
 * Merender 4 pot workflow dalam 2 baris.
 */
export function Section2Footer() {
  return (
    // Container Section2Footer (Specs: flex-col, w-[1412.047px], gap-[23.309px])
    <div
      className="
        flex w-full flex-col items-center 
        gap-4 lg:gap-[23.309px]
        lg:w-auto
      "
    >
      {/* Frame 22 (Specs: flex, w-full, justify-between) */}
      <div
        className="
          flex w-full flex-col items-center 
          gap-4 lg:gap-[23.309px] 
          lg:flex-row lg:justify-between
        "
      >
        <WorkflowPot {...potData[0]} />
        <WorkflowPot {...potData[1]} />
      </div>

      {/* Frame 21 (Specs: flex, w-full, justify-between) */}
      <div
        className="
          flex w-full flex-col items-center 
          gap-4 lg:gap-[23.309px] 
          lg:flex-row lg:justify-between
        "
      >
        <WorkflowPot {...potData[2]} />
        <WorkflowPot {...potData[3]} />
      </div>
    </div>
  );
}
