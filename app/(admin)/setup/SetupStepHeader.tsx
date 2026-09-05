"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

const TOTAL_STEPS = 7;

export function SetupStepHeader({
  step,
  title,
  subtitle,
  lastSaved,
}: {
  step: number;
  title: string;
  subtitle: ReactNode;
  lastSaved?: Date | null;
}) {
  const [timeText, setTimeText] = useState("");

  useEffect(() => {
    if (!lastSaved) return;
    const update = () => {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      setTimeText(seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880] mb-1">
          Step {step} of {TOTAL_STEPS}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#171717] mb-1">{title}</h1>
        <p className="text-sm max-w-xl">{subtitle}</p>
      </div>

      {lastSaved && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e0d9cc] text-xs text-[#6b7280] shadow-sm shrink-0 mt-1">
          <Check className="w-3.5 h-3.5 text-[#22c55e]" />
          <span>Saved {timeText}</span>
        </div>
      )}
    </div>
  );
}
