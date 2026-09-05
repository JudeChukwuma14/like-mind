"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAdminResetPassword, getStoredAdminResetEmail } from "../../admin/useAdminResetPassword";

export default function AdminResetPasswordPage() {
  const router = useRouter();

  // Empty on the server (sessionStorage isn't available there); filled in
  // right after mount from what the forgot-password step stashed.
  const [email, setEmail] = useState("");
  useEffect(() => {
    const stored = getStoredAdminResetEmail();
    if (stored) setEmail(stored);
  }, []);

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetPassword = useAdminResetPassword();

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = Boolean(email) && Boolean(code) && Boolean(password) && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetPassword.mutate(
      { email, code, newPassword: password, confirmPassword },
      { onSuccess: () => router.push("/login") },
    );
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] flex flex-col">
      {/* Top bar */}
      <header className="w-full bg-[#f4efe6]">
        <div className="flex items-center px-5 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f5c518] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-[#171717] tracking-tight">LM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[#171717] tracking-tight">LikeMind</span>
              <span className="text-xs font-mono text-[#a09880] uppercase tracking-widest ml-1">
                Setup
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Centered content */}
      <div className="flex-1 flex items-start justify-center pt-16 px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#171717] mb-2">Set new password</h1>
            <p className="text-sm text-[#a09880]">Enter the code we sent, then choose a new password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#d97706] mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@likemind.coop"
                className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all placeholder:text-[#c8bfa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                Verification code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Code from your email"
                className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all placeholder:text-[#c8bfa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all placeholder:text-[#c8bfa8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09880] hover:text-[#171717] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all placeholder:text-[#c8bfa8]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09880] hover:text-[#171717] transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-600 mt-2">Passwords don&apos;t match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || resetPassword.isPending}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-semibold text-sm transition-all mt-2"
            >
              {resetPassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {resetPassword.isPending ? "Saving…" : "Save and log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
