"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";
import { setStoredResetEmail } from "@/app/lib/reset-password-email";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const requestReset = useMutation({
    mutationFn: () =>
      apiFetch<ApiEnvelope<unknown>>("/api/Auth/forgot-password", {
        method: "POST",
        body: { email },
      }),
    onSuccess: (res) => {
      toast.success(res.message || "Reset code sent — check your email.");
      setStoredResetEmail(email);
      router.push("/signin/reset-password");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestReset.mutate();
  };

  return (
    <>
      <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 mb-2">Reset</p>
      <h2 className="text-3xl font-bold text-[#171717] mb-2">Forgot password?</h2>
      <p className="text-sm text-gray-500 mb-8">Enter your email. We&apos;ll send a reset link.</p>

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

        <button
          type="submit"
          disabled={requestReset.isPending}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-full font-medium transition-colors"
        >
          {requestReset.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {requestReset.isPending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <Link
        href="/signin"
        className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#171717] mt-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to log in
      </Link>
    </>
  );
}
