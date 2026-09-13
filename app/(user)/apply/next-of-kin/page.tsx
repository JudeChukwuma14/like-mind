"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronDown, Mail } from "lucide-react";
import PhoneInput, { type Country as PhoneCountry } from "react-phone-number-input";
import { StepHeader } from "../StepHeader";
import { useApplyStore } from "../useApplyStore";

export default function NextOfKinPage() {
  const router = useRouter();
  const { data, setData, isClient, lastSaved } = useApplyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isClient || !mounted) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/apply/referee");
  };

  return (
    <form onSubmit={handleNext} className="flex flex-col h-full justify-between min-h-full">
      <div>
        <StepHeader step={5} totalSteps={9} title="NEXT OF KIN" lastSaved={lastSaved} />

        <div className="mt-8 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#171717] mb-4">
            Next of kin.
          </h1>
          <p className="text-lg text-gray-600 mb-10">For welfare claims & beneficiary pass-through.</p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                <input
                  type="text"
                  required
                  value={data.nokFullName}
                  onChange={(e) => setData({ nokFullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  placeholder="John Morgan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                <div className="relative">
                  <select
                    value={data.nokRelationship}
                    onChange={(e) => setData({ nokRelationship: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white appearance-none"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={data.nokEmail}
                    onChange={(e) => setData({ nokEmail: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                    placeholder="john.morgan@outlook.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                <PhoneInput
                  international
                  defaultCountry={(data.countryCode || "CA") as PhoneCountry}
                  value={data.nokPhone}
                  onChange={(value) => setData({ nokPhone: value ?? "" })}
                  className="likemind-phone-input"
                  numberInputProps={{ required: true }}
                  placeholder="(416) 555-0271"
                />
              </div>
            </div>

            <div
              className={`mt-6 border rounded-xl p-5 cursor-pointer transition-all ${
                data.nokPrimaryBeneficiary
                  ? "border-[#171717] bg-gray-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              onClick={() => setData({ nokPrimaryBeneficiary: !data.nokPrimaryBeneficiary })}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border ${
                      data.nokPrimaryBeneficiary
                        ? "bg-[#171717] border-[#171717]"
                        : "border-gray-300"
                    }`}
                  >
                    {data.nokPrimaryBeneficiary && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-[#171717]">
                    Designate as primary beneficiary for Generations Trust
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Recommended. You can split shares between multiple beneficiaries later from your dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">Share percentage</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  step={1}
                  value={data.nokSharePercentage}
                  onChange={(e) => setData({ nokSharePercentage: e.target.value })}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  placeholder="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-6 border-t border-gray-200 border-dashed flex items-center justify-between">
        <Link
          href="/apply/employment"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#171717] px-6 py-3 rounded-full font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        
        <span className="text-xs text-gray-400 font-mono tracking-widest uppercase hidden md:inline-block">
          44% complete
        </span>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-[#171717] hover:bg-black text-white px-6 py-3 rounded-full font-medium transition-colors"
        >
          Continue to referee
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
