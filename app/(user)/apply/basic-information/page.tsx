"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, ChevronDown } from "lucide-react";
import { StepHeader } from "../StepHeader";
import { useApplyStore } from "../useApplyStore";

export default function BasicInformationPage() {
  const router = useRouter();
  const { data, setData, isClient, lastSaved } = useApplyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isClient || !mounted) return null; // Avoid hydration mismatch

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/apply/contact-information");
  };

  // value differs from label only for "Male" -> "male", to match the exact
  // string the backend expects; label text shown to the user is unchanged.
  const genders = [
    { label: "Female", value: "Female" },
    { label: "Male", value: "male" },
    { label: "Non-binary", value: "Non-binary" },
    { label: "Prefer not to say", value: "Prefer not to say" },
  ];

  return (
    <form onSubmit={handleNext} className="flex flex-col h-full justify-between min-h-full">
      <div>
        <StepHeader step={2} totalSteps={9} title="BASIC INFORMATION" lastSaved={lastSaved} />

        <div className="mt-8 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#171717] mb-4">
            Basic info.
          </h1>
          <p className="text-lg text-gray-600 mb-10">Legal identity for KYC.</p>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <div className="relative">
                  <select
                    required
                    value={data.title}
                    onChange={(e) => setData({ title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Miss">Miss</option>
                    <option value="Dr">Dr</option>
                    <option value="Mx">Mx</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
                <input
                  type="text"
                  required
                  value={data.firstName}
                  onChange={(e) => setData({ firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  placeholder="Alexandra"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Middle name - optional</label>
                <input
                  type="text"
                  value={data.middleName}
                  onChange={(e) => setData({ middleName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  placeholder="Adesina"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
                <input
                  type="text"
                  required
                  value={data.lastName}
                  onChange={(e) => setData({ lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  placeholder="Morgan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex flex-wrap gap-2">
                  {genders.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setData({ gender: g.value })}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                        data.gender === g.value
                          ? "bg-[#171717] text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    required
                    min="1900-01-01"
                    max={new Date().toISOString().slice(0, 10)}
                    value={data.dob}
                    onChange={(e) => setData({ dob: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-700 appearance-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Residency status</label>
                <input
                  type="text"
                  required
                  value={data.residencyStatus}
                  onChange={(e) => setData({ residencyStatus: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  placeholder="e.g. Citizen, Permanent Resident, Visa holder"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Province/state of residence</label>
                <input
                  type="text"
                  required
                  value={data.provinceOfResidence}
                  onChange={(e) => setData({ provinceOfResidence: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  placeholder="e.g. Ontario, Lagos, California"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-6 border-t border-gray-200 border-dashed flex items-center justify-between">
        <Link
          href="/apply/welcome"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#171717] px-6 py-3 rounded-full font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        
        <span className="text-xs text-gray-400 font-mono tracking-widest uppercase hidden md:inline-block">
          11% complete
        </span>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-[#171717] hover:bg-black text-white px-6 py-3 rounded-full font-medium transition-colors"
        >
          Continue to contact
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
