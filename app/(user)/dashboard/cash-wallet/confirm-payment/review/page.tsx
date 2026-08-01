"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, FileText } from "lucide-react";
import { useState } from "react";

export default function ReviewPaymentPage() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmed) {
      router.push("/dashboard/cash-wallet/confirm-payment/success");
    }
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
        <div className="flex items-center gap-2 px-3 py-1.5 bg-transparent rounded-full border border-transparent">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check size={12} strokeWidth={3} />
          </div>
          <span className="text-xs font-medium text-emerald-600">Payment details</span>
        </div>
        <div className="h-[1px] w-12 bg-gray-200"></div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-[#111] text-white flex items-center justify-center text-[10px] font-bold">
            2
          </div>
          <span className="text-xs font-bold text-[#111]">Review</span>
        </div>
      </div>

      {/* ─── Main Content Grid ────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left: Review Area */}
        <div className="flex-1 w-full bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">
            Step 2 of 2
          </p>
          <h2 className="text-2xl font-bold text-[#111] mb-6">Review and submit</h2>
          
          <div className="bg-gray-50/50 rounded-xl border border-gray-100 mb-6">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Contribution month</span>
              <span className="text-sm font-bold text-[#111]">April 2026</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Type</span>
              <span className="text-sm font-medium text-[#111]">Savings contribution</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
              <span className="text-sm text-gray-500">Amount paid</span>
              <span className="text-lg font-bold text-[#111]">₦ 25,000</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Payment date</span>
              <span className="text-sm font-medium text-[#111]">14 April 2026</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Method</span>
              <span className="text-sm font-medium text-[#111]">Interac e-Transfer</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Interac reference</span>
              <span className="text-sm font-medium text-[#111]">C1A2-8820-41AP</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-gray-500">Proof</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#111]">
                <FileText size={16} className="text-gray-400" />
                Interac-receipt-14Apr.pdf
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Checkbox */}
            <label className="flex items-center gap-3 p-4 mb-8 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${confirmed ? 'bg-[#111] border-[#111] text-white' : 'bg-white border-gray-300'}`}>
                {confirmed && <Check size={14} strokeWidth={3} />}
              </div>
              <input 
                type="checkbox" 
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="hidden" 
              />
              <span className="text-sm font-medium text-[#111]">
                I confirm the details above are accurate. Admin will be notified.
              </span>
            </label>

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
                  onClick={() => router.back()}
                  className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-[#111] transition-colors"
                >
                  Edit details
                </button>
                <button 
                  type="submit" 
                  disabled={!confirmed}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Check size={16} strokeWidth={3} />
                  Submit confirmation
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right: Instructions (Same as form step) */}
        <div className="w-full lg:w-[320px] xl:w-[360px] space-y-4 shrink-0">
          
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-gray-800">
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
