"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, EyeOff, Check, Circle, Loader2 } from "lucide-react";
import { apiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";
import { clearStoredResetEmail, getStoredResetEmail } from "@/app/lib/reset-password-email";

const REQUIREMENTS = [
  { label: "At least 12 characters", test: (p: string) => p.length >= 12 },
  { label: "One number and one symbol", test: (p: string) => /\d/.test(p) && /[^A-Za-z0-9]/.test(p) },
  { label: "Mixed case", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
];

export default function ResetPasswordPage() {
  const router = useRouter();

  // Empty on the server (sessionStorage isn't available there); filled in
  // right after mount from what forgot-password stashed — no URL exposure,
  // no need to type it in again.
  const [email, setEmail] = useState("");
  useEffect(() => {
    const stored = getStoredResetEmail();
    if (stored) setEmail(stored);
  }, []);

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetPassword = useMutation({
    mutationFn: () =>
      apiFetch<ApiEnvelope<unknown>>("/api/Auth/reset-password", {
        method: "POST",
        body: { email, code, newPassword: password, confirmPassword },
      }),
    onSuccess: (res) => {
      toast.success(res.message || "Password reset — you can now log in.");
      clearStoredResetEmail();
      router.push("/signin");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const allRequirementsMet = REQUIREMENTS.every((req) => req.test(password));
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = Boolean(email) && Boolean(code) && allRequirementsMet && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetPassword.mutate();
  };

  return (
    <>
      <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 mb-2">
        03 — New password
      </p>
      <h2 className="text-3xl font-bold text-[#171717] mb-8">Set new password</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
            placeholder="alex@likemind.co"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Verification code</label>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
            placeholder="Code from your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-600 mt-2">Passwords don&apos;t match.</p>
          )}
        </div>

        <div className="bg-[#f4efe6] border border-[#e2ddd6] rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2.5">
            Requirements
          </p>
          <ul className="space-y-1.5">
            {REQUIREMENTS.map((req) => {
              const met = req.test(password);
              return (
                <li
                  key={req.label}
                  className={`flex items-center gap-2 text-xs ${met ? "text-emerald-700" : "text-gray-500"}`}
                >
                  {met ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  {req.label}
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || resetPassword.isPending}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-full font-medium transition-colors"
        >
          {resetPassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {resetPassword.isPending ? "Saving…" : "Save and log in"}
        </button>
      </form>
    </>
  );
}
