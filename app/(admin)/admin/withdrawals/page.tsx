"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowDownToLine, ChevronRight, Loader2, Plus, RefreshCw, Search, Settings2, X } from "lucide-react";
import { approveWithdrawal, getWithdrawal, getWithdrawals, initiateDeduction, rejectWithdrawal, type WithdrawalRequest } from "@/app/lib/withdrawals-api";
import { adminApiFetch, ensureApiSuccess, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";
import { useWithdrawalPermissions } from "@/app/components/withdrawals/useWithdrawalPermissions";
import { formatWithdrawalAmount, formatWithdrawalDate, withdrawalCategory, WithdrawalStatusBadge } from "@/app/components/withdrawals/withdrawal-display";

const PAGE_SIZE = 20;
type DeductionUser = { id: string; email?: string | null; firstName?: string | null; lastName?: string | null };

function userLabel(user: DeductionUser): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || user.id;
}

function isPending(status: string | null | undefined): boolean {
  return ["pendingapprovals", "pending", "approving"].includes((status ?? "").toLowerCase());
}

function DecisionDialog({ request, approve, pending, onClose, onConfirm }: { request: WithdrawalRequest; approve: boolean; pending: boolean; onClose: () => void; onConfirm: (note: string) => void }) {
  const [note, setNote] = useState("");
  return <div role="dialog" aria-modal="true" aria-labelledby="decision-title" className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4">
    <form onSubmit={(event) => { event.preventDefault(); onConfirm(note.trim()); }} className="card-admin w-full max-w-md space-y-5 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Review request</p><h2 id="decision-title" className="mt-1 text-xl font-bold">{approve ? "Approve" : "Reject"} {withdrawalCategory(request).toLowerCase()}?</h2></div><button type="button" onClick={onClose} disabled={pending} aria-label="Close" className="rounded-full border p-2" style={{ borderColor: "var(--admin-border)" }}><X className="h-4 w-4" /></button></div>
      <p className="text-sm admin-text-muted">{formatWithdrawalAmount(request.amount)} for {request.memberName ?? request.memberEmail ?? request.memberId ?? "this member"}. {approve ? "Your approval may be one of several required." : "A rejection ends this request."}</p>
      <label className="grid gap-2 text-sm font-semibold">Review note <span className="text-xs font-normal admin-text-muted">{approve ? "Optional" : "Required for rejection"}</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} required={!approve} className="input-admin rounded-xl p-3 text-sm outline-none" placeholder="Add context for the review record" /></label>
      <div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={pending} className="rounded-full border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Cancel</button><button type="submit" disabled={pending || (!approve && !note.trim())} className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${approve ? "bg-[#171717]" : "bg-red-700"}`}>{pending && <Loader2 className="h-4 w-4 animate-spin" />} Confirm {approve ? "approval" : "rejection"}</button></div>
    </form>
  </div>;
}

function DeductionDialog({ pending, onClose, onConfirm }: { pending: boolean; onClose: () => void; onConfirm: (payload: { amountPerUser: number; reason: string; applyToAllUsers: boolean; targetUserIds: string[] }) => void }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [scope, setScope] = useState<"selected" | "all">("selected");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<DeductionUser[]>([]);
  const [confirmedAll, setConfirmedAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const users = useQuery({
    queryKey: ["deduction-user-search", searchTerm],
    queryFn: async (): Promise<DeductionUser[]> => {
      const response = await adminApiFetch<ApiEnvelope<{ items: DeductionUser[] } | DeductionUser[]>>(`/api/User/search?q=${encodeURIComponent(searchTerm)}&page=1&pageSize=10`);
      const data = ensureApiSuccess(response).data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.items)) return data.items;
      throw new Error("Member search returned an unexpected response.");
    },
    enabled: scope === "selected" && searchTerm.length >= 2,
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = Number(amount);
    const targetUserIds = selectedUsers.map((user) => user.id);
    if (!Number.isFinite(parsed) || parsed <= 0) return setError("Enter a positive amount per user.");
    if (!reason.trim()) return setError("Add a reason for this deduction.");
    if (scope === "all" && !confirmedAll) return setError("Confirm that this deduction applies to all users.");
    if (scope === "selected" && !targetUserIds.length) return setError("Select at least one user for a targeted deduction.");
    setError(null);
    onConfirm({ amountPerUser: parsed, reason: reason.trim(), applyToAllUsers: scope === "all", targetUserIds: scope === "all" ? [] : targetUserIds });
  }

  return <div role="dialog" aria-modal="true" aria-labelledby="deduction-title" className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4">
    <form onSubmit={submit} className="card-admin max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-3xl p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Administrative request</p><h2 id="deduction-title" className="mt-1 text-xl font-bold">Create a deduction</h2><p className="mt-1 text-sm admin-text-muted">This submits a request for approval; it does not immediately deduct funds.</p></div><button type="button" onClick={onClose} disabled={pending} aria-label="Close" className="rounded-full border p-2" style={{ borderColor: "var(--admin-border)" }}><X className="h-4 w-4" /></button></div>
      <label className="grid gap-1.5 text-sm font-semibold">Amount per user<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="input-admin rounded-xl px-4 py-3 text-sm outline-none" placeholder="0.00" /></label>
      <label className="grid gap-1.5 text-sm font-semibold">Reason<input value={reason} onChange={(event) => setReason(event.target.value)} className="input-admin rounded-xl px-4 py-3 text-sm outline-none" placeholder="Why is this deduction needed?" /></label>
      <fieldset className="space-y-3"><legend className="text-sm font-semibold">Who does this apply to?</legend><label className="flex items-center gap-2 text-sm"><input type="radio" name="deduction-scope" checked={scope === "selected"} onChange={() => setScope("selected")} className="accent-amber-500" /> Specific users</label><label className="flex items-center gap-2 text-sm"><input type="radio" name="deduction-scope" checked={scope === "all"} onChange={() => setScope("all")} className="accent-amber-500" /> All users</label></fieldset>
      {scope === "selected" ? <div className="space-y-3">
        <label className="grid gap-1.5 text-sm font-semibold">Find users <span className="text-xs font-normal admin-text-muted">Search by name or email, then select each user to include.</span><span className="flex gap-2"><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); setSearchTerm(searchInput.trim()); } }} className="input-admin min-w-0 flex-1 rounded-xl px-3 py-2.5 text-sm outline-none" placeholder="Name or email" /><button type="button" onClick={() => setSearchTerm(searchInput.trim())} disabled={searchInput.trim().length < 2} className="inline-flex items-center gap-1.5 rounded-xl bg-[#171717] px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-50"><Search className="h-4 w-4" /> Search</button></span></label>
        {users.isFetching && <p role="status" className="flex items-center gap-2 text-xs admin-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Searching users...</p>}
        {users.isError && <p role="alert" className="text-xs text-red-700">{getApiErrorMessage(users.error)}</p>}
        {users.isSuccess && <div className="max-h-40 overflow-y-auto rounded-xl border" style={{ borderColor: "var(--admin-border)" }}>{users.data.length ? users.data.map((user) => <button key={user.id} type="button" disabled={selectedUsers.some((selected) => selected.id === user.id)} onClick={() => setSelectedUsers((current) => [...current, user])} className="block w-full border-b px-3 py-2 text-left text-xs last:border-b-0 hover:bg-amber-400/10 disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}><span className="block font-semibold">{userLabel(user)}</span><span className="admin-text-muted">{user.email ?? user.id}</span></button>) : <p className="p-3 text-xs admin-text-muted">No users found. Try another name or email.</p>}</div>}
        {selectedUsers.length > 0 && <div className="flex flex-wrap gap-2" aria-label="Selected users">{selectedUsers.map((user) => <button key={user.id} type="button" onClick={() => setSelectedUsers((current) => current.filter((selected) => selected.id !== user.id))} className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900" aria-label={`Remove ${userLabel(user)}`}>{userLabel(user)} <X className="h-3 w-3" /></button>)}</div>}
      </div> : <label className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900"><input type="checkbox" checked={confirmedAll} onChange={(event) => setConfirmedAll(event.target.checked)} className="mt-0.5 accent-amber-600" /> I understand this request targets every user if approved.</label>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={pending} className="rounded-full border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Cancel</button><button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{pending && <Loader2 className="h-4 w-4 animate-spin" />} Submit for approval</button></div>
    </form>
  </div>;
}

export default function AdminWithdrawalsPage() {
  const queryClient = useQueryClient();
  const { user } = useAdminAuth();
  const permissions = useWithdrawalPermissions();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decision, setDecision] = useState<{ request: WithdrawalRequest; approve: boolean } | null>(null);
  const [showDeduction, setShowDeduction] = useState(false);
  const list = useQuery({ queryKey: ["withdrawals", "admin", page, status, category, onlyMine], queryFn: () => getWithdrawals({ page, pageSize: PAGE_SIZE, status: status || undefined, category: category || undefined, onlyMine }) });
  const detail = useQuery({ queryKey: ["withdrawal-detail", selectedId], queryFn: () => getWithdrawal(selectedId!), enabled: Boolean(selectedId && permissions.can("review")) });
  const request = detail.data ?? list.data?.items?.find((item) => item.id === selectedId) ?? null;
  const alreadyApproved = Boolean(detail.data?.approvalRecords?.some((record) => record.approverId === user?.id && record.status?.toLowerCase() === "approved"));
  const canDecide = permissions.can("review") && detail.isSuccess && request && isPending(request.status) && !alreadyApproved;

  const approval = useMutation({ mutationFn: ({ id, note }: { id: string; note: string }) => approveWithdrawal(id, { note }), onSuccess: () => { toast.success("Approval recorded. More approvals may still be required."); setDecision(null); queryClient.invalidateQueries({ queryKey: ["withdrawals"] }); queryClient.invalidateQueries({ queryKey: ["withdrawal-detail"] }); }, onError: (error) => toast.error(getApiErrorMessage(error)) });
  const rejection = useMutation({ mutationFn: ({ id, note }: { id: string; note: string }) => rejectWithdrawal(id, { note }), onSuccess: () => { toast.success("Request rejected."); setDecision(null); queryClient.invalidateQueries({ queryKey: ["withdrawals"] }); queryClient.invalidateQueries({ queryKey: ["withdrawal-detail"] }); }, onError: (error) => toast.error(getApiErrorMessage(error)) });
  const deduction = useMutation({ mutationFn: initiateDeduction, onSuccess: () => { toast.success("Deduction request submitted for approval."); setShowDeduction(false); setStatus("PendingApprovals"); setCategory("CooperativeDeduction"); setPage(1); queryClient.invalidateQueries({ queryKey: ["withdrawals"] }); }, onError: (error) => toast.error(getApiErrorMessage(error)) });

  function changeStatus(next: string) { setStatus(next); setPage(1); setSelectedId(null); }
  function changeCategory(next: string) { setCategory(next); setPage(1); setSelectedId(null); }
  function clearFilters() { setStatus(""); setCategory(""); setOnlyMine(false); setPage(1); setSelectedId(null); }
  const filtered = Boolean(status || category || onlyMine);

  return <div className="mx-auto max-w-7xl space-y-6 pb-14 admin-text">
    <header className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8"><div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" /><div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Money movement</p><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Withdrawals & deductions</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Review requests, track their approval progress, and manage cooperative deductions.</p></div><div className="flex flex-wrap gap-2">{permissions.can("deduct") && <button type="button" onClick={() => setShowDeduction(true)} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-300"><Plus className="h-4 w-4" /> New deduction</button>}{permissions.can("manageTiers") && <Link href="/admin/settings#withdrawal-approval-tiers" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"><Settings2 className="h-4 w-4" /> Approval tiers</Link>}</div></div></header>

    <section className="card-admin rounded-3xl p-5 md:p-6" aria-label="Request filters"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">Request queue</h2><p className="mt-1 text-sm admin-text-muted">Filter by status and request type. Open a row to inspect the full request before reviewing it.</p></div><button type="button" onClick={() => list.refetch()} disabled={list.isFetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}><RefreshCw className={`h-4 w-4 ${list.isFetching ? "animate-spin" : ""}`} /> Refresh</button></div><div className="mt-5 flex flex-wrap gap-2">{[{ label: "All", value: "" }, { label: "Pending", value: "PendingApprovals" }, { label: "Approved", value: "Approved" }, { label: "Rejected", value: "Rejected" }].map((item) => <button key={item.label} type="button" aria-pressed={status === item.value} onClick={() => changeStatus(item.value)} className={`rounded-full px-4 py-2 text-xs font-semibold ${status === item.value ? "bg-[#171717] text-white" : "border admin-text-muted hover:bg-black/5"}`} style={status === item.value ? undefined : { borderColor: "var(--admin-border)" }}>{item.label}</button>)}</div><div className="mt-5 flex flex-wrap items-end gap-4 border-t pt-5" style={{ borderColor: "var(--admin-border)" }}><label className="grid gap-1.5 text-xs font-semibold admin-text-muted">Category<select value={category} onChange={(event) => changeCategory(event.target.value)} className="input-admin min-w-52 rounded-xl px-3 py-2.5 text-sm font-medium outline-none"><option value="">All categories</option><option value="Withdrawal">Withdrawals</option><option value="CooperativeDeduction">Cooperative deductions</option></select></label><label className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium" style={{ borderColor: "var(--admin-border)" }}><input type="checkbox" checked={onlyMine} onChange={(event) => { setOnlyMine(event.target.checked); setPage(1); setSelectedId(null); }} className="h-4 w-4 accent-amber-500" /> Only mine</label>{filtered && <button type="button" onClick={clearFilters} className="pb-2 text-xs font-semibold admin-text-muted hover:underline">Clear filters</button>}</div></section>

    <section aria-label="Withdrawal and deduction results" className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">{status ? `${status === "PendingApprovals" ? "Pending" : status} requests` : "All requests"}</h2><p className="mt-1 text-xs admin-text-muted">{list.data ? `${list.data.totalCount} matching request${list.data.totalCount === 1 ? "" : "s"}` : "Withdrawal and deduction requests"}</p></div>{list.data && list.data.totalPages > 1 && <p className="text-xs admin-text-muted">Page {list.data.pageNumber} of {list.data.totalPages}</p>}</div>
      {list.isLoading ? <div role="status" className="card-admin flex items-center justify-center gap-3 rounded-3xl py-16 text-sm admin-text-muted"><Loader2 className="h-5 w-5 animate-spin" /> Loading requests…</div> : list.isError ? <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700"><p>{getApiErrorMessage(list.error)}</p><button type="button" onClick={() => list.refetch()} className="mt-3 font-semibold underline">Try again</button></div> : !list.data?.items?.length ? <div className="card-admin rounded-3xl p-10 text-center"><ArrowDownToLine className="mx-auto h-8 w-8 text-amber-500" /><h3 className="mt-3 font-semibold">No requests in this view</h3><p className="mt-2 text-sm admin-text-muted">{filtered ? "Try another filter or show all requests." : "Requests will appear here when submitted."}</p>{filtered && <button type="button" onClick={clearFilters} className="mt-4 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white">Show all requests</button>}</div> : <div className="card-admin overflow-hidden rounded-3xl"><div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b px-5 py-3 text-xs font-bold uppercase tracking-wider admin-text-muted md:grid" style={{ borderColor: "var(--admin-border)" }}><span>Member</span><span>Amount</span><span>Category</span><span>Status</span><span className="sr-only">Open</span></div><div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>{list.data.items.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className="grid w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-amber-400/5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center md:gap-4"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.memberName ?? item.memberEmail ?? item.memberId ?? "Member"}</p><p className="mt-1 truncate text-xs admin-text-muted">{formatWithdrawalDate(item.createdAt)} · {item.reason ?? "No reason provided"}</p></div><p className="text-sm font-semibold">{formatWithdrawalAmount(item.amount)}</p><p className="text-xs admin-text-muted">{withdrawalCategory(item)}</p><WithdrawalStatusBadge status={item.status} /><ChevronRight className="hidden h-4 w-4 admin-text-muted md:block" /></button>)}</div></div>}
    </section>

    {!list.isError && list.data && list.data.totalPages > 1 && <nav aria-label="Request pages" className="card-admin flex items-center justify-between gap-3 rounded-2xl p-3 text-sm"><button type="button" disabled={page <= 1 || list.isFetching} onClick={() => { setPage((value) => value - 1); setSelectedId(null); }} className="rounded-full border px-4 py-2 font-semibold disabled:opacity-40" style={{ borderColor: "var(--admin-border)" }}>Previous</button><span className="text-xs admin-text-muted">Page {list.data.pageNumber} of {list.data.totalPages}</span><button type="button" disabled={page >= list.data.totalPages || list.isFetching} onClick={() => { setPage((value) => value + 1); setSelectedId(null); }} className="rounded-full border px-4 py-2 font-semibold disabled:opacity-40" style={{ borderColor: "var(--admin-border)" }}>Next</button></nav>}

    {selectedId && <div role="dialog" aria-modal="true" aria-labelledby="request-detail-title" className="fixed inset-0 z-[60] flex justify-end bg-black/50"><div className="h-full w-full max-w-lg overflow-y-auto p-5 shadow-2xl" style={{ background: "var(--admin-surface)" }}><div className="flex items-start justify-between gap-3 border-b pb-5" style={{ borderColor: "var(--admin-border)" }}><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Request details</p><h2 id="request-detail-title" className="mt-2 text-2xl font-bold">{request ? formatWithdrawalAmount(request.amount) : "Loading…"}</h2><p className="mt-1 text-xs admin-text-muted">{selectedId}</p></div><button type="button" onClick={() => setSelectedId(null)} aria-label="Close details" className="rounded-full border p-2" style={{ borderColor: "var(--admin-border)" }}><X className="h-4 w-4" /></button></div>
      {detail.isLoading && permissions.can("review") && <p role="status" className="mt-5 flex items-center gap-2 text-sm admin-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading full request…</p>}
      {detail.isError && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>{getApiErrorMessage(detail.error)}</p><button type="button" onClick={() => detail.refetch()} className="mt-2 font-semibold underline">Retry details</button></div>}
      {request && <><dl className="mt-6 space-y-4 text-sm">{[["Member", request.memberName ?? request.memberEmail ?? request.memberId ?? "—"], ["Category", withdrawalCategory(request)], ["Status", request.status ?? "—"], ["Reason", request.reason ?? "—"], ["Submitted", formatWithdrawalDate(request.createdAt)], ["Approvals", request.requiredApprovals == null ? "—" : `${request.currentApprovals ?? request.approvalRecords?.filter((record) => record.status?.toLowerCase() === "approved").length ?? 0} of ${request.requiredApprovals}`]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b pb-3" style={{ borderColor: "var(--admin-border)" }}><dt className="admin-text-muted">{label}</dt><dd className="max-w-[65%] text-right font-medium break-words">{value}</dd></div>)}</dl>{detail.data?.approvalRecords && detail.data.approvalRecords.length > 0 && <section className="mt-7"><h3 className="text-sm font-semibold">Review history</h3><div className="mt-3 space-y-2">{detail.data.approvalRecords.map((record, index) => <div key={record.id ?? index} className="rounded-xl border p-3 text-xs" style={{ borderColor: "var(--admin-border)" }}><p className="font-semibold">{record.approverName ?? record.approverId ?? "Reviewer"} · {record.status ?? "Recorded"}</p><p className="mt-1 admin-text-muted">{formatWithdrawalDate(record.approvedAt ?? record.rejectedAt)}{record.rejectionReason ? ` · ${record.rejectionReason}` : ""}</p></div>)}</div></section>}{alreadyApproved && <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">You have already approved this request. The backend does not allow a second approval.</p>}{canDecide && <div className="mt-7 flex gap-3 border-t pt-5" style={{ borderColor: "var(--admin-border)" }}><button type="button" onClick={() => setDecision({ request, approve: false })} className="flex-1 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700">Reject</button><button type="button" onClick={() => setDecision({ request, approve: true })} className="flex-1 rounded-full bg-[#171717] px-4 py-2.5 text-sm font-semibold text-white">Approve</button></div>}</>}
    </div></div>}
    {decision && <DecisionDialog key={`${decision.request.id}-${decision.approve}`} request={decision.request} approve={decision.approve} pending={approval.isPending || rejection.isPending} onClose={() => setDecision(null)} onConfirm={(note) => decision.approve ? approval.mutate({ id: decision.request.id, note }) : rejection.mutate({ id: decision.request.id, note })} />}
    {showDeduction && <DeductionDialog pending={deduction.isPending} onClose={() => setShowDeduction(false)} onConfirm={(payload) => deduction.mutate(payload)} />}
  </div>;
}
