import type { WithdrawalRequest } from "@/app/lib/withdrawals-api";

export function formatWithdrawalAmount(value: number | null | undefined, currency?: string): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (!currency) return new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 }).format(value);
  }
}

export function formatWithdrawalDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function withdrawalCategory(request: WithdrawalRequest): string {
  const category = request.category ?? request.type;
  if (category === "CooperativeDeduction" || category === "Deduction") return "Cooperative deduction";
  return category || "Withdrawal";
}

export function WithdrawalStatusBadge({ status }: { status: string | null | undefined }) {
  const normalized = (status ?? "").toLowerCase();
  const pending = normalized === "pendingapprovals" || normalized === "pending" || normalized === "approving";
  const approved = normalized === "approved" || normalized === "completed";
  const rejected = normalized === "rejected" || normalized === "failed";
  const label = pending ? "Pending approval" : status ? status.replace(/([a-z])([A-Z])/g, "$1 $2") : "Unknown";
  const style = pending ? "border-amber-200 bg-amber-50 text-amber-800" : approved ? "border-green-200 bg-green-50 text-green-800" : rejected ? "border-red-200 bg-red-50 text-red-800" : "border-gray-200 bg-gray-50 text-gray-700";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>{label}</span>;
}
