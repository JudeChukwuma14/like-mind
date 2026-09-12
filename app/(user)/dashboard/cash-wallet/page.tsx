"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Download, Plus, Loader2 } from "lucide-react";
import { getMySavings, getMyDrafts } from "@/app/lib/savings-api";
import { getApiErrorMessage } from "@/app/lib/api-client";
import { useState } from "react";

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

function getStatusBadge(status: string | null | undefined) {
  const s = status?.toLowerCase() || "unknown";
  if (s === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Confirmed
      </span>
    );
  }
  if (s === "submitted" || s === "pendingconfirmation" || s === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Pending Admin
      </span>
    );
  }
  if (s === "draft") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
        Draft
      </span>
    );
  }
  if (s === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-100">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
      {status}
    </span>
  );
}

export default function CashWalletPage() {
  const [activeTab, setActiveTab] = useState("All");

  const { data: savings, isLoading: loadingSavings, error: savingsError } = useQuery({
    queryKey: ["my-savings"],
    queryFn: () => getMySavings(),
  });

  const { data: drafts = [], isLoading: loadingDrafts, error: draftsError } = useQuery({
    queryKey: ["my-drafts"],
    queryFn: () => getMyDrafts(),
  });

  const balance = savings?.balance ?? 0;
  
  // Basic stats from drafts (using safe case-insensitive matching)
  const isStatus = (d: any, statuses: string[]) => {
    const s = (d.status || "").toLowerCase();
    return statuses.includes(s);
  };

  const confirmedCount = drafts.filter(d => isStatus(d, ["confirmed"])).length;
  const pendingCount = drafts.filter(d => isStatus(d, ["submitted", "pendingconfirmation", "pending"])).length;
  const draftCount = drafts.filter(d => isStatus(d, ["draft"])).length;

  const filteredDrafts = drafts.filter(d => {
    if (activeTab === "All") return true;
    if (activeTab === "Confirmed") return isStatus(d, ["confirmed"]);
    if (activeTab === "Pending") return isStatus(d, ["submitted", "pendingconfirmation", "pending"]);
    if (activeTab === "Drafts") return isStatus(d, ["draft"]);
    if (activeTab === "Rejected") return isStatus(d, ["rejected"]);
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      
      {/* ─── Header Section ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">
            Cash Wallet
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#111] mb-1">
            Cash wallet
          </h1>
          <p className="text-sm text-gray-500">
            Savings plans · 12 months · April 2025 – March 2026
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors text-[#111]">
            <Download size={16} />
            Statement (PDF)
          </button>
          <Link
            href="/dashboard/cash-wallet/confirm-payment"
            className="flex items-center gap-2 px-4 py-2 bg-[#111] text-white rounded-full text-sm font-medium hover:bg-black transition-colors shadow-sm"
          >
            <Plus size={16} />
            New payment
          </Link>
        </div>
      </div>

      {/* ─── Summary Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Savings Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-center relative">
          {loadingSavings && (
            <div className="absolute top-4 right-4 text-gray-300 animate-spin">
              <Loader2 size={20} />
            </div>
          )}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Total Savings (Confirmed)
          </p>
          {savingsError ? (
            <p className="text-red-500 text-sm">{getApiErrorMessage(savingsError)}</p>
          ) : (
            <>
              <h2 className="text-4xl md:text-5xl font-bold text-[#111] mb-2 tracking-tight">
                {fmt(balance)}
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Available to withdraw
              </p>
            </>
          )}
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-center relative">
          {loadingDrafts && (
            <div className="absolute top-4 right-4 text-gray-300 animate-spin">
              <Loader2 size={20} />
            </div>
          )}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
            Payments Overview
          </p>
          {draftsError ? (
             <p className="text-red-500 text-sm">{getApiErrorMessage(draftsError)}</p>
          ) : (
            <div className="flex items-start gap-8 md:gap-12">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-emerald-500 mb-1">{confirmedCount}</p>
                <p className="text-xs text-gray-500">Confirmed</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-amber-500 mb-1">{pendingCount}</p>
                <p className="text-xs text-gray-500">Pending Admin</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-[#111] mb-1">{draftCount}</p>
                <p className="text-xs text-gray-500">Drafts</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Savings Plans ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
              Savings Plans
            </p>
            <h3 className="text-xl font-bold text-[#111]">Monthly Savings</h3>
            <p className="text-sm text-gray-500">
              Everyone saves into the monthly plan. Join any other plan your admin opens.
            </p>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <span className="w-2 h-2 rounded-full border-2 border-gray-300"></span>
            Set by Admin
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-lg font-bold text-[#111]">Monthly savings plan</h4>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Required
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Standard contribution every member saves into - set by your admin.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors text-[#111]">
                View plan
              </button>
              <Link
                href="/dashboard/cash-wallet/confirm-payment"
                className="px-4 py-2 bg-[#111] text-white rounded-full text-sm font-medium hover:bg-black transition-colors"
              >
                Make payment
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Monthly
              </p>
              <p className="font-bold text-[#111]">₦ 25,000</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Frequency
              </p>
              <p className="font-bold text-[#111]">Monthly</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Your Status
              </p>
              <p className="font-bold text-emerald-600">Enrolled</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Members
              </p>
              <p className="font-bold text-[#111]">128 members</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Contributions / Drafts ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-t-2xl border-b border-gray-50 shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
              Payments
            </p>
            <h3 className="text-xl font-bold text-[#111]">Payment history & drafts</h3>
          </div>
          
          <div className="flex items-center gap-1 bg-gray-50/80 p-1 rounded-full border border-gray-100 overflow-x-auto custom-scrollbar max-w-full">
            {['All', 'Confirmed', 'Pending', 'Drafts', 'Rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-[#111] text-white shadow-sm'
                    : 'text-gray-500 hover:text-[#111] hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* List items container */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {/* Header Row (Desktop only) */}
          <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-6 py-4 bg-gray-50/50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date / Type</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount & Reference</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</p>
          </div>

          {loadingDrafts && (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
            </div>
          )}

          {!loadingDrafts && filteredDrafts.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500">
              No payments found matching this view.
            </div>
          )}

          {!loadingDrafts && filteredDrafts.map((draft, idx) => {
            // Safe parsing of type
            const typeStr = (draft as any).type ?? draft.contributionType ?? "Unknown type";
            // Safe parsing of reference
            const refStr = draft.referenceNumber || "No reference";
            
            // Format dates
            let dateTitle = "Unknown date";
            let dateSub = "";
            if (draft.createdAt) {
              try {
                const d = new Date(draft.createdAt);
                if (!isNaN(d.getTime())) {
                  dateTitle = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
                  const dayStr = d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
                  dateSub = `Created ${dayStr}`;
                }
              } catch(e) {}
            }

            const isDraft = isStatus(draft, ["draft"]);
            const isPending = isStatus(draft, ["submitted", "pendingconfirmation", "pending"]);

            return (
              <div key={draft.id || idx} className="flex flex-col md:grid md:grid-cols-[2fr_1.5fr_1.5fr_1fr] md:items-center gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                    isPending ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-gray-50 border-gray-100 text-gray-700'
                  }`}>
                    <span className="text-[10px] font-bold uppercase">
                      {dateTitle.split(' ')[0]}
                    </span>
                    <span className="text-sm font-bold">
                      {dateTitle.split(' ')[1]}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-[#111]">{typeStr}</p>
                    <p className="text-xs text-gray-500">{dateSub}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 md:mt-0 mt-2 md:pl-0 pl-16">
                  <p className="font-bold text-[#111]">{fmt(draft.amount)}</p>
                  <p className="text-xs text-gray-400 font-mono">#{refStr}</p>
                </div>

                <div className="md:mt-0 mt-2 md:pl-0 pl-16">
                  {getStatusBadge(draft.status)}
                </div>

                <div className="md:mt-0 mt-3 md:pl-0 pl-16 md:text-right">
                  {isDraft ? (
                    <Link href={`/dashboard/cash-wallet/confirm-payment?draftId=${draft.id}`} className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                      Edit Draft
                    </Link>
                  ) : (
                    <Link href="#" className="text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors">
                      View
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
          
        </div>
      </div>
      
    </div>
  );
}
