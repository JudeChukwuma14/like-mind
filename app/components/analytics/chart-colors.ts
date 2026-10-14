/**
 * chart-colors.ts
 *
 * Categorical palette for multi-series charts, validated with the dataviz
 * skill's validate_palette.js (first 3 slots, light + dark, both PASS; the
 * 3rd slot carries a light-mode contrast WARN that requires visible direct
 * labels — see DonutChart, which labels every slice). Do not reorder these —
 * the order itself is the CVD-safety mechanism.
 *
 * Resolved against the app's own theme (`useTheme()`, the `data-theme`
 * attribute toggle), not `light-dark()` / `prefers-color-scheme` — those
 * wouldn't track the user's manual toggle the way this app's theming does.
 *
 * Sequential (single-series) charts use each product's own `--accent-N`
 * brand ramp from globals.css instead of these — see TrendChart's
 * `singleSeriesVar` prop.
 */
export const CATEGORICAL_COLORS = [
  { light: "#2a78d6", dark: "#3987e5", name: "blue" },
  { light: "#eb6834", dark: "#d95926", name: "orange" },
  { light: "#1baf7a", dark: "#199e70", name: "aqua" },
] as const;

export function categoricalColor(index: number, theme: "light" | "dark"): string {
  const slot = CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length];
  return theme === "dark" ? slot.dark : slot.light;
}
