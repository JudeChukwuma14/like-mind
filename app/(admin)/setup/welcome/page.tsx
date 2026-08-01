"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check } from "lucide-react";
import { useSetupStore } from "../useSetupStore";

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
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!isClient || !mounted) return null;

  const password = data.password;
  const hasLength = password.length >= 12;
  const hasNumberSymbol = /[0-9]/.test(password) && /[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]/.test(password);
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/setup/cooperative-profile");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] flex flex-col">
      {/* Top bar */}
      <header className="w-full bg-[#f4efe6] border-b border-dashed border-blue-400/60">
        <div className="flex items-center px-5 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f5c518] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-[#171717]">LM</span>
            </div>
            <span className="font-semibold text-sm text-[#171717]">LikeMind</span>
            <span className="text-xs font-mono text-[#a09880] uppercase tracking-widest ml-1">Setup</span>
          </div>
        </div>
      </header>

      {/* Center content */}
      <div className="flex-1 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#171717] mb-2">Welcome to LikeMinds</h1>
            <p className="text-sm text-[#a09880]">Setup your cooperative account and rules</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-lg font-semibold text-[#171717]">Create your account</h2>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#d97706] mb-1.5 uppercase tracking-wide">
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
              disabled={loading || !hasLength}
              className="w-full bg-[#171717] hover:bg-black text-white py-3.5 rounded-full font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating…" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
