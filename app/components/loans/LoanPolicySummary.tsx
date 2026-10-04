"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { getMemberCooperativeId } from "@/app/lib/cooperative-id-api";
import { getMemberLoanPolicy } from "@/app/lib/loan-governance-api";

function formatAmount(value: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

/**
 * Shows the cooperative's real loan policy (max amount, term, rate, key
 * eligibility rules) so a member knows what they can borrow before guessing
 * at the calculator. Reads with the member's own token on the same endpoint
 * admin screens use — if the backend does not allow that for this deployment,
 * this fails quietly (renders nothing) rather than showing an error, since
 * it's reference info, not something the page depends on.
 */
export function LoanPolicySummary() {
  const cooperativeId = useQuery({
    queryKey: ["member-cooperative-id"],
    queryFn: getMemberCooperativeId,
    staleTime: Infinity,
    retry: 1,
  });

  const policy = useQuery({
    queryKey: ["member-loan-policy", cooperativeId.data],
    queryFn: () => getMemberLoanPolicy(cooperativeId.data!),
    enabled: Boolean(cooperativeId.data),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (policy.isError || cooperativeId.isError) return null;

  if (policy.isPending) {
    return (
      <div className="card-dash animate-pulse rounded-3xl p-6 shadow-sm md:p-8">
        <div className="h-4 w-40 rounded bg-black/5" />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="h-12 rounded-xl bg-black/5" />
          <div className="h-12 rounded-xl bg-black/5" />
          <div className="h-12 rounded-xl bg-black/5" />
        </div>
      </div>
    );
  }

  const data = policy.data;
  if (!data) return null;
  const { eligibilityRequirements: elig } = data;

  const rules: string[] = [];
  if (elig.requireMinimumMembershipDuration) {
    rules.push(`At least ${elig.minimumMembershipMonths} month${elig.minimumMembershipMonths === 1 ? "" : "s"} of membership`);
  }
  if (elig.requireGuarantor) {
    rules.push(`${elig.minimumGuarantorCount} guarantor${elig.minimumGuarantorCount === 1 ? "" : "s"} required`);
    if (elig.guarantorMustHaveNoActiveLoan) {
      rules.push("Guarantors must have no active loan of their own");
    }
  }
  if (elig.requireDebtToIncomeCheck) {
    rules.push(`Debt-to-income ratio under ${elig.maximumDebtToIncomeRatioPercent}%`);
  }
  if (elig.requireBankStatementUpload) {
    rules.push("Bank statement upload required");
  }

  return (
    <div className="card-dash rounded-3xl p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-(--accent-500)" />
        <p className="text-xs font-bold uppercase tracking-[0.15em] dash-text-muted">Your cooperative&apos;s loan policy</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest dash-text-muted">Maximum amount</p>
          <p className="mt-1 text-lg font-bold dash-text">{formatAmount(data.maximumAmountAllowed)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest dash-text-muted">Maximum term</p>
          <p className="mt-1 text-lg font-bold dash-text">{data.maxTermMonths} months</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest dash-text-muted">Interest rate</p>
          <p className="mt-1 text-lg font-bold dash-text">{data.annualInterestRatePercent}% ({data.interestRateType})</p>
        </div>
      </div>

      {rules.length > 0 && (
        <ul className="mt-5 space-y-1.5 border-t border-black/5 pt-4 text-sm dash-text-muted">
          {rules.map((rule) => (
            <li key={rule} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current" />
              {rule}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
