"use client";

import { use, useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Loader2, RefreshCw, ShieldCheck, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  approveDisbursement,
  approveLoan,
  getAdminDisbursementApprovals,
  getAdminInstallments,
  getAdminLoan,
  getAdminLoanApprovals,
  initiateDisbursement,
  initiateLoan,
  rejectAtTriage,
  rejectDisbursement,
  rejectLoan,
  repayInstallment,
  type LoanRecord,
} from "@/app/lib/loan-api";
import { loanKeys } from "@/app/lib/loan-keys";
import { getLoanScreenError } from "@/app/components/loans/loan-errors";
import { LoanOverview } from "@/app/components/loans/LoanOverview";
import { ResponseDetails } from "@/app/components/loans/ResponseDetails";
import { findNamedRecord, findNestedId, formatMoney, formatValue, loanStatus, readNumber, readString } from "@/app/components/loans/loan-data";
import { type LoanAction, useLoanPermissions } from "@/app/components/loans/useLoanPermissions";

type Operation = "initiate" | "rejectTriage" | "approve" | "reject" | "initiateDisbursement" | "approveDisbursement" | "rejectDisbursement";
type Tab = "overview" | "approvals" | "disbursement" | "installments";

const actions: Record<Operation, { title: string; button: string; permission: LoanAction; rejection?: boolean; reference?: boolean; description: string }> = {
  initiate: { title: "Initiate loan", button: "Move to approvals", permission: "initiateLoan", description: "Move this application from triage to the approval ladder." },
  rejectTriage: { title: "Reject at triage", button: "Reject application", permission: "rejectAtTriage", rejection: true, description: "This rejection is final and allows the member to apply again." },
  approve: { title: "Approve loan", button: "Record approval", permission: "approveLoan", description: "Your approval is recorded. The backend decides when the required threshold is reached." },
  reject: { title: "Reject loan", button: "Reject loan", permission: "rejectLoan", rejection: true, description: "A single rejection ends the approval process." },
  initiateDisbursement: { title: "Initiate disbursement", button: "Submit for approval", permission: "initiateDisbursement", reference: true, description: "Submit this approved loan for disbursement review." },
  approveDisbursement: { title: "Approve disbursement", button: "Record approval", permission: "approveDisbursement", description: "Funds are marked disbursed only when the backend threshold is met." },
  rejectDisbursement: { title: "Reject disbursement", button: "Reject disbursement", permission: "rejectDisbursement", rejection: true, description: "This rejects the disbursement only. The loan remains approved." },
};

function HistoryPanel({ loanId, kind }: { loanId: string; kind: "approvals" | "disbursement" }) {
  const query = useQuery({
    queryKey: kind === "approvals" ? loanKeys.adminApprovals(loanId) : loanKeys.adminDisbursementApprovals(loanId),
    queryFn: () => kind === "approvals" ? getAdminLoanApprovals(loanId) : getAdminDisbursementApprovals(loanId),
  });
  return <section className="card-admin rounded-3xl p-5 md:p-7"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-amber-500" /><h2 className="text-xl font-semibold">{kind === "approvals" ? "Loan approval history" : "Disbursement approval history"}</h2></div>{query.isLoading ? <Loader2 className="mt-8 h-6 w-6 animate-spin" /> : query.isError ? <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{getLoanScreenError(query.error)} <button onClick={() => query.refetch()} className="font-bold underline">Retry</button></div> : !query.data?.length ? <p className="mt-5 text-sm admin-text-muted">No approval records returned.</p> : <div className="mt-5 space-y-3">{query.data.map((record, index) => <div key={readString(record, "id") ?? index} className="rounded-2xl border p-4" style={{ borderColor: "var(--admin-border)" }}><ResponseDetails value={record} variant="admin" /></div>)}</div>}</section>;
}

function AdminInstallments({ loanId, canRecord }: { loanId: string; canRecord: boolean }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: loanKeys.adminInstallments(loanId), queryFn: () => getAdminInstallments(loanId) });
  const [selected, setSelected] = useState<LoanRecord | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: async () => {
      const installmentId = selected && (readString(selected, "id") ?? readString(selected, "installmentId"));
      if (!installmentId) throw new Error("No installment ID is available.");
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) throw new Error("Enter an amount greater than zero.");
      return repayInstallment(installmentId, numericAmount);
    },
    onSuccess: async () => {
      toast.success("Repayment recorded.");
      setSelected(null);
      setAmount("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: loanKeys.adminInstallments(loanId) }),
        queryClient.invalidateQueries({ queryKey: loanKeys.adminDetail(loanId) }),
        queryClient.invalidateQueries({ queryKey: loanKeys.adminLists }),
      ]);
    },
    onError: (reason) => setError(getLoanScreenError(reason)),
  });
  return <section className="space-y-3"><h2 className="text-xl font-semibold">Repayment schedule</h2>{query.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : query.isError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{getLoanScreenError(query.error)} <button onClick={() => query.refetch()} className="font-bold underline">Retry</button></div> : !query.data?.length ? <div className="card-admin rounded-3xl p-10 text-center text-sm admin-text-muted">No installments have been returned yet.</div> : query.data.map((installment, index) => { const id = readString(installment, "id") ?? readString(installment, "installmentId"); const status = readString(installment, "status"); const due = readString(installment, "dueDate"); const amountDue = readNumber(installment, "balance") ?? readNumber(installment, "amount") ?? readNumber(installment, "amountDue"); return <article key={id ?? index} className="card-admin rounded-2xl p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Installment {readNumber(installment, "installmentNumber") ?? index + 1}</p><p className="mt-1 text-lg font-bold">{formatMoney(amountDue)}</p><p className="mt-1 text-xs admin-text-muted">{due ? formatValue(due) : "Due date unavailable"} · {status ?? "Status unavailable"}</p></div>{canRecord && id && status?.toLowerCase() !== "paid" && <button onClick={() => { setSelected(installment); setAmount(""); setError(null); }} className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white">Record repayment</button>}</div><details className="mt-4 border-t pt-3" style={{ borderColor: "var(--admin-border)" }}><summary className="cursor-pointer text-xs font-semibold admin-text-muted">View installment details</summary><div className="mt-4"><ResponseDetails value={installment} variant="admin" /></div></details></article>; })}{selected && <div role="dialog" aria-modal="true" aria-labelledby="record-repayment-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4"><form onSubmit={(event) => { event.preventDefault(); if (!mutation.isPending) { setError(null); mutation.mutate(); } }} className="w-full max-w-md rounded-3xl border p-6 shadow-2xl" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}><h3 id="record-repayment-title" className="text-xl font-bold">Record installment repayment</h3><p className="mt-2 text-sm admin-text-muted">Confirm the amount before recording this financial transaction.</p><label className="mt-5 grid gap-2 text-sm font-semibold">Amount paid<input type="number" min="0.01" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} required className="input-admin rounded-xl px-4 py-3 outline-none" /></label>{error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-6 flex gap-3"><button type="button" disabled={mutation.isPending} onClick={() => setSelected(null)} className="flex-1 rounded-full border px-4 py-3 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}>Cancel</button><button disabled={mutation.isPending} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171717] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Record payment</button></div></form></div>}</section>;
}

export default function AdminLoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const permissions = useLoanPermissions();
  const [tab, setTab] = useState<Tab>("overview");
  const [operation, setOperation] = useState<Operation | null>(null);
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const query = useQuery({ queryKey: loanKeys.adminDetail(id), queryFn: () => getAdminLoan(id), enabled: Boolean(id) });
  const status = loanStatus(query.data);
  const disbursementStatus = query.data ? readString(findNamedRecord(query.data, "disbursement"), "status") : undefined;
  const disbursementId = query.data ? findNestedId(query.data, "disbursement") : undefined;
  const available: Operation[] = status === "PendingReview" ? ["initiate", "rejectTriage"] : status === "PendingApprovals" ? ["approve", "reject"] : status === "Approved" ? ["initiateDisbursement"] : status === "PendingDisbursementApprovals" && disbursementId ? ["approveDisbursement", "rejectDisbursement"] : [];
  const permitted = available.filter((item) => permissions.can(actions[item].permission));

  const mutation = useMutation({
    mutationFn: async () => {
      if (!operation || !query.data) throw new Error("The loan is not available.");
      const config = actions[operation];
      if (!permissions.can(config.permission)) throw new Error("You do not have permission for this action.");
      if (!available.includes(operation)) throw new Error("This action is no longer available for the loan's current state.");
      if (config.rejection && !note.trim()) throw new Error("A rejection note is required.");
      if (config.reference && !reference.trim()) throw new Error("A disbursement reference is required.");
      switch (operation) {
        case "initiate": return initiateLoan(id, note.trim());
        case "rejectTriage": return rejectAtTriage(id, note.trim());
        case "approve": return approveLoan(id, note.trim());
        case "reject": return rejectLoan(id, note.trim());
        case "initiateDisbursement": return initiateDisbursement(id, reference.trim());
        case "approveDisbursement": if (!disbursementId) throw new Error("The disbursement ID was not returned by the service."); return approveDisbursement(disbursementId, note.trim());
        case "rejectDisbursement": if (!disbursementId) throw new Error("The disbursement ID was not returned by the service."); return rejectDisbursement(disbursementId, note.trim());
      }
    },
    onSuccess: async () => {
      toast.success(operation === "rejectDisbursement" ? "Disbursement rejected. The loan remains approved." : "Loan updated successfully.");
      setOperation(null); setNote(""); setReference("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: loanKeys.adminDetail(id) }),
        queryClient.invalidateQueries({ queryKey: loanKeys.adminLists }),
        queryClient.invalidateQueries({ queryKey: loanKeys.adminApprovals(id) }),
        queryClient.invalidateQueries({ queryKey: loanKeys.adminDisbursementApprovals(id) }),
        queryClient.invalidateQueries({ queryKey: loanKeys.adminInstallments(id) }),
      ]);
    },
    onError: (reason) => setFormError(getLoanScreenError(reason)),
  });

  function confirm(event: FormEvent) { event.preventDefault(); if (!mutation.isPending) { setFormError(null); mutation.mutate(); } }

  return <div className="space-y-6 pb-16 admin-text"><div className="flex items-center justify-between gap-3"><Link href="/admin/loans" className="inline-flex items-center gap-2 text-sm font-semibold admin-text-muted"><ArrowLeft className="h-4 w-4" /> Back to loans</Link><button onClick={() => query.refetch()} disabled={query.isFetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}><RefreshCw className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`} /> Refresh</button></div>
    {query.isLoading ? <div className="flex justify-center py-24"><Loader2 className="h-7 w-7 animate-spin" /></div> : query.isError ? <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{getLoanScreenError(query.error)} <button onClick={() => query.refetch()} className="font-bold underline">Retry</button></div> : query.data ? <>
      <LoanOverview loan={query.data} variant="admin" />
      {status !== "Rejected" && disbursementStatus?.toLowerCase() === "rejected" && <p className="rounded-2xl border border-amber-300 bg-amber-100 p-4 text-sm text-amber-900">Disbursement rejected. The loan itself remains approved and undisbursed.</p>}
      {permissions.error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Actions are hidden because your permissions could not be loaded. {getLoanScreenError(permissions.error)}</p>}
      {!permissions.isLoading && permitted.length > 0 && <section className="card-admin rounded-3xl p-5 md:p-6"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-amber-500" /><h2 className="text-lg font-semibold">Available actions</h2></div><p className="mt-1 text-sm admin-text-muted">Only actions allowed by your permissions and the current loan status appear here.</p><div className="mt-5 flex flex-wrap gap-2">{permitted.map((item) => <button key={item} onClick={() => { setOperation(item); setNote(""); setReference(""); setFormError(null); }} className={`rounded-full px-5 py-2.5 text-sm font-semibold ${actions[item].rejection ? "bg-red-100 text-red-700" : "bg-[#171717] text-white"}`}>{actions[item].title}</button>)}</div></section>}
      <nav aria-label="Loan details" className="flex gap-2 overflow-x-auto border-b pb-3" style={{ borderColor: "var(--admin-border)" }}>{(["overview", "approvals", "disbursement", "installments"] as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold capitalize ${tab === item ? "bg-amber-300 text-black" : "admin-text-muted"}`}>{item}</button>)}</nav>
      {tab === "overview" && <section className="card-admin rounded-3xl p-6"><h2 className="text-xl font-semibold">Application details</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div><p className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">Member</p><p className="mt-1 text-sm font-semibold">{readString(query.data, "memberName") ?? "—"}</p></div><div><p className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">Principal</p><p className="mt-1 text-sm font-semibold">{formatMoney(readNumber(query.data, "principalAmount"))}</p></div><div><p className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">Tenure</p><p className="mt-1 text-sm font-semibold">{readNumber(query.data, "tenureMonths") ?? "—"} months</p></div><div><p className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">Created</p><p className="mt-1 text-sm font-semibold">{formatValue(readString(query.data, "createdAt"))}</p></div></div><details className="mt-6 border-t pt-4" style={{ borderColor: "var(--admin-border)" }}><summary className="cursor-pointer text-sm font-semibold admin-text-muted">View all information supplied by the service</summary><div className="mt-5"><ResponseDetails value={query.data} variant="admin" /></div></details></section>}
      {tab === "approvals" && <HistoryPanel loanId={id} kind="approvals" />}
      {tab === "disbursement" && <HistoryPanel loanId={id} kind="disbursement" />}
      {tab === "installments" && <AdminInstallments loanId={id} canRecord={status === "Disbursed" && permissions.can("recordRepayment")} />}
    </> : <div className="card-admin rounded-3xl p-10 text-center text-sm admin-text-muted">No loan information was returned.</div>}
    {operation && <div role="dialog" aria-modal="true" aria-labelledby="loan-action-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"><form onSubmit={confirm} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border p-6 shadow-2xl md:p-8" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)", color: "var(--admin-text)" }}><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Confirm action</p><h2 id="loan-action-title" className="mt-1 text-2xl font-bold">{actions[operation].title}</h2></div><button type="button" disabled={mutation.isPending} onClick={() => setOperation(null)} aria-label="Close" className="rounded-full border p-2 disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}><X className="h-4 w-4" /></button></div><p className="mt-3 text-sm admin-text-muted">{actions[operation].description}</p>{actions[operation].reference && <label className="mt-6 grid gap-2 text-sm font-semibold">Disbursement reference<input required value={reference} onChange={(event) => setReference(event.target.value)} className="input-admin rounded-xl px-4 py-3 outline-none" /></label>}<label className="mt-5 grid gap-2 text-sm font-semibold">Note <span className="font-normal admin-text-muted">{actions[operation].rejection ? "Required for rejection" : "Optional"}</span><textarea required={actions[operation].rejection} value={note} onChange={(event) => setNote(event.target.value)} rows={4} className="input-admin resize-y rounded-xl px-4 py-3 outline-none" /></label>{formError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}<div className="mt-6 flex gap-3"><button type="button" disabled={mutation.isPending} onClick={() => setOperation(null)} className="flex-1 rounded-full border px-4 py-3 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}>Cancel</button><button disabled={mutation.isPending} className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 ${actions[operation].rejection ? "bg-red-700" : "bg-[#171717]"}`}>{mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{actions[operation].button}</button></div></form></div>}
  </div>;
}
