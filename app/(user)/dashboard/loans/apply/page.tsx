"use client";

import { type FormEvent, use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calculator, Loader2, Plus, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import {
  applyForLoan,
  LOAN_CALCULATOR_LIMITS,
  unwrapLoanResponse,
} from "@/app/lib/loan-api";
import { findNestedId, isRecord, readString } from "@/app/components/loans/loan-data";
import {
  getLoanErrorDetails,
  type LoanErrorDetails,
} from "@/app/components/loans/loan-errors";

type ApplySearchParams = Promise<{ amount?: string | string[]; tenure?: string | string[] }>;
const { amount: amountLimits, tenureMonths: tenureLimits } = LOAN_CALCULATOR_LIMITS;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validPrefill(value: string | string[] | undefined, min: number, max: number, integer = false): string {
  if (typeof value !== "string") return "";
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max || (integer && !Number.isInteger(parsed))) return "";
  return value;
}

export default function ApplyForLoanPage({ searchParams }: { searchParams: ApplySearchParams }) {
  const initial = use(searchParams);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [principal, setPrincipal] = useState(() => validPrefill(initial.amount, amountLimits.min, amountLimits.max));
  const [tenure, setTenure] = useState(() => validPrefill(initial.tenure, tenureLimits.min, tenureLimits.max, true));
  const [purpose, setPurpose] = useState("");
  const [contacts, setContacts] = useState<string[]>([""]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoanErrorDetails | null>(null);
  const [policyTenureMax, setPolicyTenureMax] = useState<number | undefined>();

  function clearField(field: keyof LoanErrorDetails["fieldErrors"]) {
    setError((current) => {
      if (!current) return null;
      const fieldErrors = { ...current.fieldErrors, [field]: undefined };
      return Object.values(fieldErrors).some(Boolean) ? { ...current, fieldErrors } : null;
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const amount = Number(principal);
    const months = Number(tenure);
    const cleanContacts = contacts.map((item) => item.trim()).filter(Boolean);
    const fieldErrors: LoanErrorDetails["fieldErrors"] = {};
    const effectiveTenureMax = policyTenureMax;

    if (!Number.isFinite(amount) || amount <= 0) {
      fieldErrors.amount = "Enter an amount greater than zero.";
    }
    if (!Number.isInteger(months) || months <= 0 || (effectiveTenureMax != null && months > effectiveTenureMax)) {
      fieldErrors.tenure = effectiveTenureMax != null ? `Enter a whole number between 1 and ${effectiveTenureMax} months.` : "Enter a positive whole number of months.";
    }
    if (!purpose.trim()) fieldErrors.purpose = "Tell us what the loan will be used for.";
    const invalidGuarantorIndex = contacts.findIndex((contact) => contact.trim() && !EMAIL_PATTERN.test(contact.trim()));
    if (invalidGuarantorIndex !== -1) {
      fieldErrors.guarantors = `Guarantor ${invalidGuarantorIndex + 1} needs a valid email address. Phone numbers are not accepted.`;
    }
    if (Object.keys(fieldErrors).length) {
      setError({ message: "Check the highlighted fields and try again.", fieldErrors });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await applyForLoan({
        PrincipalAmount: amount,
        TenureMonths: months,
        Purpose: purpose.trim(),
        GuarantorContacts: cleanContacts,
        BankStatementFile: file ?? undefined,
      });
      toast.success("Loan application submitted successfully.");
      await queryClient.invalidateQueries({ queryKey: ["member-loans"] });
      const data = unwrapLoanResponse(response);
      const id = isRecord(data) ? readString(data, "id") ?? findNestedId(data, "loan") : undefined;
      router.push(id ? `/dashboard/loans/${encodeURIComponent(id)}` : "/dashboard/loans");
    } catch (reason) {
      const details = getLoanErrorDetails(reason);
      setError(details);
      if (details.suggestedTenure) setPolicyTenureMax(details.suggestedTenure);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12 dash-text">
      <Link href="/dashboard/loans" className="inline-flex items-center gap-2 text-sm font-semibold dash-text-muted">
        <ArrowLeft className="h-4 w-4" /> Back to loans
      </Link>
      <header className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-amber-400/15 blur-3xl" />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Application</p>
        <h1 className="relative mt-2 text-3xl font-bold tracking-tight">Apply for a loan</h1>
        <p className="relative mt-2 max-w-xl text-sm leading-6 text-white/65">
          Your cooperative&apos;s policy is checked when you submit, so its allowed term may be shorter than the calculator range.
        </p>
      </header>

      {(principal || tenure) && (
        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2"><Calculator className="h-4 w-4" /> Values carried over from your calculation.</span>
          <Link href="/dashboard/loans/calculate" className="font-semibold underline underline-offset-2">Recalculate</Link>
        </div>
      )}

      <form noValidate onSubmit={submit} className="card-dash space-y-6 rounded-3xl p-6 shadow-sm md:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Principal amount
            <input
              type="number"
              min="0.01"
              step="any"
              required
              value={principal}
              onChange={(event) => { setPrincipal(event.target.value); setPolicyTenureMax(undefined); clearField("amount"); }}
              aria-invalid={Boolean(error?.fieldErrors.amount)}
              aria-describedby="apply-amount-help apply-amount-error"
              className={`input-dash rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400/30 ${error?.fieldErrors.amount ? "ring-2 ring-red-400" : ""}`}
            />
            <span id="apply-amount-help" className="text-xs font-normal dash-text-muted">
              The cooperative policy checks the amount when you submit.
            </span>
            {error?.fieldErrors.amount && <span id="apply-amount-error" className="text-xs font-medium text-red-600">{error.fieldErrors.amount}</span>}
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Tenure months
            <input
              type="number"
              min={tenureLimits.min}
              max={policyTenureMax}
              step="1"
              required
              value={tenure}
              onChange={(event) => { setTenure(event.target.value); clearField("tenure"); }}
              aria-invalid={Boolean(error?.fieldErrors.tenure)}
              aria-describedby="apply-tenure-help apply-tenure-error"
              className={`input-dash rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400/30 ${error?.fieldErrors.tenure ? "ring-2 ring-red-400" : ""}`}
            />
            <span id="apply-tenure-help" className="text-xs font-normal dash-text-muted">
              {policyTenureMax
                ? `Your cooperative currently allows up to ${policyTenureMax} months for this application.`
                : "The cooperative policy checks the maximum term when you submit."}
            </span>
            {error?.fieldErrors.tenure && <span id="apply-tenure-error" className="text-xs font-medium text-red-600">{error.fieldErrors.tenure}</span>}
            {error?.suggestedTenure && Number(tenure) !== error.suggestedTenure && (
              <button
                type="button"
                onClick={() => { setTenure(String(error.suggestedTenure)); clearField("tenure"); }}
                className="justify-self-start rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900"
              >
                Use {error.suggestedTenure} months
              </button>
            )}
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold">
          Purpose
          <textarea
            required
            rows={4}
            value={purpose}
            onChange={(event) => { setPurpose(event.target.value); clearField("purpose"); }}
            aria-invalid={Boolean(error?.fieldErrors.purpose)}
            className={`input-dash resize-y rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400/30 ${error?.fieldErrors.purpose ? "ring-2 ring-red-400" : ""}`}
          />
          {error?.fieldErrors.purpose && <span className="text-xs font-medium text-red-600">{error.fieldErrors.purpose}</span>}
        </label>

        <fieldset className="space-y-3">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold">Guarantor email addresses</legend>
            <button type="button" onClick={() => setContacts((items) => [...items, ""])} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
              <Plus className="h-4 w-4" /> Add email
            </button>
          </div>
          <p className="text-xs dash-text-muted">Enter an email address for each guarantor. Phone numbers cannot be used here.</p>
          {contacts.map((contact, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-label={`Guarantor email address ${index + 1}`}
                aria-invalid={Boolean(error?.fieldErrors.guarantors)}
                aria-describedby={error?.fieldErrors.guarantors ? "guarantor-email-error" : undefined}
                value={contact}
                onChange={(event) => {
                  setContacts((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item));
                  clearField("guarantors");
                }}
                className="input-dash min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                placeholder="name@example.com"
              />
              <button type="button" onClick={() => { setContacts((items) => items.filter((_, itemIndex) => itemIndex !== index)); clearField("guarantors"); }} className="rounded-xl border border-red-100 p-3 text-red-600" aria-label={`Remove guarantor email address ${index + 1}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {error?.fieldErrors.guarantors && <p id="guarantor-email-error" className="text-xs font-medium text-red-600">{error.fieldErrors.guarantors}</p>}
        </fieldset>

        <label className={`flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed p-5 ${error?.fieldErrors.file ? "border-red-400" : ""}`} style={!error?.fieldErrors.file ? { borderColor: "var(--dash-border)" } : undefined}>
          <Upload className="h-6 w-6 text-amber-500" />
          <span className="min-w-0"><span className="block text-sm font-semibold">Bank statement file</span><span className="block truncate text-xs dash-text-muted">{file?.name ?? "Choose a file"}</span></span>
          <input type="file" onChange={(event) => { setFile(event.target.files?.[0] ?? null); clearField("file"); }} className="sr-only" />
        </label>
        {error?.fieldErrors.file && <p className="-mt-4 text-xs font-medium text-red-600">{error.fieldErrors.file}</p>}

        {error && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">{error.message}</p>
            {error.reference && <p className="mt-2 text-xs text-red-600/75">Support reference: {error.reference}</p>}
          </div>
        )}

        <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}
