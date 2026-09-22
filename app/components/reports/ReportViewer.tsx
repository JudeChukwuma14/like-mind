import { formatValue, humanizeKey, isRecord } from "@/app/components/loans/loan-data";

function RowTable({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const visibleRows = rows.slice(0, 50);
  return <div className="space-y-2">
    {rows.length > visibleRows.length && <p className="text-xs admin-text-muted">Showing the first 50 rows here. Download the report for the complete result.</p>}
    <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--admin-border)" }}>
    <table className="min-w-full text-left text-sm">
      <thead style={{ background: "var(--admin-bg)" }}><tr>{columns.map((key) => <th key={key} scope="col" className="whitespace-nowrap border-b px-4 py-3 text-[11px] font-bold uppercase tracking-wider admin-text-muted" style={{ borderColor: "var(--admin-border)" }}>{humanizeKey(key)}</th>)}</tr></thead>
      <tbody>{visibleRows.map((row, index) => <tr key={index} className="border-b last:border-b-0" style={{ borderColor: "var(--admin-border)" }}>{columns.map((key) => <td key={key} className="max-w-80 min-w-28 break-words px-4 py-3 align-top">{formatValue(row[key])}</td>)}</tr>)}</tbody>
    </table>
    </div>
  </div>;
}

export function ReportViewer({ value, title, depth = 0 }: { value: unknown; title?: string; depth?: number }) {
  if (value == null) return <p className="rounded-2xl border border-dashed p-6 text-sm admin-text-muted" style={{ borderColor: "var(--admin-border)" }}>No report data was returned for this view.</p>;
  if (Array.isArray(value)) {
    if (!value.length) return <section><h3 className="mb-3 text-base font-semibold">{title ?? "Results"}</h3><p className="rounded-2xl border border-dashed p-6 text-sm admin-text-muted" style={{ borderColor: "var(--admin-border)" }}>No rows found for these filters.</p></section>;
    const rows = value.filter(isRecord);
    return <section className="space-y-3">{title && <div className="flex items-center justify-between gap-3"><h3 className="text-base font-semibold">{title}</h3><span className="text-xs admin-text-muted">{value.length} row{value.length === 1 ? "" : "s"}</span></div>}{rows.length === value.length ? <RowTable rows={rows} /> : <div className="grid gap-3 sm:grid-cols-2">{value.map((item, index) => <div key={index} className="rounded-2xl border p-4 text-sm" style={{ borderColor: "var(--admin-border)" }}>{formatValue(item)}</div>)}</div>}</section>;
  }
  if (!isRecord(value)) return <p className="text-sm font-semibold">{formatValue(value)}</p>;
  if (depth > 6) return <pre className="overflow-x-auto text-xs">{JSON.stringify(value, null, 2)}</pre>;

  const fields = Object.entries(value).filter(([, child]) => child == null || typeof child !== "object");
  const groups = Object.entries(value).filter(([, child]) => child !== null && typeof child === "object");
  return <section className="space-y-5">{title && <h3 className="text-base font-semibold">{title}</h3>}{fields.length > 0 && <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{fields.map(([key, item]) => <div key={key} className="rounded-2xl border p-4" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}><dt className="text-[11px] font-bold uppercase tracking-wider admin-text-muted">{humanizeKey(key)}</dt><dd className="mt-2 break-words text-lg font-semibold">{formatValue(item)}</dd></div>)}</dl>}{groups.map(([key, child]) => <ReportViewer key={key} value={child} title={humanizeKey(key)} depth={depth + 1} />)}{!fields.length && !groups.length && <p className="text-sm admin-text-muted">No values were returned.</p>}</section>;
}
