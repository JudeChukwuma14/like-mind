"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { GoogleIcon } from "@/app/components/GoogleIcon";
import { getApiErrorMessage } from "@/app/lib/api-client";
import { useMemberLogin } from "./useMemberLogin";

export default function SignInPage() {
  const router = useRouter();
  const { login, loginByEmailOnly, verify2fa } = useMemberLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [mode, setMode] = useState<"password" | "email-only">("password");

  const signIn = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (res) => {
      if (res.requires2FA) {
        toast.success(res.message ?? "Check your email for a verification code.");
        setStep("verify");
        return;
      }
      toast.success(res.message ?? "Welcome back!");
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const signInByEmailOnly = useMutation({
    mutationFn: () => loginByEmailOnly(email),
    onSuccess: (res) => {
      if (res.requires2FA) {
        toast.success(res.message ?? "Check your email for a verification code.");
        setStep("verify");
        return;
      }
      toast.success(res.message ?? "Welcome back!");
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
      // Per the backend: an untrusted device can't use email-only login —
      // fall back to the password form instead of leaving a dead end.
      setMode("password");
    },
  });

  const verify = useMutation({
    mutationFn: () => verify2fa(email, code),
    onSuccess: (res) => {
      toast.success(res.message ?? "Welcome back!");
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "password") {
      signIn.mutate();
    } else {
      signInByEmailOnly.mutate();
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verify.mutate();
  };

  if (step === "verify") {
    return (
      <>
        <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 mb-2">
          Verify
        </p>
        <h2 className="text-3xl font-bold text-[#171717] mb-2">Check your email</h2>
        <p className="text-sm text-gray-500 mb-8">
          Enter the verification code sent to <span className="font-medium text-[#171717]">{email}</span>.
        </p>

        <form onSubmit={handleVerifySubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white tracking-widest text-center"
            />
          </div>

          <button
            type="submit"
            disabled={verify.isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-full font-medium transition-colors"
          >
            {verify.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {verify.isPending ? "Verifying…" : "Verify"}
          </button>

          <button
            type="button"
            onClick={() => setStep("credentials")}
            className="flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-[#171717] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-600">Sign in</p>
        <button
          type="button"
          onClick={() => setMode(mode === "password" ? "email-only" : "password")}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          {mode === "password" ? "Use email only instead" : "Use password instead"}
        </button>
      </div>
      <h2 className="text-3xl font-bold text-[#171717] mb-8">Welcome back</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
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

        {/* Password — only for the password-based flow. Email-only login
            relies on this device already being trusted from a previous
            password sign-in, and falls back to this mode automatically if
            it isn't. */}
        {mode === "password" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link
                href="/signin/forgot-password"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                placeholder="••••••••"
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
        )}

        <button
          type="submit"
          disabled={signIn.isPending || signInByEmailOnly.isPending}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-full font-medium transition-colors"
        >
          {signIn.isPending || signInByEmailOnly.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {mode === "password" ? "Log in" : "Send login code"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        type="button"
        className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#171717] px-6 py-3.5 rounded-full font-medium border border-gray-200 transition-colors shadow-sm"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        Need help signing in?{" "}
        <a href="mailto:admin@likemind.co" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Contact admin
        </a>
      </p>

      <button
        type="button"
        className="fixed bottom-6 right-6 flex items-center gap-2 bg-[#171717] hover:bg-black text-white pl-2 pr-4 py-2 rounded-full shadow-lg transition-colors"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #f97316, #a855f7)" }}
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="text-left leading-tight">
          <div className="text-xs font-semibold">Ask LikeMind AI</div>
          <div className="text-[10px] text-gray-400">Help signing in!</div>
        </div>
      </button>
    </>
  );
}
