"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Wallet, Trash2 } from "lucide-react";
import { useSetupStore, BankingDestination } from "../useSetupStore";
import { useRequireAccount } from "../useSetupGuard";
import { SetupStepHeader } from "../SetupStepHeader";
import { FadeUp, AnimatePresence, motion } from "@/app/components/Motion";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getInitials(name: string) {
  return name
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getBankColor(name: string) {
  const colors = [
    "#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#14b8a6",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function BankingPage() {
  const router = useRouter();
  const { data, setData, isClient, lastSaved } = useSetupStore();
  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [destEmail, setDestEmail] = useState("");
  const [destDescription, setDestDescription] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => setMounted(true), []);
  useRequireAccount(isClient, data.cooperativeAccountId);
  if (!isClient || !mounted || !data.cooperativeAccountId) return null;

  const destinations = data.destinations ?? [];
  const emailValid = EMAIL_RE.test(destEmail.trim());

  const handleAddDestination = () => {
    if (!displayName.trim() || !emailValid) return;
    setAdding(true);
    const newDest: BankingDestination = {
      id: crypto.randomUUID(),
      displayName: displayName.trim(),
      email: destEmail.trim(),
      description: destDescription.trim(),
      verified: false,
    };
    setTimeout(() => {
      setData({ destinations: [...destinations, newDest] });
      setDisplayName("");
      setDestEmail("");
      setDestDescription("");
      setEmailTouched(false);
      setAdding(false);
    }, 600);
  };

  const handleRemoveDestination = (id: string) => {
    setData({ destinations: destinations.filter((d) => d.id !== id) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/setup/review-launch");
  };

  return (
    <FadeUp>
      <SetupStepHeader
        step={6}
        title="Banking"
        subtitle={
          <span className="text-[#a09880]">
            Where the cooperative holds funds and how payouts settle.
          </span>
        }
        lastSaved={lastSaved}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Existing destinations */}
        {destinations.length > 0 ? (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880] mb-3">
              Interac Destinations – {destinations.length}
            </p>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {destinations.map((dest) => (
                  <motion.div
                    key={dest.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 bg-white rounded-xl border border-[#e0d9cc]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs"
                        style={{ backgroundColor: getBankColor(dest.displayName) }}
                      >
                        {getInitials(dest.displayName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#171717] truncate">{dest.displayName}</p>
                        <p className="text-xs text-[#a09880] truncate">
                          {dest.email} · payouts and fees
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {dest.verified ? (
                        <span className="text-[10px] font-bold bg-[#dcfce7] text-[#166534] px-2.5 py-1 rounded-full uppercase tracking-wide">
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-[#fef9c3] text-[#854d0e] px-2.5 py-1 rounded-full uppercase tracking-wide">
                          Pending
                        </span>
                      )}
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        onClick={() => handleRemoveDestination(dest.id)}
                        aria-label={`Remove ${dest.displayName}`}
                        className="text-[#a09880] hover:text-[#dc2626] transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center gap-2 py-8 bg-white rounded-2xl border border-dashed border-[#ddd6c8]">
            <Wallet className="w-6 h-6 text-[#c8bfa8]" />
            <p className="text-sm text-[#a09880]">No payout destinations yet — add one below.</p>
          </div>
        )}

        {/* Add destination form */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880] mb-3">
            Add Interac Destination
          </p>
          <div className="bg-white rounded-xl border border-[#e0d9cc] p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Reserve · Stanbic"
                  className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-[#faf9f6] text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                  Interac E-Transfer Email
                </label>
                <input
                  type="email"
                  value={destEmail}
                  onChange={(e) => setDestEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="name@likemind.coop"
                  className={`w-full px-4 py-3 rounded-xl border bg-[#faf9f6] text-[#171717] text-sm outline-none focus:ring-2 transition-all ${
                    emailTouched && destEmail.trim() && !emailValid
                      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                      : "border-[#ddd6c8] focus:border-[#f5c518] focus:ring-[#f5c518]/30"
                  }`}
                />
                {emailTouched && destEmail.trim() && !emailValid && (
                  <p className="text-xs text-red-600 mt-1">Enter a valid email address.</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a09880] mb-1.5 uppercase tracking-wide">
                Description — optional
              </label>
              <input
                type="text"
                value={destDescription}
                onChange={(e) => setDestDescription(e.target.value)}
                placeholder="e.g. Primary payout account"
                className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-[#faf9f6] text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setEmailTouched(true);
                  handleAddDestination();
                }}
                disabled={!displayName.trim() || !emailValid || adding}
                className="inline-flex items-center gap-2 bg-[#171717] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
              >
                {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {adding ? "Adding…" : "Add destination"}
              </button>
              <p className="text-xs text-[#a09880]">
                We send a{" "}
                <span className="font-semibold text-[#171717]">₦1</span>{" "}
                verification micro-transfer to{" "}
                <span className="text-[#3b82f6]">confirm</span> the address
                before it can receive payouts.
              </p>
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="pt-6 border-t border-dashed border-[#ddd6c8] flex items-center justify-between mt-6">
          <Link
            href="/setup/withdrawal-policy"
            className="inline-flex items-center gap-2 bg-white border border-[#ddd6c8] hover:bg-[#f0ebe0] text-[#171717] px-6 py-2.5 rounded-full font-medium text-sm transition-colors"
          >
            ← Back
          </Link>
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
