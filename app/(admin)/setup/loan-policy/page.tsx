"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { useSetupStore } from "../useSetupStore";
import { useRequireAccount } from "../useSetupGuard";
import { SetupStepHeader } from "../SetupStepHeader";
import { FadeUp, motion } from "@/app/components/Motion";

type CheckboxItemProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
};

function CheckboxItem({ checked, onChange, children }: CheckboxItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-[#e0d9cc] select-none">
      <motion.div
        onClick={() => onChange(!checked)}
        whileTap={{ scale: 0.85 }}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
          checked
            ? "bg-[#171717] border-[#171717]"
            : "border-[#c8bfa8] bg-white"
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
      </motion.div>
      <span className="text-sm text-[#171717] font-medium flex items-center gap-1.5 flex-wrap">
        {children}
      </span>
    </div>
  );
}

const inlineNumberInputClass =
  "w-14 px-2 py-1 rounded-md border border-[#ddd6c8] bg-[#faf9f6] text-center text-sm font-semibold text-[#171717] outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all";

export default function LoanPolicyPage() {
  const router = useRouter();
  const { data, setData, isClient, lastSaved } = useSetupStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useRequireAccount(isClient, data.cooperativeAccountId);
  if (!isClient || !mounted || !data.cooperativeAccountId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/setup/withdrawal-policy");
  };

  const handleSkip = () => {
    router.push("/setup/withdrawal-policy");
  };

  return (
    <FadeUp>
      <SetupStepHeader
        step={4}
        title="Loan policy"
        subtitle={
          <>
            <span className="text-[#a09880]">Eligibility, terms, and the </span>
            <span className="text-[#3b82f6]">rails</span>
            <span className="text-[#a09880]"> for approving credit.</span>
          </>
        }
        lastSaved={lastSaved}
      />

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        {/* Interest rate + Max term */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white rounded-2xl border border-[#e0d9cc] p-5">
          <div>
            <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
              Interest rate – annual
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step="0.1"
                value={data.interestRate}
                onChange={(e) => setData({ interestRate: e.target.value })}
                placeholder="8.0"
                className="w-full px-4 py-3 pr-20 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#a09880] bg-[#f0ebe0] px-2 py-0.5 rounded-full">
                % flat
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
              Max term
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={data.maxTermMonths}
                onChange={(e) => setData({ maxTermMonths: e.target.value })}
                placeholder="24"
                className="w-full px-4 py-3 pr-20 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#a09880] bg-[#f0ebe0] px-2 py-0.5 rounded-full">
                months
              </span>
            </div>
          </div>
        </div>

        {/* Late penalty */}
        <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5">
          <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
            Late penalty
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step="0.1"
              value={data.latePenalty}
              onChange={(e) => setData({ latePenalty: e.target.value })}
              placeholder="2.0"
              className="w-full px-4 py-3 pr-32 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#a09880] bg-[#f0ebe0] px-2 py-0.5 rounded-full">
              % per month
            </span>
          </div>
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
            >
              Active member for at least
              <input
                type="number"
                min={1}
                disabled={!data.requiresActiveMember}
                value={data.minimumMembershipMonths}
                onChange={(e) => setData({ minimumMembershipMonths: e.target.value })}
                className={inlineNumberInputClass}
              />
              months
            </CheckboxItem>
            <CheckboxItem
              checked={data.requiresGuarantor}
              onChange={(v) => setData({ requiresGuarantor: v })}
            >
              At least
              <input
                type="number"
                min={1}
                disabled={!data.requiresGuarantor}
                value={data.minimumGuarantorCount}
                onChange={(e) => setData({ minimumGuarantorCount: e.target.value })}
                className={inlineNumberInputClass}
              />
              guarantor(s) (member, no active loan)
            </CheckboxItem>
            <CheckboxItem
              checked={data.requiresDebtToIncome}
              onChange={(v) => setData({ requiresDebtToIncome: v })}
            >
              Debt-to-income ≤
              <input
                type="number"
                min={0}
                max={100}
                disabled={!data.requiresDebtToIncome}
                value={data.maximumDebtToIncomeRatioPercent}
                onChange={(e) => setData({ maximumDebtToIncomeRatioPercent: e.target.value })}
                className={inlineNumberInputClass}
              />
              %
            </CheckboxItem>
            <CheckboxItem
              checked={data.requiresBankStatement}
              onChange={(v) => setData({ requiresBankStatement: v })}
            >
              Bank statement upload
            </CheckboxItem>
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
    </FadeUp>
  );
}
