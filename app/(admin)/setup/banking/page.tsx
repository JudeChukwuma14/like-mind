"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSetupStore, BankingDestination } from "../useSetupStore";

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
  const { data, setData, isClient } = useSetupStore();
  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [destEmail, setDestEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!isClient || !mounted) return null;

  const destinations = data.destinations ?? [];

  const handleAddDestination = () => {
    if (!displayName.trim() || !destEmail.trim()) return;
    setAdding(true);
    const newDest: BankingDestination = {
      displayName: displayName.trim(),
      email: destEmail.trim(),
      verified: false,
    };
    setTimeout(() => {
      setData({ destinations: [...destinations, newDest] });
      setDisplayName("");
      setDestEmail("");
      setAdding(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/setup/review-launch");
  };

  return (
    <div>
      {/* Step label */}
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880] mb-1">Step 6</p>
      <h1 className="text-4xl md:text-5xl font-bold text-[#171717] mb-1">Banking</h1>
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880] mb-8">
        Where the cooperative holds funds and how payouts settle.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Existing destinations */}
        {destinations.length > 0 && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880] mb-3">
              Interac Destinations – {destinations.length}
            </p>
            <div className="space-y-2">
              {destinations.map((dest, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3.5 bg-white rounded-xl border border-[#e0d9cc]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs"
                      style={{ backgroundColor: getBankColor(dest.displayName) }}
                    >
                      {getInitials(dest.displayName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#171717]">{dest.displayName}</p>
                      <p className="text-xs text-[#a09880]">
                        {dest.email} · payouts and fees
                      </p>
                    </div>
                  </div>
                  {dest.verified ? (
                    <span className="text-[10px] font-bold bg-[#dcfce7] text-[#166534] px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-[#fef9c3] text-[#854d0e] px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
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
                  placeholder="name@likemind.coop"
                  className="w-full px-4 py-3 rounded-xl border border-[#ddd6c8] bg-[#faf9f6] text-[#171717] text-sm outline-none focus:border-[#f5c518] focus:ring-2 focus:ring-[#f5c518]/30 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={handleAddDestination}
                disabled={!displayName.trim() || !destEmail.trim() || adding}
                className="bg-[#171717] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
              >
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
    </div>
  );
}
