"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { getApiErrorMessage } from "@/app/lib/api-client";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const {
    login,
    loginByEmailOnly,
    verify2fa,
    resendOtp,
    isAuthenticated,
    isLoading,
  } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [mode, setMode] = useState<"password" | "email-only">("password");

  // Already have a valid session (e.g. revisited /login directly) — skip the form.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/admin");
    }
  }, [isLoading, isAuthenticated, router]);

  const signIn = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (res) => {
      if (res.requires2FA) {
        toast.success(
          res.message ?? "Check your email for a verification code.",
        );
        setStep("verify");
        return;
      }
      toast.success(res.message ?? "Welcome back!");
      router.push("/admin");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const signInByEmailOnly = useMutation({
    mutationFn: () => loginByEmailOnly(email),
    onSuccess: (res) => {
      if (res.requires2FA) {
        toast.success(
          res.message ?? "Check your email for a verification code.",
        );
        setStep("verify");
        return;
      }
      toast.success(res.message ?? "Welcome back!");
      router.push("/admin");
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
      router.push("/admin");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const resend = useMutation({
    mutationFn: () => resendOtp(email),
    onSuccess: (res) => {
      toast.success(res.message ?? "A new code has been sent.");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const handleCredentialsSubmit = (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen bg-[#f4efe6] flex flex-col">
      {/* Top bar */}
      <header className="w-full bg-[#f4efe6] ">
        <div className="flex items-center px-5 py-3 md:px-8">
          <div className="flex items-center gap-3 bg-[#f5f1e8]">
            <Image
              src="/Likemind.png"
              alt="LikeMind"
              width={100}
              height={100}
              className="h-12 w-12 object-contain"
            />
          </div>
        </div>
      </header>

      {/* Centered content */}
      <div className="flex-1 flex items-start justify-center pt-16 px-4">
        <div className="w-full max-w-sm">
          {step === "credentials" ? (
            <>
              {/* Heading */}
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-[#171717] mb-2">
                  Welcome to LikeMinds
                </h1>
                <p className="text-sm text-[#a09880]">
                  Log into <span className="text-[#d97706]">your</span> account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#171717]">
                    Login
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setMode(mode === "password" ? "email-only" : "password")
                    }
                    className="text-xs font-semibold text-[#d97706] hover:text-[#b45309] transition-colors"
                  >
                    {mode === "password"
                      ? "Use email only instead"
                      : "Use password instead"}
                  </button>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#d97706] mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type={"email"}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@likemind.coop"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all placeholder:text-[#c8bfa8]"
                    />
                  </div>
                </div>

                {/* Password — only for the password-based flow. Email-only
                    login relies on this device already being trusted from a
                    previous password sign-in, and falls back to this mode
                    automatically if it isn't. */}
                {mode === "password" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#a09880] uppercase tracking-wide">
                        Password
                      </label>
                      <Link
                        href="/login/forgot-password"
                        className="text-xs font-semibold text-[#d97706] hover:text-[#b45309] transition-colors"
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
                        placeholder="••••••••"
                        className="w-full px-4 py-3 pr-11 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all placeholder:text-[#c8bfa8]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09880] hover:text-[#171717] transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={signIn.isPending || signInByEmailOnly.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-black text-white py-3.5 rounded-full font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {(signIn.isPending || signInByEmailOnly.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {mode === "password"
                    ? signIn.isPending
                      ? "Logging in…"
                      : "Login"
                    : signInByEmailOnly.isPending
                      ? "Sending code…"
                      : "Send login code"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Heading */}
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-[#171717] mb-2">
                  Check your email
                </h1>
                <p className="text-sm text-[#a09880]">
                  Enter the verification code sent to{" "}
                  <span className="text-[#d97706] font-medium">{email}</span>
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleVerifySubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#d97706] mb-1.5 uppercase tracking-wide">
                    Verification code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter code"
                    className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-white text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all placeholder:text-[#c8bfa8] tracking-widest text-center"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={verify.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-black text-white py-3.5 rounded-full font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {verify.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {verify.isPending ? "Verifying…" : "Verify"}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setStep("credentials")}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a09880] hover:text-[#171717] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => resend.mutate()}
                    disabled={resend.isPending}
                    className="text-xs font-semibold text-[#d97706] hover:text-[#b45309] transition-colors disabled:opacity-60"
                  >
                    {resend.isPending ? "Sending…" : "Resend code"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
