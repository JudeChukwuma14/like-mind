"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Download, Clock } from "lucide-react";
import { useApplyStore } from "../useApplyStore";

export default function ConfirmationPage() {
  const router = useRouter();
  const { data, clearData, isClient } = useApplyStore();
  const [mounted, setMounted] = useState(false);
  const [submitTime, setSubmitTime] = useState("");
  const [decisionDate, setDecisionDate] = useState("");

  useEffect(() => {
    setMounted(true);
    
    const now = new Date();
    setSubmitTime(now.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', 
      hour: '2-digit', minute:'2-digit'
    }));

    const future = new Date();
    future.setDate(future.getDate() + 5);
    setDecisionDate(future.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }));

    // Optionally clear data after some time or immediately
    // clearData();
  }, []);

  if (!isClient || !mounted) return null;

  return (
    <div className="flex flex-col h-full justify-between min-h-full">
      <div>
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-sm">
          <Check className="w-8 h-8 text-white" strokeWidth={3} />
        </div>

        <div className="text-[10px] text-emerald-600 font-mono uppercase tracking-widest mb-4">
          — SUBMISSION CONFIRMED
        </div>

        <div className="mt-2 max-w-3xl">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-[#171717] mb-4">
            Application Submitted.
          </h1>
          <p className="text-xl text-gray-600 mb-12">Decision will be communicated within 5 business days. Track status anytime.</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="text-[10px] font-mono tracking-widest text-gray-400 mb-2 uppercase">Submitted</div>
              <div className="text-xl font-semibold text-[#171717] mb-1">{submitTime}</div>
              <div className="text-sm text-gray-500">Confirmation email sent to {data.email || "your email"}</div>
            </div>

            <div className="flex-1 bg-[#171717] rounded-2xl p-6 border border-[#222] shadow-sm text-white">
              <div className="text-[10px] font-mono tracking-widest text-gray-400 mb-2 uppercase">Expected decision</div>
              <div className="text-xl font-semibold text-white mb-1">By {decisionDate}</div>
              <div className="text-sm text-gray-400">5 business days · we'll email a decision</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm">
            <div className="text-[10px] font-mono tracking-widest text-gray-400 mb-6 uppercase">— What happens next</div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
              {/* Connecting line for desktop */}
              <div className="hidden sm:block absolute top-5 left-8 right-8 h-px bg-gray-200 z-0">
                <div className="w-1/3 h-full bg-emerald-500"></div>
              </div>

              {/* Step 1 */}
              <div className="relative z-10 flex sm:flex-col items-center gap-4 sm:gap-3 flex-1 sm:text-center w-full">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#171717]">Submitted</div>
                  <div className="text-xs text-gray-500">Today · {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex sm:flex-col items-center gap-4 sm:gap-3 flex-1 sm:text-center w-full">
                <div className="w-10 h-10 rounded-full bg-[#171717] flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#171717]">Admin review</div>
                  <div className="text-xs text-gray-500">In progress · 1-3 days</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex sm:flex-col items-center gap-4 sm:gap-3 flex-1 sm:text-center w-full opacity-50">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-400 text-sm font-mono shrink-0">
                  3
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#171717]">Decision email</div>
                  <div className="text-xs text-gray-500">Approve · reject<br className="hidden sm:block" />· request edit</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex sm:flex-col items-center gap-4 sm:gap-3 flex-1 sm:text-center w-full opacity-50">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-400 text-sm font-mono shrink-0">
                  4
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#171717]">Account activated</div>
                  <div className="text-xs text-gray-500">First dues debit<br className="hidden sm:block" />+ dashboard</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-6 border-t border-gray-200 border-dashed flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm font-medium">
          <button className="flex items-center gap-2 text-gray-600 hover:text-[#171717] transition-colors">
            <Download className="w-4 h-4" />
            Download confirmation PDF
          </button>
          <span className="text-gray-300">or</span>
          <button className="flex items-center gap-2 text-gray-600 hover:text-[#171717] transition-colors">
            <Clock className="w-4 h-4" />
            Track status
          </button>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#171717] hover:bg-black text-white px-8 py-3.5 rounded-full font-medium transition-colors w-full sm:w-auto justify-center"
        >
          Back to homepage
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
