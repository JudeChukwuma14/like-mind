"use client";

import { useState } from "react";
import { 
  Search, Bell, Filter, Calendar, FileText, Check, ChevronLeft, ChevronRight, X 
} from "lucide-react";

export default function ContributionsPage() {
  const [activeTab, setActiveTab] = useState("needs-review");
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard' | 'manual-entry' | 'receipt' | 'rejected'
  const [selectedPayment, setSelectedPayment] = useState<number | null>(1);

  const mockPayments = [
    { id: 1, name: "Adaeze Okonkwo", type: "April savings", ref: "TX-4471", amount: "₦50,000", selected: true },
    { id: 2, name: "Folake Adeleke", type: "loan repayment", ref: "TX-4472", amount: "₦25,000", selected: false },
    { id: 3, name: "Emeka Obi", type: "April Savings", ref: "TX-4473", amount: "₦18,400", selected: false },
    { id: 4, name: "Sade Kuti", type: "April savings", ref: "TX-4475", amount: "₦80,000", selected: false },
    { id: 5, name: "Ronke Udom", type: "May Savings", ref: "TX-4476", amount: "₦12,500", selected: false },
  ];

  if (currentView === "manual-entry") {
    return (
      <div className="text-[#111110]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                CONTRIBUTIONS / MANUAL
              </div>
              <h1 className="text-4xl font-medium tracking-tight">Manual entry</h1>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setCurrentView("dashboard")}
                className="px-6 py-2.5 rounded-full bg-white font-medium text-sm border border-black/5 hover:bg-black/5 transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => setCurrentView("receipt")}
                className="px-6 py-2.5 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition"
              >
                Save & generate receipt
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              {/* Member Selection */}
              <div>
                <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                  MEMBER
                </label>
                <div className="bg-white rounded-xl p-4 flex items-center justify-between border border-black/5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-medium text-sm">
                      JN
                    </div>
                    <div>
                      <div className="font-medium text-[15px]">Jide Ndubuisi</div>
                      <div className="text-sm text-black/50">last paid Mar 28 - ₦144,300</div>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-black/60 hover:text-black">
                    Change
                  </button>
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                    AMOUNT
                  </label>
                  <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm font-medium flex items-center gap-2">
                    <span className="text-black/40">₦</span>
                    <input type="text" defaultValue="25,000" className="bg-transparent outline-none w-full" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                    DATE PAID
                  </label>
                  <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm font-medium flex justify-between items-center cursor-pointer">
                    Apr 26, 2026
                    <Calendar className="w-4 h-4 text-black/40" />
                  </div>
                </div>
              </div>

              {/* Allocate To & Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                    ALLOCATE TO
                  </label>
                  <select className="w-full bg-white rounded-xl p-4 border border-black/5 shadow-sm font-medium appearance-none outline-none cursor-pointer">
                    <option>Personal savings - April</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                    METHOD
                  </label>
                  <select className="w-full bg-white rounded-xl p-4 border border-black/5 shadow-sm font-medium appearance-none outline-none cursor-pointer">
                    <option>Cash - in person</option>
                  </select>
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                  REFERENCE / NOTE
                </label>
                <textarea 
                  defaultValue="Cash collected at branch desk."
                  className="w-full bg-white rounded-xl p-4 border border-black/5 shadow-sm min-h-[100px] text-[15px] outline-none resize-none"
                />
              </div>

              {/* Counter slip */}
              <div>
                <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                  COUNTER SLIP
                </label>
                <div className="bg-white rounded-xl p-4 flex items-center justify-between border border-black/5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-black/5 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-black/40" />
                    </div>
                    <div>
                      <div className="font-medium text-[15px]">cs-2206-jide-ndubuisi.jpg</div>
                      <div className="text-sm text-black/50">812KB · attached now</div>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-black/60 hover:text-black">
                    Replace
                  </button>
                </div>
              </div>
            </div>

            {/* Right side info panel */}
            <div>
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/5 shadow-sm sticky top-8">
                <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-6">
                  AFTER SAVE
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-black/5 pb-4">
                    <span className="text-[15px] text-black/60">New balance</span>
                    <span className="font-semibold">₦169,300</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-black/5 pb-4">
                    <span className="text-[15px] text-black/60">Cycle status</span>
                    <span className="font-medium">April - paid</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-black/5 pb-4">
                    <span className="text-[15px] text-black/60">Receipt #</span>
                    <span className="font-medium">RCT-2026-04-0214</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[15px] text-black/60">Notify member</span>
                    <span className="font-medium">Email · SMS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (currentView === "receipt") {
    return (
      <div className="text-[#111110]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                CONTRIBUTIONS / DONE
              </div>
              <h1 className="text-4xl font-medium tracking-tight">Receipt sent</h1>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 rounded-full bg-white font-medium text-sm border border-black/5 hover:bg-black/5 transition">
                View member
              </button>
              <button 
                onClick={() => setCurrentView("dashboard")}
                className="px-6 py-2.5 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition"
              >
                Back to queue
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="w-16 h-16 rounded-full bg-[#E8D94B] flex items-center justify-center mb-8 shadow-sm">
                <Check className="w-6 h-6 text-black" />
              </div>
              
              <h2 className="text-3xl font-semibold tracking-tight mb-4">₦25,000 confirmed</h2>
              <p className="text-black/60 text-[15px] leading-relaxed mb-8 max-w-md">
                Receipt RCT-2026-04-0214 emailed to jide.ndubuisi@likemind.coop and SMS sent to +234 803 422 11. Balance updated.
              </p>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setCurrentView("dashboard")}
                  className="px-6 py-3 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition shadow-sm"
                >
                  Confirm next payment
                </button>
                <button className="px-6 py-3 rounded-full bg-white font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm">
                  Resend receipt
                </button>
                <button className="px-6 py-3 rounded-full bg-white font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm">
                  Download PDF
                </button>
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm w-full max-w-md relative overflow-hidden">
                {/* Subtle top decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#E8D94B]"></div>
                
                <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-2 font-semibold">
                    <div className="w-4 h-4 rounded bg-[#E8D94B]"></div>
                    LikeMind
                  </div>
                  <div className="text-right text-xs text-black/40 font-medium tracking-wide uppercase">
                    <div>RCT-2026-04-0214</div>
                    <div>Apr 30, 2026</div>
                  </div>
                </div>

                <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-4">
                  RECEIPT
                </div>
                <div className="text-[40px] font-semibold tracking-tight mb-12">
                  ₦25,000
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-black/5 pb-4 gap-1">
                    <span className="text-xs font-semibold tracking-widest text-black/40 uppercase">MEMBER</span>
                    <span className="font-medium text-[15px]">Jide Ndubuisi - LM-5512</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-black/5 pb-4 gap-1">
                    <span className="text-xs font-semibold tracking-widest text-black/40 uppercase">FOR</span>
                    <span className="font-medium text-[15px]">Personal savings - April</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-black/5 pb-4 gap-1">
                    <span className="text-xs font-semibold tracking-widest text-black/40 uppercase">METHOD</span>
                    <span className="font-medium text-[15px]">Cash - Transfer</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-black/5 pb-4 gap-1">
                    <span className="text-xs font-semibold tracking-widest text-black/40 uppercase">RECORDED BY</span>
                    <span className="font-medium text-[15px]">Adeyera Triumph</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
                    <span className="text-xs font-semibold tracking-widest text-black/40 uppercase">NEW BALANCE</span>
                    <span className="font-semibold text-[15px]">₦169,300</span>
                  </div>
                </div>

                <div className="mt-16 pt-6 border-t border-dashed border-black/10 text-[10px] font-semibold tracking-widest text-black/30 uppercase flex justify-between">
                  <span>VERIFIED - LIKEMIND TREASURY</span>
                  <span>SHA - 4f2a1c</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  // Dashboard View
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
              <Calendar className="w-4 h-4" /> Cycle Apr
            </button>
            <button className="px-4 py-2.5 rounded-full bg-white flex items-center gap-2 font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm">
              <Filter className="w-4 h-4" /> Source
            </button>
            <button 
              onClick={() => setCurrentView("manual-entry")}
              className="px-6 py-2.5 rounded-full bg-white font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm"
            >
              Manual entry
            </button>
            <button className="px-6 py-2.5 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition shadow-sm">
              Confirm 3 selected
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-black/10 mb-8 overflow-x-auto hide-scrollbar">
          {[
            { id: 'needs-review', label: 'Needs review', count: 12 },
            { id: 'manual-entries', label: 'Manual entries', count: 4 },
            { id: 'confirmed', label: 'Confirmed today', count: 8 },
            { id: 'rejected', label: 'Rejected', count: 1 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
          {/* List Pane */}
          <div className="flex flex-col gap-2">
            {activeTab === 'needs-review' && mockPayments.map((payment) => (
              <div 
                key={payment.id}
                onClick={() => setSelectedPayment(payment.id)}
                className={`p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors border ${
                  selectedPayment === payment.id 
                    ? 'bg-gradient-to-r from-[#FEFBE8] to-white border-[#E8D94B]/40 shadow-sm' 
                    : 'bg-white border-transparent hover:border-black/10 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                    payment.selected ? 'bg-black border-black text-white' : 'border-black/20 bg-white'
                  }`}>
                    {payment.selected && <Check className="w-3 h-3" strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="font-medium text-[15px]">{payment.name}</div>
                    <div className="text-sm text-black/50">{payment.type} · ref {payment.ref}</div>
                  </div>
                </div>
                <div className="font-semibold text-[15px]">{payment.amount}</div>
              </div>
            ))}
            
            {activeTab !== 'needs-review' && (
              <div className="py-16 text-center text-black/40 font-medium bg-white/50 rounded-2xl border border-black/5 border-dashed">
                No items in this view for prototyping.
              </div>
            )}

            {activeTab === 'needs-review' && (
              <div className="flex items-center justify-between mt-6 px-2">
                <div className="text-xs font-semibold tracking-widest text-black/40 uppercase">
                  SHOWING 1-5 OF 12
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 text-sm font-medium text-black/40 hover:text-black transition">
                    &lt; Prev
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-black text-white text-sm font-medium flex items-center justify-center">
                    1
                  </button>
                  <button className="w-8 h-8 rounded-lg text-sm font-medium hover:bg-black/5 flex items-center justify-center transition">
                    2
                  </button>
                  <button className="w-8 h-8 rounded-lg text-sm font-medium hover:bg-black/5 flex items-center justify-center transition">
                    3
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium hover:bg-black/5 transition rounded-lg text-black">
                    Next &gt;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Details Pane */}
          {activeTab === 'needs-review' && selectedPayment && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/5 shadow-sm xl:sticky xl:top-24">
              <div className="text-xs text-black/40 font-semibold tracking-widest mb-3 uppercase">
                TX-4471 · APR 30, 09:42
              </div>
              <div className="text-[40px] font-semibold tracking-tight mb-2">
                ₦50,000
              </div>
              <div className="text-[15px] text-black/60 mb-8 font-medium">
                Adaeze Okonkwo - April savings
              </div>

              {/* Receipt viewer box */}
              <div className="bg-[#F5F3EC] rounded-2xl p-10 flex flex-col items-center justify-center text-center mb-8 border border-black/5 group cursor-pointer hover:bg-[#ebe9e2] transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 text-black/60" strokeWidth={1.5} />
                </div>
                <div className="font-medium text-[15px] mb-1">sterling-receipt-apr30.pdf</div>
                <div className="text-sm text-black/50">2.4 MB · uploaded by member</div>
              </div>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-[15px] text-black/50">Bank reference</span>
                  <span className="font-medium">STR-2026-0430-0942</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-[15px] text-black/50">Allocate to</span>
                  <span className="font-medium">Personal savings - April</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-[15px] text-black/50">New balance</span>
                  <span className="font-semibold">₦1,260,800</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[15px] text-black/50">Receipt</span>
                  <span className="font-medium">Auto-email on confirm</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setCurrentView("receipt")}
                  className="flex-1 py-4 rounded-full bg-black text-white font-medium text-[15px] hover:bg-black/80 transition shadow-sm"
                >
                  Confirm contribution
                </button>
                <button 
                  onClick={() => setCurrentView("rejected")}
                  className="px-8 py-4 rounded-full bg-white font-medium text-[15px] border border-black/10 hover:bg-red-50 hover:border-red-200 transition text-red-600 shadow-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Rejection State Placeholder */}
          {currentView === 'rejected' && (
            <div className="bg-white rounded-3xl p-10 border border-black/5 shadow-sm xl:sticky xl:top-24 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6 text-red-600 shadow-inner">
                <X className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-semibold mb-3 tracking-tight">Contribution Rejected</h3>
              <p className="text-black/60 mb-10 max-w-sm text-[15px] leading-relaxed">
                The contribution of <span className="font-semibold text-black">₦50,000</span> from <span className="font-semibold text-black">Adaeze Okonkwo</span> has been rejected. The member has been notified via email.
              </p>
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="w-full py-4 rounded-full bg-black text-white font-medium text-[15px] hover:bg-black/80 transition shadow-sm"
              >
                Back to queue
              </button>
            </div>
          )}
        </div>
      </div>
  );
}
