"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, X, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  type WithdrawalRequest,
} from "@/app/lib/withdrawals-api";
import { getApiErrorMessage } from "@/app/lib/api-client";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function initialsFor(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = (status ?? "").toLowerCase();
  if (s === "pendingapprovals" || s === "pending") {
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-100 text-amber-700 border border-amber-200">
        PENDING
      </span>
    );
  }
  if (s === "approved") {
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
        APPROVED
      </span>
    );
  }
  if (s === "rejected") {
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-red-100 text-red-700 border border-red-200">
        REJECTED
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-gray-100 text-gray-600 border border-gray-200">
      {status ?? "UNKNOWN"}
    </span>
  );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({
  withdrawal,
  onClose,
  onConfirm,
  isPending,
}: {
  withdrawal: WithdrawalRequest;
  onClose: () => void;
  onConfirm: (note: string) => void;
  isPending: boolean;
}) {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#111]">Reject withdrawal</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition">
            <X className="w-4 h-4 text-black/60" />
          </button>
        </div>
        <p className="text-sm text-black/60">
          Rejecting <strong>{fmt(withdrawal.amount)}</strong> for{" "}
          <strong>{withdrawal.memberName ?? withdrawal.memberId}</strong>. Please leave a note for the member.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason for rejection…"
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:border-gray-400 transition"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={isPending} className="px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={isPending || !note.trim()}
            className="px-6 py-2.5 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm rejection
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Approve Modal ────────────────────────────────────────────────────────────

function ApproveModal({
  withdrawal,
  onClose,
  onConfirm,
  isPending,
}: {
  withdrawal: WithdrawalRequest;
  onClose: () => void;
  onConfirm: (note: string) => void;
  isPending: boolean;
}) {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#111]">Approve withdrawal</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition">
            <X className="w-4 h-4 text-black/60" />
          </button>
        </div>
        <p className="text-sm text-black/60">
          Approving <strong>{fmt(withdrawal.amount)}</strong> for{" "}
          <strong>{withdrawal.memberName ?? withdrawal.memberId}</strong>.
          {withdrawal.requiredApprovals && withdrawal.requiredApprovals > 1 && (
            <span className="ml-1 text-amber-600 font-medium">
              ({withdrawal.approvalRecords?.length ?? 0}/{withdrawal.requiredApprovals} approvals)
            </span>
          )}
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note (e.g. Verified balance)"
          rows={2}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:border-gray-400 transition"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={isPending} className="px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={isPending}
            className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-black/80 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WithdrawalsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<WithdrawalRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<WithdrawalRequest | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["withdrawals", statusFilter, categoryFilter],
    queryFn: () =>
      getWithdrawals({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        pageSize: 50,
      }),
  });

  const withdrawals = data?.items ?? [];
  const selectedRequest = withdrawals.find((r) => r.id === selectedId) ?? null;

  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      approveWithdrawal(id, { note }),
    onSuccess: () => {
      toast.success("Withdrawal approved successfully.");
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      setApproveTarget(null);
      setSelectedId(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      rejectWithdrawal(id, { note }),
    onSuccess: () => {
      toast.success("Withdrawal rejected.");
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      setRejectTarget(null);
      setSelectedId(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const tabs = [
    { label: "All", value: "" },
    { label: "Pending", value: "PendingApprovals" },
    { label: "Approved", value: "Approved" },
    { label: "Rejected", value: "Rejected" },
  ];

  return (
    <div className="text-[#111110]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
            WITHDRAWALS
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight">Approvals</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full bg-white border border-black/5 text-sm font-medium shadow-sm outline-none cursor-pointer"
          >
            <option value="">All categories</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="CooperativeDeduction">Cooperative Deduction</option>
          </select>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-full self-start mb-8 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setSelectedId(null); }}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
              statusFilter === tab.value
                ? "bg-[#111] text-white shadow-sm"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-6 bg-red-50 rounded-2xl border border-red-100 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{getApiErrorMessage(error)}</p>
        </div>
      )}

      {!isLoading && !error && withdrawals.length === 0 && (
        <div className="py-20 text-center text-black/40 font-medium bg-white/50 rounded-2xl border border-black/5 border-dashed">
          No withdrawal requests found.
        </div>
      )}

      {!isLoading && !error && withdrawals.length > 0 && (
        <div className="bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-black/5 bg-white text-[10px] font-semibold tracking-widest text-black/40 uppercase">
                <div className="col-span-4 pl-2">MEMBER</div>
                <div className="col-span-2">AMOUNT</div>
                <div className="col-span-2">TYPE</div>
                <div className="col-span-2">DATE</div>
                <div className="col-span-2 text-right pr-8">STATUS</div>
              </div>

              {/* Table Rows */}
              <div className="flex flex-col">
                {withdrawals.map((w) => {
                  const isSelected = selectedId === w.id;
                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedId(isSelected ? null : w.id)}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer transition-colors border-b last:border-b-0 ${
                        isSelected
                          ? "bg-amber-50/60 border-black/5"
                          : "bg-white border-black/5 hover:bg-black/[0.02]"
                      }`}
                    >
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#111] text-white flex items-center justify-center font-medium text-sm shrink-0">
                          {initialsFor(w.memberName)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[15px] truncate">
                            {w.memberName ?? w.memberId ?? "Unknown"}
                          </div>
                          <div className="text-xs text-black/50 truncate">{w.reason ?? "No reason"}</div>
                        </div>
                      </div>
                      <div className="col-span-2 text-[15px] font-semibold">{fmt(w.amount)}</div>
                      <div className="col-span-2 text-[14px] text-black/70 capitalize">
                        {w.category ?? "Withdrawal"}
                      </div>
                      <div className="col-span-2 text-[13px] text-black/50">{fmtDate(w.createdAt)}</div>
                      <div className="col-span-2 flex items-center justify-end gap-3 pr-2">
                        <StatusBadge status={w.status} />
                        <ChevronRight
                          className={`w-4 h-4 transition-colors shrink-0 ${
                            isSelected ? "text-black" : "text-black/30"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedRequest && (
        <div
          className="fixed top-0 right-0 bottom-0 z-50 flex items-center justify-center p-4"
          style={{ left: 0, marginLeft: "var(--admin-sidebar-offset, 0px)" }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          />
          <div className="relative w-full max-w-[480px] bg-white rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-black/5">
              <div className="flex justify-between items-center mb-8">
                <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">
                  WITHDRAWAL / {selectedRequest.id?.slice(0, 8)}
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition"
                >
                  <X className="w-4 h-4 text-black/60" />
                </button>
              </div>
              <div className="text-[40px] font-semibold tracking-tight mb-4">
                {fmt(selectedRequest.amount)}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-medium text-xs shrink-0">
                  {initialsFor(selectedRequest.memberName)}
                </div>
                <div>
                  <div className="font-semibold text-[15px]">
                    {selectedRequest.memberName ?? selectedRequest.memberId}
                  </div>
                  <div className="text-sm text-black/50">
                    {selectedRequest.category ?? "Withdrawal"}
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-sm text-black/50">Status</span>
                  <StatusBadge status={selectedRequest.status} />
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-sm text-black/50">Reason</span>
                  <span className="text-sm font-medium">{selectedRequest.reason ?? "—"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-sm text-black/50">Submitted</span>
                  <span className="text-sm font-medium">{fmtDate(selectedRequest.createdAt)}</span>
                </div>
                {selectedRequest.requiredApprovals && (
                  <div className="flex justify-between items-center border-b border-black/5 pb-4">
                    <span className="text-sm text-black/50">Approvals</span>
                    <span className="text-sm font-medium">
                      {selectedRequest.approvalRecords?.length ?? 0} / {selectedRequest.requiredApprovals} required
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer — only show actions on pending */}
            {(selectedRequest.status?.toLowerCase() === "pendingapprovals" ||
              selectedRequest.status?.toLowerCase() === "pending") && (
              <div className="p-6 border-t border-black/5 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setRejectTarget(selectedRequest)}
                  className="px-6 py-3 rounded-full bg-white font-medium text-sm border border-black/10 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition shadow-sm"
                >
                  Reject
                </button>
                <button
                  onClick={() => setApproveTarget(selectedRequest)}
                  className="px-8 py-3 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition shadow-sm"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approve modal */}
      {approveTarget && (
        <ApproveModal
          withdrawal={approveTarget}
          onClose={() => setApproveTarget(null)}
          onConfirm={(note) => approveMutation.mutate({ id: approveTarget.id, note })}
          isPending={approveMutation.isPending}
        />
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          withdrawal={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={(note) => rejectMutation.mutate({ id: rejectTarget.id, note })}
          isPending={rejectMutation.isPending}
        />
      )}
    </div>
  );
}
