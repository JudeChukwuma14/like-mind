import Link from "next/link";
import { 
  Download, 
  Plus, 
} from "lucide-react";

export default function CashWalletPage() {
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
            Confirm payment
          </Link>
        </div>
      </div>

      {/* ─── Summary Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Savings Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Total Savings
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#111] mb-2 tracking-tight">
            ₦ 985,000
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            Monthly contribution - ₦ 25,000
          </p>
        </div>

        {/* 12-Month Status Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
            12-Month Status
          </p>
          <div className="flex items-start gap-8 md:gap-12">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-500 mb-1">10</p>
              <p className="text-xs text-gray-500">Confirmed</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-500 mb-1">1</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[#111] mb-1">1</p>
              <p className="text-xs text-gray-500">Not paid</p>
            </div>
          </div>
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

      {/* ─── Contributions ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-t-2xl border-b border-gray-50 shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
              Contributions
            </p>
            <h3 className="text-xl font-bold text-[#111]">Monthly breakdown</h3>
          </div>
          
          <div className="flex items-center gap-1 bg-gray-50/80 p-1 rounded-full border border-gray-100 overflow-x-auto custom-scrollbar max-w-full">
            {['All', 'Confirmed', 'Pending', 'Unpaid'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  tab === 'All'
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
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Month</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount & Reference</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</p>
          </div>

          {/* Item 1 - Pending */}
          <div className="flex flex-col md:grid md:grid-cols-[2fr_1.5fr_1.5fr_1fr] md:items-center gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-amber-600 uppercase">Apr</span>
                <span className="text-sm font-bold text-amber-700">2026</span>
              </div>
              <div>
                <p className="font-bold text-[#111]">April 2026</p>
                <p className="text-xs text-gray-500">Submitted 14 Apr · Awaiting admin</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 md:mt-0 mt-2 md:pl-0 pl-16">
              <p className="font-bold text-[#111]">₦ 25,000</p>
              <p className="text-xs text-gray-400 font-mono">#SAV-2684-118</p>
            </div>

            <div className="md:mt-0 mt-2 md:pl-0 pl-16">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Pending
              </span>
            </div>

            <div className="md:mt-0 mt-3 md:pl-0 pl-16 md:text-right">
              <Link href="#" className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                Track
              </Link>
            </div>
          </div>

          {/* Item 2 - Confirmed */}
          <div className="flex flex-col md:grid md:grid-cols-[2fr_1.5fr_1.5fr_1fr] md:items-center gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Mar</span>
                <span className="text-sm font-bold text-gray-700">2026</span>
              </div>
              <div>
                <p className="font-bold text-[#111]">March 2026</p>
                <p className="text-xs text-gray-500">Confirmed 12 Mar · Receipt available</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 md:mt-0 mt-2 md:pl-0 pl-16">
              <p className="font-bold text-[#111]">₦ 25,000</p>
              <p className="text-xs text-gray-400 font-mono">#SAV-2683-184</p>
            </div>

            <div className="md:mt-0 mt-2 md:pl-0 pl-16">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Confirmed
              </span>
            </div>

            <div className="md:mt-0 mt-3 md:pl-0 pl-16 md:text-right">
              <Link href="#" className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                Receipt
              </Link>
            </div>
          </div>

          {/* Item 3 - Confirmed */}
          <div className="flex flex-col md:grid md:grid-cols-[2fr_1.5fr_1.5fr_1fr] md:items-center gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Feb</span>
                <span className="text-sm font-bold text-gray-700">2026</span>
              </div>
              <div>
                <p className="font-bold text-[#111]">February 2026</p>
                <p className="text-xs text-gray-500">Confirmed 09 Feb · Receipt available</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 md:mt-0 mt-2 md:pl-0 pl-16">
              <p className="font-bold text-[#111]">₦ 25,000</p>
              <p className="text-xs text-gray-400 font-mono">#SAV-2682-091</p>
            </div>

            <div className="md:mt-0 mt-2 md:pl-0 pl-16">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Confirmed
              </span>
            </div>

            <div className="md:mt-0 mt-3 md:pl-0 pl-16 md:text-right">
              <Link href="#" className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                Receipt
              </Link>
            </div>
          </div>
          
           {/* Item 4 - Confirmed */}
           <div className="flex flex-col md:grid md:grid-cols-[2fr_1.5fr_1.5fr_1fr] md:items-center gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Jan</span>
                <span className="text-sm font-bold text-gray-700">2026</span>
              </div>
              <div>
                <p className="font-bold text-[#111]">January 2026</p>
                <p className="text-xs text-gray-500">Confirmed 11 Jan · Receipt available</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 md:mt-0 mt-2 md:pl-0 pl-16">
              <p className="font-bold text-[#111]">₦ 25,000</p>
              <p className="text-xs text-gray-400 font-mono">#SAV-2681-073</p>
            </div>

            <div className="md:mt-0 mt-2 md:pl-0 pl-16">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Confirmed
              </span>
            </div>

            <div className="md:mt-0 mt-3 md:pl-0 pl-16 md:text-right">
              <Link href="#" className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                Receipt
              </Link>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
