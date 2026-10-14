/**
 * Stat-tile contract from the dataviz skill: label (sentence case, no trailing
 * colon), value (semibold, auto-compact), optional delta, optional helper text.
 * Used for KPI rows — "a handful of headline numbers" — rather than a chart.
 */
export function StatTile({
  label,
  value,
  helper,
  surface = "dash",
}: {
  label: string;
  value: string;
  helper?: string;
  /** Which CSS var family this tile renders against — the admin and user dashboards use different var prefixes. */
  surface?: "dash" | "admin";
}) {
  const textVar = `var(--${surface}-text)`;
  const mutedVar = `var(--${surface}-muted)`;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: mutedVar }}>
        {label}
      </p>
      <p className="text-3xl font-bold tracking-tight" style={{ color: textVar }}>
        {value}
      </p>
      {helper && (
        <p className="mt-1.5 text-xs" style={{ color: mutedVar }}>
          {helper}
        </p>
      )}
    </div>
  );
}
