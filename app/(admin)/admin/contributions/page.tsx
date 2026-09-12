"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Filter, Calendar, FileText, Check, X, Loader2, AlertCircle, ExternalLink 
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getPendingPayments,
  confirmPayment,
  rejectPayment,
  type PendingPayment,
} from "@/app/lib/payments-api";
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
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({
  payment,
  onClose,
  onConfirm,
  isPending,
}: {
  payment: PendingPayment;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#111]">Reject payment</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition">
            <X className="w-4 h-4 text-black/60" />
          </button>
        </div>
        <p className="text-sm text-black/60">
          Rejecting <strong>{fmt(payment.amount)}</strong> from{" "}
          <strong>{payment.memberName ?? payment.memberEmail ?? "Unknown"}</strong>.
          The member will be notified.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (required)…"
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:border-gray-400 transition"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={isPending} className="px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending || !reason.trim()}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContributionsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("needs-review");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingPayment | null>(null);

  // Fetch pending payments
  const { data, isLoading, error } = useQuery({
    queryKey: ["pending-payments"],
    queryFn: () => getPendingPayments({ pageSize: 100 }),
  });

  const payments = data?.items ?? [];
  const selectedPayment = payments.find((p) => p.id === selectedId) ?? null;

  // Confirm Mutation
  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmPayment(id),
    onSuccess: () => {
      toast.success("Payment confirmed. Savings credited.");
      queryClient.invalidateQueries({ queryKey: ["pending-payments"] });
      setSelectedId(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectPayment(id, { reason }),
    onSuccess: () => {
      toast.success("Payment rejected.");
      queryClient.invalidateQueries({ queryKey: ["pending-payments"] });
      setRejectTarget(null);
      setSelectedId(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div className="text-[#111110]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
            CONTRIBUTIONS
          </div>
          <h1 className="text-4xl font-medium tracking-tight">Confirm payments</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-4 py-2.5 rounded-full bg-white flex items-center gap-2 font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm">
            <Calendar className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-black/10 mb-8 overflow-x-auto hide-scrollbar">
        {[
          { id: 'needs-review', label: 'Needs review', count: payments.length },
          { id: 'confirmed', label: 'Confirmed today', count: 0 },
          { id: 'rejected', label: 'Rejected', count: 0 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedId(null); }}
            className={`pb-4 text-[15px] font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-black' : 'text-black/40 hover:text-black/70'
            }`}
          >
            {tab.label} {tab.count > 0 && <span className={activeTab === tab.id ? 'text-black' : 'text-black/40'}>- {tab.count}</span>}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        
        {/* Left List Pane */}
        <div className="flex flex-col gap-2">
          {activeTab !== 'needs-review' && (
            <div className="py-16 text-center text-black/40 font-medium bg-white/50 rounded-2xl border border-black/5 border-dashed">
              No items in this view.
            </div>
          )}

          {activeTab === 'needs-review' && isLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          )}

          {activeTab === 'needs-review' && error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{getApiErrorMessage(error)}</p>
            </div>
          )}

          {activeTab === 'needs-review' && !isLoading && !error && payments.length === 0 && (
            <div className="py-16 text-center text-black/40 font-medium bg-white/50 rounded-2xl border border-black/5 border-dashed">
              Queue is empty. No pending payments.
            </div>
          )}

          {activeTab === 'needs-review' && payments.map((payment) => (
            <div 
              key={payment.id}
              onClick={() => setSelectedId(selectedId === payment.id ? null : payment.id)}
              className={`p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors border ${
                selectedId === payment.id 
                  ? 'bg-gradient-to-r from-[#FEFBE8] to-white border-[#E8D94B]/40 shadow-sm' 
                  : 'bg-white border-transparent hover:border-black/10 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                  selectedId === payment.id ? 'bg-[#E8D94B] border-[#E8D94B] text-black' : 'border-black/20 bg-white'
                }`}>
                  {selectedId === payment.id && <Check className="w-3 h-3" strokeWidth={3} />}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-[15px] truncate">{payment.memberName ?? payment.memberEmail ?? "Unknown Member"}</div>
                  <div className="text-sm text-black/50 truncate capitalize">
                    {payment.contributionType ?? "Payment"} · {fmtDate(payment.submittedAt ?? payment.createdAt)}
                  </div>
                </div>
              </div>
              <div className="font-semibold text-[15px] shrink-0 pl-4">{fmt(payment.amount)}</div>
            </div>
          ))}
        </div>

        {/* Right Details Pane */}
        {activeTab === 'needs-review' && selectedPayment && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/5 shadow-sm xl:sticky xl:top-24 flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <div className="text-xs text-black/40 font-semibold tracking-widest mb-3 uppercase">
                {selectedPayment.referenceNumber ?? selectedPayment.id?.slice(0, 8)} · {fmtDate(selectedPayment.submittedAt ?? selectedPayment.createdAt)}
              </div>
              <div className="text-[40px] font-semibold tracking-tight mb-2">
                {fmt(selectedPayment.amount)}
              </div>
              <div className="text-[15px] text-black/60 font-medium capitalize">
                {selectedPayment.memberName ?? selectedPayment.memberEmail} — {selectedPayment.contributionType ?? "Payment"}
              </div>
            </div>

            {/* Receipt viewer box */}
            {selectedPayment.proofUrl ? (
              <a 
                href={selectedPayment.proofUrl} 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#F5F3EC] rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-black/5 group cursor-pointer hover:bg-[#ebe9e2] transition-colors relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-black/60" strokeWidth={1.5} />
                </div>
                <div className="font-medium text-[15px] mb-1 flex items-center gap-2">
                  View proof of payment <ExternalLink className="w-4 h-4" />
                </div>
                <div className="text-sm text-black/50">Uploaded by member</div>
              </a>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-black/5 border-dashed">
                <div className="text-black/40 font-medium text-sm">No proof of payment attached.</div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <span className="text-[14px] text-black/50">Bank reference</span>
                <span className="font-medium text-sm">{selectedPayment.referenceNumber ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <span className="text-[14px] text-black/50">Note</span>
                <span className="font-medium text-sm">{selectedPayment.note ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-[14px] text-black/50">Receipt</span>
                <span className="font-medium text-sm text-black/70">Auto-email on confirm</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setRejectTarget(selectedPayment)}
                disabled={confirmMutation.isPending || rejectMutation.isPending}
                className="px-6 py-4 rounded-full bg-white font-medium text-[15px] border border-black/10 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition shadow-sm disabled:opacity-50"
              >
                Reject
              </button>
              <button 
                onClick={() => confirmMutation.mutate(selectedPayment.id)}
                disabled={confirmMutation.isPending || rejectMutation.isPending}
                className="flex-1 py-4 rounded-full bg-black text-white font-medium text-[15px] hover:bg-black/80 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {confirmMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                Confirm & credit savings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          payment={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => rejectMutation.mutate({ id: rejectTarget.id, reason })}
          isPending={rejectMutation.isPending}
        />
      )}
    </div>
  );
}
