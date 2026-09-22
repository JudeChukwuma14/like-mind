import { humanizeKey, isRecord, primitiveEntries } from "@/app/components/loans/loan-data";

export function ResponseDetails({ value, title, variant = "member" }: { value: unknown; title?: string; variant?: "member" | "admin" }) {
  const surface = variant === "admin" ? "var(--admin-surface)" : "var(--dash-surface)";
  const border = variant === "admin" ? "var(--admin-border)" : "var(--dash-border)";
  const muted = variant === "admin" ? "var(--admin-muted)" : "var(--dash-muted)";
  const color = variant === "admin" ? "var(--admin-text)" : "var(--dash-text)";
  if (Array.isArray(value)) {
    if (!value.length) return null;
    return <section className="space-y-3">{title && <h2 className="text-lg font-semibold">{title}</h2>}<div className="space-y-3">{value.map((item, index) => <div key={index} className="rounded-2xl border p-4" style={{ background: surface, borderColor: border, color }}>{isRecord(item) ? <ResponseDetails value={item} variant={variant} /> : <p className="text-sm">{String(item)}</p>}</div>)}</div></section>;
  }
  if (!isRecord(value)) return null;
  const primitives = primitiveEntries(value);
  const nested = Object.entries(value).filter(([, child]) => isRecord(child) || Array.isArray(child));
  return <section className="space-y-5" style={{ color }}>{title && <h2 className="text-lg font-semibold">{title}</h2>}{primitives.length > 0 && <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{primitives.map(([key, formatted]) => <div key={key} className="rounded-2xl border p-4 shadow-sm" style={{ background: surface, borderColor: border }}><dt className="text-[10px] font-bold uppercase tracking-widest" style={{ color: muted }}>{humanizeKey(key)}</dt><dd className="mt-2 break-words text-sm font-semibold">{formatted}</dd></div>)}</dl>}{nested.map(([key, child]) => <ResponseDetails key={key} value={child} title={humanizeKey(key)} variant={variant} />)}</section>;
}
