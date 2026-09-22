import type { LoanRecord, LoanStatus } from "@/app/lib/loan-api";

export function isRecord(value: unknown): value is LoanRecord { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
export function readField(record: LoanRecord | null | undefined, name: string): unknown {
  if (!record) return undefined;
  const key = Object.keys(record).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
  return key ? record[key] : undefined;
}
export function readString(record: LoanRecord | null | undefined, name: string): string | undefined {
  const value = readField(record, name);
  return typeof value === "string" && value.trim() ? value : undefined;
}
export function readNumber(record: LoanRecord | null | undefined, name: string): number | undefined {
  const value = readField(record, name);
  if (value == null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
export function formatMoney(value: number | undefined): string {
  return value == null ? "—" : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(value);
}
export function loanId(loan: LoanRecord): string | undefined { return readString(loan, "id") ?? readString(loan, "loanId"); }
export function loanStatus(loan: LoanRecord | null | undefined): LoanStatus | string | undefined { return readString(loan, "status"); }
export function humanizeKey(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}
export function formatValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return new Intl.NumberFormat("en-NG").format(value);
  if (typeof value === "string") {
    const date = /^\d{4}-\d{2}-\d{2}T/.test(value) ? new Date(value) : null;
    if (date && !Number.isNaN(date.getTime())) return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(date);
    return value;
  }
  return JSON.stringify(value);
}
export function primitiveEntries(record: LoanRecord): [string, string][] {
  return Object.entries(record).filter(([, value]) => value == null || ["string", "number", "boolean"].includes(typeof value)).map(([key, value]) => [key, formatValue(value)]);
}
export function findNamedRecords(value: unknown, nameFragment: string): LoanRecord[] {
  if (!isRecord(value)) return [];
  for (const [key, child] of Object.entries(value)) if (key.toLowerCase().includes(nameFragment.toLowerCase()) && Array.isArray(child)) return child.filter(isRecord);
  for (const child of Object.values(value)) if (isRecord(child)) { const found = findNamedRecords(child, nameFragment); if (found.length) return found; }
  return [];
}
export function findNamedRecord(value: unknown, nameFragment: string): LoanRecord | undefined {
  if (!isRecord(value)) return undefined;
  for (const [key, child] of Object.entries(value)) if (key.toLowerCase().includes(nameFragment.toLowerCase()) && isRecord(child)) return child;
  for (const child of Object.values(value)) { const found = findNamedRecord(child, nameFragment); if (found) return found; }
  return undefined;
}
export function findNestedId(value: unknown, nameFragment: string): string | undefined {
  if (!isRecord(value)) return undefined;
  for (const [key, child] of Object.entries(value)) {
    if (key.toLowerCase().includes(nameFragment.toLowerCase()) && isRecord(child)) {
      const id = readString(child, "id") ?? readString(child, `${nameFragment}Id`);
      if (id) return id;
    }
  }
  const direct = readString(value, `${nameFragment}Id`);
  if (direct) return direct;
  for (const child of Object.values(value)) { const found = findNestedId(child, nameFragment); if (found) return found; }
  return undefined;
}
