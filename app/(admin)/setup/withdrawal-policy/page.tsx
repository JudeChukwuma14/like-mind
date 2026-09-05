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

export default function WithdrawalPolicyPage() {
  const router = useRouter();
  const { data, setData, isClient, lastSaved } = useSetupStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useRequireAccount(isClient, data.cooperativeAccountId);
  if (!isClient || !mounted || !data.cooperativeAccountId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/setup/banking");
  };

  return (
    <FadeUp>
      <SetupStepHeader
        step={5}
        title="Withdrawal policy"
        subtitle={
          <>
            <span className="text-[#a09880]">When members can </span>
            <span className="text-[#3b82f6]">pull</span>
            <span className="text-[#a09880]"> funds out and how the cooperative pays.</span>
          </>
        }
        lastSaved={lastSaved}
      />

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        {/* Max per cycle + Frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white rounded-2xl border border-[#e0d9cc] p-5">
          <div>
            <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
              Maximum per cycle
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                required
                value={data.maxPerCycle}
                onChange={(e) => setData({ maxPerCycle: e.target.value })}
                placeholder="75"
                className="w-full px-4 py-3 pr-20 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#a09880] bg-[#f0ebe0] px-2 py-0.5 rounded-full">
                % balance
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
              Max withdrawals per cycle
            </label>
            <input
              type="number"
              min={0}
              required
              value={data.withdrawalFrequency}
              onChange={(e) => setData({ withdrawalFrequency: e.target.value })}
              placeholder="2"
              className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
            />
          </div>
        </div>

        {/* Block withdrawal when */}
        <div>
          <label className="block text-xs font-semibold text-[#a09880] mb-3">
            Block withdrawal when
          </label>
          <div className="space-y-2">
            <CheckboxItem
              checked={data.blockActiveLoan}
              onChange={(v) => setData({ blockActiveLoan: v })}
            >
              Active loan exists
            </CheckboxItem>
            <CheckboxItem
              checked={data.blockGuarantor}
              onChange={(v) => setData({ blockGuarantor: v })}
            >
              Member is guarantor on outstanding loan
            </CheckboxItem>
            <CheckboxItem
              checked={data.blockArrears}
              onChange={(v) => setData({ blockArrears: v })}
            >
              Cycle contributions in arrears
            </CheckboxItem>
            <CheckboxItem
              checked={data.blockNewMember}
              onChange={(v) => setData({ blockNewMember: v })}
            >
              Less than
              <input
                type="number"
                min={1}
                disabled={!data.blockNewMember}
                value={data.minimumDaysSinceJoining}
                onChange={(e) => setData({ minimumDaysSinceJoining: e.target.value })}
                className={inlineNumberInputClass}
              />
              days since joining
            </CheckboxItem>
          </div>
        </div>

        {/* Footer nav */}
        <div className="pt-6 border-t border-dashed border-[#ddd6c8] flex items-center justify-between mt-10">
          <Link
            href="/setup/loan-policy"
            className="inline-flex items-center gap-2 bg-white border border-[#ddd6c8] hover:bg-[#f0ebe0] text-[#171717] px-6 py-2.5 rounded-full font-medium text-sm transition-colors"
          >
            ← Back
          </Link>
          <button
            type="submit"
            className="bg-[#171717] hover:bg-black text-white px-7 py-2.5 rounded-full font-semibold text-sm transition-colors"
          >
            Save &amp; continue
          </button>
        </div>
      </form>
    </FadeUp>
  );
}
