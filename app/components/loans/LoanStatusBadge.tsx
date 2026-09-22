import { loanStatus } from "@/app/components/loans/loan-data";
import type { LoanRecord } from "@/app/lib/loan-api";

const styles: Record<string, string> = {
  PendingReview: "bg-amber-100 text-amber-800", PendingApprovals: "bg-blue-100 text-blue-800",
  Approved: "bg-indigo-100 text-indigo-800", Rejected: "bg-red-100 text-red-800",
  PendingDisbursementApprovals: "bg-purple-100 text-purple-800", Disbursed: "bg-emerald-100 text-emerald-800",
  Closed: "bg-slate-200 text-slate-700",
};
export function humanizeStatus(status?: string): string { return status?.replace(/([a-z])([A-Z])/g, "$1 $2") ?? "Status unavailable"; }
export function LoanStatusBadge({ loan, status }: { loan?: LoanRecord; status?: string }) {
  const value = status ?? loanStatus(loan);
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[value ?? ""] ?? "bg-slate-100 text-slate-600"}`}>{humanizeStatus(value)}</span>;
}
