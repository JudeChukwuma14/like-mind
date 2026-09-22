import { adminApiFetch } from "@/app/lib/api-client";
import { ensureSuccessfulResponse, unwrapLoanResponse, type LoanRecord } from "@/app/lib/loan-api";

const APPROVAL_TIERS_PATH = "/api/LoanApprovalTier/Loans/Approval/ApprovalTiers";

export type LoanApprovalBand = {
  id?: string;
  minAmount: number;
  /** Null means the final tier has no upper limit. */
  maxAmount: number | null;
  requiredApprovals: number;
};

function isRecord(value: unknown): value is LoanRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function read(record: LoanRecord, name: string): unknown {
  const key = Object.keys(record).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
  return key ? record[key] : undefined;
}

function unwrap(value: unknown): unknown {
  let data = unwrapLoanResponse(ensureSuccessfulResponse(value));
  if (typeof data === "string") {
    try { data = unwrapLoanResponse(ensureSuccessfulResponse(JSON.parse(data))); }
    catch { throw new Error("The loan approval tier response was not valid JSON."); }
  }
  return data;
}

function records(value: unknown): LoanRecord[] {
  const data = unwrap(value);
  if (Array.isArray(data)) return data.filter(isRecord);
  if (isRecord(data)) {
    const list = read(data, "items") ?? read(data, "tiers") ?? read(data, "proposals") ?? read(data, "pendingProposals") ?? read(data, "changeRequests");
    if (Array.isArray(list)) return list.filter(isRecord);
  }
  if (data == null) return [];
  throw new Error("The loan approval tier response had an unexpected format.");
}

function parseTier(value: LoanRecord, index: number): LoanApprovalBand {
  const id = read(value, "id");
  const minimum = read(value, "minAmount");
  const maximum = read(value, "maxAmount");
  const approvals = read(value, "requiredApprovals");
  if ([minimum, approvals].some((item) => item == null || item === "")) {
    throw new Error(`Active approval tier ${index + 1} is missing its minimum amount or approval count. No replacement proposal can be prepared safely.`);
  }
  const minAmount = Number(minimum);
  const maxAmount = maximum == null || maximum === "" ? null : Number(maximum);
  const requiredApprovals = Number(approvals);
  if (![minAmount, requiredApprovals].every(Number.isFinite) || (maxAmount !== null && !Number.isFinite(maxAmount))) {
    throw new Error(`Active approval tier ${index + 1} has an invalid amount or approval count. No replacement proposal can be prepared safely.`);
  }
  return { ...(typeof id === "string" && id.trim() ? { id } : {}), minAmount, maxAmount, requiredApprovals };
}

export async function getLoanApprovalTiers(): Promise<LoanApprovalBand[]> {
  const response = await adminApiFetch<unknown>(APPROVAL_TIERS_PATH);
  return records(response).map(parseTier);
}

export function replaceLoanApprovalTiers(tiers: LoanApprovalBand[]): Promise<unknown> {
  return adminApiFetch<unknown>(APPROVAL_TIERS_PATH, { method: "PUT", body: { tiers } }).then(ensureSuccessfulResponse);
}

export function proposeLoanApprovalTiers(tiers: LoanApprovalBand[]): Promise<unknown> {
  return adminApiFetch<unknown>(`${APPROVAL_TIERS_PATH}/Propose`, { method: "POST", body: { tiers } }).then(ensureSuccessfulResponse);
}

export async function getPendingLoanApprovalTierProposals(): Promise<LoanRecord[]> {
  return records(await adminApiFetch<unknown>(`${APPROVAL_TIERS_PATH}/PendingProposals`));
}

export function reviewLoanApprovalTierProposal(changeRequestId: string, approve: boolean, note: string): Promise<unknown> {
  return adminApiFetch<unknown>(`${APPROVAL_TIERS_PATH}/${encodeURIComponent(changeRequestId)}/Review`, {
    method: "POST",
    body: { approve, note },
  }).then(ensureSuccessfulResponse);
}

const LOAN_POLICY_PATH = "/api/LoanPolicy/Loans/Policy";

export type LoanPolicy = {
  annualInterestRatePercent: number;
  maximumAmountAllowed: number;
  interestRateType: string;
  maxTermMonths: number;
  latePenaltyPercentPerMonth: number;
  eligibilityRequirements: {
    requireMinimumMembershipDuration: boolean;
    minimumMembershipMonths: number;
    requireGuarantor: boolean;
    minimumGuarantorCount: number;
    guarantorMustHaveNoActiveLoan: boolean;
    requireDebtToIncomeCheck: boolean;
    maximumDebtToIncomeRatioPercent: number;
    requireBankStatementUpload: boolean;
    firstRepaymentInstallmentDays: number;
  };
  penaltyGracePeriodDays: number;
  defaultAlertGraceDays: number;
  penaltyMode: string;
};

function requiredNumber(source: LoanRecord, name: string): number {
  const value = read(source, name);
  if (value == null || value === "") throw new Error(`The active policy is missing ${name}; it cannot safely be replaced.`);
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`The active policy has an invalid ${name}.`);
  return parsed;
}

function requiredString(source: LoanRecord, name: string): string {
  const value = read(source, name);
  if (typeof value !== "string" || !value.trim()) throw new Error(`The active policy is missing ${name}; it cannot safely be replaced.`);
  return value;
}

function requiredBoolean(source: LoanRecord, name: string): boolean {
  const value = read(source, name);
  if (typeof value !== "boolean") throw new Error(`The active policy is missing ${name}; it cannot safely be replaced.`);
  return value;
}

/** Parse every field required by the full-replacement proposal. Never invent defaults. */
export function parseLoanPolicy(value: unknown): LoanPolicy {
  const data = unwrap(value);
  let policy: unknown = data;
  if (isRecord(data)) {
    for (const name of ["policy", "activePolicy", "currentPolicy", "loanPolicy"]) {
      const nested = read(data, name);
      if (isRecord(nested)) { policy = nested; break; }
    }
  }
  if (!isRecord(policy)) throw new Error("No active loan policy was returned for this cooperative.");
  const eligibility = read(policy, "eligibilityRequirements");
  if (!isRecord(eligibility)) throw new Error("The active policy is missing eligibilityRequirements; it cannot safely be replaced.");
  return {
    annualInterestRatePercent: requiredNumber(policy, "annualInterestRatePercent"),
    maximumAmountAllowed: requiredNumber(policy, "maximumAmountAllowed"),
    interestRateType: requiredString(policy, "interestRateType"),
    maxTermMonths: requiredNumber(policy, "maxTermMonths"),
    latePenaltyPercentPerMonth: requiredNumber(policy, "latePenaltyPercentPerMonth"),
    eligibilityRequirements: {
      requireMinimumMembershipDuration: requiredBoolean(eligibility, "requireMinimumMembershipDuration"),
      minimumMembershipMonths: requiredNumber(eligibility, "minimumMembershipMonths"),
      requireGuarantor: requiredBoolean(eligibility, "requireGuarantor"),
      minimumGuarantorCount: requiredNumber(eligibility, "minimumGuarantorCount"),
      guarantorMustHaveNoActiveLoan: requiredBoolean(eligibility, "guarantorMustHaveNoActiveLoan"),
      requireDebtToIncomeCheck: requiredBoolean(eligibility, "requireDebtToIncomeCheck"),
      maximumDebtToIncomeRatioPercent: requiredNumber(eligibility, "maximumDebtToIncomeRatioPercent"),
      requireBankStatementUpload: requiredBoolean(eligibility, "requireBankStatementUpload"),
      firstRepaymentInstallmentDays: requiredNumber(eligibility, "firstRepaymentInstallmentDays"),
    },
    penaltyGracePeriodDays: requiredNumber(policy, "penaltyGracePeriodDays"),
    defaultAlertGraceDays: requiredNumber(policy, "defaultAlertGraceDays"),
    penaltyMode: requiredString(policy, "penaltyMode"),
  };
}

/** Pending-proposal response shape is not documented; locate a complete policy without guessing field values. */
export function findProposedLoanPolicy(value: unknown): LoanPolicy | null {
  const queue: { value: unknown; depth: number }[] = [{ value, depth: 0 }];
  while (queue.length) {
    const current = queue.shift()!;
    if (!isRecord(current.value)) continue;
    if (read(current.value, "maximumAmountAllowed") != null && read(current.value, "eligibilityRequirements") != null) {
      try { return parseLoanPolicy(current.value); } catch { /* The candidate was incomplete; keep looking. */ }
    }
    if (current.depth >= 3) continue;
    const preferred = ["proposedPolicy", "newPolicy", "requestedPolicy", "proposedValue", "policy"];
    for (const name of preferred) {
      const child = read(current.value, name);
      if (isRecord(child)) queue.push({ value: child, depth: current.depth + 1 });
    }
    for (const [name, child] of Object.entries(current.value)) {
      if (/currentpolicy|activepolicy|oldpolicy|previouspolicy/i.test(name)) continue;
      if (preferred.some((field) => field.toLowerCase() === name.toLowerCase())) continue;
      if (isRecord(child)) queue.push({ value: child, depth: current.depth + 1 });
    }
  }
  return null;
}

export async function getLoanPolicy(cooperativeId: string): Promise<LoanPolicy> {
  return parseLoanPolicy(await adminApiFetch<unknown>(`${LOAN_POLICY_PATH}/${encodeURIComponent(cooperativeId)}`));
}

export function proposeLoanPolicy(cooperativeId: string, policy: LoanPolicy): Promise<unknown> {
  return adminApiFetch<unknown>(`${LOAN_POLICY_PATH}/${encodeURIComponent(cooperativeId)}/Propose`, {
    method: "POST",
    body: { policy },
  }).then(ensureSuccessfulResponse);
}

export async function getPendingLoanPolicyProposals(cooperativeId: string): Promise<LoanRecord[]> {
  return records(await adminApiFetch<unknown>(`${LOAN_POLICY_PATH}/${encodeURIComponent(cooperativeId)}/PendingProposals`));
}

export function reviewLoanPolicyChange(changeRequestId: string, approve: boolean, note: string): Promise<unknown> {
  return adminApiFetch<unknown>(`${LOAN_POLICY_PATH}/ChangeRequests/${encodeURIComponent(changeRequestId)}/Review`, {
    method: "POST",
    body: { approve, note },
  }).then(ensureSuccessfulResponse);
}
