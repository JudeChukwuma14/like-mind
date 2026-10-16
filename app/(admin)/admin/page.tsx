"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ApiErrorCard } from "@/app/components/ApiErrorCard";
import { getApiErrorMessage } from "@/app/lib/api-client";
import {
  getAnalyticsSummary,
  getMonthlyInvestments,
  getMonthlyLoans,
  getMonthlySavings,
  LOAN_ANALYTICS_STATUSES,
  SAVINGS_CATEGORIES,
  type LoanAnalyticsStatus,
  type SavingsCategory,
} from "@/app/lib/analytics-api";
import { StatTile } from "@/app/components/analytics/StatTile";
import { CompositionBar } from "@/app/components/analytics/CompositionBar";
import { TrendChart } from "@/app/components/analytics/TrendChart";

const workloadTasks = [
  { text: "Review new member applications", href: "/admin/members" },
  { text: "Confirm pending contributions", href: "/admin/contributions" },
  { text: "Decide on open loan applications", href: "/admin/loans" },
  { text: "Approve pending withdrawals", href: "/admin/withdrawals" },
];

const RANGE_PRESETS = [
  { id: "ytd", label: "This year" },
  { id: "6m", label: "Last 6 months" },
  { id: "12m", label: "Last 12 months" },
] as const;
type RangeId = (typeof RANGE_PRESETS)[number]["id"];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function rangeFor(id: RangeId): { from: string; to: string } {
  const now = new Date();
  const to = isoDate(now);
  if (id === "ytd") return { from: `${now.getUTCFullYear()}-01-01`, to };
  const months = id === "6m" ? 6 : 12;
  const from = new Date(now);
  from.setUTCMonth(from.getUTCMonth() - months);
  return { from: isoDate(from), to };
}

function money(n: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

/** "PendingDisbursementApprovals" -> "Pending disbursement approvals" */
function humanize(value: string): string {
  const spaced = value.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

const SELECT_CLASS = "rounded-full border px-3 py-1.5 text-xs font-semibold outline-none";

function ChartCard({ title, eyebrow, action, children }: { title: string; eyebrow: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6 md:p-8 shadow-sm border" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "var(--admin-muted)" }}>{eyebrow}</p>
          <h2 className="text-xl font-bold" style={{ color: "var(--admin-text)" }}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function QueryBoundary({ isLoading, isError, error, onRetry, children }: { isLoading: boolean; isError: boolean; error: unknown; onRetry: () => void; children: React.ReactNode }) {
  if (isLoading) {
    return <div className="flex h-48 items-center justify-center gap-2 text-sm" style={{ color: "var(--admin-muted)" }}><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }
  if (isError) {
    return <ApiErrorCard message={getApiErrorMessage(error)} onRetry={onRetry} compact />;
  }
  return <>{children}</>;
}

export default function AdminOverviewPage() {
  const [range, setRange] = useState<RangeId>("ytd");
  const { from, to } = useMemo(() => rangeFor(range), [range]);
  const [savingsCategory, setSavingsCategory] = useState<SavingsCategory | "">("");
  const [loanStatus, setLoanStatus] = useState<LoanAnalyticsStatus | "">("");

  const summary = useQuery({ queryKey: ["analytics-summary", from, to], queryFn: () => getAnalyticsSummary({ from, to }) });
  const savings = useQuery({
    queryKey: ["analytics-monthly-savings", from, to, savingsCategory],
    queryFn: () => (savingsCategory ? getMonthlySavings({ from, to, category: savingsCategory }) : getMonthlySavings({ from, to, allCategories: true })),
  });
  const investments = useQuery({ queryKey: ["analytics-monthly-investments", from, to], queryFn: () => getMonthlyInvestments({ from, to }) });
  const loans = useQuery({
    queryKey: ["analytics-monthly-loans", from, to, loanStatus],
    queryFn: () => getMonthlyLoans({ from, to, status: loanStatus || undefined }),
  });

  const rangePicker = (
    <div role="tablist" aria-label="Date range" className="flex w-fit gap-1 rounded-full border p-1" style={{ borderColor: "var(--admin-border)" }}>
      {RANGE_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          role="tab"
          aria-selected={range === preset.id}
          onClick={() => setRange(preset.id)}
          className="rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
          style={
            range === preset.id
              ? { background: "var(--admin-primary)", color: "#fff" }
              : { color: "var(--admin-muted)" }
          }
        >
          {preset.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "var(--admin-muted)" }}>Overview</p>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>Dashboard</h1>
        </div>
        {rangePicker}
      </div>

      {/* Summary stat row */}
      <QueryBoundary isLoading={summary.isLoading} isError={summary.isError} error={summary.error} onRetry={() => summary.refetch()}>
        {summary.data && (
          <div className="grid grid-cols-2 md:grid-cols-4 py-6 border-y gap-y-4" style={{ borderColor: "var(--admin-border)" }}>
            <StatTile surface="admin" label="Active members" value={summary.data.activeMembers.toLocaleString()} />
            <StatTile surface="admin" label="Pending activation" value={summary.data.pendingActivationMembers.toLocaleString()} />
            <StatTile surface="admin" label="Non-active" value={summary.data.nonActiveMembers.toLocaleString()} />
            <StatTile surface="admin" label="Total contribution" value={money(summary.data.totalContribution)} helper={`${money(summary.data.savingsBalanceTotal)} savings · ${money(summary.data.cycleContributionTotal)} cycle`} />
          </div>
        )}
      </QueryBoundary>

      {/* Member composition */}
      <ChartCard eyebrow="Membership" title="Member composition">
        <QueryBoundary isLoading={summary.isLoading} isError={summary.isError} error={summary.error} onRetry={() => summary.refetch()}>
          {summary.data && (
            <CompositionBar
              surface="admin"
              totalLabel="Total members"
              slices={[
                { label: "Active", value: summary.data.activeMembers },
                { label: "Pending activation", value: summary.data.pendingActivationMembers },
                { label: "Non-active", value: summary.data.nonActiveMembers },
              ]}
            />
          )}
        </QueryBoundary>
      </ChartCard>

      {/* Savings trend */}
      <ChartCard
        eyebrow="Cash flow"
        title="Monthly savings"
        action={
          <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--admin-muted)" }}>
            Category
            <select
              value={savingsCategory}
              onChange={(e) => setSavingsCategory(e.target.value as SavingsCategory | "")}
              className={SELECT_CLASS}
              style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)", color: "var(--admin-text)" }}
            >
              <option value="">All categories</option>
              {SAVINGS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{humanize(cat)}</option>
              ))}
            </select>
          </label>
        }
      >
        <QueryBoundary isLoading={savings.isLoading} isError={savings.isError} error={savings.error} onRetry={() => savings.refetch()}>
          {savings.data && (
            <TrendChart
              surface="admin"
              data={savings.data.map((p) => ({ label: p.month, values: [p.amount] }))}
              seriesNames={["Savings"]}
              singleSeriesVar="--admin-primary"
              formatValue={(n) => money(n)}
            />
          )}
        </QueryBoundary>
      </ChartCard>

      {/* Investments trend */}
      <ChartCard eyebrow="Pools" title="Monthly investments">
        <QueryBoundary isLoading={investments.isLoading} isError={investments.isError} error={investments.error} onRetry={() => investments.refetch()}>
          {investments.data && (
            <TrendChart
              surface="admin"
              data={investments.data.map((p) => ({ label: p.month, values: [p.moneyMovedIntoPools, p.participantContributionAmount] }))}
              seriesNames={["Moved into pools", "Participant contribution"]}
              formatValue={(n) => money(n)}
            />
          )}
        </QueryBoundary>
      </ChartCard>

      {/* Loans trend */}
      <ChartCard
        eyebrow="Credit"
        title="Monthly loans — amount"
        action={
          <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--admin-muted)" }}>
            Status
            <select
              value={loanStatus}
              onChange={(e) => setLoanStatus(e.target.value as LoanAnalyticsStatus | "")}
              className={SELECT_CLASS}
              style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)", color: "var(--admin-text)" }}
            >
              <option value="">All statuses</option>
              {LOAN_ANALYTICS_STATUSES.map((status) => (
                <option key={status} value={status}>{humanize(status)}</option>
              ))}
            </select>
          </label>
        }
      >
        <QueryBoundary isLoading={loans.isLoading} isError={loans.isError} error={loans.error} onRetry={() => loans.refetch()}>
          {loans.data && (
            <>
              <TrendChart
                surface="admin"
                data={loans.data.map((p) => ({ label: p.month, values: [p.requestedAmount, p.disbursedAmount] }))}
                seriesNames={["Requested", "Disbursed"]}
                formatValue={(n) => money(n)}
              />
              <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-5 sm:w-72" style={{ borderColor: "var(--admin-border)" }}>
                <StatTile surface="admin" label="Loans requested" value={loans.data.reduce((sum, p) => sum + p.requestedCount, 0).toLocaleString()} />
                <StatTile surface="admin" label="Loans disbursed" value={loans.data.reduce((sum, p) => sum + p.disbursedCount, 0).toLocaleString()} />
              </div>
            </>
          )}
        </QueryBoundary>
      </ChartCard>

      {/* Workload */}
      <div>
        <h3 className="text-lg font-bold mb-4" style={{ color: "var(--admin-text)" }}>Workload</h3>
        <div className="flex flex-col gap-3">
          {workloadTasks.map((task, i) => (
            <Link
              key={i}
              href={task.href}
              className="admin-workload-card group flex items-center justify-between p-5 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-(--admin-primary)"></div>
                <span className="text-sm font-medium" style={{ color: "var(--admin-muted)" }}>{task.text}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--admin-muted)" }}>
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
