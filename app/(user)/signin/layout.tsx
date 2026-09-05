"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";

const LEFT_PANEL: Record<string, { label: string; heading: string; subtext?: string }> = {
  "/signin": {
    label: "MEMBER PORTAL",
    heading: "Your cooperative,\nat a glance.",
    subtext: "Savings, investments, loans, withdrawals.",
  },
  "/signin/forgot-password": {
    label: "ACCOUNT",
    heading: "We'll get\nyou back in.",
  },
  "/signin/reset-password": {
    label: "ACCOUNT",
    heading: "Set a\nfresh password.",
  },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const panel = LEFT_PANEL[pathname] ?? LEFT_PANEL["/signin"];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="lg:w-[38%] shrink-0 bg-[#0a0a0a] text-white flex flex-col justify-between p-8 lg:p-12 lg:min-h-screen">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #f97316, #a855f7)" }}
          >
            L
          </div>
          <span className="font-semibold">LikeMind</span>
        </Link>

        <div className="mt-16 lg:mt-0">
          <p className="text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-4">
            — {panel.label}
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] whitespace-pre-line">
            {panel.heading}
          </h1>
          {panel.subtext && <p className="text-sm text-gray-400 mt-4">{panel.subtext}</p>}
        </div>

        <div className="hidden lg:flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-gray-600">
          <span>© LikeMind Cooperative · 2026</span>
          <span>V 2.4</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-[#f6f4eb] relative flex items-center justify-center p-6 lg:p-12">
        <button
          type="button"
          className="absolute top-6 right-6 lg:top-8 lg:right-8 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          EN / FR
        </button>

        <div className="w-full max-w-sm py-16 lg:py-0">{children}</div>
      </div>
    </div>
  );
}
