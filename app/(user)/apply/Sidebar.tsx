"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";

const steps = [
  { id: 1, name: "Welcome", path: "/apply/welcome" },
  { id: 2, name: "Basic information", path: "/apply/basic-information" },
  { id: 3, name: "Contact Information", path: "/apply/contact-information" },
  { id: 4, name: "Employment", path: "/apply/employment" },
  { id: 5, name: "Next of kin", path: "/apply/next-of-kin" },
  { id: 6, name: "Referee", path: "/apply/referee" },
  { id: 7, name: "Review", path: "/apply/review" },
  { id: 8, name: "Acknowledgement", path: "/apply/acknowledgement" },
  { id: 9, name: "Confirmation", path: "/apply/confirmation" },
];

export function Sidebar() {
  const pathname = usePathname();

  // Find current step index (0 to 8)
  const currentStepIndex = steps.findIndex((s) => pathname.includes(s.path));
  // If not found, default to 0
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  // Calculate progress percentage (e.g., step 1 = ~11%, step 9 = 100%)
  const progressPercent = Math.round(((activeIndex + 1) / steps.length) * 100);

  return (
    <aside className="w-72 bg-[#111111] text-white flex flex-col h-screen sticky top-0 shrink-0 border-r border-[#222]">
      {/* Header / Logo */}
      <div className="p-6 flex items-center gap-3 mt-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-yellow-400"></div>
        </div>
        <span className="font-semibold text-lg tracking-tight">
          LikeMinds Cooperative
        </span>
      </div>

      {/* Progress Section */}
      <div className="px-6 py-4">
        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-3">
          — Application Progress
        </div>
        <div className="flex items-end justify-between mb-3">
          <div className="text-3xl font-semibold leading-none">
            {progressPercent}%
          </div>
          <div className="text-xs text-gray-400 font-mono">
            {activeIndex + 1} / {steps.length} STEPS
          </div>
        </div>
        {/* Progress Bar Segments */}
        <div className="flex gap-1 h-1.5 w-full">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full ${
                i <= activeIndex ? "bg-yellow-400" : "bg-[#333]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Steps List */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 dark-scrollbar">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isDone = index < activeIndex;

          return (
            <Link
              key={step.id}
              href={step.path}
              className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                isActive ? "bg-[#1a1a1a]" : "hover:bg-[#1a1a1a]/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium border transition-colors ${
                    isActive
                      ? "border-yellow-400 text-yellow-400 bg-yellow-400/10"
                      : isDone
                        ? "border-gray-500 text-gray-400"
                        : "border-gray-700 text-gray-600"
                  }`}
                >
                  {String(step.id).padStart(2, "0")}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-white"
                      : isDone
                        ? "text-gray-400"
                        : "text-gray-600"
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {isActive && (
                <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-wider">
                  {activeIndex === steps.length - 1 ? "Done" : "Now"}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Help Footer */}
      <div className="p-6">
        <div className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center gap-3 border border-[#222] transition-colors hover:bg-[#222]">
          <div className="w-8 h-8 bg-[#333] rounded-full flex items-center justify-center text-gray-300">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Need help?</div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              WhatsApp - 8 AM — 11 PM ET
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
