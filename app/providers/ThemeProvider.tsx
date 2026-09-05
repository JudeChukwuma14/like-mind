"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type ThemeValue,
  THEME_KEY,
  getSavedTheme,
  saveTheme,
} from "@/app/lib/theme";

/* ── Context ───────────────────────────────────────────────── */
interface ThemeContextValue {
  theme: ThemeValue;
  setTheme: (t: ThemeValue) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ── Provider ──────────────────────────────────────────────── */
export function ThemeProvider({ children }: { children: ReactNode }) {

  const [theme, setThemeState] = useState<ThemeValue>(() => {
    if (typeof window === "undefined") return "light";
    return getSavedTheme();
  });


  useEffect(() => {
    saveTheme(theme);
  }, [theme]);


  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {

      try {
        if (!localStorage.getItem(THEME_KEY)) {
          setThemeState(mq.matches ? "dark" : "light");
        }
      } catch {
        // ignore
      }
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((t: ThemeValue) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────────────────────── */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
