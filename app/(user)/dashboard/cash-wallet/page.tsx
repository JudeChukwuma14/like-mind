"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, FileText, Loader2, Plus, RefreshCw, X } from "lucide-react";
import { useUserAuth } from "@/app/providers/UserAuthProvider";
import { getMySavings } from "@/app/lib/savings-api";
import { getMemberAllPaymentStatus, getPaymentProofBlobUrl, type PendingPayment } from "@/app/lib/payments-api";
import { getApiErrorMessage } from "@/app/lib/api-client";
import { paymentAmount, paymentDate, paymentTypeLabel, PaymentStatusBadge } from "@/app/components/payments/payment-display";

const PAGE_SIZE = 20;
const statuses = [
  { label: "All", value: "" },
  { label: "Drafts", value: "Draft" },
  { label: "Pending", value: "PendingConfirmation" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Rejected", value: "Rejected" },
] as const;

export default function CashWalletPage() {
  const { user } = useUserAuth();
  const [savingsPage, setSavingsPage] = useState(1);
  const [savingsDates, setSavingsDates] = useState({ fromDate: "", toDate: "", reference: "" });
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState<(typeof statuses)[number]["value"]>("");
  const [paymentType, setPaymentType] = useState("");
  const [paymentDates, setPaymentDates] = useState({ fromDate: "", toDate: "", reference: "" });
  const [selected, setSelected] = useState<PendingPayment | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [proofLoading, setProofLoading] = useState(false);

  useEffect(() => () => { if (proofUrl) URL.revokeObjectURL(proofUrl); }, [proofUrl]);

  const savings = useQuery({
    queryKey: ["my-savings", savingsPage, savingsDates],
    queryFn: () => getMySavings({ page: savingsPage, pageSize: PAGE_SIZE, ...savingsDates }),
  });
  const history = useQuery({
    queryKey: ["my-payments", user?.id, paymentPage, paymentStatus, paymentType, paymentDates],
    queryFn: () => getMemberAllPaymentStatus({ page: paymentPage, pageSize: PAGE_SIZE, status: paymentStatus || undefined, type: paymentType || undefined, ...paymentDates, submittedByUserId: user!.id }),
    enabled: Boolean(user?.id),
  });
  const balance = savings.data?.balance;
  const transactions = savings.data?.transactions;

  async function openProof(fileName: string) {
    setProofLoading(true);
    setProofError(null);
    try { setProofUrl(await getPaymentProofBlobUrl(fileName, "member")); }
    catch (error) { setProofError(getApiErrorMessage(error)); }
    finally { setProofLoading(false); }
  }

  return <div className="mx-auto max-w-6xl space-y-6 pb-14 dash-text">
    <header className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Savings & payments</p><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Cash wallet</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Track confirmed savings separately from payments still waiting for review.</p></div><Link href="/dashboard/cash-wallet/confirm-payment" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black hover:bg-amber-300"><Plus className="h-4 w-4" /> Record a payment</Link></div>
    </header>

    <div className="grid gap-4 md:grid-cols-2">
      <section className="card-dash rounded-3xl p-6"><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Confirmed savings balance</p>{savings.isLoading ? <p role="status" className="mt-5 flex items-center gap-2 text-sm dash-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading balance...</p> : savings.isError ? <div role="alert" className="mt-4 text-sm text-red-700"><p>{getApiErrorMessage(savings.error)}</p><button onClick={() => savings.refetch()} className="mt-2 font-semibold underline">Retry</button></div> : balance?.balance == null ? <p className="mt-4 text-sm dash-text-muted">Balance unavailable. Please refresh before relying on this figure.</p> : <p className="mt-3 text-4xl font-bold tracking-tight">{paymentAmount(balance.balance, balance.currency)}</p>}<p className="mt-4 text-xs leading-5 dash-text-muted">Pending and draft payments are not included in this balance.</p></section>
      <section className="card-dash rounded-3xl p-6"><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Payment records</p>{history.isLoading ? <p role="status" className="mt-5 flex items-center gap-2 text-sm dash-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading payments...</p> : history.isError ? <p role="alert" className="mt-5 text-sm text-red-700">{getApiErrorMessage(history.error)}</p> : <p className="mt-3 text-4xl font-bold tracking-tight">{history.data?.totalCount ?? "—"}</p>}<p className="mt-4 text-xs leading-5 dash-text-muted">Total matches for the payment filters below.</p></section>
    </div>

    <section className="card-dash rounded-3xl p-5 md:p-7" aria-labelledby="transactions-title">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Ledger</p><h2 id="transactions-title" className="mt-1 text-xl font-bold">Savings transactions</h2><p className="mt-1 text-sm dash-text-muted">Only posted credits and debits affect your balance.</p></div><button type="button" onClick={() => savings.refetch()} disabled={savings.isFetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--dash-border)" }}><RefreshCw className={`h-4 w-4 ${savings.isFetching ? "animate-spin" : ""}`} /> Refresh</button></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><label className="grid gap-1.5 text-xs font-semibold dash-text-muted">From date<input type="date" value={savingsDates.fromDate} onChange={(event) => { setSavingsDates((value) => ({ ...value, fromDate: event.target.value })); setSavingsPage(1); }} className="input-dash rounded-xl px-3 py-2.5 text-sm outline-none" /></label><label className="grid gap-1.5 text-xs font-semibold dash-text-muted">To date<input type="date" value={savingsDates.toDate} onChange={(event) => { setSavingsDates((value) => ({ ...value, toDate: event.target.value })); setSavingsPage(1); }} className="input-dash rounded-xl px-3 py-2.5 text-sm outline-none" /></label><label className="grid gap-1.5 text-xs font-semibold dash-text-muted">Reference<input value={savingsDates.reference} onChange={(event) => { setSavingsDates((value) => ({ ...value, reference: event.target.value })); setSavingsPage(1); }} placeholder="Search reference" className="input-dash rounded-xl px-3 py-2.5 text-sm outline-none" /></label></div>
      <div className="mt-5 divide-y" style={{ borderColor: "var(--dash-border)" }}>{savings.isLoading ? <p role="status" className="py-10 text-center text-sm dash-text-muted">Loading transactions...</p> : savings.isError ? <p role="alert" className="py-8 text-center text-sm text-red-700">{getApiErrorMessage(savings.error)}</p> : !transactions?.items?.length ? <p className="py-10 text-center text-sm dash-text-muted">No savings transactions match these filters.</p> : transactions.items.map((item) => { const credit = item.transactionType === "Credit" || item.transactionType === "ContributionConfirmed"; return <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${credit ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{credit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}</span><div><p className="text-sm font-semibold">{paymentTypeLabel(item.contributionType || item.category || item.transactionType)}</p><p className="mt-1 text-xs dash-text-muted">{paymentDate(item.transactionDate ?? item.createdAt)}{item.reference ? ` · ${item.reference}` : ""}</p></div></div><div className="text-right"><p className="text-sm font-bold">{credit ? "+" : "-"}{paymentAmount(item.amount, balance?.currency)}</p><p className="mt-1 text-xs dash-text-muted">Balance {paymentAmount(item.balanceAfter, balance?.currency)}</p></div></div>; })}</div>
      {transactions && transactions.totalPages > 1 && <nav aria-label="Savings transaction pages" className="mt-5 flex items-center justify-between border-t pt-5 text-sm" style={{ borderColor: "var(--dash-border)" }}><button type="button" disabled={savingsPage <= 1 || savings.isFetching} onClick={() => setSavingsPage((page) => page - 1)} className="rounded-full border px-4 py-2 disabled:opacity-40" style={{ borderColor: "var(--dash-border)" }}>Previous</button><span className="text-xs dash-text-muted">Page {transactions.pageNumber} of {transactions.totalPages}</span><button type="button" disabled={savingsPage >= transactions.totalPages || savings.isFetching} onClick={() => setSavingsPage((page) => page + 1)} className="rounded-full border px-4 py-2 disabled:opacity-40" style={{ borderColor: "var(--dash-border)" }}>Next</button></nav>}
    </section>

    <section className="card-dash rounded-3xl p-5 md:p-7" aria-labelledby="payments-title">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Submissions</p><h2 id="payments-title" className="mt-1 text-xl font-bold">Payment history</h2><p className="mt-1 text-sm dash-text-muted">Drafts, pending submissions, confirmed payments and rejections.</p></div><button type="button" onClick={() => history.refetch()} disabled={history.isFetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--dash-border)" }}><RefreshCw className={`h-4 w-4 ${history.isFetching ? "animate-spin" : ""}`} /> Refresh</button></div>
      <div className="mt-5 flex flex-wrap gap-2">{statuses.map((item) => <button key={item.label} type="button" aria-pressed={paymentStatus === item.value} onClick={() => { setPaymentStatus(item.value); setPaymentPage(1); }} className={`rounded-full px-4 py-2 text-xs font-semibold ${paymentStatus === item.value ? "bg-[#171717] text-white" : "border dash-text-muted"}`} style={paymentStatus ? undefined : { borderColor: "var(--dash-border)" }}>{item.label}</button>)}</div>
      <div className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "var(--dash-border)" }}><label className="grid gap-1.5 text-xs font-semibold dash-text-muted">Payment type<select value={paymentType} onChange={(event) => { setPaymentType(event.target.value); setPaymentPage(1); }} className="input-dash rounded-xl px-3 py-2.5 text-sm outline-none"><option value="">All types</option><option value="ShareCapital">Share capital</option><option value="SavingsContribution">Savings contribution</option><option value="CommitmentFee">Commitment fee</option></select></label><label className="grid gap-1.5 text-xs font-semibold dash-text-muted">From date<input type="date" value={paymentDates.fromDate} onChange={(event) => { setPaymentDates((value) => ({ ...value, fromDate: event.target.value })); setPaymentPage(1); }} className="input-dash rounded-xl px-3 py-2.5 text-sm outline-none" /></label><label className="grid gap-1.5 text-xs font-semibold dash-text-muted">To date<input type="date" value={paymentDates.toDate} onChange={(event) => { setPaymentDates((value) => ({ ...value, toDate: event.target.value })); setPaymentPage(1); }} className="input-dash rounded-xl px-3 py-2.5 text-sm outline-none" /></label><label className="grid gap-1.5 text-xs font-semibold dash-text-muted">Reference<input value={paymentDates.reference} onChange={(event) => { setPaymentDates((value) => ({ ...value, reference: event.target.value })); setPaymentPage(1); }} placeholder="Search reference" className="input-dash rounded-xl px-3 py-2.5 text-sm outline-none" /></label></div>
      <div className="mt-6 divide-y" style={{ borderColor: "var(--dash-border)" }}>{history.isLoading ? <p role="status" className="py-10 text-center text-sm dash-text-muted">Loading payment history...</p> : history.isError ? <div role="alert" className="py-8 text-center text-sm text-red-700"><p>{getApiErrorMessage(history.error)}</p><button type="button" onClick={() => history.refetch()} className="mt-2 font-semibold underline">Retry</button></div> : !history.data?.items?.length ? <p className="py-10 text-center text-sm dash-text-muted">No payments match this view.</p> : history.data.items.map((item) => <button key={item.id} type="button" onClick={() => setSelected(item)} className="flex w-full flex-wrap items-center justify-between gap-3 py-4 text-left"><div><p className="text-sm font-semibold">{paymentTypeLabel(item.type)}</p><p className="mt-1 text-xs dash-text-muted">{paymentDate(item.submittedAt ?? item.paymentDate)}{item.interacReferenceNumber ? ` · ${item.interacReferenceNumber}` : ""}</p></div><div className="flex items-center gap-4"><strong className="text-sm">{paymentAmount(item.amountPaid, item.currency)}</strong><PaymentStatusBadge status={item.status} /></div></button>)}</div>
      {history.data && history.data.totalPages > 1 && <nav aria-label="Payment history pages" className="mt-5 flex items-center justify-between border-t pt-5 text-sm" style={{ borderColor: "var(--dash-border)" }}><button type="button" disabled={paymentPage <= 1 || history.isFetching} onClick={() => setPaymentPage((page) => page - 1)} className="rounded-full border px-4 py-2 disabled:opacity-40" style={{ borderColor: "var(--dash-border)" }}>Previous</button><span className="text-xs dash-text-muted">Page {history.data.pageNumber} of {history.data.totalPages}</span><button type="button" disabled={paymentPage >= history.data.totalPages || history.isFetching} onClick={() => setPaymentPage((page) => page + 1)} className="rounded-full border px-4 py-2 disabled:opacity-40" style={{ borderColor: "var(--dash-border)" }}>Next</button></nav>}
    </section>

    {selected && <div role="dialog" aria-modal="true" aria-labelledby="payment-detail-title" className="fixed inset-0 z-[60] flex justify-end bg-black/50"><div className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Payment record</p><h2 id="payment-detail-title" className="mt-2 text-2xl font-bold">{paymentAmount(selected.amountPaid, selected.currency)}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Close details" className="rounded-full border p-2"><X className="h-4 w-4" /></button></div><div className="mt-5"><PaymentStatusBadge status={selected.status} /></div><dl className="mt-6 space-y-4 text-sm">{[["Type", paymentTypeLabel(selected.type)], ["Payment date", paymentDate(selected.paymentDate)], ["Submitted", paymentDate(selected.submittedAt)], ["Reference", selected.interacReferenceNumber || "—"], ["Method", selected.method || "—"], ["Note", selected.note || "—"]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b pb-3"><dt className="dash-text-muted">{label}</dt><dd className="max-w-[65%] text-right font-medium break-words">{value}</dd></div>)}</dl><div className="mt-7 flex flex-wrap gap-3">{selected.status?.toLowerCase() === "draft" && <Link href={`/dashboard/cash-wallet/confirm-payment?draftId=${selected.id}`} className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white">Edit draft</Link>}{selected.proofFileName && <button type="button" onClick={() => openProof(selected.proofFileName!)} disabled={proofLoading} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold disabled:opacity-50"><FileText className="h-4 w-4" /> {proofLoading ? "Opening..." : "View proof"}</button>}</div>{proofError && <p role="alert" className="mt-4 text-sm text-red-700">{proofError}</p>}</div></div>}
    {proofUrl && <div role="dialog" aria-modal="true" aria-label="Payment proof" className="fixed inset-0 z-[70] grid place-items-center bg-black/75 p-4"><div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white"><div className="flex items-center justify-between border-b p-4"><p className="font-semibold">Payment proof</p><button type="button" onClick={() => setProofUrl(null)} aria-label="Close proof"><X className="h-5 w-5" /></button></div><iframe src={proofUrl} title="Payment proof" className="h-[70vh] w-full" /></div></div>}
  </div>;
}
