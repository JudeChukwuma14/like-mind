"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ArrowUp, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { requestWithdrawal, getWithdrawals } from "@/app/lib/withdrawals-api";
import { getMySavings } from "@/app/lib/savings-api";
import { getApiErrorMessage } from "@/app/lib/api-client";
import { useCurrentUser } from "@/app/lib/useCurrentUser";

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

function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = (status ?? "").toLowerCase();
  if (s === "pendingapprovals" || s === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-100/50">
        <span className="w-1 h-1 rounded-full bg-amber-500"></span>
        Pending
      </span>
    );
  }
  if (s === "approved" || s === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-100/50">
        <span className="w-1 h-1 rounded-full bg-green-500"></span>
        Approved
      </span>
    );
  }
  if (s === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-100/50">
        <span className="w-1 h-1 rounded-full bg-red-500"></span>
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 text-[10px] font-semibold border border-gray-100">
      <span className="w-1 h-1 rounded-full bg-gray-500"></span>
      {status ?? "Unknown"}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WithdrawalsPage() {
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const [amountStr, setAmountStr] = useState("");
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  const { data: savings } = useQuery({
    queryKey: ["my-savings"],
    queryFn: () => getMySavings(),
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["withdrawals", { onlyMine: true, status: activeTab }],
    queryFn: () =>
      getWithdrawals({
        onlyMine: true,
        status: activeTab || undefined,
        pageSize: 50,
      }),
  });

  const balance = savings?.balance?.balance ?? 0;
  const history = historyData?.items ?? [];
  
  const parsedAmount = parseFloat(amountStr.replace(/,/g, ""));
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= balance;

  const withdrawMutation = useMutation({
    mutationFn: () => requestWithdrawal({ amount: parsedAmount, reason }),
    onSuccess: () => {
      toast.success("Withdrawal requested successfully.");
      setAmountStr("");
      setReason("");
      setAgreed(false);
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["my-savings"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount) return toast.error("Please enter a valid amount within your balance.");
    if (!reason.trim()) return toast.error("Please provide a reason.");
    if (!agreed) return toast.error("Please confirm the agreement.");
    withdrawMutation.mutate();
  };

  const setMax = () => setAmountStr(balance.toString());

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-[#171717] pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Withdrawals</h1>
        <p className="mt-2 text-sm text-gray-500">
          Pull from your savings balance. Kindly note your withdrawal is subject to admin approval.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        {/* Form Box */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="relative z-10 mb-8">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">
              AVAILABLE BALANCE
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-bold tracking-tighter">
                {fmt(balance)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-[#111] mb-2">Withdrawal amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-xl font-bold text-[#111]">$</span>
                </div>
                <input
                  type="number"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-20 py-4 bg-white border-2 border-indigo-200 rounded-xl text-2xl font-bold text-[#111] outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <button type="button" onClick={setMax} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-200 transition-colors">
                    MAX
                  </button>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-[#111] mb-2">Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Personal, Medical, School Fees..."
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#111] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all shadow-sm"
              />
            </div>

            {/* Checkbox */}
            <div className="flex items-start gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 mt-2">
              <div 
                onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 cursor-pointer shadow-sm transition-colors ${agreed ? 'bg-[#111]' : 'bg-white border border-gray-300'}`}
              >
                {agreed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <p className="text-sm text-[#111] font-medium leading-relaxed" onClick={() => setAgreed(!agreed)}>
                I confirm this request is accurate and I understand it is subject to the cooperative's withdrawal policy and approval process.
              </p>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={withdrawMutation.isPending}
                className="px-6 py-3 rounded-full text-sm font-semibold bg-[#111] text-white hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {withdrawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit request <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </div>

        {/* Summary Box */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            YOU'LL RECEIVE
          </p>
          <p className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            {fmt(isNaN(parsedAmount) ? 0 : parsedAmount)}
          </p>
          
          <div className="space-y-4 text-sm mt-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-gray-500">Requested</span>
              <span className="font-semibold text-[#111]">{fmt(isNaN(parsedAmount) ? 0 : parsedAmount)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-500">Expected payout</span>
              <span className="font-semibold text-[#111]">After approval</span>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">HISTORY</p>
            <h2 className="text-xl font-bold">Past requests</h2>
          </div>
          <div className="flex p-1 bg-gray-100/80 rounded-full self-start overflow-x-auto hide-scrollbar">
            {[
              { label: "All", value: "" },
              { label: "Pending", value: "PendingApprovals" },
              { label: "Approved", value: "Approved" },
              { label: "Rejected", value: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeTab === tab.value ? "bg-[#111] text-white shadow-sm" : "text-gray-500 hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table Headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
          <div className="col-span-6">REQUEST</div>
          <div className="col-span-2">AMOUNT</div>
          <div className="col-span-2">SUBMITTED</div>
          <div className="col-span-2">STATUS</div>
        </div>

        <div className="space-y-4 md:space-y-0 mt-4 md:mt-0">
          {historyLoading && (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          )}

          {!historyLoading && history.length === 0 && (
            <div className="py-10 text-center text-sm font-medium text-gray-400">
              No withdrawal history found.
            </div>
          )}
          
          {!historyLoading && history.map((req) => (
            <div key={req.id} className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 md:py-5 px-2 hover:bg-gray-50/50 rounded-xl transition-colors border-b border-gray-50 md:border-0 last:border-0 pb-5 md:pb-0">
              <div className="md:col-span-6 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  req.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-600 border-red-100/50' :
                  req.status?.toLowerCase() === 'approved' || req.status?.toLowerCase() === 'completed' ? 'bg-green-50 text-green-600 border-green-100/50' :
                  'bg-amber-50 text-amber-600 border-amber-100/50'
                }`}>
                  <ArrowUp className="w-5 h-5" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-[#111] truncate capitalize">{req.category ?? "Withdrawal"}</p>
                  <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider truncate">
                    {req.reason ?? "No reason provided"}
                  </p>
                </div>
              </div>
              <div className="md:col-span-2 text-sm font-bold text-[#111]">
                <span className="md:hidden text-gray-400 font-normal mr-2">Amount:</span>{fmt(req.amount)}
              </div>
              <div className="md:col-span-2 text-[13px] text-gray-500">
                <span className="md:hidden text-gray-400 font-normal mr-2">Submitted:</span>{fmtDate(req.createdAt)}
              </div>
              <div className="md:col-span-2">
                <StatusBadge status={req.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
