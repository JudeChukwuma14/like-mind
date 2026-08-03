/** Theme constants — single source of truth */
export const THEME_KEY = "kajola-theme";
export type ThemeValue = "light" | "dark";

/** Read the OS colour‐scheme preference */
export function getSystemTheme(): ThemeValue {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Read saved theme from localStorage, falling back to OS preference */
export function getSavedTheme(): ThemeValue {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(THEME_KEY) as ThemeValue | null;
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // localStorage unavailable (e.g. private browsing restrictions)
  }
  return getSystemTheme();
}

/** Apply a theme to the document root (sets data-theme attribute) */
export function applyTheme(theme: ThemeValue) {
  document.documentElement.setAttribute("data-theme", theme);
}

/** Save and apply a theme */
export function saveTheme(theme: ThemeValue) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
  applyTheme(theme);
}
