export function paymentAmount(amount: number | null | undefined, currency?: string | null): string {
  if (amount == null || !Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-NG", currency ? { style: "currency", currency, maximumFractionDigits: 2 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  }
}

export function paymentDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function paymentTypeLabel(value: string | null | undefined): string {
  return value ? value.replace(/([a-z])([A-Z])/g, "$1 $2") : "Payment";
}

export function PaymentStatusBadge({ status }: { status: string | null | undefined }) {
  const normalized = status?.toLowerCase();
  const pending = normalized === "pendingconfirmation" || normalized === "submitted";
  const classes = pending ? "border-amber-200 bg-amber-50 text-amber-800" : normalized === "confirmed" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : normalized === "rejected" ? "border-red-200 bg-red-50 text-red-800" : "border-gray-200 bg-gray-50 text-gray-700";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}>{pending ? "Pending confirmation" : status || "Unknown"}</span>;
}
