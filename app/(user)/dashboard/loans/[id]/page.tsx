"use client";

import { use, useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, CheckCircle2, FileUp, Loader2, RefreshCw, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import {
  getMemberDisbursementApprovals,
  getMemberInstallments,
  getMemberLoan,
  getMemberLoanApprovals,
  repayFromSavings,
  submitRepaymentProof,
  type LoanRecord,
} from "@/app/lib/loan-api";
import { loanKeys } from "@/app/lib/loan-keys";
import { getLoanScreenError } from "@/app/components/loans/loan-errors";
import { LoanOverview } from "@/app/components/loans/LoanOverview";
import { ResponseDetails } from "@/app/components/loans/ResponseDetails";
import { formatMoney, formatValue, loanStatus, readNumber, readString } from "@/app/components/loans/loan-data";

type Tab = "overview" | "installments" | "activity";
type RepaymentMethod = "savings" | "proof";

function QueryError({ error, retry }: { error: unknown; retry: () => void }) {
  return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p>{getLoanScreenError(error)}</p><button onClick={retry} className="mt-3 font-bold underline underline-offset-2">Try again</button></div>;
}

function RepaymentDialog({ installment, loanId, onClose }: { installment: LoanRecord; loanId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const installmentId = readString(installment, "id") ?? readString(installment, "installmentId");
  const [method, setMethod] = useState<RepaymentMethod>("savings");
  const [amount, setAmount] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!installmentId) throw new Error("The installment ID was not returned by the service.");
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) throw new Error("Enter an amount greater than zero.");
      if (method === "proof") {
        if (!proof) throw new Error("Choose a repayment proof file.");
        return submitRepaymentProof(installmentId, { AmountPaid: numericAmount, ProofFile: proof, Note: note });
      }
      return repayFromSavings(installmentId, numericAmount);
    },
    onSuccess: async () => {
      toast.success(method === "proof" ? "Proof submitted for review. Your balance has not changed yet." : "Repayment from savings recorded.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: loanKeys.memberDetail(loanId) }),
        queryClient.invalidateQueries({ queryKey: loanKeys.memberInstallments(loanId) }),
        queryClient.invalidateQueries({ queryKey: loanKeys.memberLists }),
        queryClient.invalidateQueries({ queryKey: ["my-savings"] }),
      ]);
      onClose();
    },
    onError: (reason) => setError(getLoanScreenError(reason)),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (mutation.isPending) return;
    setError(null);
    mutation.mutate();
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="repayment-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border p-6 shadow-2xl md:p-8" style={{ background: "var(--dash-surface)", color: "var(--dash-text)", borderColor: "var(--dash-border)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Installment repayment</p>
        <h2 id="repayment-title" className="mt-1 text-2xl font-bold">Choose how to pay</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--dash-muted)" }}>Savings payments are recorded by the service. Uploaded proof is reviewed before it changes your balance.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => { setMethod("savings"); setError(null); }} className={`flex items-center gap-2 rounded-2xl border p-4 text-left text-sm font-semibold ${method === "savings" ? "border-amber-400 ring-2 ring-amber-400/20" : ""}`} style={{ borderColor: method === "savings" ? undefined : "var(--dash-border)" }}><Wallet className="h-5 w-5 text-amber-600" /> Pay from savings</button>
          <button type="button" onClick={() => { setMethod("proof"); setError(null); }} className={`flex items-center gap-2 rounded-2xl border p-4 text-left text-sm font-semibold ${method === "proof" ? "border-amber-400 ring-2 ring-amber-400/20" : ""}`} style={{ borderColor: method === "proof" ? undefined : "var(--dash-border)" }}><FileUp className="h-5 w-5 text-amber-600" /> Submit proof</button>
        </div>

        <label className="mt-5 grid gap-2 text-sm font-semibold">Amount paid
          <input type="number" min="0.01" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} required className="input-dash rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400/30" />
        </label>
        {method === "proof" && <div className="mt-5 space-y-4"><label className="grid gap-2 text-sm font-semibold">Proof file<input type="file" required onChange={(event) => setProof(event.target.files?.[0] ?? null)} className="input-dash min-w-0 rounded-xl px-4 py-3 text-sm" /></label><label className="grid gap-2 text-sm font-semibold">Note <span className="font-normal" style={{ color: "var(--dash-muted)" }}>(optional)</span><textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} className="input-dash rounded-xl px-4 py-3 outline-none" /></label></div>}
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex gap-3"><button type="button" disabled={mutation.isPending} onClick={onClose} className="flex-1 rounded-full border px-4 py-3 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--dash-border)" }}>Cancel</button><button disabled={mutation.isPending} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171717] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}{method === "proof" ? "Submit for review" : "Confirm payment"}</button></div>
      </form>
    </div>
  );
}

function Schedule({ loanId, canPay }: { loanId: string; canPay: boolean }) {
  const [selected, setSelected] = useState<LoanRecord | null>(null);
  const query = useQuery({ queryKey: loanKeys.memberInstallments(loanId), queryFn: () => getMemberInstallments(loanId) });
  if (query.isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (query.isError) return <QueryError error={query.error} retry={() => { void query.refetch(); }} />;
  if (!query.data?.length) return <div className="card-dash rounded-3xl p-10 text-center text-sm dash-text-muted">No installments are available yet. The service generates the schedule after disbursement.</div>;
  return <div className="space-y-3">{query.data.map((installment, index) => {
    const id = readString(installment, "id") ?? readString(installment, "installmentId");
    const status = readString(installment, "status");
    const due = readString(installment, "dueDate");
    const amount = readNumber(installment, "amount") ?? readNumber(installment, "amountDue");
    const balance = readNumber(installment, "balance");
    const payable = canPay && Boolean(id) && status?.toLowerCase() !== "paid";
    return <article key={id ?? index} className="card-dash rounded-2xl p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Installment {readNumber(installment, "installmentNumber") ?? index + 1}</p><p className="mt-1 text-lg font-bold">{formatMoney(balance ?? amount)}</p><p className="mt-1 text-xs dash-text-muted">{due ? `Due ${formatValue(due)}` : "Due date unavailable"} · {status ?? "Status unavailable"}</p></div>{payable && <button onClick={() => setSelected(installment)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white"><ArrowUpRight className="h-4 w-4" /> Repay</button>}</div><details className="mt-4 border-t pt-3 text-sm" style={{ borderColor: "var(--dash-border)" }}><summary className="cursor-pointer text-xs font-semibold dash-text-muted">View installment details</summary><div className="mt-4"><ResponseDetails value={installment} /></div></details></article>;
  })}{selected && <RepaymentDialog installment={selected} loanId={loanId} onClose={() => setSelected(null)} />}</div>;
}

function Activity({ loanId }: { loanId: string }) {
  const approvals = useQuery({ queryKey: loanKeys.memberApprovals(loanId), queryFn: () => getMemberLoanApprovals(loanId) });
  const disbursements = useQuery({ queryKey: loanKeys.memberDisbursementApprovals(loanId), queryFn: () => getMemberDisbursementApprovals(loanId) });
  const groups = [
    { title: "Loan approvals", query: approvals },
    { title: "Disbursement approvals", query: disbursements },
  ];
  return <div className="grid gap-4 xl:grid-cols-2">{groups.map(({ title, query }) => <section key={title} className="card-dash rounded-3xl p-5 md:p-6"><h2 className="text-lg font-bold">{title}</h2>{query.isLoading ? <Loader2 className="mt-6 h-5 w-5 animate-spin" /> : query.isError ? <div className="mt-4"><QueryError error={query.error} retry={() => { void query.refetch(); }} /></div> : !query.data?.length ? <p className="mt-5 text-sm dash-text-muted">No records returned.</p> : <div className="mt-5 space-y-3">{query.data.map((record, index) => <div key={readString(record, "id") ?? index} className="rounded-2xl border p-4" style={{ borderColor: "var(--dash-border)" }}><ResponseDetails value={record} /></div>)}</div>}</section>)}</div>;
}

export default function MemberLoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<Tab>("overview");
  const query = useQuery({ queryKey: loanKeys.memberDetail(id), queryFn: () => getMemberLoan(id), enabled: Boolean(id) });
  const status = loanStatus(query.data);
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12 dash-text">
      <div className="flex items-center justify-between gap-3"><Link href="/dashboard/loans" className="inline-flex items-center gap-2 text-sm font-semibold dash-text-muted"><ArrowLeft className="h-4 w-4" /> Back to loans</Link><button onClick={() => query.refetch()} disabled={query.isFetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--dash-border)" }}><RefreshCw className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`} /> Refresh</button></div>
      {query.isLoading ? <div className="flex justify-center py-24"><Loader2 className="h-7 w-7 animate-spin" /></div> : query.isError ? <QueryError error={query.error} retry={() => { void query.refetch(); }} /> : query.data ? <>
        <LoanOverview loan={query.data} />
        <nav aria-label="Loan details" className="flex gap-2 overflow-x-auto border-b pb-3" style={{ borderColor: "var(--dash-border)" }}>{(["overview", "installments", "activity"] as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold capitalize ${tab === item ? "bg-amber-400 text-black" : "dash-text-muted"}`}>{item}</button>)}</nav>
        {tab === "overview" && <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]"><section className="card-dash rounded-3xl p-6"><h2 className="text-xl font-bold">Application details</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-widest dash-text-muted">Purpose</p><p className="mt-1 text-sm font-semibold">{readString(query.data, "purpose") ?? "—"}</p></div><div><p className="text-[10px] font-bold uppercase tracking-widest dash-text-muted">Loan ID</p><p className="mt-1 break-all text-sm font-semibold">{id}</p></div><div><p className="text-[10px] font-bold uppercase tracking-widest dash-text-muted">Principal</p><p className="mt-1 text-sm font-semibold">{formatMoney(readNumber(query.data, "principalAmount"))}</p></div><div><p className="text-[10px] font-bold uppercase tracking-widest dash-text-muted">Tenure</p><p className="mt-1 text-sm font-semibold">{readNumber(query.data, "tenureMonths") ?? "—"} months</p></div></div><details className="mt-6 border-t pt-4" style={{ borderColor: "var(--dash-border)" }}><summary className="cursor-pointer text-sm font-semibold dash-text-muted">View all information supplied by the service</summary><div className="mt-5"><ResponseDetails value={query.data} /></div></details></section><aside className="card-dash rounded-3xl p-6"><CheckCircle2 className="h-7 w-7 text-amber-500" /><h2 className="mt-4 text-lg font-bold">What happens next?</h2><p className="mt-2 text-sm leading-6 dash-text-muted">{status === "Disbursed" ? "Your repayment schedule is ready. Open Installments to pay from savings or submit payment proof." : status === "Closed" ? "Your loan has been completed." : status === "Rejected" ? "This application was rejected. You can review the returned details for the reason." : "The service will update your loan status as the review and approval steps progress."}</p>{status === "Disbursed" && <button onClick={() => setTab("installments")} className="mt-5 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white">View installments</button>}</aside></div>}
        {tab === "installments" && <Schedule loanId={id} canPay={status === "Disbursed"} />}
        {tab === "activity" && <Activity loanId={id} />}
      </> : <div className="card-dash rounded-3xl p-10 text-center text-sm dash-text-muted">No loan information was returned.</div>}
    </div>
  );
}
