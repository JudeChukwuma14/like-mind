"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, BarChart3, CalendarDays, FileSpreadsheet, Loader2, RefreshCw, WalletCards } from "lucide-react";
import toast from "react-hot-toast";
import { CooperativeSelector } from "@/app/components/CooperativeSelector";
import { ReportViewer } from "@/app/components/reports/ReportViewer";
import { getApiErrorMessage } from "@/app/lib/api-client";
import { useCooperativeId } from "@/app/lib/useCooperativeId";
import {
  exportLoanPortfolioReport, exportSavingsBalanceReport, exportSavingsTransactionsReport,
  getLoanPortfolioReport, getSavingsBalanceReport, getSavingsTransactionsReport,
  LOAN_STATUSES, type LoanPortfolioFilters, type ReportFormat, type SavingsTransactionFilters,
} from "@/app/lib/report-api";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";

type ReportTab = "loans" | "balance" | "transactions";
const emptyLoanFilters: LoanPortfolioFilters = { status: "", disbursedFrom: "", disbursedTo: "", appliedFrom: "", appliedTo: "" };
const emptyTransactionFilters: SavingsTransactionFilters = { fromDate: "", toDate: "" };
const tabs = [
  { id: "balance", label: "Savings balance", detail: "Current savings position", icon: WalletCards },
  { id: "transactions", label: "Savings transactions", detail: "Activity over a date range", icon: CalendarDays },
  { id: "loans", label: "Loan portfolio", detail: "Exposure, overdue loans and status", icon: BarChart3 },
] as const;

function dateRangeError(start: string | undefined, end: string | undefined, label: string): string | null {
  return start && end && start > end ? `${label} start date must be on or before its end date.` : null;
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-1.5 text-xs font-semibold admin-text-muted">
    <span>{label}</span>
    <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="input-admin min-h-11 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400/40" />
  </label>;
}

function ReportResult({ data, error, loading, refreshing, onRetry }: { data: unknown; error: unknown; loading: boolean; refreshing: boolean; onRetry: () => void }) {
  if (loading) return <div className="card-admin flex min-h-56 items-center justify-center gap-3 rounded-3xl text-sm admin-text-muted"><Loader2 className="h-5 w-5 animate-spin text-amber-500" /> Loading report…</div>;
  if (error) return <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
    <p className="font-semibold">Could not load this report</p><p className="mt-1 whitespace-pre-line">{getApiErrorMessage(error)}</p>
    <button onClick={onRetry} className="mt-4 rounded-full bg-red-700 px-4 py-2 font-semibold text-white">Try again</button>
  </div>;
  return <section className="card-admin rounded-3xl p-5 md:p-7">
    <div className="mb-6 flex items-center justify-between gap-3 border-b pb-5" style={{ borderColor: "var(--admin-border)" }}>
      <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">Live backend data</p><h2 className="mt-1 text-xl font-semibold">Report results</h2></div>
      {refreshing && <Loader2 className="h-4 w-4 animate-spin text-amber-500" aria-label="Refreshing" />}
    </div>
    <ReportViewer value={data} />
  </section>;
}

export default function ReportsPage() {
  const { user } = useAdminAuth();
  const [tab, setTab] = useState<ReportTab>("balance");
  const cooperative = useCooperativeId(tab === "loans");
  const cooperativeId = cooperative.cooperativeId ?? "";
  const [loanDraft, setLoanDraft] = useState<LoanPortfolioFilters>(emptyLoanFilters);
  const [loanFilters, setLoanFilters] = useState<LoanPortfolioFilters>(emptyLoanFilters);
  const [transactionDraft, setTransactionDraft] = useState<SavingsTransactionFilters>(emptyTransactionFilters);
  const [transactionFilters, setTransactionFilters] = useState<SavingsTransactionFilters>(emptyTransactionFilters);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<ReportFormat | null>(null);

  const loans = useQuery({ queryKey: ["reports", "loan-portfolio", cooperativeId, loanFilters], queryFn: () => getLoanPortfolioReport(cooperativeId, loanFilters), enabled: tab === "loans" && Boolean(cooperativeId), staleTime: 30_000 });
  const balance = useQuery({ queryKey: ["reports", "savings-balance", user?.id], queryFn: getSavingsBalanceReport, enabled: tab === "balance" && Boolean(user), staleTime: 30_000 });
  const transactions = useQuery({ queryKey: ["reports", "savings-transactions", user?.id, transactionFilters], queryFn: () => getSavingsTransactionsReport(transactionFilters), enabled: tab === "transactions" && Boolean(user), staleTime: 30_000 });
  const activeQuery = tab === "loans" ? loans : tab === "balance" ? balance : transactions;

  function applyLoanFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = dateRangeError(loanDraft.disbursedFrom, loanDraft.disbursedTo, "Disbursed") ?? dateRangeError(loanDraft.appliedFrom, loanDraft.appliedTo, "Applied");
    setFilterError(error);
    if (!error) setLoanFilters({ ...loanDraft });
  }

  function applyTransactionFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = dateRangeError(transactionDraft.fromDate, transactionDraft.toDate, "Transaction");
    setFilterError(error);
    if (!error) setTransactionFilters({ ...transactionDraft });
  }

  async function download(format: ReportFormat) {
    if (tab === "loans" && !cooperativeId) {
      toast.error("Select a cooperative before exporting its loan portfolio.");
      return;
    }
    setDownloading(format);
    try {
      if (tab === "loans") await exportLoanPortfolioReport(cooperativeId, loanFilters, format);
      else if (tab === "balance") await exportSavingsBalanceReport(format);
      else await exportSavingsTransactionsReport(transactionFilters, format);
      toast.success(`${format.toUpperCase()} report downloaded`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDownloading(null);
    }
  }

  return <div className="mx-auto max-w-7xl space-y-6 pb-16 admin-text">
    <header className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="relative"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Reporting workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Reports</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">View live loan and savings data, narrow the results, and download the rows you need.</p></div>
    </header>

    <nav aria-label="Report type" className="grid gap-3 md:grid-cols-3">{tabs.map((item) => <button key={item.id} type="button" onClick={() => { setTab(item.id); setFilterError(null); }} aria-current={tab === item.id ? "page" : undefined} className={`card-admin flex items-center gap-4 rounded-2xl p-4 text-left transition hover:border-amber-400 ${tab === item.id ? "ring-2 ring-amber-400/70" : ""}`}>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tab === item.id ? "bg-amber-400 text-black" : "bg-amber-400/10 text-amber-600"}`}><item.icon className="h-5 w-5" /></span>
      <span><span className="block text-sm font-semibold">{item.label}</span><span className="mt-0.5 block text-xs admin-text-muted">{item.detail}</span></span>
    </button>)}</nav>

    {tab === "loans" && <CooperativeSelector selection={cooperative} disabled={downloading !== null} onChange={(id) => { cooperative.selectCooperative(id); setFilterError(null); }} />}
    {(tab !== "loans" || Boolean(cooperativeId)) && <>
      {tab === "loans" && <form onSubmit={applyLoanFilters} className="card-admin space-y-5 rounded-3xl p-5 md:p-6">
        <div><h2 className="font-semibold">Loan portfolio filters</h2><p className="mt-1 text-xs admin-text-muted">Use either date range on its own, both together, or leave all dates blank.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="grid gap-1.5 text-xs font-semibold admin-text-muted"><span>Status</span><select value={loanDraft.status ?? ""} onChange={(event) => setLoanDraft((draft) => ({ ...draft, status: event.target.value as LoanPortfolioFilters["status"] }))} className="input-admin min-h-11 rounded-xl px-3 py-2 text-sm font-medium"><option value="">All statuses</option>{LOAN_STATUSES.map((status) => <option key={status} value={status}>{status.replace(/([a-z])([A-Z])/g, "$1 $2")}</option>)}</select></label>
          <DateField label="Disbursed from" value={loanDraft.disbursedFrom ?? ""} onChange={(value) => setLoanDraft((draft) => ({ ...draft, disbursedFrom: value }))} />
          <DateField label="Disbursed to" value={loanDraft.disbursedTo ?? ""} onChange={(value) => setLoanDraft((draft) => ({ ...draft, disbursedTo: value }))} />
          <DateField label="Applied from" value={loanDraft.appliedFrom ?? ""} onChange={(value) => setLoanDraft((draft) => ({ ...draft, appliedFrom: value }))} />
          <DateField label="Applied to" value={loanDraft.appliedTo ?? ""} onChange={(value) => setLoanDraft((draft) => ({ ...draft, appliedTo: value }))} />
        </div>
        {filterError && <p role="alert" className="text-sm text-red-600">{filterError}</p>}
        <div className="flex flex-wrap gap-2"><button type="submit" className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300">Apply filters</button><button type="button" onClick={() => { setLoanDraft(emptyLoanFilters); setLoanFilters(emptyLoanFilters); setFilterError(null); }} className="rounded-full border px-5 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Clear</button></div>
      </form>}

      {tab === "transactions" && <form onSubmit={applyTransactionFilters} className="card-admin space-y-5 rounded-3xl p-5 md:p-6">
        <div><h2 className="font-semibold">Transaction dates</h2><p className="mt-1 text-xs admin-text-muted">Both dates are optional. Filter from a date, to a date, or across a range.</p></div>
        <div className="grid max-w-xl gap-4 sm:grid-cols-2"><DateField label="From date" value={transactionDraft.fromDate ?? ""} onChange={(value) => setTransactionDraft((draft) => ({ ...draft, fromDate: value }))} /><DateField label="To date" value={transactionDraft.toDate ?? ""} onChange={(value) => setTransactionDraft((draft) => ({ ...draft, toDate: value }))} /></div>
        {filterError && <p role="alert" className="text-sm text-red-600">{filterError}</p>}
        <div className="flex flex-wrap gap-2"><button type="submit" className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300">Apply dates</button><button type="button" onClick={() => { setTransactionDraft(emptyTransactionFilters); setTransactionFilters(emptyTransactionFilters); setFilterError(null); }} className="rounded-full border px-5 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Clear</button></div>
      </form>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold">{tabs.find((item) => item.id === tab)?.label}</h2><p className="mt-0.5 text-xs admin-text-muted">Exports use the filters currently applied to this view.</p></div><div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => activeQuery.refetch()} disabled={activeQuery.isFetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}><RefreshCw className={`h-4 w-4 ${activeQuery.isFetching ? "animate-spin" : ""}`} /> Refresh</button>
        <button type="button" onClick={() => download("csv")} disabled={downloading !== null} className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}>{downloading === "csv" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />} CSV</button>
        <button type="button" onClick={() => download("xlsx")} disabled={downloading !== null} className="inline-flex items-center gap-2 rounded-full bg-[#181817] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{downloading === "xlsx" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />} Excel</button>
      </div></div>

      <ReportResult data={activeQuery.data} error={activeQuery.error} loading={activeQuery.isLoading} refreshing={activeQuery.isFetching && !activeQuery.isLoading} onRetry={() => activeQuery.refetch()} />
    </>}
  </div>;
}
