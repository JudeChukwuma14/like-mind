"use client";

import { usePathname } from "next/navigation";

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
    <header className="w-full bg-[#f4efe6] border-b border-dashed border-blue-400/60">
      <div className="flex items-center justify-between px-5 py-3 md:px-8">
        {/* Logo + label */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#f5c518] rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-[#171717] tracking-tight">LM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#171717] tracking-tight">
              LikeMind
            </span>
            <span className="text-xs font-mono text-[#a09880] uppercase tracking-widest ml-1">
              Setup
            </span>
          </div>
        </div>

        {/* Step counter */}
        {activeStep && (
          <span className="text-xs font-mono text-[#a09880] uppercase tracking-widest">
            Step {activeStep.id} / {steps.length}
          </span>
        )}
      </div>
    </header>
  );
}
