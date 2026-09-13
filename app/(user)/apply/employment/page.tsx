"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building, ChevronDown, MapPin } from "lucide-react";
import { StepHeader } from "../StepHeader";
import { useApplyStore } from "../useApplyStore";

export default function EmploymentPage() {
  const router = useRouter();
  const { data, setData, isClient, lastSaved } = useApplyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isClient || !mounted) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/apply/next-of-kin");
  };

  const statusOptions = ["Employed", "Self-employed", "Business owner", "Student", "Retired"];

  return (
    <form onSubmit={handleNext} className="flex flex-col h-full justify-between min-h-full">
      <div>
        <StepHeader step={4} totalSteps={9} title="EMPLOYMENT" lastSaved={lastSaved} />

        <div className="mt-8 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#171717] mb-4">
            Employment.
          </h1>
          <p className="text-lg text-gray-600 mb-10">Sets dues tier + loan capacity.</p>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">I am</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {statusOptions.map((status) => {
                  const isActive = data.employmentStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setData({ employmentStatus: status })}
                      className={`flex items-center gap-3 px-5 py-3 rounded-full text-sm font-medium transition-all ${
                        isActive
                          ? "bg-white text-[#171717] border-2 border-[#171717]"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isActive ? "border-[#171717]" : "border-gray-300"
                        }`}
                      >
                        {isActive && <div className="w-2 h-2 rounded-full bg-[#171717]" />}
                      </div>
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employer / business name</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={data.employerName}
                    onChange={(e) => setData({ employerName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                    placeholder="RBC Royal Bank"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <div className="relative">
                  <select
                    value={data.industry}
                    onChange={(e) => setData({ industry: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white appearance-none"
                  >
                    <option value="">Select industry</option>
                    <option value="Banking & Finance">Banking & Finance</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job title / occupation</label>
                <input
                  type="text"
                  required
                  value={data.jobTitle}
                  onChange={(e) => setData({ jobTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  placeholder="Senior Compliance Analyst"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={data.workLocation}
                    onChange={(e) => setData({ workLocation: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                    placeholder="Toronto, ON"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years in role</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={70}
                  step={0.5}
                  value={data.yearsInRole}
                  onChange={(e) => setData({ yearsInRole: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  placeholder="4.5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 border-dashed flex md:flex-row flex-col justify-between items-center gap-4">
        <Link
          href="/apply/contact-information"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#171717] px-6 py-3 rounded-full font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        
        <span className="text-xs text-gray-400 font-mono tracking-widest uppercase hidden md:inline-block">
          33% complete
        </span>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-[#171717] hover:bg-black text-white px-6 py-3 rounded-full font-medium transition-colors"
        >
          Continue to next of kin
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
