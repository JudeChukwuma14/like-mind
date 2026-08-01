"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/admin");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] flex flex-col">
      {/* Top bar */}
      <header className="w-full bg-[#f4efe6] ">
        <div className="flex items-center px-5 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f5c518] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-[#171717] tracking-tight">LM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[#171717] tracking-tight">
                LikeMind
              </span>
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
          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#171717] mb-2">
              Welcome to LikeMinds
            </h1>
            <p className="text-sm text-[#a09880]">
              Log into{" "}
              <span className="text-[#d97706]">your</span> account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-lg font-semibold text-[#171717]">Login</h2>

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

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                Password
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
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#171717] hover:bg-black text-white py-3.5 rounded-full font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
