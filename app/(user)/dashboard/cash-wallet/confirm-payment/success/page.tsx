"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function SuccessPaymentPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 max-w-2xl w-full text-center relative overflow-hidden">
        
        {/* Soft green glow at the top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-emerald-500/10 rounded-[100%] blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white mb-6 shadow-md">
            <Check size={32} strokeWidth={3} />
          </div>

          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">
            Ref #SAV-2684-118
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-[#111] mb-4">
            Submitted for review
          </h1>

          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Your April payment of <strong className="text-[#111]">$ 25,000</strong> is with admin. 
            Confirmation usually arrives within 1-2 working days.
          </p>

          <div className="bg-[#FAF9F5] border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 w-full mb-10">
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Amount
              </p>
              <p className="font-bold text-[#111]">$ 25,000</p>
            </div>
            {/* Divider (desktop) */}
            <div className="hidden sm:block w-[1px] h-8 bg-gray-200"></div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Month
              </p>
              <p className="font-bold text-[#111]">April 2026</p>
            </div>
            {/* Divider (desktop) */}
            <div className="hidden sm:block w-[1px] h-8 bg-gray-200"></div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Status
              </p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Pending review
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-4 w-full">
            <Link 
              href="/dashboard/cash-wallet"
              className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium text-[#111] hover:bg-gray-50 transition-colors"
            >
              Back to savings
            </Link>
            <Link 
              href="#"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#111] text-white rounded-full text-sm font-medium hover:bg-black transition-colors shadow-sm"
            >
              Track this payment
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
