"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Info, Loader2, Mail, Phone, Plus, Settings2, ShieldCheck, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { adminApiFetch, getApiErrorMessage } from "@/app/lib/api-client";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";
import { pluckMember, formatDate } from "@/app/lib/member-profile";
import { getWithdrawalApprovalTiers, updateWithdrawalApprovalTiers, type ApprovalTier } from "@/app/lib/withdrawal-tiers-api";
import { getLoanDisbursementTiers, updateLoanDisbursementTiers } from "@/app/lib/loan-api";
import { useLoanPermissions } from "@/app/components/loans/useLoanPermissions";
import { useWithdrawalPermissions } from "@/app/components/withdrawals/useWithdrawalPermissions";
import { formatWithdrawalAmount } from "@/app/components/withdrawals/withdrawal-display";

type TierDraft = { minAmount: string; maxAmount: string; requiredApprovals: string };

function toDraft(tier: ApprovalTier): TierDraft {
  return { minAmount: String(tier.minAmount), maxAmount: tier.maxAmount == null ? "" : String(tier.maxAmount), requiredApprovals: String(tier.requiredApprovals) };
}

function validateTiers(rows: TierDraft[], allowOpenEnded: boolean): ApprovalTier[] {
  if (!rows.length) throw new Error("Add at least one approval tier before saving.");
  const tiers = rows.map((row, index) => {
    const minAmount = Number(row.minAmount);
    const maxAmount = row.maxAmount.trim() === "" && allowOpenEnded ? null : Number(row.maxAmount);
    const requiredApprovals = Number(row.requiredApprovals);
    if (!row.minAmount.trim() || !Number.isFinite(minAmount) || minAmount < 0) throw new Error(`Tier ${index + 1}: enter a non-negative minimum amount.`);
    if ((!allowOpenEnded && !row.maxAmount.trim()) || (maxAmount !== null && (!Number.isFinite(maxAmount) || maxAmount < minAmount))) throw new Error(`Tier ${index + 1}: enter a maximum amount that is not below the minimum.`);
    if (!row.requiredApprovals.trim() || !Number.isInteger(requiredApprovals) || requiredApprovals < 1) throw new Error(`Tier ${index + 1}: required approvals must be a whole number of at least 1.`);
    return { minAmount, maxAmount, requiredApprovals };
  }).sort((a, b) => a.minAmount - b.minAmount);
  for (let index = 1; index < tiers.length; index++) {
    const previous = tiers[index - 1];
    if (previous.maxAmount === null || tiers[index].minAmount <= previous.maxAmount) throw new Error(`Tier ${index + 1} overlaps the previous amount range. Keep ranges separate and open-ended tiers last.`);
  }
  return tiers;
}

function TierEditor({ id, title, description, queryKey, load, save, allowOpenEnded, canManage, permissionLoading }: {
  id: string;
  title: string;
  description: string;
  queryKey: string;
  load: () => Promise<ApprovalTier[]>;
  save: (tiers: ApprovalTier[]) => Promise<unknown>;
  allowOpenEnded: boolean;
  canManage: boolean;
  permissionLoading: boolean;
}) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: [queryKey], queryFn: load, enabled: canManage });
  const [draft, setDraft] = useState<TierDraft[] | null>(null);
  const [confirm, setConfirm] = useState<ApprovalTier[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rows = draft ?? (query.data ?? []).map(toDraft);
  const mutation = useMutation({
    mutationFn: save,
    onSuccess: async () => {
      toast.success(`${title} updated.`);
      setConfirm(null); setDraft(null); setError(null);
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (reason) => setError(getApiErrorMessage(reason)),
  });

  function update(index: number, field: keyof TierDraft, value: string) {
    setDraft(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
    setError(null);
  }

  function reviewChanges() {
    try { setConfirm(validateTiers(rows, allowOpenEnded)); setError(null); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Check the tier amounts and try again."); }
  }

  return <section id={id} className="card-admin scroll-mt-6 rounded-3xl p-5 md:p-7" aria-labelledby={`${id}-title`}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Approval rules</p><h2 id={`${id}-title`} className="mt-1 text-xl font-bold">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 admin-text-muted">{description}</p></div>{canManage && <button type="button" onClick={() => { setDraft([...rows, { minAmount: "0", maxAmount: "", requiredApprovals: "1" }]); setError(null); }} disabled={mutation.isPending || query.isLoading || query.isError} className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}><Plus className="h-4 w-4" /> Add tier</button>}</div>
    <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>{allowOpenEnded ? "Saving replaces the full tier list. Withdrawal approval changes apply to new requests; existing requests keep the approval count assigned when submitted." : "Saving replaces the full tier list. Review every amount band before applying changes to future loan disbursement requests."}</p></div>
    {permissionLoading ? <p role="status" className="mt-6 flex items-center gap-2 text-sm admin-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Checking access…</p> : !canManage ? <p className="mt-6 text-sm admin-text-muted">You do not have permission to manage these approval tiers.</p> : query.isLoading ? <p role="status" className="mt-6 flex items-center gap-2 text-sm admin-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading tiers…</p> : query.isError ? <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>{getApiErrorMessage(query.error)}</p><button type="button" onClick={() => query.refetch()} className="mt-2 font-semibold underline">Retry</button></div> : <>
      {rows.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed p-8 text-center text-sm admin-text-muted" style={{ borderColor: "var(--admin-border)" }}>No tiers configured. Add one to define approval requirements.</div> : <div className="mt-6 space-y-3">{rows.map((row, index) => <div key={index} className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(7rem,0.7fr)_auto] md:items-end" style={{ borderColor: "var(--admin-border)" }}><label className="grid gap-1.5 text-xs font-semibold admin-text-muted">Minimum amount<input type="number" min="0" step="0.01" value={row.minAmount} onChange={(event) => update(index, "minAmount", event.target.value)} className="input-admin w-full rounded-xl px-3 py-2.5 text-sm outline-none" /></label><label className="grid gap-1.5 text-xs font-semibold admin-text-muted">Maximum amount {allowOpenEnded && <span className="font-normal">(blank = no limit)</span>}<input type="number" min="0" step="0.01" value={row.maxAmount} onChange={(event) => update(index, "maxAmount", event.target.value)} placeholder={allowOpenEnded ? "No upper limit" : "Enter amount"} className="input-admin w-full rounded-xl px-3 py-2.5 text-sm outline-none" /></label><label className="grid gap-1.5 text-xs font-semibold admin-text-muted">Approvals<input type="number" min="1" step="1" value={row.requiredApprovals} onChange={(event) => update(index, "requiredApprovals", event.target.value)} className="input-admin w-full rounded-xl px-3 py-2.5 text-sm outline-none" /></label><button type="button" onClick={() => { setDraft(rows.filter((_, rowIndex) => rowIndex !== index)); setError(null); }} aria-label={`Remove tier ${index + 1}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-700"><Trash2 className="h-4 w-4" /></button></div>)}</div>}
      {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {draft && <div className="mt-6 flex flex-wrap justify-end gap-3 border-t pt-5" style={{ borderColor: "var(--admin-border)" }}><button type="button" onClick={() => { setDraft(null); setError(null); }} disabled={mutation.isPending} className="rounded-full border px-5 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Discard edits</button><button type="button" onClick={reviewChanges} disabled={mutation.isPending} className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Review changes</button></div>}
    </>}
    {confirm && <div role="dialog" aria-modal="true" aria-labelledby={`${id}-confirm-title`} className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4"><div className="card-admin max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-6 shadow-2xl"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Replace configuration</p><h3 id={`${id}-confirm-title`} className="mt-1 text-xl font-bold">Save {title.toLowerCase()}?</h3></div><button type="button" onClick={() => setConfirm(null)} disabled={mutation.isPending} aria-label="Close" className="rounded-full border p-2" style={{ borderColor: "var(--admin-border)" }}><X className="h-4 w-4" /></button></div><p className="mt-3 text-sm admin-text-muted">The backend will replace the complete tier list with these {confirm.length} range{confirm.length === 1 ? "" : "s"}.</p><ol className="mt-5 space-y-2">{confirm.map((tier, index) => <li key={index} className="flex justify-between gap-3 rounded-xl border p-3 text-xs" style={{ borderColor: "var(--admin-border)" }}><span>{formatWithdrawalAmount(tier.minAmount)} – {tier.maxAmount == null ? "No upper limit" : formatWithdrawalAmount(tier.maxAmount)}</span><strong>{tier.requiredApprovals} approval{tier.requiredApprovals === 1 ? "" : "s"}</strong></li>)}</ol>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setConfirm(null)} disabled={mutation.isPending} className="rounded-full border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Keep editing</button><button type="button" onClick={() => mutation.mutate(confirm)} disabled={mutation.isPending} className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save tiers</button></div></div></div>}
  </section>;
}

function MyAccountCard() {
  const { user } = useAdminAuth();
  const staff = useQuery({ queryKey: ["admin-my-staff-profile", user?.id], queryFn: async () => { const response = await adminApiFetch<unknown>(`/api/User/GetStaffById?userId=${encodeURIComponent(user!.id!)}`); return pluckMember(response); }, enabled: Boolean(user?.id) });
  const name = staff.data ? [staff.data.basicInfo?.firstName, staff.data.basicInfo?.lastName].filter(Boolean).join(" ") || staff.data.email : user?.name || user?.email;
  const initials = (name ?? "?").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
  return <section id="my-account" className="card-admin scroll-mt-6 rounded-3xl p-5 md:p-7"><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Identity</p><h2 className="mt-1 text-xl font-bold">My account</h2><p className="mt-1 text-sm admin-text-muted">Your signed-in admin identity and staff profile.</p>{staff.isLoading && <p role="status" className="mt-5 flex items-center gap-2 text-sm admin-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading profile…</p>}{staff.isError && <div role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">Staff profile could not be loaded: {getApiErrorMessage(staff.error)}. Your login details are shown below.</div>}<div className="mt-6 flex flex-wrap items-start gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-lg font-bold text-black">{initials}</span><div className="min-w-0 space-y-2"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{name || "Admin account"}</p>{user?.role && <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-700">{user.role.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>}</div><p className="flex items-center gap-2 text-sm admin-text-muted"><Mail className="h-4 w-4" /> {staff.data?.email ?? user?.email ?? "—"}</p>{staff.data?.contact?.phoneNumber && <p className="flex items-center gap-2 text-sm admin-text-muted"><Phone className="h-4 w-4" /> {staff.data.contact.phoneNumber}</p>}{staff.data && <p className="flex items-center gap-2 text-xs admin-text-muted"><ShieldCheck className="h-4 w-4" /> {staff.data.isVerified ? "Verified" : "Not verified"} · Joined {formatDate(staff.data.createdAt)}</p>}</div></div></section>;
}

export function SettingsClient() {
  const withdrawalPermissions = useWithdrawalPermissions();
  const loanPermissions = useLoanPermissions();
  return <div className="mx-auto max-w-6xl space-y-6 pb-14 admin-text">
    <header className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8"><div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Administration</p><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">System settings</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Review your account and manage approval rules backed by the live API. Changes to tier lists are reviewed before you save them.</p></div></header>
    <nav aria-label="Settings sections" className="grid gap-3 sm:grid-cols-3">{[{ href: "#my-account", title: "My account", detail: "Identity and profile" }, { href: "#withdrawal-approval-tiers", title: "Withdrawal approvals", detail: "Withdrawal and deduction bands" }, { href: "#loan-disbursement-tiers", title: "Loan disbursement", detail: "Disbursement approval bands" }].map((item) => <a key={item.href} href={item.href} className="card-admin flex items-center justify-between gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-sm"><span><strong className="text-sm">{item.title}</strong><span className="mt-1 block text-xs admin-text-muted">{item.detail}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-amber-600" /></a>)}</nav>
    <MyAccountCard />
    <TierEditor id="withdrawal-approval-tiers" title="Withdrawal approval tiers" description="Set the amount bands and distinct approvals required for new withdrawal or cooperative-deduction requests." queryKey="withdrawal-approval-tiers" load={getWithdrawalApprovalTiers} save={updateWithdrawalApprovalTiers} allowOpenEnded canManage={withdrawalPermissions.can("manageTiers")} permissionLoading={withdrawalPermissions.isLoading} />
    <TierEditor id="loan-disbursement-tiers" title="Loan disbursement tiers" description="Set the amount bands and approval counts used by new loan disbursement requests." queryKey="loan-disbursement-tiers" load={getLoanDisbursementTiers} save={(tiers) => updateLoanDisbursementTiers(tiers.map((tier) => ({ minAmount: tier.minAmount, maxAmount: tier.maxAmount!, requiredApprovals: tier.requiredApprovals })))} allowOpenEnded={false} canManage={loanPermissions.can("approvalTiers")} permissionLoading={loanPermissions.isLoading} />
    <p className="flex items-start gap-2 rounded-2xl border p-4 text-xs leading-5 admin-text-muted" style={{ borderColor: "var(--admin-border)" }}><Settings2 className="mt-0.5 h-4 w-4 shrink-0" /> General platform fields, feature switches, and destructive actions are not shown until their backend contracts and save flows exist.</p>
  </div>;
}
