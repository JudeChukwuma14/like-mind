import type { Metadata } from "next";
import { Settings, Clock, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Manage your Kajola notifications.",
};

export default function NotificationsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 text-[#171717] pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Notifications
        </h1>
        <div className="flex items-center gap-4 self-start sm:self-auto">
          <button className="px-5 py-2 rounded-full text-xs font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors shadow-sm">
            Mark all read
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#111] transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 md:gap-1 p-1 bg-white/50 border border-gray-200/60 rounded-full w-fit">
        <button className="px-4 py-1.5 bg-[#111] text-white rounded-full text-[11px] font-semibold flex items-center gap-1.5">
          All{" "}
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
            6
          </span>
        </button>
        <button className="px-4 py-1.5 text-gray-500 hover:text-[#111] rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-colors">
          Payments{" "}
          <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px]">
            3
          </span>
        </button>
        <button className="px-4 py-1.5 text-gray-500 hover:text-[#111] rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-colors">
          Loans{" "}
          <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px]">
            2
          </span>
        </button>
        <button className="px-4 py-1.5 text-gray-500 hover:text-[#111] rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-colors">
          Withdrawals{" "}
          <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px]">
            0
          </span>
        </button>
        <button className="px-4 py-1.5 text-gray-500 hover:text-[#111] rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-colors">
          Account{" "}
          <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px]">
            2
          </span>
        </button>
      </div>

      <div className="space-y-10 pt-4">
        {/* TODAY SECTION */}
        <section>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 pl-4">
            TODAY
          </p>
          <div className="space-y-3">
            {/* Notification 1 */}
            <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="mt-4 shrink-0">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/50 mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-[#111]">
                      November dues window
                    </p>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
                      Payment
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500">
                    Pay $ 200 between 28 - 30 November to keep your savings
                    status current.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-6 ml-10 md:ml-0 border-t border-gray-50 pt-4 md:pt-0 md:border-0 shrink-0">
                <span className="text-[11px] font-semibold text-gray-400">
                  2h ago
                </span>
                <button className="px-5 py-2 rounded-full text-xs font-semibold bg-[#111] text-white hover:bg-black transition-colors">
                  Pay now
                </button>
              </div>
            </div>

            {/* Notification 2 */}
            <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="mt-4 shrink-0">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/50 mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-[#111]">
                      Loan repayment due 15 Nov
                    </p>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
                      Loan
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500">
                    School fees loan instalment $ 173.33 due 15 November - 3 of
                    6 paid.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-6 ml-10 md:ml-0 border-t border-gray-50 pt-4 md:pt-0 md:border-0 shrink-0">
                <span className="text-[11px] font-semibold text-gray-400">
                  5h ago
                </span>
                <button className="px-5 py-2 rounded-full text-xs font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors">
                  Track
                </button>
              </div>
            </div>

            {/* Notification 3 */}
            <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="mt-4 shrink-0">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100/50 mt-1">
                  <Check className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-[#111]">
                      October payment confirmed
                    </p>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-600 border border-green-100 uppercase tracking-wider">
                      Payment
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500">
                    Receipt #SAV-2510-078 for $ 200 is ready to download.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-6 ml-10 md:ml-0 border-t border-gray-50 pt-4 md:pt-0 md:border-0 shrink-0">
                <span className="text-[11px] font-semibold text-gray-400">
                  1d ago
                </span>
                <button className="px-5 py-2 rounded-full text-xs font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors">
                  Receipt
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* EARLIER THIS WEEK SECTION */}
        <section>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 pl-4">
            EARLIER THIS WEEK
          </p>
          <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Notification 4 */}
            <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50">
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 shrink-0 opacity-0 mt-4"></div>{" "}
                {/* Spacer for dot alignment */}
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/50 mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-[#111]">
                      Loan repayment confirmed
                    </p>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
                      Withdrawal
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500">
                    $ 173.33 instalment received 15 Oct - 3 of 6 paid.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-6 ml-10 md:ml-0 border-t border-gray-50 pt-4 md:pt-0 md:border-0 shrink-0">
                <span className="text-[11px] font-semibold text-gray-400">
                  15 Oct
                </span>
                <button className="px-5 py-2 rounded-full text-xs font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors">
                  Track
                </button>
              </div>
            </div>

            {/* Notification 5 */}
            <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50">
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 shrink-0 opacity-0 mt-4"></div>
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100/50 mt-1">
                  <Check className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-[#111]">
                      Investment receipt available
                    </p>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-600 border border-green-100 uppercase tracking-wider">
                      Payment
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500">
                    $ 700 Calgary Apartments investment confirmed - June 2025.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-6 ml-10 md:ml-0 border-t border-gray-50 pt-4 md:pt-0 md:border-0 shrink-0">
                <span className="text-[11px] font-semibold text-gray-400">
                  15 Jun
                </span>
                <button className="px-5 py-2 rounded-full text-xs font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors">
                  Receipt
                </button>
              </div>
            </div>

            {/* Notification 6 */}
            <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 shrink-0 opacity-0 mt-4"></div>
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100/50 mt-1">
                  <Check className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-[#111]">
                      September payment confirmed
                    </p>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-600 border border-green-100 uppercase tracking-wider">
                      Loan
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500">
                    Receipt #SAV-2509-069 for $ 200 ready to download.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-6 ml-10 md:ml-0 border-t border-gray-50 pt-4 md:pt-0 md:border-0 shrink-0">
                <span className="text-[11px] font-semibold text-gray-400">
                  30 Sep
                </span>
                <button className="px-5 py-2 rounded-full text-xs font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors">
                  Receipt
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
