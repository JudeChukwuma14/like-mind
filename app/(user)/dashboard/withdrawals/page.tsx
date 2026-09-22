"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, Loader2, RefreshCw, WalletCards } from "lucide-react";
import toast from "react-hot-toast";
import { getMyWithdrawals, requestWithdrawal } from "@/app/lib/withdrawals-api";
import { getMySavings } from "@/app/lib/savings-api";
import { getApiErrorMessage } from "@/app/lib/api-client";
import { formatWithdrawalAmount, formatWithdrawalDate, withdrawalCategory, WithdrawalStatusBadge } from "@/app/components/withdrawals/withdrawal-display";

const PAGE_SIZE = 20;

export default function WithdrawalsPage() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const savings = useQuery({ queryKey: ["my-savings"], queryFn: () => getMySavings() });
  const history = useQuery({ queryKey: ["withdrawals", "member", page, status, category], queryFn: () => getMyWithdrawals({ page, pageSize: PAGE_SIZE, status: status || undefined, category: category || undefined }) });
  const balance = savings.data?.balance?.balance;
  const currency = savings.data?.balance?.currency || undefined;
  const parsedAmount = Number(amount);
  const validAmount = amount.trim() !== "" && Number.isFinite(parsedAmount) && parsedAmount > 0 && balance != null && parsedAmount <= balance;

  const submit = useMutation({
    mutationFn: () => requestWithdrawal({ amount: parsedAmount, reason: reason.trim() }),
    onSuccess: () => {
      toast.success("Withdrawal request submitted for approval.");
      setAmount(""); setReason(""); setAgreed(false);
      setPage(1); setStatus(""); setCategory("");
      queryClient.invalidateQueries({ queryKey: ["withdrawals", "member"] });
      queryClient.invalidateQueries({ queryKey: ["my-savings"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function changeStatus(next: string) { setStatus(next); setPage(1); }
  function changeCategory(next: string) { setCategory(next); setPage(1); }
  const filtered = Boolean(status || category);

  return <div className="mx-auto max-w-6xl space-y-6 pb-12 dash-text">
    <header className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8"><div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Your savings</p><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Withdrawals</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Request money from your savings and track its approval. Submitting a request does not move funds immediately.</p></div></header>

    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,1fr)] lg:items-start">
      <section className="card-dash rounded-3xl p-5 md:p-7" aria-labelledby="withdraw-title"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">New request</p><h2 id="withdraw-title" className="mt-1 text-xl font-bold">Request a withdrawal</h2><p className="mt-1 text-sm dash-text-muted">The cooperative reviews your request before any payout.</p></div><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600"><ArrowUpRight className="h-5 w-5" /></span></div>
        <form onSubmit={(event) => { event.preventDefault(); if (validAmount && reason.trim() && agreed) submit.mutate(); }} className="mt-6 space-y-5"><label className="grid gap-2 text-sm font-semibold">Amount<input type="number" min="0.01" step="0.01" inputMode="decimal" required value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="input-dash rounded-xl px-4 py-3 text-lg font-semibold outline-none" /></label>{amount && !validAmount && <p role="alert" className="text-xs text-red-700">{balance == null ? "Balance is unavailable. Please retry loading it." : parsedAmount > balance ? "Amount cannot exceed your current savings balance." : "Enter an amount greater than zero."}</p>}<label className="grid gap-2 text-sm font-semibold">Reason<input required value={reason} onChange={(event) => setReason(event.target.value)} placeholder="What is this withdrawal for?" className="input-dash rounded-xl px-4 py-3 text-sm outline-none" /></label><label className="flex items-start gap-3 rounded-xl border p-4 text-sm leading-6" style={{ borderColor: "var(--dash-border)" }}><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-amber-500" /><span>I confirm these details are accurate and understand the cooperative’s policy and approval process apply.</span></label><button type="submit" disabled={!validAmount || !reason.trim() || !agreed || submit.isPending} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">{submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Submit request</button></form>
      </section>

      <aside className="card-dash rounded-3xl p-5 md:p-7"><div className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-amber-600" /><h2 className="text-lg font-bold">Savings balance</h2></div>{savings.isLoading ? <p role="status" className="mt-5 flex items-center gap-2 text-sm dash-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading balance…</p> : savings.isError ? <div role="alert" className="mt-5 text-sm text-red-700"><p>{getApiErrorMessage(savings.error)}</p><button type="button" onClick={() => savings.refetch()} className="mt-2 font-semibold underline">Retry</button></div> : balance == null ? <p className="mt-5 text-sm dash-text-muted">Balance is unavailable. Try refreshing before requesting a withdrawal.</p> : <p className="mt-4 text-3xl font-bold tracking-tight">{formatWithdrawalAmount(balance, currency)}</p>}<div className="mt-6 border-t pt-5" style={{ borderColor: "var(--dash-border)" }}><p className="text-xs font-semibold uppercase tracking-wider dash-text-muted">Requested amount</p><p className="mt-2 text-xl font-bold">{formatWithdrawalAmount(Number.isFinite(parsedAmount) && amount ? parsedAmount : 0, currency)}</p><p className="mt-3 text-xs leading-5 dash-text-muted">Your balance is not a guaranteed withdrawal limit. The backend also checks cooperative policy and approval rules.</p></div></aside>
    </div>

    <section className="card-dash rounded-3xl p-5 md:p-7" aria-labelledby="history-title"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Activity</p><h2 id="history-title" className="mt-1 text-xl font-bold">Your requests</h2><p className="mt-1 text-sm dash-text-muted">Withdrawals and cooperative deductions associated with your account.</p></div><button type="button" onClick={() => history.refetch()} disabled={history.isFetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--dash-border)" }}><RefreshCw className={`h-4 w-4 ${history.isFetching ? "animate-spin" : ""}`} /> Refresh</button></div>
      <div className="mt-5 flex flex-wrap gap-2">{[{ label: "All", value: "" }, { label: "Pending", value: "PendingApprovals" }, { label: "Approved", value: "Approved" }, { label: "Rejected", value: "Rejected" }].map((item) => <button key={item.label} type="button" aria-pressed={status === item.value} onClick={() => changeStatus(item.value)} className={`rounded-full px-4 py-2 text-xs font-semibold ${status === item.value ? "bg-[#171717] text-white" : "border dash-text-muted hover:bg-black/5"}`} style={status === item.value ? undefined : { borderColor: "var(--dash-border)" }}>{item.label}</button>)}</div><div className="mt-5 flex flex-wrap items-end gap-4 border-t pt-5" style={{ borderColor: "var(--dash-border)" }}><label className="grid gap-1.5 text-xs font-semibold dash-text-muted">Category<select value={category} onChange={(event) => changeCategory(event.target.value)} className="input-dash min-w-52 rounded-xl px-3 py-2.5 text-sm font-medium outline-none"><option value="">All activity</option><option value="Withdrawal">Withdrawals</option><option value="CooperativeDeduction">Cooperative deductions</option></select></label>{filtered && <button type="button" onClick={() => { changeStatus(""); changeCategory(""); }} className="pb-2 text-xs font-semibold dash-text-muted hover:underline">Clear filters</button>}</div>
      <div className="mt-6">{history.isLoading ? <div role="status" className="flex items-center justify-center gap-2 py-12 text-sm dash-text-muted"><Loader2 className="h-5 w-5 animate-spin" /> Loading requests…</div> : history.isError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p>{getApiErrorMessage(history.error)}</p><button type="button" onClick={() => history.refetch()} className="mt-2 font-semibold underline">Retry</button></div> : !history.data?.items?.length ? <div className="rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: "var(--dash-border)" }}><h3 className="font-semibold">{filtered ? "No matching requests" : "No requests yet"}</h3><p className="mt-2 text-sm dash-text-muted">{filtered ? "Try another filter to see your activity." : "Your withdrawal requests will appear here after submission."}</p></div> : <div className="divide-y" style={{ borderColor: "var(--dash-border)" }}>{history.data.items.map((request) => <div key={request.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-6"><div className="min-w-0"><p className="truncate text-sm font-semibold">{withdrawalCategory(request)}</p><p className="mt-1 truncate text-xs dash-text-muted">{request.reason ?? "No reason provided"} · {formatWithdrawalDate(request.createdAt)}</p></div><p className="text-sm font-bold">{formatWithdrawalAmount(request.amount, currency)}</p><WithdrawalStatusBadge status={request.status} /></div>)}</div>}</div>
      {!history.isError && history.data && history.data.totalPages > 1 && <nav aria-label="Request pages" className="mt-5 flex items-center justify-between gap-3 border-t pt-5 text-sm" style={{ borderColor: "var(--dash-border)" }}><button type="button" disabled={page <= 1 || history.isFetching} onClick={() => setPage((value) => value - 1)} className="rounded-full border px-4 py-2 font-semibold disabled:opacity-40" style={{ borderColor: "var(--dash-border)" }}>Previous</button><span className="text-xs dash-text-muted">Page {history.data.pageNumber} of {history.data.totalPages}</span><button type="button" disabled={page >= history.data.totalPages || history.isFetching} onClick={() => setPage((value) => value + 1)} className="rounded-full border px-4 py-2 font-semibold disabled:opacity-40" style={{ borderColor: "var(--dash-border)" }}>Next</button></nav>}
    </section>
  </div>;
}
