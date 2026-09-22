"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import {
  calculateLoan,
  LOAN_CALCULATOR_LIMITS,
  type LoanCalculationResult,
} from "@/app/lib/loan-api";
import { ResponseDetails } from "@/app/components/loans/ResponseDetails";
import {
  getLoanErrorDetails,
  type LoanErrorDetails,
} from "@/app/components/loans/loan-errors";

const { amount: amountLimits, tenureMonths: tenureLimits } = LOAN_CALCULATOR_LIMITS;

export default function LoanCalculatorPage() {
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("");
  const [result, setResult] = useState<LoanCalculationResult | null>(null);
  const [error, setError] = useState<LoanErrorDetails | null>(null);
  const [loading, setLoading] = useState(false);

  function clearField(field: keyof LoanErrorDetails["fieldErrors"]) {
    setError((current) => {
      if (!current) return null;
      const fieldErrors = { ...current.fieldErrors, [field]: undefined };
      return Object.values(fieldErrors).some(Boolean) ? { ...current, fieldErrors } : null;
    });
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const numericAmount = Number(amount);
    const numericTenure = Number(tenure);
    const fieldErrors: LoanErrorDetails["fieldErrors"] = {};

    if (!Number.isFinite(numericAmount) || numericAmount < amountLimits.min || numericAmount > amountLimits.max) {
      fieldErrors.amount = `Enter an amount between ${amountLimits.min.toLocaleString()} and ${amountLimits.max.toLocaleString()}.`;
    }
    if (!Number.isInteger(numericTenure) || numericTenure < tenureLimits.min || numericTenure > tenureLimits.max) {
      fieldErrors.tenure = `Enter a whole number between ${tenureLimits.min} and ${tenureLimits.max} months.`;
    }
    if (Object.keys(fieldErrors).length) {
      setError({ message: "Check the highlighted fields and try again.", fieldErrors });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await calculateLoan(numericAmount, numericTenure));
    } catch (reason) {
      setError(getLoanErrorDetails(reason));
    } finally {
      setLoading(false);
    }
  }

  const applyHref = `/dashboard/loans/apply?amount=${encodeURIComponent(amount)}&tenure=${encodeURIComponent(tenure)}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 dash-text">
      <Link href="/dashboard/loans" className="inline-flex items-center gap-2 text-sm font-semibold dash-text-muted">
        <ArrowLeft className="h-4 w-4" /> Back to loans
      </Link>

      <header className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-amber-400/15 blur-3xl" />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Loan calculator</p>
        <h1 className="relative mt-2 text-3xl font-bold tracking-tight">Calculate repayment</h1>
        <p className="relative mt-2 max-w-xl text-sm leading-6 text-white/65">
          Get an estimate, then continue directly to a pre-filled application.
        </p>
      </header>

      <form onSubmit={submit} className="card-dash grid gap-5 rounded-3xl p-6 shadow-sm sm:grid-cols-2 md:p-8">
        <label className="grid gap-2 text-sm font-semibold">
          Loan amount
          <input
            type="number"
            min={amountLimits.min}
            max={amountLimits.max}
            step="any"
            inputMode="decimal"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              clearField("amount");
            }}
            required
            aria-invalid={Boolean(error?.fieldErrors.amount)}
            aria-describedby="calculator-amount-help calculator-amount-error"
            className={`input-dash rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400/30 ${error?.fieldErrors.amount ? "ring-2 ring-red-400" : ""}`}
          />
          <span id="calculator-amount-help" className="text-xs font-normal dash-text-muted">
            Allowed range: {amountLimits.min.toLocaleString()}–{amountLimits.max.toLocaleString()}.
          </span>
          {error?.fieldErrors.amount && <span id="calculator-amount-error" className="text-xs font-medium text-red-600">{error.fieldErrors.amount}</span>}
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Tenure in months
          <input
            type="number"
            min={tenureLimits.min}
            max={tenureLimits.max}
            step="1"
            inputMode="numeric"
            value={tenure}
            onChange={(event) => {
              setTenure(event.target.value);
              clearField("tenure");
            }}
            required
            aria-invalid={Boolean(error?.fieldErrors.tenure)}
            aria-describedby="calculator-tenure-help calculator-tenure-error"
            className={`input-dash rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400/30 ${error?.fieldErrors.tenure ? "ring-2 ring-red-400" : ""}`}
          />
          <span id="calculator-tenure-help" className="text-xs font-normal dash-text-muted">
            Calculator range: {tenureLimits.min}–{tenureLimits.max} months. Your application policy may allow a shorter term.
          </span>
          {error?.fieldErrors.tenure && <span id="calculator-tenure-error" className="text-xs font-medium text-red-600">{error.fieldErrors.tenure}</span>}
        </label>

        <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Calculating…" : "Calculate"}
        </button>
      </form>

      {error && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p>{error.message}</p>
          {error.reference && <p className="mt-2 text-xs text-red-600/75">Support reference: {error.reference}</p>}
          <button type="button" onClick={() => submit()} disabled={loading} className="mt-3 inline-flex items-center gap-2 font-semibold">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}

      {result && (
        <div className="card-dash rounded-3xl p-6 shadow-sm md:p-8">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Calculation result</h2>
              <p className="mt-1 text-sm dash-text-muted">The loan service supplied these figures.</p>
            </div>
            <Link href={applyHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-bold text-black">
              Apply with these values <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ResponseDetails value={result} />
        </div>
      )}
    </div>
  );
}
