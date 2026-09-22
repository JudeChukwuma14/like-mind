import type { LoanRecord } from "@/app/lib/loan-api";
import { LoanStatusBadge } from "@/app/components/loans/LoanStatusBadge";
import { formatMoney, formatValue, loanStatus, readNumber, readString } from "@/app/components/loans/loan-data";

const stages = ["PendingReview", "PendingApprovals", "Approved", "PendingDisbursementApprovals", "Disbursed", "Closed"];

export function LoanOverview({ loan, variant = "member" }: { loan: LoanRecord; variant?: "member" | "admin" }) {
  const surface = variant === "admin" ? "var(--admin-surface)" : "var(--dash-surface)";
  const border = variant === "admin" ? "var(--admin-border)" : "var(--dash-border)";
  const muted = variant === "admin" ? "var(--admin-muted)" : "var(--dash-muted)";
  const color = variant === "admin" ? "var(--admin-text)" : "var(--dash-text)";
  const status = loanStatus(loan);
  const currentStage = stages.indexOf(status ?? "");
  const principal = readNumber(loan, "principalAmount");
  const tenure = readNumber(loan, "tenureMonths");
  const purpose = readString(loan, "purpose");
  const memberName = readString(loan, "memberName");
  const createdAt = readString(loan, "createdAt");

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">{variant === "admin" ? "Loan case" : "Your loan"}</p>
            <h1 className="mt-2 max-w-2xl text-2xl font-bold tracking-tight md:text-3xl">{purpose ?? "Loan application"}</h1>
            {memberName && variant === "admin" && <p className="mt-2 text-sm text-white/65">{memberName}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-3"><LoanStatusBadge status={status} />{createdAt && <span className="text-xs text-white/55">Submitted {formatValue(createdAt)}</span>}</div>
          </div>
          {principal != null && <div className="sm:text-right"><p className="text-[10px] font-bold uppercase tracking-widest text-white/45">Principal</p><p className="mt-1 text-3xl font-bold tracking-tight text-amber-300">{formatMoney(principal)}</p>{tenure != null && <p className="mt-1 text-xs text-white/55">{tenure} months</p>}</div>}
        </div>
        {status === "Rejected" && <p className="relative mt-7 rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100">The loan was rejected. No further approval or disbursement actions are available.</p>}
        {status === "Closed" && <p className="relative mt-7 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/80">This loan is closed. No further repayment is due.</p>}
      </section>

      {currentStage >= 0 && status !== "Rejected" && (
        <section className="rounded-3xl border p-5" style={{ background: surface, borderColor: border, color }}>
          <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-bold">Loan journey</h2><p className="text-xs" style={{ color: muted }}>Backend status is authoritative</p></div>
          <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {stages.map((stage, index) => <li key={stage} className="flex items-center gap-2 text-xs"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${index <= currentStage ? "bg-amber-400 text-black" : ""}`} style={index > currentStage ? { background: border, color: muted } : undefined}>{index + 1}</span><span className={index <= currentStage ? "font-semibold" : ""} style={index > currentStage ? { color: muted } : undefined}>{stage.replace(/([a-z])([A-Z])/g, "$1 $2")}</span></li>)}
          </ol>
        </section>
      )}
    </div>
  );
}
