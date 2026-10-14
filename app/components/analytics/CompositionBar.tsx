"use client";

import { useTheme } from "@/app/providers/ThemeProvider";
import { categoricalColor } from "./chart-colors";

export type CompositionSlice = {
  label: string;
  value: number;
};

/**
 * Part-to-whole as a single horizontal stacked bar — the dataviz skill's own
 * default form for this job (not a pie). Categorical colors in fixed order,
 * a 2px surface-color gap between segments (the mark-spec separator, not a
 * border), and every segment directly labelled in the legend below rather
 * than relying on hue alone.
 */
export function CompositionBar({
  slices,
  totalLabel,
  surface = "dash",
}: {
  slices: CompositionSlice[];
  totalLabel: string;
  surface?: "dash" | "admin";
}) {
  const { theme } = useTheme();
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const textVar = `var(--${surface}-text)`;
  const mutedVar = `var(--${surface}-muted)`;
  const borderVar = `var(--${surface}-border)`;
  const surfaceVar = `var(--${surface}-surface)`;

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight" style={{ color: textVar }}>{total.toLocaleString()}</span>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: mutedVar }}>{totalLabel}</span>
      </div>

      {total === 0 ? (
        <div className="flex h-10 items-center justify-center rounded-full border text-xs" style={{ borderColor: borderVar, color: mutedVar }}>
          No data yet
        </div>
      ) : (
        <div className="flex h-5 w-full overflow-hidden rounded-full" style={{ background: surfaceVar }}>
          {slices.map((slice, i) => {
            const fraction = slice.value / total;
            if (fraction <= 0) return null;
            return (
              <div
                key={slice.label}
                className="h-full"
                style={{
                  width: `${fraction * 100}%`,
                  background: categoricalColor(i, theme),
                  borderRight: i < slices.length - 1 ? `2px solid ${surfaceVar}` : undefined,
                }}
                title={`${slice.label}: ${slice.value.toLocaleString()} (${Math.round(fraction * 100)}%)`}
              />
            );
          })}
        </div>
      )}

      <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">
        {slices.map((slice, i) => {
          const fraction = total > 0 ? slice.value / total : 0;
          return (
            <li key={slice.label} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: categoricalColor(i, theme) }} aria-hidden />
              <span className="min-w-0 truncate font-medium" style={{ color: textVar }}>{slice.label}</span>
              <span className="shrink-0 font-semibold" style={{ color: mutedVar }}>
                {slice.value.toLocaleString()} <span className="text-xs">({Math.round(fraction * 100)}%)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
