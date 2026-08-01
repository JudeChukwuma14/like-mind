"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useSetupStore } from "../useSetupStore";

const ACCENT_COLORS = [
  "#f5c518",
  "#f97316",
  "#3b82f6",
  "#22c55e",
  "#e11d48",
];

const CURRENCIES = ["NGN - ₦", "USD - $", "GBP - £", "EUR - €", "CAD - C$"];
const TIMEZONES = ["WAT - UTC+1", "GMT - UTC+0", "CAT - UTC+2", "EAT - UTC+3", "EST - UTC-5"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const YEARS = Array.from({ length: 30 }, (_, i) => String(2024 - i));

export default function CooperativeProfilePage() {
  const router = useRouter();
  const { data, setData, isClient } = useSetupStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!isClient || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/setup/cycles-contributions");
  };

  // Compute initials from cooperative name
  const initials = data.cooperativeName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "LM";

  return (
    <div>
      {/* Step label */}
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880] mb-1">Step 2</p>
      <h1 className="text-4xl md:text-5xl font-bold text-[#171717] mb-1">Cooperative profile</h1>
      <p className="text-sm text-[#3b82f6] mb-8">
        Shows on receipts, the member portal, and audit reports.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left — form fields */}
          <div className="flex-1 space-y-5 min-w-0">
            {/* Cooperative name */}
            <div>
              <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
                Cooperative name
              </label>
              <input
                type="text"
                required
                value={data.cooperativeName}
                onChange={(e) => setData({ cooperativeName: e.target.value })}
                placeholder="LikeMind Multipurpose Cooperative"
                className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
              />
            </div>

            {/* Reg number + Founded */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
                  Reg. number
                </label>
                <input
                  type="text"
                  value={data.rcNumber}
                  onChange={(e) => setData({ rcNumber: e.target.value })}
                  placeholder="RC-2419-LG"
                  className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#a09880] mb-1.5">
                  Founded
                </label>
                <div className="relative">
                  <select
                    value={data.founded}
                    onChange={(e) => setData({ founded: e.target.value })}
                    className="w-full px-4 py-3 pr-9 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 appearance-none transition-all"
                  >
                    <option value="">Select year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a09880] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Headquarters address */}
            <div>
              <label className="block text-xs font-semibold text-[#d97706] mb-1.5">
                Headquarters address
              </label>
              <textarea
                rows={2}
                value={data.headquartersAddress}
                onChange={(e) => setData({ headquartersAddress: e.target.value })}
                placeholder={"14B Awolowo Road, Ikoyi, Lagos\nNigeria"}
                className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all resize-none"
              />
            </div>

            {/* Default currency + Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#a09880] mb-1.5">
                  Default currency
                </label>
                <div className="relative">
                  <select
                    value={data.defaultCurrency}
                    onChange={(e) => setData({ defaultCurrency: e.target.value })}
                    className="w-full px-4 py-3 pr-9 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 appearance-none transition-all"
                  >
                    {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a09880] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#a09880] mb-1.5">
                  Timezone
                </label>
                <div className="relative">
                  <select
                    value={data.timezone}
                    onChange={(e) => setData({ timezone: e.target.value })}
                    className="w-full px-4 py-3 pr-9 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 appearance-none transition-all"
                  >
                    {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a09880] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Public motto */}
            <div>
              <label className="block text-xs font-semibold text-[#a09880] mb-1.5">
                Public motto
              </label>
              <input
                type="text"
                value={data.publicMotto}
                onChange={(e) => setData({ publicMotto: e.target.value })}
                placeholder="Save together, grow together."
                className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
              />
            </div>
          </div>

          {/* Right — Brand card */}
          <div className="xl:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 space-y-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880]">Brand</p>

              {/* Logo */}
              <div>
                <p className="text-xs font-semibold text-[#171717] mb-3">Logo</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-[#171717] font-bold text-sm shrink-0"
                    style={{ backgroundColor: data.brandAccentColor }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#171717] truncate">
                      {data.cooperativeName
                        ? `${data.cooperativeName.toLowerCase().replace(/\s+/g, "-")}-mark.svg`
                        : "likemind-mark.svg"}
                    </p>
                    <p className="text-[10px] text-[#a09880] mt-0.5">320×320 · attached</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#3b82f6] hover:text-blue-700 transition-colors shrink-0"
                  >
                    Replace
                  </button>
                </div>
              </div>

              {/* Brand accent */}
              <div>
                <p className="text-xs font-semibold text-[#171717] mb-3">Brand accent</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setData({ brandAccentColor: color })}
                      className={`w-7 h-7 rounded-lg transition-all ${
                        data.brandAccentColor === color
                          ? "ring-2 ring-offset-1 ring-[#171717] scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg border-2 border-dashed border-[#c8bfa8] text-[#a09880] flex items-center justify-center text-sm hover:border-[#a09880] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-6 border-t border-dashed border-[#ddd6c8] flex items-center justify-between">
          <Link
            href="/setup/welcome"
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
    </div>
  );
}
