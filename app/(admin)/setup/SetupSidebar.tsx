"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { useSetupStore } from "./useSetupStore";

const steps = [
  { id: 1, name: "Welcome", path: "/setup/welcome" },
  { id: 2, name: "Cooperative profile", path: "/setup/cooperative-profile" },
  {
    id: 3,
    name: "Cycles & contributions",
    path: "/setup/cycles-contributions",
  },
  { id: 4, name: "Loan policy", path: "/setup/loan-policy" },
  { id: 5, name: "Withdrawal policy", path: "/setup/withdrawal-policy" },
  { id: 6, name: "Banking", path: "/setup/banking" },
  { id: 7, name: "Review & launch", path: "/setup/review-launch" },
];

export function SetupSidebar() {
  const pathname = usePathname();
  const { data, isClient } = useSetupStore();

  const currentStepIndex = steps.findIndex((s) => pathname.includes(s.path));
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;
  // Welcome creates the account — once that's done, re-visiting it would
  // create a duplicate, so it's locked out of the nav (page.tsx enforces
  // this with a redirect regardless; this just keeps the sidebar honest).
  const isWelcomeLocked = isClient && Boolean(data.cooperativeAccountId);

  return (
    <aside className="w-56 bg-[#f4efe6] flex flex-col h-screen sticky top-0 shrink-0 border-r border-[#e0d9cc]">
      {/* Steps Label */}
      <div className="px-6 pt-8 pb-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880]">
          Setup Steps
        </p>
      </div>

      {/* Steps List */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 custom-scrollbar">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isDone = index < activeIndex;
          const isFuture = index > activeIndex;
          const isLocked = step.id === 1 && isWelcomeLocked && !isActive;

          const rowClassName = `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
            isActive ? "bg-[#f0e8c8]" : isLocked ? "" : "hover:bg-[#ede7d8]"
          }`;

          const content = (
            <>
              {/* Step circle */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isDone
                    ? "bg-[#171717]"
                    : isActive
                      ? "bg-[#171717]"
                      : "border-2 border-[#c8bfa8] bg-transparent"
                }`}
              >
                {isLocked ? (
                  <Lock className="w-2.5 h-2.5 text-white" />
                ) : isDone ? (
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                ) : isActive ? (
                  <span className="text-[10px] font-bold text-white">
                    {step.id}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-[#a09880]">
                    {step.id}
                  </span>
                )}
              </div>

              {/* Step name */}
              <span
                className={`text-sm font-medium leading-tight ${
                  isActive
                    ? "text-[#171717]"
                    : isDone
                      ? "text-[#6b7280]"
                      : isFuture
                        ? "text-[#b0a690]"
                        : "text-[#171717]"
                }`}
              >
                {step.name}
              </span>
            </>
          );

          if (isLocked) {
            return (
              <div
                key={step.id}
                title="Already created — can't be revisited"
                className={`${rowClassName} opacity-50 cursor-not-allowed`}
              >
                {content}
              </div>
            );
          }

          return (
            <Link key={step.id} href={step.path} className={rowClassName}>
              {content}
            </Link>
          );
        })}
      </nav>

      {/* Bottom padding */}
      <div className="h-6" />
    </aside>
  );
}
