import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUp, ChevronDown, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Withdrawals",
  description: "Manage your Kajola withdrawals.",
};

export default function WithdrawalsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 text-[#171717] pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Withdrawals
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Pull from your savings balance. Kindly note your withdrawal is subject to admin approval.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        
        {/* Form Box */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="relative z-10 mb-8">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">
              AVAILABLE BALANCE
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-bold tracking-tighter">
                $ 2,000
              </span>
              <span className="text-xl md:text-2xl text-gray-400 font-medium">.00</span>
            </div>
          </div>

          <form className="relative z-10 space-y-6">
            
            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-[#111] mb-2">
                Withdrawal amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-xl font-bold text-[#111]">$</span>
                </div>
                <input
                  type="text"
                  defaultValue="300"
                  className="w-full pl-9 pr-20 py-4 bg-white border-2 border-indigo-200 rounded-xl text-2xl font-bold text-[#111] outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <button type="button" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-200 transition-colors">
                    MAX
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[10px] font-bold text-gray-400 tracking-wider">
                Min $ 50 · Max $ 2,000
              </p>
            </div>

            {/* Dropdowns row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#111] mb-2">
                  Reason
                </label>
                <div className="relative">
                  <select className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#111] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all appearance-none shadow-sm cursor-pointer">
                    <option>Personal · medical</option>
                    <option>Family · school fees</option>
                    <option>Personal · home repair</option>
                    <option>Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#111] mb-2">
                  Pay to Interac email
                </label>
                <div className="relative">
                  <select className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#111] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all appearance-none shadow-sm cursor-pointer">
                    <option>alex@likemind.co · INTERAC</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-start gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 mt-2">
              <div className="w-5 h-5 rounded-md bg-[#111] flex items-center justify-center shrink-0 mt-0.5 cursor-pointer shadow-sm">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <p className="text-sm text-[#111] font-medium leading-relaxed">
                I confirm the Interac email belongs to me and accept a $ 5 processing fee.
              </p>
            </div>

            <div className="pt-2">
              <button type="button" className="px-6 py-3 rounded-full text-sm font-semibold bg-[#111] text-white hover:bg-black transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                Submit request <ArrowRight className="w-4 h-4" />
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
            $ 295
          </p>
          
          <div className="space-y-4 text-sm mt-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-gray-500">Requested</span>
              <span className="font-semibold text-[#111]">$ 300</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-gray-500">Processing fee</span>
              <span className="font-semibold text-[#111]">- $ 5</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-500">Expected payout</span>
              <span className="font-semibold text-[#111]">2-3 working days</span>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">
              HISTORY
            </p>
            <h2 className="text-xl font-bold">Past requests</h2>
          </div>
          <div className="flex p-1 bg-gray-100/80 rounded-full self-start">
            <button className="px-4 py-1.5 bg-[#111] text-white rounded-full text-xs font-semibold">All</button>
            <button className="px-4 py-1.5 text-gray-500 rounded-full text-xs font-semibold hover:text-black transition-colors">Pending</button>
            <button className="px-4 py-1.5 text-gray-500 rounded-full text-xs font-semibold hover:text-black transition-colors">Paid</button>
            <button className="px-4 py-1.5 text-gray-500 rounded-full text-xs font-semibold hover:text-black transition-colors">Rejected</button>
          </div>
        </div>

        {/* Desktop Table Headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
          <div className="col-span-5">REQUEST</div>
          <div className="col-span-2">AMOUNT</div>
          <div className="col-span-2">SUBMITTED</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-1 text-right">ACTION</div>
        </div>

        <div className="space-y-4 md:space-y-0 mt-4 md:mt-0">
          
          {/* Row 1 */}
          <div className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 md:py-5 px-2 hover:bg-gray-50/50 rounded-xl transition-colors border-b border-gray-50 md:border-0 last:border-0 pb-5 md:pb-0">
            <div className="md:col-span-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/50">
                <ArrowUp className="w-5 h-5" />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-[#111] truncate">Personal · medical</p>
                <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider truncate">
                  REF #WD-2604-014 · alex@likemind.co · INTERAC
                </p>
              </div>
            </div>
            <div className="md:col-span-2 text-sm font-bold text-[#111]">
              <span className="md:hidden text-gray-400 font-normal mr-2">Amount:</span>₦ 300,000
            </div>
            <div className="md:col-span-2 text-[13px] text-gray-500">
              <span className="md:hidden text-gray-400 font-normal mr-2">Submitted:</span>14 Apr 2026
            </div>
            <div className="md:col-span-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-100/50">
                <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                Pending
              </span>
            </div>
            <div className="md:col-span-1 md:text-right">
              <Link href="#" className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600">
                Track
              </Link>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 md:py-5 px-2 hover:bg-gray-50/50 rounded-xl transition-colors border-b border-gray-50 md:border-0 last:border-0 pb-5 md:pb-0">
            <div className="md:col-span-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100/50">
                <ArrowUp className="w-5 h-5" />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-[#111] truncate">Family · school fees</p>
                <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider truncate">
                  REF #WD-2603-089 · alex@likemind.co · INTERAC
                </p>
              </div>
            </div>
            <div className="md:col-span-2 text-sm font-bold text-[#111]">
              <span className="md:hidden text-gray-400 font-normal mr-2">Amount:</span>₦ 200,000
            </div>
            <div className="md:col-span-2 text-[13px] text-gray-500">
              <span className="md:hidden text-gray-400 font-normal mr-2">Submitted:</span>02 Mar 2026
            </div>
            <div className="md:col-span-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-100/50">
                <span className="w-1 h-1 rounded-full bg-green-500"></span>
                Paid
              </span>
            </div>
            <div className="md:col-span-1 md:text-right">
              <Link href="#" className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600">
                Receipt
              </Link>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 md:py-5 px-2 hover:bg-gray-50/50 rounded-xl transition-colors border-b border-gray-50 md:border-0 last:border-0 pb-5 md:pb-0">
            <div className="md:col-span-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100/50">
                <ArrowUp className="w-5 h-5" />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-[#111] truncate">Personal · home repair</p>
                <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider truncate">
                  REF #WD-2601-083 · alex@likemind.co · INTERAC
                </p>
              </div>
            </div>
            <div className="md:col-span-2 text-sm font-bold text-[#111]">
              <span className="md:hidden text-gray-400 font-normal mr-2">Amount:</span>₦ 150,000
            </div>
            <div className="md:col-span-2 text-[13px] text-gray-500">
              <span className="md:hidden text-gray-400 font-normal mr-2">Submitted:</span>18 Jan 2026
            </div>
            <div className="md:col-span-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-100/50">
                <span className="w-1 h-1 rounded-full bg-green-500"></span>
                Paid
              </span>
            </div>
            <div className="md:col-span-1 md:text-right">
              <Link href="#" className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600">
                Receipt
              </Link>
            </div>
          </div>

          {/* Row 4 */}
          <div className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 md:py-5 px-2 hover:bg-gray-50/50 rounded-xl transition-colors border-b border-gray-50 md:border-0 last:border-0 pb-5 md:pb-0">
            <div className="md:col-span-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100/50">
                <ArrowUp className="w-5 h-5" />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-[#111] truncate">Other · personal</p>
                <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider truncate">
                  REF #WD-2512-024 · Insufficient verified balance
                </p>
              </div>
            </div>
            <div className="md:col-span-2 text-sm font-bold text-[#111]">
              <span className="md:hidden text-gray-400 font-normal mr-2">Amount:</span>₦ 90,000
            </div>
            <div className="md:col-span-2 text-[13px] text-gray-500">
              <span className="md:hidden text-gray-400 font-normal mr-2">Submitted:</span>05 Dec 2025
            </div>
            <div className="md:col-span-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-100/50">
                <span className="w-1 h-1 rounded-full bg-red-500"></span>
                Rejected
              </span>
            </div>
            <div className="md:col-span-1 md:text-right">
              <Link href="#" className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600">
                Re-request
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
