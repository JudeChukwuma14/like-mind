"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "@/app/components/Motion";

const steps = [
  { id: 1, path: "/setup/welcome" },
  { id: 2, path: "/setup/cooperative-profile" },
  { id: 3, path: "/setup/cycles-contributions" },
  { id: 4, path: "/setup/loan-policy" },
  { id: 5, path: "/setup/withdrawal-policy" },
  { id: 6, path: "/setup/banking" },
  { id: 7, path: "/setup/review-launch" },
];

export function SetupTopBar() {
  const pathname = usePathname();
  const currentStepIndex = steps.findIndex((s) => pathname.includes(s.path));
  const activeStep = currentStepIndex === -1 ? null : steps[currentStepIndex];

  return (
    <header className="w-full bg-[#f4efe6] sticky top-0 z-10 border-b border-[#e0d9cc]">
      <div className="flex items-center justify-between px-5 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <Image src="/Likemind.png" alt="LikeMind" width={100} height={100}  className="h-10 w-10 object-contain " />
        </div>

        {/* Step counter */}
        {activeStep && (
          <span className="text-xs font-mono text-[#a09880] uppercase tracking-widest">
            Step {activeStep.id} / {steps.length}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {activeStep && (
        <div className="h-1 w-full bg-[#e0d9cc]">
          <motion.div
            className="h-full bg-[#f5c518]"
            initial={false}
            animate={{ width: `${(activeStep.id / steps.length) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}
    </header>
  );
}
