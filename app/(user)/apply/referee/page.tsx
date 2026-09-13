"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronDown, Check, Mail, Info } from "lucide-react";
import { StepHeader } from "../StepHeader";
import { useApplyStore } from "../useApplyStore";

export default function RefereePage() {
  const router = useRouter();
  const { data, setData, isClient, lastSaved } = useApplyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isClient || !mounted) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setData({ refereeSkipped: false });
    router.push("/apply/review");
  };

  const handleSkip = () => {
    setData({ refereeSkipped: true });
    router.push("/apply/review");
  };

  return (
    <form onSubmit={handleNext} className="flex flex-col h-full justify-between min-h-full">
      <div>
        <StepHeader step={6} totalSteps={9} title="REFEREE" lastSaved={lastSaved} />

        <div className="mt-8 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#171717] mb-4">
            Referee.
          </h1>
          <p className="text-lg text-gray-600 mb-8">A current member (Tier 02+) who can confirm you.</p>

          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-purple-50 rounded-2xl border border-purple-100">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-purple-600 shrink-0 shadow-sm">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Don't have a member referee?</h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  Skip this step. Our member relations team will assign one — adds 2-3 business days to review.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSkip}
              className="px-5 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
            >
              Skip step
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referee full name</label>
                <input
                  type="text"
                  required
                  value={data.refereeFullName}
                  onChange={(e) => setData({ refereeFullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Member ID - optional</label>
                <input
                  type="text"
                  value={data.refereeMemberId}
                  onChange={(e) => setData({ refereeMemberId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  placeholder="LM-0014"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referee email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={data.refereeEmail}
                    onChange={(e) => setData({ refereeEmail: e.target.value })}
                    className="w-full pl-12 pr-32 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                    placeholder="jane@likeminds.coop"
                  />
                  {data.refereeEmail.includes("@likeminds.coop") && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-md">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">
                        Verified Member
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                <div className="relative">
                  <select
                    value={data.refereeRelationship}
                    onChange={(e) => setData({ refereeRelationship: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white appearance-none"
                  >
                    <option value="Mentor / Colleague">Mentor / Colleague</option>
                    <option value="Friend">Friend</option>
                    <option value="Family Member">Family Member</option>
                    <option value="Community Leader">Community Leader</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">Years known</label>
              <input
                type="number"
                required
                min={0}
                max={100}
                step={1}
                value={data.refereeKnownDuration}
                onChange={(e) => setData({ refereeKnownDuration: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                placeholder="4"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-6 border-t border-gray-200 border-dashed flex items-center justify-between">
        <Link
          href="/apply/next-of-kin"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#171717] px-6 py-3 rounded-full font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        
        <span className="text-xs text-gray-400 font-mono tracking-widest uppercase hidden md:inline-block">
          66% complete
        </span>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-[#171717] hover:bg-black text-white px-6 py-3 rounded-full font-medium transition-colors"
        >
          Continue to review
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
