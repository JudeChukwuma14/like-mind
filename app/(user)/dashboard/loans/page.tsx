import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Check, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Loans",
  description: "Manage your Kajola loans.",
};

export default function LoansPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 text-[#171717] pb-10">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Loans
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            One active loan at a time. Repay your current loan to apply for a new one.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <button className="px-5 py-2.5 rounded-full text-sm font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors">
            Loan terms
          </button>
          <button className="px-5 py-2.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-400 flex items-center gap-1.5 cursor-not-allowed">
            <Lock className="w-3.5 h-3.5" /> Apply for loan
          </button>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        
        {/* Active Loan */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                  ACTIVE LOAN
                </p>
                <h2 className="text-2xl font-bold tracking-tight">School fees loan</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 flex items-center gap-1.5 border border-green-100/50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Repaying · on track
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  OUTSTANDING
                </p>
                <p className="text-3xl md:text-4xl font-bold tracking-tight">$ 520</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  NEXT REPAYMENT
                </p>
                <p className="text-xl md:text-2xl font-bold tracking-tight mb-0.5">$ 173.33</p>
                <p className="text-xs text-gray-500">Due 15 November 2025</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="w-full bg-gray-100 h-1.5 rounded-full mb-3 overflow-hidden flex">
                <div className="bg-green-600 h-full rounded-full w-[50%]"></div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 tracking-wider">
                <p>3 of 6 paid - $ 528 / $ 1,040</p>
                <p>50 %</p>
              </div>
            </div>
          </div>

            <div className="flex items-center gap-3">
              <button className="px-6 py-2.5 rounded-full text-sm font-semibold bg-[#111] text-white hover:bg-black transition-colors">
                Make repayment
              </button>
              <button className="px-6 py-2.5 rounded-full text-sm font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors">
                Schedule
              </button>
              <button className="px-4 py-2.5 rounded-full text-sm font-semibold text-gray-500 hover:text-[#111] transition-colors">
                Statement
              </button>
            </div>
        </div>

        {/* Eligibility */}
        <div className="lg:col-span-2 bg-[#111] text-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">
              ELIGIBILITY
            </p>
            <p className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              $ 6,000
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Available headroom - 3x your verified savings.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300">6+ months active membership</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300">Contributions current</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300">No defaults in past 12 months</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-6 border-t border-gray-800">
            <Lock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-500/90 font-medium">
              One active loan at a time — new applications locked
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="mb-8">
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">
            LOAN CALCULATOR
          </p>
          <h2 className="text-xl font-bold tracking-tight">Estimate before you apply</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          <div className="md:col-span-2 space-y-8">
            {/* Amount Slider */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <p className="text-sm text-gray-500 font-medium">Amount</p>
                <p className="text-xl font-bold tracking-tight">$ 1,000</p>
              </div>
              
              <div className="relative mb-2">
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full w-[25%]"></div>
                </div>
                {/* Thumb */}
                <div className="absolute top-1/2 left-[25%] -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-[3px] border-indigo-500 rounded-full shadow-sm"></div>
              </div>
              
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 tracking-wider">
                <p>$ 100</p>
                <p>$ 6,000</p>
              </div>
            </div>

            {/* Repayment Term */}
            <div>
              <p className="text-sm text-gray-500 font-medium mb-3">Repayment term</p>
              <div className="flex flex-wrap items-center gap-2">
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-500 hover:text-black">6 mo</button>
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#111] text-white">12 mo</button>
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-500 hover:text-black">18 mo</button>
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-500 hover:text-black">24 mo</button>
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-500 hover:text-black">36 mo</button>
              </div>
            </div>

            {/* Indicative Rate */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm text-gray-500">Indicative rate</p>
                <p className="text-sm font-bold tracking-tight">8 % p.a.</p>
              </div>
              <p className="text-[11px] text-gray-400 mb-2">Final rate set by admin at approval.</p>
              <div className="w-[30%] bg-green-500 h-1 rounded-full"></div>
            </div>
          </div>

          {/* Breakdown Box */}
          <div className="bg-gray-50 rounded-[20px] p-6 flex flex-col justify-between h-full border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                ESTIMATED MONTHLY
              </p>
              <p className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                $ 173
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
                  <span className="text-gray-500">Principal</span>
                  <span className="font-semibold">$ 1,000</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
                  <span className="text-gray-500">Interest (est.)</span>
                  <span className="font-semibold">$ 40</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-semibold text-[#111]">Total to repay</span>
                  <span className="font-bold text-[#111]">$ 1,040</span>
                </div>
              </div>
            </div>

            <button className="mt-8 w-full px-5 py-3 rounded-full text-xs font-semibold bg-gray-200/70 text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" /> Repay current loan to apply
            </button>
          </div>
        </div>
      </div>

      {/* Loan History Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
              APPLICATIONS
            </p>
            <h2 className="text-xl font-bold">Loan history</h2>
          </div>
          <div className="flex p-1 bg-white border border-gray-100 rounded-full self-start shadow-sm">
            <button className="px-4 py-1.5 bg-[#111] text-white rounded-full text-xs font-semibold">All</button>
            <button className="px-4 py-1.5 text-gray-500 rounded-full text-xs font-semibold hover:text-black transition-colors">Active</button>
            <button className="px-4 py-1.5 text-gray-500 rounded-full text-xs font-semibold hover:text-black transition-colors">Pending</button>
            <button className="px-4 py-1.5 text-gray-500 rounded-full text-xs font-semibold hover:text-black transition-colors">Completed</button>
          </div>
        </div>

        {/* Desktop Table Headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
          <div className="col-span-5">LOAN</div>
          <div className="col-span-2 text-right pr-4">AMOUNT</div>
          <div className="col-span-2">SUBMITTED</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-1 text-right">ACTION</div>
        </div>

        <div className="space-y-4 md:space-y-0 mt-4 md:mt-0">
          {/* History Item 1 */}
          <div className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 md:py-4 px-2 hover:bg-gray-50/50 rounded-xl transition-colors">
            
            <div className="md:col-span-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100/50 mt-0.5">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111] truncate">School fees loan · Jun 2025</p>
                <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider truncate">
                  REF #LN-2506-014 · Active · 6 mo · son's school fees
                </p>
              </div>
            </div>

            <div className="md:col-span-2 text-sm font-bold text-[#111] md:text-right md:pr-4">
              <span className="md:hidden text-gray-400 font-normal mr-2">Amount:</span>$ 1,000
            </div>
            
            <div className="md:col-span-2 text-xs text-gray-500">
              <span className="md:hidden text-gray-400 font-normal mr-2">Submitted:</span>30 Jun 2025
            </div>

            <div className="md:col-span-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-100/50">
                <span className="w-1 h-1 rounded-full bg-green-500"></span>
                Disbursed
              </span>
            </div>

            <div className="md:col-span-1 md:text-right">
              <Link href="#" className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600">
                Track
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
