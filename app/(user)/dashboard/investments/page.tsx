import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Investments",
  description: "Manage your Kajola investments.",
};

export default function InvestmentsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 text-[#171717] pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Investments
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Investment plans set by admin. Pick one, pay to subscribe.
        </p>
      </div>

      {/* Total Invested Summary */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          TOTAL INVESTED
        </p>
        <p className="text-5xl md:text-6xl font-bold tracking-tighter mb-8">
          $ 700
        </p>

        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              RETURNS
            </p>
            <p className="text-sm font-semibold text-green-600">+ $ 0</p>
          </div>
          <div className="w-px h-8 bg-gray-100 hidden sm:block"></div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              YOY
            </p>
            <p className="text-sm font-semibold text-[#111]">—</p>
          </div>
          <div className="w-px h-8 bg-gray-100 hidden sm:block"></div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              MONTHS ACTIVE
            </p>
            <p className="text-sm font-semibold text-[#111]">5</p>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
              PLANS
            </p>
            <h2 className="text-xl font-bold">Investment plans</h2>
          </div>
          <div className="flex p-1 bg-white rounded-full self-start shadow-sm border border-gray-100">
            <button className="px-4 py-1.5 bg-[#111] text-white rounded-full text-xs font-semibold">
              All
            </button>
            <button className="px-4 py-1.5 text-gray-500 rounded-full text-xs font-semibold hover:text-black transition-colors">
              My plans
            </button>
            <button className="px-4 py-1.5 text-gray-500 rounded-full text-xs font-semibold hover:text-black transition-colors">
              Open
            </button>
            <button className="px-4 py-1.5 text-gray-500 rounded-full text-xs font-semibold hover:text-black transition-colors">
              Closed
            </button>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Plan 1 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-lg font-bold">
                    Calgary Apartments · LikeMinds Estate
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-600 flex items-center gap-1 border border-purple-100/50">
                    <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                    Subscribed
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Admin-subscribed project - fixed $700 - paid 15 Jun 2025 -
                  dividends expected Q2 2026.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors">
                  View plan
                </button>
                <button className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                  Track payout <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-4 border-t border-gray-50 pt-6">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  YOUR STAKE
                </p>
                <p className="text-sm font-semibold text-[#111]">$ 700</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  TERM
                </p>
                <p className="text-sm font-semibold text-[#111]">12 months</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  EXPECTED RETURN
                </p>
                <p className="text-sm font-semibold text-green-600">
                  12 % p.a.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  MATURES
                </p>
                <p className="text-sm font-semibold text-[#111]">30 Jun 2026</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  HOLDERS
                </p>
                <p className="text-sm font-semibold text-[#111]">86 members</p>
              </div>
            </div>
          </div>

          {/* Plan 2 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-lg font-bold">Cooperative Growth Fund</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 flex items-center gap-1 border border-green-100/50">
                    <span className="w-1 h-1 rounded-full bg-green-500"></span>
                    Starts Jan 2026
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Default monthly investment every member joins - enter any
                  amount $100 - $2,000 - pay by the 15th.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors">
                  View plan
                </button>
                <button className="px-4 py-2 rounded-full text-xs font-semibold bg-[#111] text-white hover:bg-black transition-colors flex items-center gap-1.5">
                  Make payment <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-4 border-t border-gray-50 pt-6">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  MONTHLY
                </p>
                <p className="text-sm font-semibold text-[#111]">
                  $ 100 — $ 2,000
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  TERM
                </p>
                <p className="text-sm font-semibold text-[#111]">12 months</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  EXPECTED RETURN
                </p>
                <p className="text-sm font-semibold text-green-600">
                  10 % p.a.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  FIRST DUE
                </p>
                <p className="text-sm font-semibold text-[#111]">15 Jan 2026</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  PAID SO FAR
                </p>
                <p className="text-sm font-semibold text-[#111]">$ 0</p>
              </div>
            </div>
          </div>

          {/* Plan 3 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-lg font-bold">Treasury Bills 2026</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 flex items-center gap-1 border border-green-100/50">
                    <span className="w-1 h-1 rounded-full bg-green-500"></span>
                    Open
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Principal-protected ladder - monthly coupons.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors">
                  View plan
                </button>
                <button className="px-4 py-2 rounded-full text-xs font-semibold bg-[#111] text-white hover:bg-black transition-colors flex items-center gap-1.5">
                  Join plan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 border-t border-gray-50 pt-6">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  MONTHLY
                </p>
                <p className="text-sm font-semibold text-[#111]">$ 500</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  TERM
                </p>
                <p className="text-sm font-semibold text-[#111]">6 months</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  NEXT DUE
                </p>
                <p className="text-sm font-semibold text-[#111]">¯</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  PAID SO FAR
                </p>
                <p className="text-sm font-semibold text-[#111]">$ 0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
