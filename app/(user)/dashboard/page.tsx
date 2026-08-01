import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, TrendingUp, DollarSign, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Kajola dashboard overview.",
};

export default function DashboardOverviewPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 text-[#171717] pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Good morning, Triumph.
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          April dues are unpaid. You're 2 months from full loan eligibility.
        </p>
      </div>

      {/* Top section: Total Balance & Next Due */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* TOTAL BALANCE */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between min-h-55">
          {/* Subtle gradient background effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="relative z-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              TOTAL BALANCE
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl md:text-6xl font-bold tracking-tighter">
                $ 2,700
              </span>
              <span className="text-2xl text-gray-400 font-medium">.00</span>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 mt-8">
            <button className="bg-[#111] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors">
              Make payment
            </button>
            <button className="bg-white border border-gray-200 text-[#111] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
              Withdraw
            </button>
            <button className="text-gray-500 px-4 py-2.5 rounded-full text-sm font-medium hover:text-black transition-colors">
              Statement
            </button>
          </div>
        </div>

        {/* NEXT DUE */}
        <div className="bg-[#1a1a1a] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between text-white min-h-55">
          <div>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3">
              NEXT DUE - 15 APRIL
            </p>
            <p className="text-4xl md:text-5xl font-bold tracking-tighter mb-1">
              $200
            </p>
            <p className="text-sm text-gray-400">Share capital</p>
          </div>
          <div className="mt-8">
            <button className="w-full bg-white text-[#111] px-5 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
              Pay now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* Savings */}
        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-sm text-gray-500">Savings balance</span>
          </div>
          <p className="text-3xl font-bold tracking-tight mb-4">₦ 985,000</p>
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+ $ 200 this month</span>
          </div>
        </div>

        {/* Investment */}
        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-sm text-gray-500">Investment balance</span>
          </div>
          <p className="text-3xl font-bold tracking-tight mb-4">$ 700</p>
          <div className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1.5 uppercase">
            <span className="w-full max-w-10 h-1 bg-amber-100 rounded-full overflow-hidden block">
              <span className="bg-amber-400 w-[60%] h-full block" />
            </span>
            ₦ 1,200,000 / ₦ 2,000,000 monthly cap
          </div>
        </div>

        {/* Loan */}
        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-sm text-gray-500">Loan eligibility</span>
          </div>
          <p className="text-3xl font-bold tracking-tight mb-4">$ 520</p>
          <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            Eligible · 3x savings
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        {/* Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                ACTIVITY
              </p>
              <h2 className="text-lg font-bold">Recent contributions</h2>
            </div>
            <div className="flex p-1 bg-gray-100/80 rounded-full self-start">
              <button className="px-4 py-1.5 bg-[#111] text-white rounded-full text-xs font-semibold">
                All
              </button>
              <button className="px-4 py-1.5 text-gray-500 rounded-full text-xs font-semibold hover:text-black">
                Savings
              </button>
              <button className="px-4 py-1.5 text-gray-500 rounded-full text-xs font-semibold hover:text-black">
                Investment
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Item 1 */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                APR
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111] truncate">
                  April savings contribution
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 uppercase tracking-wider">
                  REF #SAV-2684-118 · 14 Apr
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold border border-amber-100/50">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Pending review
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#111]">+ ₦ 25,000</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                MAR
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111] truncate">
                  March savings contribution
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 uppercase tracking-wider">
                  REF #SAV-2683-104 · 12 Mar
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold border border-green-100/50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Confirmed
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#111]">+ ₦ 25,000</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                APR
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111] truncate">
                  April investment contribution
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 uppercase tracking-wider">
                  REF #INV-2684-027 · 11 Apr
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold border border-green-100/50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Confirmed
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#111]">+ ₦ 1,200,000</p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                MAR
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111] truncate">
                  March investment contribution
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 uppercase tracking-wider">
                  REF #INV-2683-019 · 10 Mar
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold border border-green-100/50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Confirmed
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#111]">+ ₦ 1,000,000</p>
              </div>
            </div>

            {/* Item 5 */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                FEB
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111] truncate">
                  February savings contribution
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 uppercase tracking-wider">
                  REF #SAV-2682-091 · 09 Feb
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold border border-green-100/50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Confirmed
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#111]">+ ₦ 25,000</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium tracking-wide">
              5 of 24
            </span>
            <Link
              href="#"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View all activity <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right side group: Inbox + Share Capital */}
        <div className="space-y-4 lg:space-y-6">
          {/* Inbox */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                INBOX{" "}
                <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-sm">
                  5 NEW
                </span>
              </p>
              <Link
                href="#"
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                View all
              </Link>
            </div>

            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[#111]">
                      April dues reminder
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 font-medium">
                      2h
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500">
                    Pay by 15 April to stay current.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[#111]">
                      Loan request received
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 font-medium">
                      1d
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500">
                    Admin will review within 3 days.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[#111]">
                      March payment confirmed
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 font-medium">
                      3d
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500">
                    Receipt available in your records.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Share Capital */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-4">
              SHARE CAPITAL
            </p>
            <p className="text-xl font-bold tracking-tight mb-1">
              $2,000 of $2,000 paid
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Paid in full - + $100 registration fee
            </p>

            <div className="w-full bg-gray-100 h-1.5 rounded-full mb-3 overflow-hidden">
              <div className="bg-green-600 h-full rounded-full w-full"></div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">
                Completed 28 Dec 2024
              </p>
            </div>

            <button className="bg-[#111] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-black transition-colors">
              Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
