"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { useApplyStore } from "../useApplyStore";

export default function AcknowledgementPage() {
  const router = useRouter();
  const { data, setData, isClient } = useApplyStore();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleString('en-US', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute:'2-digit', timeZoneName: 'short'
    }));
  }, []);

  if (!isClient || !mounted) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/apply/confirmation");
  };

  const isFormValid = data.signature && data.agreeInfoTrue && data.agreeBylaws && data.agreeConsent;

  return (
    <form onSubmit={handleNext} className="flex flex-col h-full justify-between min-h-full">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-4">
            <span>STEP 08 OF 09</span>
            <span className="w-8 h-px bg-gray-300"></span>
            <span className="font-semibold text-gray-700">ACKNOWLEDGEMENT & SIGNATURE</span>
          </div>
        </div>

        <div className="mt-8 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#171717] mb-4">
            Sign & submit.
          </h1>
          <p className="text-lg text-gray-600 mb-10">Confirms info accurate. Bylaws apply.</p>

          <div className="space-y-6">
            {/* Signature Box */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative">
              <div className="flex items-center justify-between mb-8">
                <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                  — DIGITAL SIGNATURE
                </div>
                <div className="text-xs text-gray-500 flex gap-2">
                  <button type="button" className="hover:text-gray-900" onClick={() => setData({ signature: "" })}>Clear</button>
                  <span>·</span>
                  <button type="button" className="hover:text-gray-900">Type instead</button>
                </div>
              </div>

              <div className="h-32 flex items-center justify-center border-b border-gray-100 mb-6 relative">
                <input
                  type="text"
                  required
                  value={data.signature}
                  onChange={(e) => setData({ signature: e.target.value })}
                  className="w-full text-center text-6xl outline-none bg-transparent"
                  style={{ fontFamily: "'Cedarville Cursive', cursive", color: "#171717" }}
                  placeholder="Type your name"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                <div>Signed by {data.signature || "..."}</div>
                <div>{currentTime}</div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 mt-8">
              <label className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    required
                    checked={data.agreeInfoTrue}
                    onChange={(e) => setData({ agreeInfoTrue: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#171717] focus:ring-[#171717]"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-[#171717] text-sm">All information provided is true, accurate and complete to the best of my knowledge</h3>
                  <p className="text-xs text-gray-500 mt-1">Misrepresentation may result in immediate termination of membership.</p>
                </div>
              </label>

              <label className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    required
                    checked={data.agreeBylaws}
                    onChange={(e) => setData({ agreeBylaws: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#171717] focus:ring-[#171717]"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-[#171717] text-sm">I have read and agree to the 2024 Bylaws, Member Code of Conduct, and Welfare Policy</h3>
                  <p className="text-xs text-gray-500 mt-1">Last revised: 2024-11-08 - 8 minute read combined.</p>
                </div>
              </label>

              <label className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    required
                    checked={data.agreeConsent}
                    onChange={(e) => setData({ agreeConsent: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#171717] focus:ring-[#171717]"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-[#171717] text-sm">I consent to PIPEDA-compliant data processing for KYC, member services and welfare claims</h3>
                  <p className="text-xs text-gray-500 mt-1">Data stays in Canadian data centers. Right to erasure on departure.</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-6 border-t border-gray-200 border-dashed flex items-center justify-between">
        <Link
          href="/apply/review"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#171717] px-6 py-3 rounded-full font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to review
        </Link>
        
        <span className="text-xs text-gray-400 font-mono tracking-widest uppercase hidden md:inline-block">
          88% complete
        </span>

        <button
          type="submit"
          disabled={!isFormValid}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-medium transition-colors"
        >
          Submit application
        </button>
      </div>
    </form>
  );
}
