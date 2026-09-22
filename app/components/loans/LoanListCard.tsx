import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, WalletCards } from "lucide-react";
import type { LoanRecord } from "@/app/lib/loan-api";
import { LoanStatusBadge } from "@/app/components/loans/LoanStatusBadge";
import { formatMoney, formatValue, loanId, readNumber, readString } from "@/app/components/loans/loan-data";

export function LoanListCard({ loan, href, variant = "member" }: { loan: LoanRecord; href?: string; variant?: "member" | "admin" }) {
  const id = loanId(loan);
  const surface = variant === "admin" ? "var(--admin-surface)" : "var(--dash-surface)";
  const border = variant === "admin" ? "var(--admin-border)" : "var(--dash-border)";
  const muted = variant === "admin" ? "var(--admin-muted)" : "var(--dash-muted)";
  const color = variant === "admin" ? "var(--admin-text)" : "var(--dash-text)";
  const purpose = readString(loan, "purpose") ?? "Loan application";
  const member = readString(loan, "memberName");
  const tenure = readNumber(loan, "tenureMonths");
  const createdAt = readString(loan, "createdAt");
  const content = <>
    <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-600"><WalletCards className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate text-base font-bold">{purpose}</p><p className="mt-1 text-xs" style={{ color: muted }}>{member && variant === "admin" ? member : id ? `Loan #${id.slice(0, 8)}` : "Loan record"}</p></div></div>{href && <ArrowUpRight className="h-5 w-5 shrink-0" style={{ color: muted }} />}</div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: muted }}>Principal</p><p className="mt-1 text-xl font-bold tracking-tight">{formatMoney(readNumber(loan, "principalAmount"))}</p></div><LoanStatusBadge loan={loan} /></div>
    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-xs" style={{ borderColor: border, color: muted }}>{tenure != null && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {tenure} months</span>}{createdAt && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {formatValue(createdAt)}</span>}</div>
  </>;
  const className = "block rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";
  const style = { background: surface, borderColor: border, color };
  return href ? <Link href={href} className={className} style={style}>{content}</Link> : <article className={className} style={style}>{content}</article>;
}
