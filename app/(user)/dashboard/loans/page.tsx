"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calculator, ClipboardList, FilePlus2, Loader2, RefreshCw } from "lucide-react";
import { getMemberLoans, LOAN_STATUSES, type LoanStatus } from "@/app/lib/loan-api";
import { loanKeys } from "@/app/lib/loan-keys";
import { getLoanScreenError } from "@/app/components/loans/loan-errors";
import { LoanListCard } from "@/app/components/loans/LoanListCard";
import { loanId } from "@/app/components/loans/loan-data";

const PAGE_SIZE = 20;
const QUICK_VIEWS: { label: string; status: LoanStatus | "" }[] = [
  { label: "All", status: "" },
  { label: "Pending review", status: "PendingReview" },
  { label: "Approved", status: "Approved" },
  { label: "Disbursed", status: "Disbursed" },
  { label: "Closed", status: "Closed" },
];

function statusLabel(value: LoanStatus): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export default function MemberLoansPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<LoanStatus | "">("");
  // Member history must never offer a switch to request other members' loans.
  const filters = { page, pageSize: PAGE_SIZE, status, onlyMine: true };
  const query = useQuery({ queryKey: loanKeys.memberList(filters), queryFn: () => getMemberLoans(filters) });

  function changeStatus(next: LoanStatus | "") {
    setStatus(next);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12 dash-text">
      <header className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Your borrowing</p><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Your loans</h1><p className="mt-3 max-w-lg text-sm leading-6 text-white/70">Estimate a repayment plan, apply when you are ready, and follow your applications here.</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/dashboard/loans/calculate" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"><Calculator className="h-4 w-4" /> Calculate</Link><Link href="/dashboard/loans/apply" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-amber-300"><FilePlus2 className="h-4 w-4" /> Apply for a loan <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </header>

      <section aria-label="Borrowing steps" className="grid gap-3 sm:grid-cols-3">
        <Link href="/dashboard/loans/calculate" className="card-dash group rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600"><Calculator className="h-4 w-4" /></span><span className="text-xs font-bold dash-text-muted">01</span></div><h2 className="mt-3 text-sm font-bold">Estimate</h2><p className="mt-1 text-xs leading-5 dash-text-muted">Check the amount and repayment schedule.</p></Link>
        <Link href="/dashboard/loans/apply" className="card-dash group rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600"><FilePlus2 className="h-4 w-4" /></span><span className="text-xs font-bold dash-text-muted">02</span></div><h2 className="mt-3 text-sm font-bold">Apply</h2><p className="mt-1 text-xs leading-5 dash-text-muted">Submit your details and required documents.</p></Link>
        <div className="card-dash rounded-2xl p-4"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600"><ClipboardList className="h-4 w-4" /></span><span className="text-xs font-bold dash-text-muted">03</span></div><h2 className="mt-3 text-sm font-bold">Track</h2><p className="mt-1 text-xs leading-5 dash-text-muted">Open any loan below for its latest status.</p></div>
      </section>

      <section className="card-dash rounded-3xl p-5 md:p-6" aria-label="Loan history filters">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Applications</p><h2 className="mt-1 text-xl font-bold">Loan history</h2><p className="mt-1 text-sm dash-text-muted">Only loans associated with your account are shown.</p></div><button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--dash-border)" }}><RefreshCw className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`} /> Refresh</button></div>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Quick loan filters">{QUICK_VIEWS.map((view) => <button key={view.label} type="button" onClick={() => changeStatus(view.status)} aria-pressed={status === view.status} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${status === view.status ? "bg-[#171717] text-white" : "border dash-text-muted hover:bg-black/5"}`} style={status === view.status ? undefined : { borderColor: "var(--dash-border)" }}>{view.label}</button>)}</div>
        <div className="mt-5 flex flex-wrap items-end gap-4 border-t pt-5" style={{ borderColor: "var(--dash-border)" }}><label className="grid gap-1.5 text-xs font-semibold dash-text-muted">All statuses<select value={status} onChange={(event) => changeStatus(event.target.value as LoanStatus | "")} className="input-dash min-w-56 rounded-xl px-3 py-2.5 text-sm font-medium outline-none"><option value="">All statuses</option>{LOAN_STATUSES.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}</select></label>{status && <button type="button" onClick={() => changeStatus("")} className="pb-2 text-xs font-semibold dash-text-muted hover:underline">Clear filter</button>}</div>
      </section>

      <section aria-label="Your loan applications" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-bold">{status ? statusLabel(status) : "All applications"}</h2><p className="mt-1 text-xs dash-text-muted">{query.data ? `${query.data.totalCount} matching loan${query.data.totalCount === 1 ? "" : "s"}` : "Your loan applications"}</p></div>{query.data && query.data.totalPages > 1 && <span className="text-xs dash-text-muted">Page {query.data.pageNumber} of {query.data.totalPages}</span>}</div>
        {query.isLoading ? <div role="status" className="card-dash flex items-center justify-center gap-3 rounded-3xl py-16 text-sm dash-text-muted"><Loader2 className="h-5 w-5 animate-spin text-amber-500" /> Loading your loans…</div> : query.isError ? <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700"><p>{getLoanScreenError(query.error)}</p><button type="button" onClick={() => query.refetch()} className="mt-4 rounded-full bg-red-700 px-5 py-2 font-semibold text-white">Retry</button></div> : !query.data?.items.length ? <div className="card-dash rounded-3xl p-10 text-center"><ClipboardList className="mx-auto h-8 w-8 text-amber-500" /><h3 className="mt-3 font-bold">{status ? "No loans with this status" : "No loan applications yet"}</h3><p className="mt-2 text-sm dash-text-muted">{status ? "Choose another status or see all your applications." : "Start with an estimate, then apply when you are ready."}</p>{status ? <button type="button" onClick={() => changeStatus("")} className="mt-5 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white">See all applications</button> : <Link href="/dashboard/loans/calculate" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white">Calculate a loan <ArrowRight className="h-4 w-4" /></Link>}</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{query.data.items.map((loan, index) => { const id = loanId(loan); return <LoanListCard key={id ?? index} loan={loan} href={id ? `/dashboard/loans/${encodeURIComponent(id)}` : undefined} />; })}</div>}
      </section>

      {!query.isError && query.data && query.data.totalPages > 1 && <nav aria-label="Loan pages" className="card-dash flex items-center justify-between gap-3 rounded-2xl p-3 text-sm"><button type="button" disabled={page <= 1 || query.isFetching} onClick={() => setPage((value) => value - 1)} className="rounded-full border px-4 py-2 font-semibold disabled:opacity-40" style={{ borderColor: "var(--dash-border)" }}>Previous</button><span className="text-center text-xs dash-text-muted">Page {query.data.pageNumber} of {query.data.totalPages}</span><button type="button" disabled={page >= query.data.totalPages || query.isFetching} onClick={() => setPage((value) => value + 1)} className="rounded-full border px-4 py-2 font-semibold disabled:opacity-40" style={{ borderColor: "var(--dash-border)" }}>Next</button></nav>}
    </div>
  );
}
