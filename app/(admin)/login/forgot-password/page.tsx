"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAdminForgotPassword } from "../../admin/useAdminForgotPassword";

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const requestReset = useAdminForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestReset.mutate(email, {
      onSuccess: () => router.push("/login/reset-password"),
    });
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
      <div className="flex-1 flex items-start justify-center pt-16 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#171717] mb-2">Forgot password?</h1>
            <p className="text-sm text-[#a09880]">
              Enter your admin email. We&apos;ll send a reset code.
            </p>
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

            <button
              type="submit"
              disabled={requestReset.isPending}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-black text-white py-3.5 rounded-full font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {requestReset.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {requestReset.isPending ? "Sending…" : "Send reset code"}
            </button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#a09880] hover:text-[#171717] transition-colors mt-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
