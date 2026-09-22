"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, RefreshCw, ShieldCheck, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { loanKeys } from "@/app/lib/loan-keys";
import {
  getLoanApprovalTiers,
  getPendingLoanApprovalTierProposals,
  proposeLoanApprovalTiers,
  reviewLoanApprovalTierProposal,
  type LoanApprovalBand,
} from "@/app/lib/loan-governance-api";
import { getLoanScreenError } from "@/app/components/loans/loan-errors";
import { formatMoney, formatValue, isRecord, readField, readNumber, readString } from "@/app/components/loans/loan-data";
import { useLoanPermissions } from "@/app/components/loans/useLoanPermissions";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";

type Review = { id: string; approve: boolean; proposerId?: string };

function orderedTiers(tiers: LoanApprovalBand[]): LoanApprovalBand[] {
  return [...tiers].sort((a, b) => a.minAmount - b.minAmount || (a.maxAmount ?? Infinity) - (b.maxAmount ?? Infinity));
}

function numberInput(value: string): number {
  return value.trim() ? Number(value) : Number.NaN;
}

function optionalMaximum(value: string): number | null {
  return value.trim() ? Number(value) : null;
}

function maximumLabel(tier: Record<string, unknown>): string {
  return readField(tier, "maxAmount") == null ? "No upper limit" : formatMoney(readNumber(tier, "maxAmount"));
}

function validateTiers(tiers: LoanApprovalBand[]): string | null {
  if (!tiers.length) return "Add at least one approval tier.";
  for (const [index, tier] of tiers.entries()) {
    if (!Number.isFinite(tier.minAmount) || tier.minAmount < 0) return `Tier ${index + 1}: minimum amount must be zero or more.`;
    if (tier.maxAmount !== null && (!Number.isFinite(tier.maxAmount) || tier.maxAmount < tier.minAmount)) return `Tier ${index + 1}: maximum amount must be at least the minimum.`;
    if (!Number.isInteger(tier.requiredApprovals) || tier.requiredApprovals < 1) return `Tier ${index + 1}: approvals must be a positive whole number.`;
  }
  const sorted = orderedTiers(tiers);
  if (sorted[0].minAmount !== 0) return "The first tier must start at 0. Set the lowest minimum amount to 0 before proposing.";
  if (sorted.at(-1)?.maxAmount !== null) return "The last tier must be open-ended. Clear its maximum amount so loans above the highest band are covered.";
  for (let index = 1; index < sorted.length; index++) {
    const previousMaximum = sorted[index - 1].maxAmount;
    if (previousMaximum === null) return `Only the last tier can be open-ended. Set a maximum amount for tier ${index}.`;
    if (sorted[index].minAmount <= previousMaximum) return "Tier amount ranges must not overlap.";
  }
  return null;
}

export default function LoanApprovalTiersPage() {
  const queryClient = useQueryClient();
  const permissions = useLoanPermissions();
  const { user } = useAdminAuth();
  const canManage = permissions.can("approvalTiers");
  const canReview = permissions.can("reviewApprovalTierChanges");
  const [draft, setDraft] = useState<LoanApprovalBand[] | null>(null);
  const [confirmProposal, setConfirmProposal] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const live = useQuery({ queryKey: loanKeys.approvalTiers, queryFn: getLoanApprovalTiers, enabled: canManage || canReview });
  const pending = useQuery({ queryKey: loanKeys.approvalTierProposals, queryFn: getPendingLoanApprovalTierProposals, enabled: canReview });
  const working = draft ?? live.data ?? [];
  const ordered = orderedTiers(working);

  const propose = useMutation({
    mutationFn: () => {
      const validation = validateTiers(working);
      if (validation) throw new Error(validation);
      return proposeLoanApprovalTiers(orderedTiers(working));
    },
    onSuccess: async () => {
      toast.success("Approval-tier proposal submitted for review. Live tiers have not changed.");
      setConfirmProposal(false); setDraft(null);
      await queryClient.invalidateQueries({ queryKey: loanKeys.approvalTierProposals });
      await queryClient.invalidateQueries({ queryKey: loanKeys.approvalTiers });
    },
    onError: (reason) => setFormError(getLoanScreenError(reason)),
  });
  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!review) throw new Error("No proposal selected.");
      if (review.proposerId === user?.id && !permissions.isRootAdmin) throw new Error("You cannot review your own proposal.");
      return reviewLoanApprovalTierProposal(review.id, review.approve, reviewNote.trim());
    },
    onSuccess: async () => {
      toast.success(review?.approve ? "Review recorded. Check the live tiers to see whether the backend applied the change." : "Proposal rejected.");
      setReview(null); setReviewNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: loanKeys.approvalTierProposals }),
        queryClient.invalidateQueries({ queryKey: loanKeys.approvalTiers }),
      ]);
    },
    onError: (reason) => setFormError(getLoanScreenError(reason)),
  });

  function edit(index: number, patch: Partial<LoanApprovalBand>) {
    setDraft(working.map((tier, itemIndex) => itemIndex === index ? { ...tier, ...patch } : tier));
    setFormError(null);
  }

  function submitProposal(event: FormEvent) {
    event.preventDefault();
    const validation = validateTiers(working);
    if (validation) { setFormError(validation); return; }
    setFormError(null);
    setConfirmProposal(true);
  }

  return <div className="space-y-6 pb-16 admin-text"><Link href="/admin/loans" className="inline-flex items-center gap-2 text-sm font-semibold admin-text-muted"><ArrowLeft className="h-4 w-4" /> Back to loans</Link><header className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8"><div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" /><p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Loan governance</p><h1 className="relative mt-2 text-3xl font-bold tracking-tight">Approval tiers</h1><p className="relative mt-3 max-w-xl text-sm leading-6 text-white/65">See the live amount bands and propose a change for reviewer approval. The backend decides when a proposal becomes active.</p></header>

    {permissions.isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin" /></div> : permissions.error ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{getLoanScreenError(permissions.error)}</div> : !canManage && !canReview ? <div className="card-admin rounded-3xl p-10 text-center text-sm admin-text-muted">You do not have permission to manage or review loan approval tiers.</div> : <>
      <section className="card-admin rounded-3xl p-5 md:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Live approval tiers</h2><p className="mt-1 text-sm admin-text-muted">Changes are proposals until the backend applies them.</p></div><button onClick={() => live.refetch()} disabled={live.isFetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}><RefreshCw className={`h-4 w-4 ${live.isFetching ? "animate-spin" : ""}`} /> Refresh</button></div>
        {live.isLoading ? <Loader2 className="mt-7 h-6 w-6 animate-spin" /> : live.isError ? <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{getLoanScreenError(live.error)} <button onClick={() => live.refetch()} className="font-bold underline">Retry</button></div> : <form onSubmit={submitProposal} className="mt-6 space-y-5">
          <p className="text-sm leading-6 admin-text-muted">The lowest band must begin at 0. The final band must have no maximum (open-ended). Tiers are submitted from lowest to highest minimum amount, and ranges must not overlap.</p>
          {ordered.length > 0 && Number.isFinite(ordered[0].minAmount) && ordered[0].minAmount !== 0 && <p role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">The lowest tier currently starts at {formatMoney(ordered[0].minAmount)}. Change its minimum to 0 before proposing.</p>}
          {ordered.length > 0 && ordered[ordered.length - 1].maxAmount !== null && <p role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">The final tier currently ends at {formatMoney(ordered[ordered.length - 1].maxAmount ?? undefined)}. Clear its maximum amount, or use “Make final tier open-ended” below.</p>}
          <div className="grid gap-3">{working.length ? working.map((tier, index) => <div key={tier.id ?? index} className="rounded-2xl border p-4" style={{ borderColor: "var(--admin-border)" }}>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-600">Tier {index + 1}{tier === ordered[ordered.length - 1] ? " · Final band" : ""}</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <label className="grid gap-1.5 text-xs font-semibold admin-text-muted">Minimum amount<input type="number" min="0" step="any" value={Number.isFinite(tier.minAmount) ? tier.minAmount : ""} disabled={!canManage} onChange={(event) => edit(index, { minAmount: numberInput(event.target.value) })} className="input-admin min-w-0 rounded-xl px-3 py-2.5 text-sm disabled:opacity-60" /></label>
              <label className="grid gap-1.5 text-xs font-semibold admin-text-muted">Maximum amount<input type="number" min="0" step="any" value={tier.maxAmount !== null && Number.isFinite(tier.maxAmount) ? tier.maxAmount : ""} disabled={!canManage} onChange={(event) => edit(index, { maxAmount: optionalMaximum(event.target.value) })} placeholder="No upper limit" className="input-admin min-w-0 rounded-xl px-3 py-2.5 text-sm disabled:opacity-60" /></label>
              <label className="grid gap-1.5 text-xs font-semibold admin-text-muted">Required approvals<input type="number" min="1" step="1" value={Number.isFinite(tier.requiredApprovals) ? tier.requiredApprovals : ""} disabled={!canManage} onChange={(event) => edit(index, { requiredApprovals: numberInput(event.target.value) })} className="input-admin min-w-0 rounded-xl px-3 py-2.5 text-sm disabled:opacity-60" /></label>
              {canManage && <button type="button" onClick={() => { setDraft(working.filter((_, itemIndex) => itemIndex !== index)); setFormError(null); }} className="self-end rounded-xl border border-red-200 p-3 text-red-600" aria-label={`Remove tier ${index + 1}`}><Trash2 className="h-4 w-4" /></button>}
            </div>
          </div>) : <p className="rounded-2xl border border-dashed p-8 text-center text-sm admin-text-muted" style={{ borderColor: "var(--admin-border)" }}>No live tiers returned. Add a first tier starting at 0.</p>}</div>
          {canManage && <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setDraft([...working, { minAmount: working.length ? Number.NaN : 0, maxAmount: null, requiredApprovals: 1 }]); setFormError(null); }} className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}><Plus className="h-4 w-4" /> Add tier</button>{working.length > 1 && <button type="button" onClick={() => { setDraft(orderedTiers(working)); setFormError(null); }} className="rounded-full border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Sort by amount</button>}{ordered.length > 0 && ordered[ordered.length - 1].maxAmount !== null && <button type="button" onClick={() => { const finalTier = ordered[ordered.length - 1]; setDraft(working.map((tier) => tier === finalTier ? { ...tier, maxAmount: null } : tier)); setFormError(null); }} className="rounded-full border border-amber-400 px-4 py-2.5 text-sm font-semibold text-amber-700">Make final tier open-ended</button>}</div>
            <div className="flex gap-2">{draft && <button type="button" onClick={() => { setDraft(null); setFormError(null); }} className="rounded-full border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Discard</button>}<button disabled={!draft || propose.isPending} className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Propose changes</button></div>
          </div>}
          {formError && !confirmProposal && !review && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
        </form>}
      </section>

      {canReview && <section className="card-admin rounded-3xl p-5 md:p-7">
        <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-amber-500" /><h2 className="text-xl font-semibold">Pending proposals</h2></div>
        {permissions.isRootAdmin && <p className="mt-3 text-xs leading-5 admin-text-muted">RootAdmin can submit a review attempt for their own proposal in this temporary flow. The current API documentation still says self-review is prohibited; the server decides whether to accept it and whether the approval threshold is met.</p>}
        {pending.isLoading ? <Loader2 className="mt-7 h-6 w-6 animate-spin" /> : pending.isError ? <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{getLoanScreenError(pending.error)} <button onClick={() => pending.refetch()} className="font-bold underline">Retry</button></div> : !pending.data?.length ? <p className="mt-5 text-sm admin-text-muted">No proposals are waiting for review.</p> : <div className="mt-5 space-y-3">{pending.data.map((proposal, index) => {
          const id = readString(proposal, "id");
          const proposer = readString(proposal, "proposedByUserId");
          const ownProposal = Boolean(proposer && proposer === user?.id);
          const proposedTiers = readField(proposal, "proposedTiers");
          return <article key={id ?? index} className="rounded-2xl border p-5" style={{ borderColor: "var(--admin-border)" }}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Proposal {id ? id.slice(0, 8) : index + 1}</p><p className="mt-1 text-sm admin-text-muted">Submitted {formatValue(readString(proposal, "proposedAt"))}</p><p className="mt-1 text-xs admin-text-muted">{readNumber(proposal, "approvalsSoFar") ?? "—"} approvals so far · {readNumber(proposal, "requiredApprovals") ?? "—"} required</p>{ownProposal && permissions.isRootAdmin && <p className="mt-1 text-xs text-amber-700">Your proposal · RootAdmin review attempt</p>}</div>{id && (!ownProposal || permissions.isRootAdmin) ? <div className="flex gap-2"><button onClick={() => { setReview({ id, approve: true, proposerId: proposer }); setFormError(null); }} className="rounded-full bg-[#171717] px-4 py-2 text-xs font-semibold text-white">Approve</button><button onClick={() => { setReview({ id, approve: false, proposerId: proposer }); setFormError(null); }} className="rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-700">Reject</button></div> : ownProposal ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Your proposal · review unavailable</span> : <span className="text-xs admin-text-muted">Review unavailable: proposal ID missing.</span>}</div>
            {Array.isArray(proposedTiers) && <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{proposedTiers.filter(isRecord).map((tier, tierIndex) => <div key={tierIndex} className="rounded-xl border p-3 text-xs" style={{ borderColor: "var(--admin-border)" }}><p className="font-semibold">{formatMoney(readNumber(tier, "minAmount"))} – {maximumLabel(tier)}</p><p className="mt-1 admin-text-muted">{readNumber(tier, "requiredApprovals") ?? "—"} approvals</p></div>)}</div>}
          </article>;
        })}</div>}
      </section>}
    </>}

    {confirmProposal && <div role="dialog" aria-modal="true" aria-labelledby="proposal-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4"><div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border p-6 shadow-2xl" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
      <h2 id="proposal-title" className="text-xl font-bold">Submit tier proposal?</h2>
      <p className="mt-2 text-sm leading-6 admin-text-muted">Review the bands in the order they will be sent. This proposal does not replace live tiers until the backend approval process completes.</p>
      <ol className="mt-5 space-y-2">{ordered.map((tier, index) => <li key={tier.id ?? index} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm" style={{ borderColor: "var(--admin-border)" }}><span className="font-semibold">Tier {index + 1}: {formatMoney(tier.minAmount)} – {tier.maxAmount === null ? "No upper limit" : formatMoney(tier.maxAmount)}</span><span className="admin-text-muted">{tier.requiredApprovals} approval{tier.requiredApprovals === 1 ? "" : "s"}</span></li>)}</ol>
      {formError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
      <div className="mt-6 flex gap-3"><button type="button" disabled={propose.isPending} onClick={() => setConfirmProposal(false)} className="flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Keep editing</button><button type="button" disabled={propose.isPending} onClick={() => propose.mutate()} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171717] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{propose.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Submit proposal</button></div>
    </div></div>}

    {review && <div role="dialog" aria-modal="true" aria-labelledby="review-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4"><form onSubmit={(event) => { event.preventDefault(); if (!reviewMutation.isPending) reviewMutation.mutate(); }} className="w-full max-w-md rounded-3xl border p-6 shadow-2xl" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}><div className="flex items-start justify-between"><h2 id="review-title" className="text-xl font-bold">{review.approve ? "Approve" : "Reject"} proposal?</h2><button type="button" disabled={reviewMutation.isPending} onClick={() => setReview(null)} aria-label="Close" className="rounded-full border p-2" style={{ borderColor: "var(--admin-border)" }}><X className="h-4 w-4" /></button></div><p className="mt-2 text-sm admin-text-muted">Your decision is recorded once. The backend controls the approval threshold.</p>{review.proposerId === user?.id && <p role="note" className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">You proposed this change. Swagger says self-review is not allowed; this RootAdmin attempt may be rejected by the backend.</p>}<label className="mt-5 grid gap-2 text-sm font-semibold">Note <span className="font-normal admin-text-muted">Optional</span><textarea rows={3} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} className="input-admin rounded-xl px-4 py-3 outline-none" /></label>{formError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}<div className="mt-6 flex gap-3"><button type="button" disabled={reviewMutation.isPending} onClick={() => setReview(null)} className="flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Cancel</button><button disabled={reviewMutation.isPending} className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${review.approve ? "bg-[#171717]" : "bg-red-700"}`}>{reviewMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Confirm</button></div></form></div>}
  </div>;
}
