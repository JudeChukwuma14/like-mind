"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { useSetupStore } from "../useSetupStore";

type CheckboxItemProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
};

function CheckboxItem({ checked, onChange, label }: CheckboxItemProps) {
  return (
    <label className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-[#e0d9cc] cursor-pointer hover:bg-[#fafaf8] transition-colors select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
          checked
            ? "bg-[#171717] border-[#171717]"
            : "border-[#c8bfa8] bg-white"
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
      </div>
      <span className="text-sm text-[#171717] font-medium">{label}</span>
    </label>
  );
}

export default function LoanPolicyPage() {
  const router = useRouter();
  const { data, setData, isClient } = useSetupStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!isClient || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/setup/withdrawal-policy");
  };

  const handleSkip = () => {
    router.push("/setup/withdrawal-policy");
  };

  return (
    <div>
      {/* Step label */}
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880] mb-1">Step 4</p>
      <h1 className="text-4xl md:text-5xl font-bold text-[#171717] mb-1">Loan policy</h1>
      <p className="text-sm mb-8">
        <span className="text-[#a09880]">Eligibility, terms, and the </span>
        <span className="text-[#3b82f6]">rails</span>
        <span className="text-[#a09880]"> for approving credit.</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        {/* Interest rate + Max term */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
              Interest rate – annual
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.interestRate}
                onChange={(e) => setData({ interestRate: e.target.value })}
                placeholder="8.0%"
                className="w-full px-4 py-3 pr-16 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#a09880] bg-[#f0ebe0] px-2 py-0.5 rounded-full">
                flat
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
              Max term
            </label>
            <input
              type="text"
              value={data.maxTermMonths}
              onChange={(e) => setData({ maxTermMonths: e.target.value })}
              placeholder="24 months"
              className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
            />
          </div>
        </div>

        {/* Late penalty */}
        <div>
          <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
            Late penalty
          </label>
          <input
            type="text"
            value={data.latePenalty}
            onChange={(e) => setData({ latePenalty: e.target.value })}
            placeholder="2% per month"
            className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
          />
        </div>

        {/* Required to apply */}
        <div>
          <label className="block text-xs font-semibold text-[#a09880] mb-3">
            Required to apply
          </label>
          <div className="space-y-2">
            <CheckboxItem
              checked={data.requiresActiveMember}
              onChange={(v) => setData({ requiresActiveMember: v })}
              label="Active member 3+ months"
            />
            <CheckboxItem
              checked={data.requiresGuarantor}
              onChange={(v) => setData({ requiresGuarantor: v })}
              label="1 guarantor (member, no loan)"
            />
            <CheckboxItem
              checked={data.requiresDebtToIncome}
              onChange={(v) => setData({ requiresDebtToIncome: v })}
              label="Debt-to-income ≤ 40%"
            />
            <CheckboxItem
              checked={data.requiresBankStatement}
              onChange={(v) => setData({ requiresBankStatement: v })}
              label="Bank statement upload"
            />
          </div>
        </div>

        {/* Footer nav */}
        <div className="pt-6 border-t border-dashed border-[#ddd6c8] flex items-center justify-between mt-10">
          <Link
            href="/setup/cycles-contributions"
            className="inline-flex items-center gap-2 bg-white border border-[#ddd6c8] hover:bg-[#f0ebe0] text-[#171717] px-6 py-2.5 rounded-full font-medium text-sm transition-colors"
          >
            ← Back
          </Link>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-[#a09880] hover:text-[#171717] transition-colors"
            >
              Skip optional
            </button>
            <button
              type="submit"
              className="bg-[#171717] hover:bg-black text-white px-7 py-2.5 rounded-full font-semibold text-sm transition-colors"
            >
              Save &amp; continue
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
