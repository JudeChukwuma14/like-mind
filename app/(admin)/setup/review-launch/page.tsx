"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSetupStore } from "../useSetupStore";

type SummaryRowProps = {
  label: string;
  value: string;
  editHref: string;
};

function SummaryRow({ label, value, editHref }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-[#f0ebe0] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880] mb-1">
          {label}
        </p>
        <p className="text-sm font-medium text-[#171717]">{value || "—"}</p>
      </div>
      <Link
        href={editHref}
        className="text-xs font-semibold text-[#3b82f6] hover:text-blue-700 transition-colors ml-4 shrink-0 mt-1"
      >
        Edit
      </Link>
    </div>
  );
}

export default function ReviewLaunchPage() {
  const router = useRouter();
  const { data, isClient } = useSetupStore();
  const [mounted, setMounted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!isClient || !mounted) return null;

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) return;
    setFinalizing(true);
    // In production this would call an API
    setTimeout(() => {
      router.push("/admin");
    }, 1200);
  };

  // Build summary values from store
  const cooperativeSummary = [
    data.cooperativeName,
    data.rcNumber,
  ]
    .filter(Boolean)
    .join(" · ") || "—";

  const cycleSummary = [
    data.cycleFrequency,
    data.dueDay,
    data.minMonthly ? `₦${Number(data.minMonthly).toLocaleString()} minimum` : null,
  ]
    .filter(Boolean)
    .join(" · ") || "—";

  const loanSummary = [
    data.interestRate ? `${data.interestRate} flat` : null,
    data.maxTermMonths ? `${data.maxTermMonths} max` : null,
    "1 active per member",
  ]
    .filter(Boolean)
    .join(" · ") || "—";

  const withdrawalSummary = [
    data.maxPerCycle,
    data.withdrawalFrequency,
  ]
    .filter(Boolean)
    .join(" · ") || "—";

  const bankingSummary =
    data.destinations?.length > 0
      ? data.destinations.map((d) => d.email).join(", ")
      : "—";

  return (
    <div>
      {/* Banner */}
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880] mb-1">
        Confirm settings. After you finalize, we activate your cooperative before sign-in opens.
      </p>

      {/* Step label */}
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880] mb-1 mt-2">Step 7</p>
      <h1 className="text-4xl md:text-5xl font-bold text-[#171717] mb-8">
        Review &amp; launch
      </h1>

      <form onSubmit={handleFinalize} className="space-y-6 max-w-2xl">
        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-[#e0d9cc] divide-y divide-[#f0ebe0] overflow-hidden">
          <SummaryRow
            label="Cooperative"
            value={cooperativeSummary}
            editHref="/setup/cooperative-profile"
          />
          <SummaryRow
            label="Cycle"
            value={cycleSummary}
            editHref="/setup/cycles-contributions"
          />
          <SummaryRow
            label="Loans"
            value={loanSummary}
            editHref="/setup/loan-policy"
          />
          <SummaryRow
            label="Withdrawals"
            value={withdrawalSummary}
            editHref="/setup/withdrawal-policy"
          />
          <SummaryRow
            label="Banking"
            value={bankingSummary}
            editHref="/setup/banking"
          />
        </div>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-3 px-4 py-4 bg-white rounded-xl border border-[#e0d9cc] cursor-pointer hover:bg-[#fafaf8] transition-colors select-none">
          <div
            onClick={() => setConfirmed((v) => !v)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
              confirmed
                ? "bg-[#171717] border-[#171717]"
                : "border-[#c8bfa8] bg-white"
            }`}
          >
            {confirmed && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <p className="text-sm text-[#171717] leading-relaxed">
            I confirm settings reflect the cooperative&apos;s bylaws. Once launched,
            member-facing rules can only change at the next AGM.{" "}
            <span className="text-[#d97706] font-semibold">
              Treasurer signature
            </span>{" "}
            required for ledger-affecting edits.
          </p>
        </label>

        {/* Footer nav */}
        <div className="pt-6 border-t border-dashed border-[#ddd6c8] flex items-center justify-between">
          <Link
            href="/setup/banking"
            className="inline-flex items-center gap-2 bg-white border border-[#ddd6c8] hover:bg-[#f0ebe0] text-[#171717] px-6 py-2.5 rounded-full font-medium text-sm transition-colors"
          >
            ← Back
          </Link>
          <button
            type="submit"
            disabled={!confirmed || finalizing}
            className="bg-[#171717] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-full font-semibold text-sm transition-all"
          >
            {finalizing ? "Finalizing…" : "Finalize"}
          </button>
        </div>
      </form>
    </div>
  );
}
