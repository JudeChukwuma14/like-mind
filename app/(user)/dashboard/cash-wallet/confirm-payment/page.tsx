"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, ChevronRight, Copy } from "lucide-react";

export default function ConfirmPaymentPage() {
  const router = useRouter();
  
  // Basic mock state for demonstration
  const [formData, setFormData] = useState({
    type: "Savings contribution",
    month: "April 2026",
    amount: "25,000",
    date: "14 April 2026",
    reference: "C1A2-8820-41AP",
    note: "Paid via Interac alongside March arrears."
  });

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard/cash-wallet/confirm-payment/review");
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* ─── Header ───────────────────────────────────── */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#111] mb-2">
          Confirm a payment
        </h1>
        <p className="text-sm text-gray-500">
          Tell us about a payment you&apos;ve already made. Admin will confirm.
        </p>
      </div>

      {/* ─── Steps Indicator ──────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-[#111] text-white flex items-center justify-center text-[10px] font-bold">
            1
          </div>
          <span className="text-xs font-bold text-[#111]">Payment details</span>
        </div>
        <div className="h-[1px] w-12 bg-gray-200"></div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-transparent rounded-full border border-transparent">
          <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px] font-bold">
            2
          </div>
          <span className="text-xs font-medium text-gray-400">Review</span>
        </div>
      </div>

      {/* ─── Main Content Grid ────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left: Form Area */}
        <form onSubmit={handleContinue} className="flex-1 w-full bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#111] mb-6">Payment details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors appearance-none"
                style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%239CA3AF" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
              >
                <option>Savings contribution</option>
                <option>Loan repayment</option>
              </select>
            </div>

            {/* Contribution month */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Contribution month</label>
              <select 
                value={formData.month}
                onChange={e => setFormData({...formData, month: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors appearance-none"
                style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%239CA3AF" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
              >
                <option>April 2026</option>
                <option>March 2026</option>
              </select>
            </div>

            {/* Amount paid */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Amount paid</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-600">₦</span>
                <input 
                  type="text" 
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-[#111] rounded-lg text-sm font-medium text-[#111] outline-none transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Payment date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Payment date</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          {/* Interac reference number */}
          <div className="space-y-1.5 mb-6">
            <label className="text-xs font-bold text-gray-600">Interac reference number</label>
            <input 
              type="text" 
              value={formData.reference}
              onChange={e => setFormData({...formData, reference: e.target.value})}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors"
            />
          </div>

          {/* Note (optional) */}
          <div className="space-y-1.5 mb-10">
            <label className="text-xs font-bold text-gray-600">Note (optional)</label>
            <textarea 
              rows={3}
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors resize-none"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-gray-50">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-[#111] hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-4">
              <button 
                type="button" 
                className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-[#111] transition-colors"
              >
                Save draft
              </button>
              <button 
                type="submit" 
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#111] text-white rounded-full text-sm font-medium hover:bg-black transition-colors"
              >
                Continue to proof
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </form>

        {/* Right: Instructions */}
        <div className="w-full lg:w-[320px] xl:w-[360px] space-y-4 shrink-0">
          
          {/* Interac Card */}
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-gray-800">
            {/* Subtle glow effect */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
            
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6 relative z-10">
              Send Interac E-Transfer to
            </p>
            
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                  Interac Email
                </p>
                <p className="font-bold text-base">pay@likemind.co</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                  Security Question
                </p>
                <p className="font-bold text-base">Your member ID</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                  Answer
                </p>
                <p className="font-bold text-base">LM-04812</p>
              </div>
            </div>
            
            <button className="w-full mt-6 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-100 transition-colors relative z-10">
              Copy Interac email
            </button>
          </div>

          {/* Important instructions */}
          <div className="bg-white/50 p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Important
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-300 mt-0.5">—</span>
                <span>Use member ID <strong>#LM-04812</strong> as payment narration.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-300 mt-0.5">—</span>
                <span>Submit by 15th of the month to keep status current.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-300 mt-0.5">—</span>
                <span>Admin confirms within 1-2 working days.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
      
    </div>
  );
}
