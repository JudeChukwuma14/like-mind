"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, EyeOff, Check, ChevronDown, Loader2 } from "lucide-react";
import PhoneInput, { type Country as PhoneCountry } from "react-phone-number-input";
import { State } from "country-state-city";
import { useSetupStore } from "../useSetupStore";
import { useRedirectIfAccountExists } from "../useSetupGuard";
import { CountrySelect } from "@/app/(user)/apply/contact-information/CountrySelect";
import { adminApiFetch, ensureApiSuccess, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";
import { FadeUp } from "@/app/components/Motion";

type CreateAccountResponse = ApiEnvelope<{
  cooperativeId?: string;
  cooperativeAccountId?: string;
  cooperativeAccount?: { id?: string; cooperativeId?: string };
  resume?: boolean;
} | null> & { cooperativeId?: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function PasswordReq({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          met
            ? "bg-[#22c55e] border-[#22c55e]"
            : "border-[#c8bfa8] bg-transparent"
        }`}
      >
        {met && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
      </div>
      <span className={met ? "text-[#22c55e]" : "text-[#a09880]"}>{label}</span>
    </div>
  );
}

export default function SetupWelcomePage() {
  const router = useRouter();
  const { data, setData, isClient } = useSetupStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const createAccount = useMutation({
    mutationFn: async () => {
      const res = ensureApiSuccess(await adminApiFetch<CreateAccountResponse>("/api/CooperativeAccount/CreateAccount", {
        method: "POST",
        body: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          cooperativeAdminPhoneNumber: data.cooperativeAdminPhoneNumber,
          country: data.country,
          societyOrProvince: data.societyOrProvince,
          password: data.password,
        },
      }));
      // CompleteSetup takes the account ID from CreateAccount. It is not the
      // distinct cooperativeId returned after setup is completed.
      const cooperativeAccountId = [
        res.data?.cooperativeAccountId,
        res.data?.cooperativeAccount?.id,
        res.data?.cooperativeAccount?.cooperativeId,
        res.data?.cooperativeId,
        res.cooperativeId,
      ].find((value): value is string => typeof value === "string" && UUID_PATTERN.test(value));
      if (!cooperativeAccountId) throw new Error("The account response did not include a cooperative account ID. The account may already have been created; contact support before retrying.");
      return cooperativeAccountId;
    },
    onSuccess: (cooperativeAccountId) => {
      setData({ cooperativeAccountId });
      toast.success("Account created!");
      router.push("/setup/cooperative-profile");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const states = useMemo(() => State.getStatesOfCountry(data.countryCode), [data.countryCode]);

  useRedirectIfAccountExists(isClient, data.cooperativeAccountId);

  if (!isClient || data.cooperativeAccountId) return null;

  const password = data.password;
  const hasLength = password.length >= 12;
  const hasNumberSymbol = /[0-9]/.test(password) && /[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]/.test(password);
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount.mutate();
  };

  return (
    <FadeUp>
      {/* Center content */}
      <div className="flex justify-center px-4">
        <div className="w-full">
          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#171717] mb-2">Welcome to LikeMinds</h1>
            <p className="text-sm text-[#a09880]">Setup your cooperative account and rules</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-lg font-semibold text-[#171717]">Create your account</h2>

            {/* First / last name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                  First name
                </label>
                <input
                  type="text"
                  required
                  value={data.firstName}
                  onChange={(e) => setData({ firstName: e.target.value })}
                  placeholder="Jane"
                  className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all placeholder:text-[#c8bfa8]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  value={data.lastName}
                  onChange={(e) => setData({ lastName: e.target.value })}
                  placeholder="Smith"
                  className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all placeholder:text-[#c8bfa8]"
                />
              </div>
            </div>

            {/* Date of birth */}
            <div>
              <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                Date of birth
              </label>
              <input
                type="date"
                required
                min="1900-01-01"
                max={new Date().toISOString().slice(0, 10)}
                value={data.dateOfBirth}
                onChange={(e) => setData({ dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all appearance-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                Phone number
              </label>
              <PhoneInput
                international
                defaultCountry={(data.countryCode || "CA") as PhoneCountry}
                value={data.cooperativeAdminPhoneNumber}
                onChange={(value) => setData({ cooperativeAdminPhoneNumber: value ?? "" })}
                className="likemind-phone-input setup-phone-input"
                numberInputProps={{ required: true }}
                placeholder="(416) 555-0184"
              />
            </div>

            {/* Country / society-province */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                  Country
                </label>
                <CountrySelect
                  value={data.countryCode}
                  onChange={(c) =>
                    setData({
                      country: c.name,
                      countryCode: c.isoCode,
                      societyOrProvince: "",
                      societyOrProvinceCode: "",
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                  Society / province
                </label>
                <div className="relative">
                  <select
                    required
                    disabled={states.length === 0}
                    value={data.societyOrProvinceCode}
                    onChange={(e) => {
                      const state = states.find((s) => s.isoCode === e.target.value);
                      setData({
                        societyOrProvince: state?.name ?? "",
                        societyOrProvinceCode: e.target.value,
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all appearance-none disabled:bg-[#ede7d8]/50 disabled:text-[#c8bfa8]"
                  >
                    <option value="">
                      {states.length === 0 ? "No states/provinces" : "Select"}
                    </option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a09880] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <input
                  type={showEmail ? "text" : "email"}
                  required
                  value={data.email}
                  onChange={(e) => setData({ email: e.target.value })}
                  placeholder="admin@likemind.coop"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all placeholder:text-[#c8bfa8]"
                />
                <button
                  type="button"
                  onClick={() => setShowEmail((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09880] hover:text-[#171717] transition-colors"
                >
                  {showEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={data.password}
                  onChange={(e) => setData({ password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all placeholder:text-[#c8bfa8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09880] hover:text-[#171717] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Requirements box */}
              {data.password.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-[#ede7d8] border border-[#ddd6c8]">
                  <p className="text-[9px] font-bold text-[#a09880] uppercase tracking-widest mb-2">
                    Requirements
                  </p>
                  <div className="space-y-1.5">
                    <PasswordReq met={hasLength} label="At least 12 characters" />
                    <PasswordReq met={hasNumberSymbol} label="One number and one symbol" />
                    <PasswordReq met={hasMixedCase} label="Mixed case" />
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={createAccount.isPending || !hasLength}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-black text-white py-3.5 rounded-full font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {createAccount.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {createAccount.isPending ? "Creating…" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </FadeUp>
  );
}
