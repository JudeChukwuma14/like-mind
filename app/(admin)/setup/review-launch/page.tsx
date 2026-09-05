"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Loader2,
  Rocket,
  Building2,
  Repeat,
  HandCoins,
  Banknote,
  CreditCard,
  AlertTriangle,
  PartyPopper,
  Copy,
  Check,
  Home,
  type LucideIcon,
} from "lucide-react";
import { useSetupStore } from "../useSetupStore";
import { useRequireAccount } from "../useSetupGuard";
import { buildCompleteSetupRequest } from "../complete-setup-mapper";
import { adminApiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";
import { FadeUp, StaggerChildren, StaggerItem, motion } from "@/app/components/Motion";
import { SetupStepHeader } from "../SetupStepHeader";
import { CURRENCIES, TIMEZONES } from "../setupConstants";

function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]}`;
}

function formatDueDay(day: string): string {
  const n = Number(day);
  if (!day || Number.isNaN(n)) return "an unset day";
  return n >= 29 ? "the last day of the month" : `the ${ordinal(n)} of the month`;
}

function currencySymbol(code: string): string {
  const label = CURRENCIES.find((c) => c.code === code)?.label ?? code;
  const [, symbol] = label.split("—");
  return symbol?.trim() ?? code;
}

function money(amount: string, symbol: string): string | null {
  const n = Number(amount);
  if (!amount || Number.isNaN(n)) return null;
  return `${symbol}${n.toLocaleString()}`;
}

type SummarySectionProps = {
  icon: LucideIcon;
  title: string;
  lines: string[];
  editHref: string;
  warning?: boolean;
};

function SummarySection({ icon: Icon, title, lines, editHref, warning }: SummarySectionProps) {
  return (
    <StaggerItem className="flex items-start gap-4 py-4 border-b border-[#f0ebe0] last:border-0">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          warning ? "bg-[#fef3c7]" : "bg-[#f0ebe0]"
        }`}
      >
        <Icon className={`w-4 h-4 ${warning ? "text-[#92400e]" : "text-[#6b7280]"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880]">{title}</p>
          {warning && <AlertTriangle className="w-3 h-3 text-[#d97706]" />}
        </div>
        {lines.map((line, i) => (
          <p
            key={i}
            className={i === 0 ? "text-sm font-medium text-[#171717]" : "text-xs text-[#a09880] mt-0.5"}
          >
            {line}
          </p>
        ))}
      </div>
      <Link
        href={editHref}
        className="text-xs font-semibold text-[#3b82f6] hover:text-blue-700 transition-colors shrink-0 mt-1"
      >
        Edit
      </Link>
    </StaggerItem>
  );
}

type CompleteSetupData = {
  provisioningStatus: string;
  rootAdminUserId: string | null;
};

function LaunchResultModal({
  result,
  message,
  cooperativeId,
  onContinue,
}: {
  result: CompleteSetupData;
  message: string;
  cooperativeId: string;
  onContinue: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const needsAttention = !result.rootAdminUserId;

  const handleCopy = () => {
    navigator.clipboard.writeText(cooperativeId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl border border-[#e0d9cc] shadow-xl max-w-sm w-full p-6 text-center"
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            needsAttention ? "bg-[#fef3c7]" : "bg-[#dcfce7]"
          }`}
        >
          {needsAttention ? (
            <AlertTriangle className="w-7 h-7 text-[#92400e]" />
          ) : (
            <PartyPopper className="w-7 h-7 text-[#166534]" />
          )}
        </div>

        <h2 className="text-xl font-bold text-[#171717] mb-2">
          {needsAttention ? "Cooperative created" : "Cooperative launched!"}
        </h2>
        <p className="text-sm text-[#6b7280] leading-relaxed mb-4">{message}</p>

        <div className="bg-[#faf9f6] border border-[#e0d9cc] rounded-xl px-4 py-3 mb-3 text-left">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#a09880] mb-1">
            Cooperative ID
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-mono text-[#171717] truncate">{cooperativeId}</p>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy cooperative ID"
              className="text-[#a09880] hover:text-[#171717] transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {needsAttention && (
          <p className="text-xs text-[#92400e] bg-[#fef3c7] border border-[#fde68a] rounded-xl px-3 py-2 mb-2 text-left">
            Status: <span className="font-semibold">{result.provisioningStatus}</span> — the root admin
            account needs setup before sign-in works. Contact support if this doesn&apos;t resolve itself.
          </p>
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 w-full bg-[#171717] hover:bg-black text-white py-3 rounded-full font-semibold text-sm transition-colors mt-3"
        >
          <Home className="w-4 h-4" />
          Go to login
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function ReviewLaunchPage() {
  const router = useRouter();
  const { data, clearData, isClient } = useSetupStore();
  const [mounted, setMounted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [launchResult, setLaunchResult] = useState<{ data: CompleteSetupData; message: string } | null>(
    null,
  );

  const completeSetup = useMutation({
    mutationFn: async () => {
      const body = buildCompleteSetupRequest(data);
      return adminApiFetch<ApiEnvelope<CompleteSetupData>>(
        `/api/CooperativeAccount/CompleteSetup/${data.cooperativeAccountId}`,
        { method: "POST", body },
      );
    },
    onSuccess: (res) => {
      setLaunchResult({ data: res.data, message: res.message });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const handleGoHome = () => {
    clearData();
    router.push("/login");
  };

  useEffect(() => setMounted(true), []);
  useRequireAccount(isClient, data.cooperativeAccountId, Boolean(launchResult));
  if (!isClient || !mounted || (!data.cooperativeAccountId && !launchResult)) return null;

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) return;
    completeSetup.mutate();
  };

  const symbol = currencySymbol(data.defaultCurrency);
  const currencyLabel = CURRENCIES.find((c) => c.code === data.defaultCurrency)?.label ?? data.defaultCurrency;
  const timezoneLabel = TIMEZONES.find((t) => t.id === data.timezone)?.label ?? data.timezone;

  const cooperativeLines = [
    [data.cooperativeName, data.rcNumber].filter(Boolean).join(" · ") || "Not named yet",
    [data.founded && new Date(data.founded).getFullYear(), currencyLabel, timezoneLabel]
      .filter(Boolean)
      .join(" · "),
  ].filter(Boolean);

  const contributionRange = (() => {
    const min = money(data.minMonthly, symbol);
    const max = money(data.maxMonthly, symbol);
    return min && max ? `${min} – ${max} per member` : null;
  })();

  const cycleLines = [
    [data.cycleFrequency, `due ${formatDueDay(data.dueDay)}`, `${data.lateGrace}-day grace`]
      .filter(Boolean)
      .join(" · "),
    contributionRange,
  ].filter((line): line is string => Boolean(line));

  const eligibilityParts = [
    data.requiresActiveMember && `${data.minimumMembershipMonths}+ months membership`,
    data.requiresGuarantor && `${data.minimumGuarantorCount} guarantor(s)`,
    data.requiresDebtToIncome && `DTI ≤ ${data.maximumDebtToIncomeRatioPercent}%`,
    data.requiresBankStatement && "bank statement",
  ].filter(Boolean);

  const loanLines = [
    [
      data.interestRate && `${data.interestRate}% flat annually`,
      data.maxTermMonths && `up to ${data.maxTermMonths} months`,
      data.latePenalty && `${data.latePenalty}%/mo late penalty`,
    ]
      .filter(Boolean)
      .join(" · ") || "No terms set",
    eligibilityParts.length > 0 ? `Requires: ${eligibilityParts.join(", ")}` : "No eligibility requirements set",
  ];

  const blockParts = [
    data.blockActiveLoan && "active loan",
    data.blockGuarantor && "guarantor exposure",
    data.blockArrears && "arrears",
    data.blockNewMember && `< ${data.minimumDaysSinceJoining} days tenure`,
  ].filter(Boolean);

  const withdrawalLines = [
    [
      data.maxPerCycle && `up to ${data.maxPerCycle}% of balance`,
      data.withdrawalFrequency && `${data.withdrawalFrequency} per cycle`,
    ]
      .filter(Boolean)
      .join(" · ") || "No limits set",
    blockParts.length > 0 ? `Blocks: ${blockParts.join(", ")}` : "No block rules set",
  ];

  const destinations = data.destinations ?? [];
  const bankingLines =
    destinations.length > 0
      ? [
          `${destinations.length} destination${destinations.length > 1 ? "s" : ""} configured`,
          destinations.map((d) => d.displayName).join(", "),
        ]
      : ["No payout destination added yet"];

  return (
    <>
    <FadeUp>
      <SetupStepHeader
        step={7}
        title="Review & launch"
        subtitle={
          <span className="text-[#a09880]">
            Confirm settings. After you finalize, we activate your cooperative before sign-in opens.
          </span>
        }
      />

      <form onSubmit={handleFinalize} className="space-y-6 max-w-2xl">
        {/* Summary card */}
        <StaggerChildren className="bg-white rounded-2xl border border-[#e0d9cc] divide-y divide-[#f0ebe0] overflow-hidden px-5">
          <SummarySection
            icon={Building2}
            title="Cooperative"
            lines={cooperativeLines}
            editHref="/setup/cooperative-profile"
          />
          <SummarySection
            icon={Repeat}
            title="Cycle"
            lines={cycleLines}
            editHref="/setup/cycles-contributions"
          />
          <SummarySection
            icon={HandCoins}
            title="Loans"
            lines={loanLines}
            editHref="/setup/loan-policy"
          />
          <SummarySection
            icon={Banknote}
            title="Withdrawals"
            lines={withdrawalLines}
            editHref="/setup/withdrawal-policy"
          />
          <SummarySection
            icon={CreditCard}
            title="Banking"
            lines={bankingLines}
            editHref="/setup/banking"
            warning={destinations.length === 0}
          />
        </StaggerChildren>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-3 px-4 py-4 bg-white rounded-xl border border-[#e0d9cc] cursor-pointer hover:bg-[#fafaf8] transition-colors select-none">
          <motion.div
            onClick={() => setConfirmed((v) => !v)}
            whileTap={{ scale: 0.85 }}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
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
          </motion.div>
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
          <motion.button
            type="submit"
            disabled={!confirmed || completeSetup.isPending}
            whileTap={confirmed ? { scale: 0.97 } : undefined}
            className="inline-flex items-center gap-2 bg-[#171717] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-full font-semibold text-sm transition-all"
          >
            {completeSetup.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            {completeSetup.isPending ? "Launching…" : "Launch cooperative"}
          </motion.button>
        </div>
      </form>
    </FadeUp>

    {launchResult && (
      <LaunchResultModal
        result={launchResult.data}
        message={launchResult.message}
        cooperativeId={data.cooperativeAccountId}
        onContinue={handleGoHome}
      />
    )}
    </>
  );
}
