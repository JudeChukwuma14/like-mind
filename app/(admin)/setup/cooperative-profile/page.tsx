"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ChevronDown, Loader2 } from "lucide-react";
import { useSetupStore } from "../useSetupStore";
import { useRequireAccount } from "../useSetupGuard";
import { SetupStepHeader } from "../SetupStepHeader";
import { FadeUp, motion } from "@/app/components/Motion";
import { CURRENCIES, TIMEZONES } from "../setupConstants";
import { adminApiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";

type UploadLogoResponse = ApiEnvelope<{
  assetId: string;
  fileName: string;
}>;

const ACCENT_COLORS = [
  "#f5c518",
  "#f97316",
  "#3b82f6",
  "#22c55e",
  "#e11d48",
];

export default function CooperativeProfilePage() {
  const router = useRouter();
  const { data, setData, isClient, lastSaved } = useSetupStore();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return adminApiFetch<UploadLogoResponse>(
        `/api/CooperativeAccount/${data.cooperativeAccountId}/UploadLogo`,
        { method: "POST", body: formData },
      );
    },
    onSuccess: (res, file) => {
      setData({
        logoAssetId: res.data.assetId,
        logoFileName: res.data.fileName || file.name,
        logoPreviewUrl: URL.createObjectURL(file),
      });
      toast.success("Logo uploaded!");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  useEffect(() => setMounted(true), []);
  useRequireAccount(isClient, data.cooperativeAccountId);
  if (!isClient || !mounted || !data.cooperativeAccountId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/setup/cycles-contributions");
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo.mutate(file);
    e.target.value = "";
  };

  // Compute initials from cooperative name
  const initials = data.cooperativeName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "LM";

  return (
    <FadeUp>
      <SetupStepHeader
        step={2}
        title="Cooperative profile"
        subtitle={
          <span className="text-[#3b82f6]">
            Shows on receipts, the member portal, and audit reports.
          </span>
        }
        lastSaved={lastSaved}
      />

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left — form fields */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#e0d9cc] p-5 sm:p-6 space-y-5">
            {/* Cooperative name */}
            <div>
              <label className="block text-xs font-semibold text-[#a09880] mb-1.5">
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
                <label className="block text-xs font-semibold text-[#a09880] mb-1.5">
                  Reg. number
                </label>
                <input
                  type="text"
                  required
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
                <input
                  type="date"
                  required
                  max={new Date().toISOString().slice(0, 10)}
                  value={data.founded}
                  onChange={(e) => setData({ founded: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all appearance-none"
                />
              </div>
            </div>

            {/* Headquarters address */}
            <div>
              <label className="block text-xs font-semibold text-[#a09880]  mb-1.5">
                Headquarters address
              </label>
              <textarea
                rows={2}
                required
                value={data.headquartersAddress}
                onChange={(e) => setData({ headquartersAddress: e.target.value })}
                placeholder={"123 Maple Street, Toronto, Canada"}
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
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
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
                    {TIMEZONES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
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
                    className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-[#171717] font-bold text-sm shrink-0"
                    style={{ backgroundColor: data.brandAccentColor }}
                  >
                    {data.logoPreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.logoPreviewUrl}
                        alt="Cooperative logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#171717] truncate">
                      {data.logoFileName || "No logo uploaded"}
                    </p>
                    <p className="text-[10px] text-[#a09880] mt-0.5">
                      {uploadLogo.isPending
                        ? "Uploading…"
                        : data.logoFileName
                          ? "Attached"
                          : "PNG or SVG"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLogo.isPending}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3b82f6] hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    {uploadLogo.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {data.logoFileName ? "Replace" : "Upload"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoFileChange}
                  />
                </div>
              </div>

              {/* Brand accent */}
              <div>
                <p className="text-xs font-semibold text-[#171717] mb-3">Brand accent</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {ACCENT_COLORS.map((color) => (
                    <motion.button
                      key={color}
                      type="button"
                      whileTap={{ scale: 0.9 }}
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

        {/* Footer nav — no Back link: Welcome created the account and can't be revisited */}
        <div className="mt-12 pt-6 border-t border-dashed border-[#ddd6c8] flex items-center justify-end">
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
