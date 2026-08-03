"use client";

import { useTheme } from "@/app/providers/ThemeProvider";
import { useState, useEffect } from "react";

interface ThemeToggleProps {
  /** Extra CSS classes for positioning/sizing */
  className?: string;
  /** Visual variant — 'default' = dark pill, 'ghost' = icon only */
  variant?: "default" | "ghost";
}

export function ThemeToggle({
  className = "",
  variant = "default",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering the toggle after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  if (!mounted) {
    if (variant === "ghost") {
      return <div className={`w-9 h-9 ${className}`} />;
    }
    return <div className={`w-[76px] h-[28px] ${className}`} />;
  }

  if (variant === "ghost") {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={`group relative w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 ${className}`}
      >
        {/* Sun */}
        <span
          className={`absolute transition-all duration-300 ${
            isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 rotate-90"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </span>
        {/* Moon */}
        <span
          className={`absolute transition-all duration-300 ${
            isDark ? "opacity-0 scale-75 -rotate-90" : "opacity-100 scale-100 rotate-0"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </span>
      </button>
    );
  }

  /* Default pill toggle */
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 ${
        isDark
          ? "bg-white/10 border-white/20 text-white/80 hover:bg-white/15"
          : "bg-black/5 border-black/15 text-black/70 hover:bg-black/10"
      } ${className}`}
    >
      {/* Track */}
      <span className="relative w-8 h-4.5 rounded-full flex items-center px-0.5 transition-colors duration-300"
        style={{ background: isDark ? "rgba(250,204,21,0.3)" : "rgba(0,0,0,0.15)" }}
      >
        <span
          className="w-3.5 h-3.5 rounded-full transition-all duration-300 shadow-sm"
          style={{
            background: isDark ? "#facc15" : "#6b7280",
            transform: isDark ? "translateX(14px)" : "translateX(0)",
          }}
        />
      </span>
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
