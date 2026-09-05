"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useSetupStore } from "../useSetupStore";
import { useRequireAccount } from "../useSetupGuard";
import { SetupStepHeader } from "../SetupStepHeader";
import { FadeUp, motion } from "@/app/components/Motion";

const FREQUENCIES = ["Monthly", "Weekly", "Quarterly"];

const DUE_DAYS = [
  { value: "1", label: "1st of month" },
  { value: "5", label: "5th of month" },
  { value: "10", label: "10th of month" },
  { value: "15", label: "15th of month" },
  { value: "20", label: "20th of month" },
  { value: "25", label: "25th of month" },
  { value: "28", label: "28th of month" },
  { value: "31", label: "Last day of month" },
];

const GRACE_PERIODS = ["0", "3", "5", "7", "10", "14"];

export default function CyclesContributionsPage() {
  const router = useRouter();
  const { data, setData, isClient, lastSaved } = useSetupStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useRequireAccount(isClient, data.cooperativeAccountId);
  if (!isClient || !mounted || !data.cooperativeAccountId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/setup/loan-policy");
  };

  return (
    <FadeUp>
      <SetupStepHeader
        step={3}
        title="Cycles & contributions"
        subtitle={
          <span className="text-[#a09880]">
            How often members save and what they&apos;re saving toward.
          </span>
        }
        lastSaved={lastSaved}
      />

      <form onSubmit={handleSubmit} className="space-y-7 max-w-2xl">
        {/* Cycle frequency */}
        <div>
          <label className="block text-sm font-semibold text-[#171717] mb-3">
            Cycle frequency
          </label>
          <div className="flex flex-wrap gap-2">
            {FREQUENCIES.map((freq) => (
              <motion.button
                key={freq}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setData({ cycleFrequency: freq })}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  data.cycleFrequency === freq
                    ? "bg-[#171717] text-white"
                    : "bg-white text-[#171717] border border-[#ddd6c8] hover:bg-[#f0ebe0]"
                }`}
              >
                {freq}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Due day + Late grace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white rounded-2xl border border-[#e0d9cc] p-5">
          <div>
            <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
              Due day
            </label>
            <div className="relative">
              <select
                value={data.dueDay}
                onChange={(e) => setData({ dueDay: e.target.value })}
                className="w-full px-4 py-3 pr-9 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 appearance-none transition-all"
              >
                {DUE_DAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a09880] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
              Late grace
            </label>
            <div className="relative">
              <select
                value={data.lateGrace}
                onChange={(e) => setData({ lateGrace: e.target.value })}
                className="w-full px-4 py-3 pr-9 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 appearance-none transition-all"
              >
                {GRACE_PERIODS.map((g) => (
                  <option key={g} value={g}>{g} {g === "1" ? "day" : "days"}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a09880] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Min + Max monthly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white rounded-2xl border border-[#e0d9cc] p-5">
          <div>
            <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
              Minimum monthly
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a09880] text-sm font-medium">
                ₦
              </span>
              <input
                type="number"
                min={0}
                required
                value={data.minMonthly}
                onChange={(e) => setData({ minMonthly: e.target.value })}
                placeholder="5,000"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
              Maximum monthly
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a09880] text-sm font-medium">
                ₦
              </span>
              <input
                type="number"
                min={0}
                required
                value={data.maxMonthly}
                onChange={(e) => setData({ maxMonthly: e.target.value })}
                placeholder="250,000"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="pt-6 border-t border-dashed border-[#ddd6c8] flex items-center justify-between mt-10">
          <Link
            href="/setup/cooperative-profile"
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
