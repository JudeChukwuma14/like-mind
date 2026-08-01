import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface StepHeaderProps {
  step: number;
  totalSteps: number;
  title: string;
  lastSaved?: Date | null;
}

export function StepHeader({
  step,
  totalSteps,
  title,
  lastSaved,
}: StepHeaderProps) {
  const [timeText, setTimeText] = useState("");

  useEffect(() => {
    if (!lastSaved) return;
    const interval = setInterval(() => {
      const seconds = Math.floor(
        (new Date().getTime() - lastSaved.getTime()) / 1000,
      );
      if (seconds < 60) setTimeText(`${seconds}s ago`);
      else setTimeText(`${Math.floor(seconds / 60)}m ago`);
    }, 1000);

    // Initial set
    const seconds = Math.floor(
      (new Date().getTime() - lastSaved.getTime()) / 1000,
    );
    if (seconds < 60) setTimeText(`${seconds}s ago`);
    else setTimeText(`${Math.floor(seconds / 60)}m ago`);

    return () => clearInterval(interval);
  }, [lastSaved]);

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-4">
        <span>
          STEP {String(step).padStart(2, "0")} OF{" "}
          {String(totalSteps).padStart(2, "0")}
        </span>
        <span className="w-8 h-px bg-gray-300"></span>
        <span className="font-semibold text-gray-700">{title}</span>
      </div>

      {lastSaved && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-600 shadow-sm transition-all duration-300">
          <Check className="w-3.5 h-3.5 text-green-600" />
          <span>Auto-saved - {timeText}</span>
        </div>
      )}
    </div>
  );
}
