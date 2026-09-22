"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, CircleCheck, Clock3, FilePenLine, Loader2, RefreshCw, ShieldCheck, X } from "lucide-react";
import toast from "react-hot-toast";
import { getLoanScreenError } from "@/app/components/loans/loan-errors";
import { CooperativeSelector } from "@/app/components/CooperativeSelector";
import { ResponseDetails } from "@/app/components/loans/ResponseDetails";
import { formatValue, readNumber, readString } from "@/app/components/loans/loan-data";
import { useLoanPermissions } from "@/app/components/loans/useLoanPermissions";
import {
  findProposedLoanPolicy,
  getLoanPolicy,
  getPendingLoanPolicyProposals,
  proposeLoanPolicy,
  reviewLoanPolicyChange,
  type LoanPolicy,
} from "@/app/lib/loan-governance-api";
import { loanKeys } from "@/app/lib/loan-keys";
import { useCooperativeId } from "@/app/lib/useCooperativeId";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";

const amountFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });

type Draft = { base: LoanPolicy; value: LoanPolicy };
type Review = { id: string; approve: boolean; proposerId?: string; policy: LoanPolicy };
type Eligibility = LoanPolicy["eligibilityRequirements"];
type PolicyView = "overview" | "propose" | "reviews";

const policyLabels: Record<string, string> = {
  maximumAmountAllowed: "Maximum loan amount",
  maxTermMonths: "Maximum term",
  annualInterestRatePercent: "Annual interest rate",
  interestRateType: "Interest type",
  latePenaltyPercentPerMonth: "Monthly late penalty",
  requireMinimumMembershipDuration: "Minimum membership required",
  minimumMembershipMonths: "Minimum membership months",
  requireGuarantor: "Guarantor required",
  minimumGuarantorCount: "Minimum guarantors",
  guarantorMustHaveNoActiveLoan: "Guarantor has no active loan",
  requireDebtToIncomeCheck: "Debt-to-income check required",
  maximumDebtToIncomeRatioPercent: "Maximum debt-to-income ratio",
  requireBankStatementUpload: "Bank statement required",
  firstRepaymentInstallmentDays: "First installment delay",
  penaltyGracePeriodDays: "Penalty grace period",
  defaultAlertGraceDays: "Default alert grace period",
  penaltyMode: "Penalty mode",
};

function policyChanges(base: LoanPolicy, value: LoanPolicy) {
  const { eligibilityRequirements: beforeEligibility, ...beforePolicy } = base;
  const { eligibilityRequirements: afterEligibility, ...afterPolicy } = value;
  const before: Record<string, unknown> = { ...beforePolicy, ...beforeEligibility };
  const after: Record<string, unknown> = { ...afterPolicy, ...afterEligibility };
  return Object.keys(before).filter((key) => before[key] !== after[key]).map((key) => ({
    label: policyLabels[key] ?? key,
    before: typeof before[key] === "boolean" ? (before[key] ? "Yes" : "No") : String(before[key]),
    after: typeof after[key] === "boolean" ? (after[key] ? "Yes" : "No") : String(after[key]),
  }));
}

function numberInput(value: string): number {
  return value.trim() ? Number(value) : Number.NaN;
}

function validWholeNumber(value: number, minimum = 0): boolean {
  return Number.isInteger(value) && value >= minimum;
}

function validatePolicy(policy: LoanPolicy): string | null {
  if (!Number.isFinite(policy.maximumAmountAllowed) || policy.maximumAmountAllowed <= 0) {
    return "Maximum loan amount must be greater than zero.";
  }
  if (!Number.isFinite(policy.annualInterestRatePercent) || policy.annualInterestRatePercent < 0) {
    return "Annual interest rate must be zero or greater.";
  }
  if (!validWholeNumber(policy.maxTermMonths, 1)) return "Maximum term must be at least one whole month.";
  if (!Number.isFinite(policy.latePenaltyPercentPerMonth) || policy.latePenaltyPercentPerMonth < 0) {
    return "Monthly late penalty must be zero or greater.";
  }
  const eligibility = policy.eligibilityRequirements;
  if (!validWholeNumber(eligibility.minimumMembershipMonths, eligibility.requireMinimumMembershipDuration ? 1 : 0)) {
    return "Minimum membership duration must be a valid number of whole months.";
  }
  if (!validWholeNumber(eligibility.minimumGuarantorCount, eligibility.requireGuarantor ? 1 : 0)) {
    return "Minimum guarantor count must be a valid whole number.";
  }
  if (!Number.isFinite(eligibility.maximumDebtToIncomeRatioPercent) || eligibility.maximumDebtToIncomeRatioPercent < 0 || eligibility.maximumDebtToIncomeRatioPercent > 100) {
    return "Maximum debt-to-income ratio must be between 0 and 100 percent.";
  }
  if (!validWholeNumber(eligibility.firstRepaymentInstallmentDays)) return "First repayment delay must be zero or more whole days.";
  if (!validWholeNumber(policy.penaltyGracePeriodDays)) return "Penalty grace period must be zero or more whole days.";
  if (!validWholeNumber(policy.defaultAlertGraceDays)) return "Default alert grace period must be zero or more whole days.";
  return null;
}

function NumberField({ label, value, onChange, unit, step = "1", min = 0, help }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: string;
  min?: number;
  help?: string;
}) {
  return <label className="grid gap-2 text-sm font-semibold">
    <span>{label}</span>
    <div className="relative">
      <input
        type="number"
        inputMode={step === "1" ? "numeric" : "decimal"}
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        onChange={(event) => onChange(numberInput(event.target.value))}
        className={`input-admin w-full rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400/30 ${unit ? "pr-20" : ""}`}
      />
      {unit && <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs admin-text-muted">{unit}</span>}
    </div>
    {help && <span className="text-xs font-normal admin-text-muted">{help}</span>}
  </label>;
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between gap-4 rounded-2xl border p-4 text-sm font-medium" style={{ borderColor: "var(--admin-border)" }}>
    <span>{label}</span>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 shrink-0 accent-amber-500" />
  </label>;
}

function PolicyEditor({ policy, update, updateEligibility }: {
  policy: LoanPolicy;
  update: <K extends keyof LoanPolicy>(key: K, value: LoanPolicy[K]) => void;
  updateEligibility: <K extends keyof Eligibility>(key: K, value: Eligibility[K]) => void;
}) {
  const eligibility = policy.eligibilityRequirements;
  return <div className="space-y-7">
    <section className="rounded-2xl border p-5 md:p-6" style={{ borderColor: "var(--admin-border)" }}>
      <h3 className="text-sm font-bold uppercase tracking-widest text-amber-600">Loan terms</h3>
      <p className="mt-1 text-xs admin-text-muted">Set the amount, duration, interest and late-charge limits members will see.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <NumberField label="Maximum loan amount" value={policy.maximumAmountAllowed} onChange={(value) => update("maximumAmountAllowed", value)} step="any" min={0.01} help="A zero cap rejects every positive application." />
        <NumberField label="Maximum term" value={policy.maxTermMonths} onChange={(value) => update("maxTermMonths", value)} unit="months" min={1} />
        <NumberField label="Annual interest rate" value={policy.annualInterestRatePercent} onChange={(value) => update("annualInterestRatePercent", value)} unit="%" step="any" />
        <NumberField label="Monthly late penalty" value={policy.latePenaltyPercentPerMonth} onChange={(value) => update("latePenaltyPercentPerMonth", value)} unit="%" step="any" />
      </div>
    </section>

    <section className="rounded-2xl border p-5 md:p-6" style={{ borderColor: "var(--admin-border)" }}>
      <h3 className="text-sm font-bold uppercase tracking-widest text-amber-600">Eligibility</h3>
      <p className="mt-1 text-xs admin-text-muted">Control membership, guarantor, affordability and documentation rules.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ToggleField label="Require minimum membership duration" checked={eligibility.requireMinimumMembershipDuration} onChange={(value) => updateEligibility("requireMinimumMembershipDuration", value)} />
        <ToggleField label="Require a guarantor" checked={eligibility.requireGuarantor} onChange={(value) => updateEligibility("requireGuarantor", value)} />
        <ToggleField label="Guarantor must have no active loan" checked={eligibility.guarantorMustHaveNoActiveLoan} onChange={(value) => updateEligibility("guarantorMustHaveNoActiveLoan", value)} />
        <ToggleField label="Require debt-to-income check" checked={eligibility.requireDebtToIncomeCheck} onChange={(value) => updateEligibility("requireDebtToIncomeCheck", value)} />
        <ToggleField label="Require bank statement upload" checked={eligibility.requireBankStatementUpload} onChange={(value) => updateEligibility("requireBankStatementUpload", value)} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <NumberField label="Minimum membership duration" value={eligibility.minimumMembershipMonths} onChange={(value) => updateEligibility("minimumMembershipMonths", value)} unit="months" min={eligibility.requireMinimumMembershipDuration ? 1 : 0} />
        <NumberField label="Minimum guarantors" value={eligibility.minimumGuarantorCount} onChange={(value) => updateEligibility("minimumGuarantorCount", value)} min={eligibility.requireGuarantor ? 1 : 0} />
        <NumberField label="Maximum debt-to-income ratio" value={eligibility.maximumDebtToIncomeRatioPercent} onChange={(value) => updateEligibility("maximumDebtToIncomeRatioPercent", value)} unit="%" step="any" />
      </div>
    </section>

    <section className="rounded-2xl border p-5 md:p-6" style={{ borderColor: "var(--admin-border)" }}>
      <h3 className="text-sm font-bold uppercase tracking-widest text-amber-600">Repayment and alerts</h3>
      <p className="mt-1 text-xs admin-text-muted">Configure first repayment timing, grace periods and default alerts.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <NumberField label="First repayment installment" value={eligibility.firstRepaymentInstallmentDays} onChange={(value) => updateEligibility("firstRepaymentInstallmentDays", value)} unit="days" />
        <NumberField label="Penalty grace period" value={policy.penaltyGracePeriodDays} onChange={(value) => update("penaltyGracePeriodDays", value)} unit="days" />
        <NumberField label="Default alert grace period" value={policy.defaultAlertGraceDays} onChange={(value) => update("defaultAlertGraceDays", value)} unit="days" />
      </div>
      <p className="mt-4 text-xs admin-text-muted">Interest type ({policy.interestRateType}) and penalty mode ({policy.penaltyMode}) are preserved from the live policy. Available enum choices were not supplied by the API contract.</p>
    </section>
  </div>;
}

function LivePolicySummary({ policy }: { policy: LoanPolicy }) {
  const eligibility = policy.eligibilityRequirements;
  const rules = [
    { label: "Membership duration", value: eligibility.requireMinimumMembershipDuration ? `${eligibility.minimumMembershipMonths} months minimum` : "Not required" },
    { label: "Guarantors", value: eligibility.requireGuarantor ? `${eligibility.minimumGuarantorCount} minimum` : "Not required" },
    { label: "Guarantor loan check", value: eligibility.guarantorMustHaveNoActiveLoan ? "Required" : "Not required" },
    { label: "Debt-to-income check", value: eligibility.requireDebtToIncomeCheck ? `Up to ${eligibility.maximumDebtToIncomeRatioPercent}%` : "Not required" },
    { label: "Bank statement", value: eligibility.requireBankStatementUpload ? "Required" : "Not required" },
  ];

  return <>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      { label: "Maximum loan amount", value: amountFormat.format(policy.maximumAmountAllowed) },
      { label: "Maximum term", value: `${policy.maxTermMonths} months` },
      { label: "Annual interest", value: `${policy.annualInterestRatePercent}%` },
      { label: "Monthly late penalty", value: `${policy.latePenaltyPercentPerMonth}%` },
    ].map((item) => <div key={item.label} className="rounded-2xl border p-4" style={{ borderColor: "var(--admin-border)" }}><p className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">{item.label}</p><p className="mt-2 text-xl font-bold">{item.value}</p></div>)}</div>
    {policy.maximumAmountAllowed <= 0 && <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">The active maximum amount is zero. Positive loan applications will fail until an approved proposal changes it.</p>}
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border p-5" style={{ borderColor: "var(--admin-border)" }}><h3 className="font-semibold">Eligibility rules</h3><dl className="mt-4 divide-y text-sm" style={{ borderColor: "var(--admin-border)" }}>{rules.map((rule) => <div key={rule.label} className="flex flex-wrap items-center justify-between gap-2 py-2.5" style={{ borderColor: "var(--admin-border)" }}><dt className="admin-text-muted">{rule.label}</dt><dd className="font-semibold">{rule.value}</dd></div>)}</dl></section>
      <section className="rounded-2xl border p-5" style={{ borderColor: "var(--admin-border)" }}><h3 className="font-semibold">Repayment and penalties</h3><dl className="mt-4 divide-y text-sm" style={{ borderColor: "var(--admin-border)" }}>{[
        { label: "Interest type", value: policy.interestRateType },
        { label: "First installment", value: `${eligibility.firstRepaymentInstallmentDays} days` },
        { label: "Penalty grace period", value: `${policy.penaltyGracePeriodDays} days` },
        { label: "Default alert grace", value: `${policy.defaultAlertGraceDays} days` },
        { label: "Penalty mode", value: policy.penaltyMode },
      ].map((item) => <div key={item.label} className="flex flex-wrap items-center justify-between gap-2 py-2.5" style={{ borderColor: "var(--admin-border)" }}><dt className="admin-text-muted">{item.label}</dt><dd className="font-semibold">{item.value}</dd></div>)}</dl></section>
    </div>
    <details className="mt-6 border-t pt-4" style={{ borderColor: "var(--admin-border)" }}><summary className="cursor-pointer text-sm font-semibold admin-text-muted">View complete backend policy</summary><div className="mt-4"><ResponseDetails value={policy} variant="admin" /></div></details>
  </>;
}

export default function AdminLoanPolicyPage() {
  const queryClient = useQueryClient();
  const { user } = useAdminAuth();
  const cooperative = useCooperativeId();
  const permissions = useLoanPermissions();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmProposal, setConfirmProposal] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [view, setView] = useState<PolicyView>("overview");
  const [submissionNotice, setSubmissionNotice] = useState(false);
  const [pendingCooperative, setPendingCooperative] = useState<string | null>(null);
  const cooperativeId = cooperative.cooperativeId ?? "";
  const canManage = permissions.can("manageLoanPolicy");
  const canReview = permissions.can("reviewLoanPolicyChanges");
  const changes = draft ? policyChanges(draft.base, draft.value) : [];

  function changeCooperative(id: string) {
    if (propose.isPending || reviewMutation.isPending) return;
    if (id !== cooperativeId && draft && changes.length > 0) {
      setPendingCooperative(id);
      return;
    }
    applyCooperative(id);
  }

  function applyCooperative(id: string) {
    setDraft(null);
    setConfirmProposal(false);
    setReview(null);
    setReviewNote("");
    setFormError(null);
    setView("overview");
    setSubmissionNotice(false);
    setPendingCooperative(null);
    cooperative.selectCooperative(id);
  }

  const live = useQuery({
    queryKey: loanKeys.policy(cooperativeId),
    queryFn: () => getLoanPolicy(cooperativeId),
    enabled: Boolean(cooperativeId),
  });
  const pending = useQuery({
    queryKey: loanKeys.policyProposals(cooperativeId),
    queryFn: () => getPendingLoanPolicyProposals(cooperativeId),
    enabled: Boolean(cooperativeId) && canReview,
  });
  const tabs: { id: PolicyView; label: string; detail: string; visible: boolean }[] = [
    { id: "overview", label: "Active policy", detail: "Rules in effect now", visible: true },
    { id: "propose", label: "Propose a change", detail: "Prepare a replacement", visible: canManage },
    { id: "reviews", label: "Pending reviews", detail: pending.data?.length ? `${pending.data.length} awaiting review` : "Reviewer decisions", visible: canReview },
  ];

  function update<K extends keyof LoanPolicy>(key: K, value: LoanPolicy[K]) {
    const base = draft?.base ?? live.data;
    const current = draft?.value ?? live.data;
    if (!base || !current) return;
    setDraft({ base, value: { ...current, [key]: value } });
    setFormError(null);
  }

  function updateEligibility<K extends keyof Eligibility>(key: K, value: Eligibility[K]) {
    const base = draft?.base ?? live.data;
    const current = draft?.value ?? live.data;
    if (!base || !current) return;
    setDraft({ base, value: { ...current, eligibilityRequirements: { ...current.eligibilityRequirements, [key]: value } } });
    setFormError(null);
  }

  const propose = useMutation({
    mutationFn: async () => {
      if (!cooperativeId || !draft) throw new Error("Select a cooperative and change its policy first.");
      if (!policyChanges(draft.base, draft.value).length) throw new Error("Change at least one policy setting before submitting.");
      const validation = validatePolicy(draft.value);
      if (validation) throw new Error(validation);
      const latest = await getLoanPolicy(cooperativeId);
      if (JSON.stringify(latest) !== JSON.stringify(draft.base)) {
        throw new Error("The live policy changed while you were editing. Discard your draft, refresh, and review the latest settings before proposing again.");
      }
      return proposeLoanPolicy(cooperativeId, draft.value);
    },
    onSuccess: async () => {
      toast.success("Policy proposal submitted for review. The live policy has not changed yet.");
      setConfirmProposal(false);
      setDraft(null);
      setFormError(null);
      setView("overview");
      setSubmissionNotice(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: loanKeys.policy(cooperativeId) }),
        queryClient.invalidateQueries({ queryKey: loanKeys.policyProposals(cooperativeId) }),
      ]);
    },
    onError: (reason) => setFormError(getLoanScreenError(reason)),
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!cooperativeId) throw new Error("Select a cooperative before reviewing its policy proposal.");
      if (!review) throw new Error("Select a pending proposal first.");
      if (review.proposerId && review.proposerId === user?.id && !permissions.isRootAdmin) throw new Error("You cannot review your own proposal.");
      return reviewLoanPolicyChange(review.id, review.approve, reviewNote.trim());
    },
    onSuccess: async () => {
      toast.success(review?.approve ? "Review recorded. Check the active policy to see whether the backend applied the change." : "Policy proposal rejected.");
      setReview(null);
      setReviewNote("");
      setFormError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: loanKeys.policy(cooperativeId) }),
        queryClient.invalidateQueries({ queryKey: loanKeys.policyProposals(cooperativeId) }),
      ]);
    },
    onError: (reason) => setFormError(getLoanScreenError(reason)),
  });

  function submitDraft(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    if (!policyChanges(draft.base, draft.value).length) {
      setFormError("No settings have changed. Edit at least one field before submitting a proposal.");
      return;
    }
    const validation = validatePolicy(draft.value);
    if (validation) { setFormError(validation); return; }
    setFormError(null);
    setConfirmProposal(true);
  }

  return <div className="space-y-6 pb-16 admin-text">
    <Link href="/admin/loans" className="inline-flex items-center gap-2 text-sm font-semibold admin-text-muted"><ArrowLeft className="h-4 w-4" /> Back to loans</Link>

    <header className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Loan governance</p><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Loan policy</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Manage the lending rules for one cooperative. Changes are proposed, independently reviewed, then applied by the backend.</p></div>
        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90"><ShieldCheck className="h-4 w-4 text-amber-300" /> Approval controlled</span>
      </div>
    </header>

    <CooperativeSelector selection={cooperative} onChange={changeCooperative} disabled={propose.isPending || reviewMutation.isPending} />

    {cooperativeId && <>
      <div className="grid gap-3 md:grid-cols-3" aria-label="Policy change process">
        {[{ number: "01", title: "Active", detail: "Read the rules currently in effect" }, { number: "02", title: "Proposed", detail: "Submit a complete replacement" }, { number: "03", title: "Reviewed", detail: "Separate approvers decide when it applies" }].map((step) => <div key={step.number} className="card-admin flex items-start gap-3 rounded-2xl p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-xs font-bold text-amber-700">{step.number}</span><div><p className="text-sm font-semibold">{step.title}</p><p className="mt-0.5 text-xs leading-5 admin-text-muted">{step.detail}</p></div></div>)}
      </div>

      {submissionNotice && <div role="status" className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><CircleCheck className="h-5 w-5 shrink-0" /><p><strong>Proposal submitted.</strong> The active policy has not changed. A different authorized reviewer must approve it before the backend applies it.</p></div>}
      {permissions.isLoading && <p role="status" className="card-admin flex items-center gap-2 rounded-2xl p-4 text-sm admin-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Checking your governance access…</p>}
      {permissions.error && <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Editing and review are unavailable because permissions could not be loaded. {getLoanScreenError(permissions.error)}</p>}
      {!permissions.isLoading && !permissions.error && !canManage && !canReview && <p className="card-admin rounded-2xl p-4 text-sm admin-text-muted">You can view this policy, but your account cannot propose changes or review pending proposals.</p>}

      <nav aria-label="Loan policy sections" className="card-admin grid gap-2 rounded-2xl p-2 sm:grid-cols-3">
        {tabs.filter((tab) => tab.visible).map((tab) => <button key={tab.id} type="button" onClick={() => { setView(tab.id); setFormError(null); }} aria-current={view === tab.id ? "page" : undefined} className={`flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${view === tab.id ? "bg-[#181817] text-white shadow-sm" : "hover:bg-amber-400/10"}`}>
          {tab.id === "overview" ? <CircleCheck className="h-5 w-5 shrink-0" /> : tab.id === "propose" ? <FilePenLine className="h-5 w-5 shrink-0" /> : <Clock3 className="h-5 w-5 shrink-0" />}
          <span className="min-w-0"><span className="block text-sm font-semibold">{tab.label}</span><span className={`mt-0.5 block text-xs ${view === tab.id ? "text-white/65" : "admin-text-muted"}`}>{tab.detail}</span></span>
        </button>)}
      </nav>

      {view === "overview" && <section className="card-admin rounded-3xl p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">In effect now</p><h2 className="mt-1 text-xl font-semibold">Live policy</h2><p className="mt-1 text-sm admin-text-muted">Only this version controls new applications.</p></div><button onClick={() => live.refetch()} disabled={live.isFetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}><RefreshCw className={`h-4 w-4 ${live.isFetching ? "animate-spin" : ""}`} /> Refresh</button></div>
        {live.isLoading ? <div role="status" className="mt-7 flex items-center gap-3 text-sm admin-text-muted"><Loader2 className="h-5 w-5 animate-spin" /> Loading the active policy…</div> : live.isError ? <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p>{getLoanScreenError(live.error)}</p><button onClick={() => live.refetch()} className="mt-3 font-semibold underline">Try again</button></div> : live.data && <LivePolicySummary policy={live.data} />}
      </section>}

      {view === "propose" && canManage && <section className="card-admin rounded-3xl p-5 md:p-7">
        <div className="flex items-start gap-3"><FilePenLine className="mt-0.5 h-5 w-5 text-amber-500" /><div><h2 className="text-xl font-semibold">Propose a policy change</h2><p className="mt-1 text-sm admin-text-muted">The form starts with every active setting. Edit what needs to change; the full policy is submitted for reviewer approval.</p></div></div>
        {live.isLoading ? <div role="status" className="mt-7 flex items-center gap-3 text-sm admin-text-muted"><Loader2 className="h-5 w-5 animate-spin" /> Loading editable policy settings…</div> : live.isError ? <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p>The active policy could not be loaded, so a safe replacement cannot be prepared. {getLoanScreenError(live.error)}</p><button type="button" onClick={() => live.refetch()} className="mt-3 font-semibold underline">Try again</button></div> : live.data ? <form noValidate onSubmit={submitDraft} className="mt-7 space-y-6"><PolicyEditor policy={draft?.value ?? live.data} update={update} updateEligibility={updateEligibility} />
          {draft && <div role="status" className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><FilePenLine className="h-5 w-5 shrink-0" /><span><strong>{changes.length} setting{changes.length === 1 ? "" : "s"} changed.</strong> These edits are a draft; the live policy is unchanged.</span></div>}
          {formError && !confirmProposal && !review && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{formError}</p>}
          <div className="flex flex-wrap justify-end gap-3 border-t pt-5" style={{ borderColor: "var(--admin-border)" }}>{draft && <button type="button" onClick={() => { setDraft(null); setFormError(null); }} className="rounded-full border px-5 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Discard edits</button>}<button disabled={!draft || propose.isPending} className="rounded-full bg-[#171717] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-45">Review proposal</button></div>
        </form> : <p className="mt-6 text-sm admin-text-muted">No active policy was returned for this cooperative. A policy cannot be replaced until the backend provides its complete current settings.</p>}
      </section>}

      {view === "reviews" && canReview && <section className="card-admin rounded-3xl p-5 md:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-amber-500" /><div><h2 className="text-xl font-semibold">Pending proposals</h2><p className="mt-1 text-sm admin-text-muted">Reviews are recorded here. The backend decides whether a decision is accepted and when a proposal takes effect.</p></div></div><button onClick={() => pending.refetch()} disabled={pending.isFetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}><RefreshCw className={`h-4 w-4 ${pending.isFetching ? "animate-spin" : ""}`} /> Refresh</button></div>
        {permissions.isRootAdmin && <p className="mt-3 text-xs leading-5 admin-text-muted">RootAdmin can submit a review attempt for their own proposal in this temporary flow. Current Swagger still says self-review is prohibited, so the backend may reject the request.</p>}
        {pending.isLoading ? <Loader2 className="mt-7 h-6 w-6 animate-spin" /> : pending.isError ? <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p>{getLoanScreenError(pending.error)}</p><button onClick={() => pending.refetch()} className="mt-3 font-semibold underline">Try again</button></div> : !pending.data?.length ? <p className="mt-6 text-sm admin-text-muted">No proposals are awaiting review.</p> : <div className="mt-6 space-y-4">{pending.data.map((proposal, index) => {
          const id = readString(proposal, "changeRequestId") ?? readString(proposal, "id");
          const proposerId = readString(proposal, "proposedByUserId") ?? readString(proposal, "createdByUserId");
          const proposedPolicy = findProposedLoanPolicy(proposal);
          const ownProposal = Boolean(proposerId && proposerId === user?.id);
          return <article key={id ?? index} className="rounded-2xl border p-5" style={{ borderColor: "var(--admin-border)" }}>
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Proposal {id ? id.slice(0, 8) : index + 1}</p><p className="mt-1 text-sm admin-text-muted">Submitted {formatValue(readString(proposal, "proposedAt") ?? readString(proposal, "createdAt"))}</p>{proposedPolicy && <p className="mt-3 text-lg font-bold">Maximum amount: {amountFormat.format(proposedPolicy.maximumAmountAllowed)}</p>}{readNumber(proposal, "approvalsSoFar") != null && <p className="mt-1 text-xs admin-text-muted">{readNumber(proposal, "approvalsSoFar")} of {readNumber(proposal, "requiredApprovals") ?? "?"} approvals recorded</p>}{ownProposal && permissions.isRootAdmin && <p className="mt-1 text-xs text-amber-700">Your proposal · RootAdmin review attempt</p>}</div>
              {id && proposedPolicy && (!ownProposal || permissions.isRootAdmin) ? <div className="flex gap-2"><button onClick={() => { setReview({ id, approve: true, proposerId, policy: proposedPolicy }); setReviewNote(""); setFormError(null); }} className="rounded-full bg-[#171717] px-4 py-2 text-xs font-semibold text-white">Approve</button><button onClick={() => { setReview({ id, approve: false, proposerId, policy: proposedPolicy }); setReviewNote(""); setFormError(null); }} className="rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-700">Reject</button></div> : ownProposal && !permissions.isRootAdmin ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">Your proposal · review unavailable</span> : <span className="text-xs admin-text-muted">Review unavailable: proposal ID or full policy missing.</span>}
            </div>
            <details className="mt-4 border-t pt-4" style={{ borderColor: "var(--admin-border)" }}><summary className="cursor-pointer text-xs font-semibold admin-text-muted">Inspect complete proposal</summary><div className="mt-4"><ResponseDetails value={proposal} variant="admin" /></div></details>
          </article>;
        })}</div>}
      </section>}
    </>}

    {pendingCooperative !== null && <div role="dialog" aria-modal="true" aria-labelledby="switch-cooperative-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl border p-6 shadow-2xl" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}><h2 id="switch-cooperative-title" className="text-xl font-bold">Discard this policy draft?</h2><p className="mt-3 text-sm leading-6 admin-text-muted">You have {changes.length} unsaved change{changes.length === 1 ? "" : "s"}. Switching cooperatives will discard them. No proposal has been submitted.</p><div className="mt-6 flex gap-3"><button type="button" onClick={() => setPendingCooperative(null)} className="flex-1 rounded-full border px-4 py-3 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Keep editing</button><button type="button" onClick={() => applyCooperative(pendingCooperative)} className="flex-1 rounded-full bg-[#181817] px-4 py-3 text-sm font-semibold text-white">Discard and switch</button></div></div></div>}

    {confirmProposal && draft && <div role="dialog" aria-modal="true" aria-labelledby="policy-proposal-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border p-6 shadow-2xl" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
        <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Final check</p><h2 id="policy-proposal-title" className="mt-1 text-xl font-bold">Submit policy proposal?</h2></div><button type="button" disabled={propose.isPending} onClick={() => setConfirmProposal(false)} aria-label="Close" className="rounded-full border p-2" style={{ borderColor: "var(--admin-border)" }}><X className="h-4 w-4" /></button></div>
        <p className="mt-3 text-sm leading-6 admin-text-muted">This sends a complete replacement policy for the selected cooperative. The live rules remain unchanged until the backend receives enough independent approvals.</p>
        <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: "var(--admin-border)" }}><p className="text-xs font-semibold uppercase tracking-wider admin-text-muted">{changes.length} proposed change{changes.length === 1 ? "" : "s"}</p><dl className="mt-3 divide-y text-sm" style={{ borderColor: "var(--admin-border)" }}>{changes.map((change) => <div key={change.label} className="grid gap-1 py-3 sm:grid-cols-[1fr_1.3fr]" style={{ borderColor: "var(--admin-border)" }}><dt className="font-semibold">{change.label}</dt><dd className="break-words"><span className="admin-text-muted">{change.before}</span><span aria-hidden="true" className="mx-2 text-amber-600">→</span><strong>{change.after}</strong></dd></div>)}</dl></div>
        {formError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
        <div className="mt-6 flex gap-3"><button type="button" disabled={propose.isPending} onClick={() => setConfirmProposal(false)} className="flex-1 rounded-full border px-4 py-3 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Keep editing</button><button type="button" disabled={propose.isPending || !changes.length} onClick={() => propose.mutate()} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171717] px-4 py-3 text-sm font-semibold text-white disabled:opacity-45">{propose.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Submit proposal</button></div>
      </div>
    </div>}

    {review && <div role="dialog" aria-modal="true" aria-labelledby="policy-review-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"><form onSubmit={(event) => { event.preventDefault(); if (!reviewMutation.isPending) reviewMutation.mutate(); }} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border p-6 shadow-2xl" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}><div className="flex items-start justify-between gap-3"><h2 id="policy-review-title" className="text-xl font-bold">{review.approve ? "Approve" : "Reject"} policy proposal?</h2><button type="button" disabled={reviewMutation.isPending} onClick={() => setReview(null)} aria-label="Close" className="rounded-full border p-2" style={{ borderColor: "var(--admin-border)" }}><X className="h-4 w-4" /></button></div><p className="mt-3 text-sm admin-text-muted">Proposed maximum: {amountFormat.format(review.policy.maximumAmountAllowed)}. Your decision is recorded once; the backend controls when the policy becomes active.</p>{review.proposerId === user?.id && <p role="note" className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">You proposed this change. Swagger says self-review is not allowed; this RootAdmin attempt may be rejected by the backend.</p>}<label className="mt-5 grid gap-2 text-sm font-semibold">Review note <span className="font-normal admin-text-muted">Optional</span><textarea rows={3} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} className="input-admin rounded-xl px-4 py-3 outline-none" placeholder="Reason for your decision" /></label>{formError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}<div className="mt-6 flex gap-3"><button type="button" disabled={reviewMutation.isPending} onClick={() => setReview(null)} className="flex-1 rounded-full border px-4 py-3 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Cancel</button><button disabled={reviewMutation.isPending} className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white disabled:opacity-45 ${review.approve ? "bg-[#171717]" : "bg-red-700"}`}>{reviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirm {review.approve ? "approval" : "rejection"}</button></div></form></div>}
  </div>;
}
