"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, FilePenLine, Loader2, RefreshCw, SlidersHorizontal, UploadCloud } from "lucide-react";
import { BulkUploadDialog } from "@/app/components/bulk-upload/BulkUploadDialog";
import { getAdminLoans, LOAN_STATUSES, type LoanStatus } from "@/app/lib/loan-api";
import { loanKeys } from "@/app/lib/loan-keys";
import { getLoanScreenError } from "@/app/components/loans/loan-errors";
import { LoanListCard } from "@/app/components/loans/LoanListCard";
import { loanId } from "@/app/components/loans/loan-data";

const PAGE_SIZE = 20;
const QUICK_VIEWS: { label: string; status: LoanStatus | "" }[] = [
  { label: "All loans", status: "" },
  { label: "Needs review", status: "PendingReview" },
  { label: "Awaiting approvals", status: "PendingApprovals" },
  { label: "Disbursement approvals", status: "PendingDisbursementApprovals" },
  { label: "Disbursed", status: "Disbursed" },
];

function statusLabel(value: LoanStatus): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export default function AdminLoansPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<LoanStatus | "">("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const filters = { page, pageSize: PAGE_SIZE, status, onlyMine };
  const query = useQuery({ queryKey: loanKeys.adminList(filters), queryFn: () => getAdminLoans(filters) });
  const hasFilters = Boolean(status || onlyMine);

  function changeStatus(next: LoanStatus | "") {
    setStatus(next);
    setPage(1);
  }

  function clearFilters() {
    setStatus("");
    setOnlyMine(false);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16 admin-text">
      <BulkUploadDialog kind="LoanRepayment" open={showBulkUpload} onClose={() => setShowBulkUpload(false)} />

      <header className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Loan operations</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Loan workspace</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Find applications that need attention, open a loan to act on it, and manage lending rules separately.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowBulkUpload(true)} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300"><UploadCloud className="h-4 w-4" /> Bulk repayments</button>
            <Link href="/admin/loans/policy" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"><FilePenLine className="h-4 w-4" /> Loan policy</Link>
            <Link href="/admin/loans/approval-tiers" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"><SlidersHorizontal className="h-4 w-4" /> Approval tiers</Link>
          </div>
        </div>
      </header>

      <section className="card-admin rounded-3xl p-5 md:p-6" aria-label="Loan queue filters">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-amber-500" /><h2 className="text-xl font-semibold">Loan queue</h2></div>
            <p className="mt-1 text-sm admin-text-muted">Use a quick view or select any status to narrow the queue.</p>
          </div>
          <button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}><RefreshCw className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`} /> Refresh</button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" aria-label="Quick loan views">
          {QUICK_VIEWS.map((view) => <button key={view.label} type="button" onClick={() => changeStatus(view.status)} aria-pressed={status === view.status} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${status === view.status ? "bg-[#171717] text-white" : "border admin-text-muted hover:bg-black/5"}`} style={status === view.status ? undefined : { borderColor: "var(--admin-border)" }}>{view.label}</button>)}
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-end" style={{ borderColor: "var(--admin-border)" }}>
          <label className="grid gap-1.5 text-xs font-semibold admin-text-muted">All statuses
            <select value={status} onChange={(event) => changeStatus(event.target.value as LoanStatus | "")} className="input-admin min-w-56 rounded-xl px-3 py-2.5 text-sm font-medium outline-none"><option value="">All statuses</option>{LOAN_STATUSES.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}</select>
          </label>
          <label className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium" style={{ borderColor: "var(--admin-border)" }}><input type="checkbox" checked={onlyMine} onChange={(event) => { setOnlyMine(event.target.checked); setPage(1); }} className="h-4 w-4 accent-amber-500" /> Only mine</label>
          {hasFilters && <button type="button" onClick={clearFilters} className="self-start pb-2 text-xs font-semibold admin-text-muted hover:underline sm:self-auto">Clear filters</button>}
        </div>
      </section>

      <section aria-label="Loan results" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-lg font-semibold">{status ? statusLabel(status) : "All loans"}</h2><p className="mt-1 text-xs admin-text-muted">{query.data ? `${query.data.totalCount} matching loan${query.data.totalCount === 1 ? "" : "s"}` : "Loans returned by the selected view"}{onlyMine ? " · Only mine" : ""}</p></div>
          {query.data && query.data.totalPages > 1 && <span className="text-xs admin-text-muted">Page {query.data.pageNumber} of {query.data.totalPages}</span>}
        </div>

        {query.isLoading ? <div role="status" className="card-admin flex items-center justify-center gap-3 rounded-3xl py-16 text-sm admin-text-muted"><Loader2 className="h-5 w-5 animate-spin text-amber-500" /> Loading loans…</div> : query.isError ? <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700"><p>{getLoanScreenError(query.error)}</p><button type="button" onClick={() => query.refetch()} className="mt-4 rounded-full bg-red-700 px-5 py-2 font-semibold text-white">Retry</button></div> : !query.data?.items.length ? <div className="card-admin rounded-3xl p-10 text-center"><ClipboardCheck className="mx-auto h-8 w-8 text-amber-500" /><h3 className="mt-3 font-semibold">No loans in this view</h3><p className="mt-2 text-sm admin-text-muted">{hasFilters ? "Try another status or clear the filters." : "Loan applications will appear here when the backend has records for this account."}</p>{hasFilters && <button type="button" onClick={clearFilters} className="mt-4 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white">Show all loans</button>}</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{query.data.items.map((loan, index) => { const id = loanId(loan); return <LoanListCard key={id ?? index} loan={loan} href={id ? `/admin/loans/${encodeURIComponent(id)}` : undefined} variant="admin" />; })}</div>}
      </section>

      {!query.isError && query.data && query.data.totalPages > 1 && <nav aria-label="Loan pages" className="card-admin flex items-center justify-between gap-3 rounded-2xl p-3 text-sm"><button type="button" disabled={page <= 1 || query.isFetching} onClick={() => setPage((value) => value - 1)} className="rounded-full border px-4 py-2 font-semibold disabled:opacity-40" style={{ borderColor: "var(--admin-border)" }}>Previous</button><span className="text-center text-xs admin-text-muted">Page {query.data.pageNumber} of {query.data.totalPages}</span><button type="button" disabled={page >= query.data.totalPages || query.isFetching} onClick={() => setPage((value) => value + 1)} className="rounded-full border px-4 py-2 font-semibold disabled:opacity-40" style={{ borderColor: "var(--admin-border)" }}>Next</button></nav>}
    </div>
  );
}
