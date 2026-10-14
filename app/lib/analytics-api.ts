/**
 * analytics-api.ts
 *
 * Typed wrappers for the four Analytics endpoints, admin dashboard only:
 *
 *  - getAnalyticsSummary   GET /api/Analytics/summary
 *  - getMonthlySavings     GET /api/Analytics/monthly-savings
 *  - getMonthlyInvestments GET /api/Analytics/monthly-investments
 *  - getMonthlyLoans       GET /api/Analytics/monthly-loans
 *
 * All four are cooperative-wide aggregates (member counts, totals across every
 * member) — called with `adminApiFetch`.
 *
 * Response shapes confirmed from real responses (2026-10-14), not guessed:
 *  - summary: a bare object, NOT wrapped in the standard {success,data}
 *    envelope — `{ from, to, totalMembers, activeMembers, nonActiveMembers,
 *    pendingActivationMembers, savingsBalanceTotal, cycleContributionTotal,
 *    totalContribution }`.
 *  - the three monthly-* endpoints: also bare, `{ from, to, months: [...] }`
 *    (not `items`), each month row carrying numeric `year`/`month` AND a
 *    pre-formatted `label` ("Oct 2025") — `label` is what's used for the
 *    x-axis; see `monthLabel()`.
 *  - monthly-savings rows also include `category`/`total` at the top level
 *    (not currently surfaced in the UI).
 */

import { adminApiFetch } from "@/app/lib/api-client";
import { assertAccepted, isRecord, type UnknownRecord } from "@/app/lib/api-response";

export type DateRangeParams = {
  /** yyyy-MM-dd, inclusive. Defaults (backend-side) to 1 January of the current year. */
  from?: string;
  /** yyyy-MM-dd, inclusive. Defaults (backend-side) to today (UTC). */
  to?: string;
};

export const SAVINGS_CATEGORIES = [
  "BulkAdminCredit",
  "LoanRepayment",
  "Contribution",
  "ContributionWithdrawal",
  "CooperativeDeduction",
  "Adjustment",
  "InvestmentPoolContribution",
  "InvestmentPoolDividend",
  "Withdrawal",
] as const;
export type SavingsCategory = (typeof SAVINGS_CATEGORIES)[number];

export const LOAN_ANALYTICS_STATUSES = [
  "PendingReview",
  "PendingApprovals",
  "Approved",
  "Rejected",
  "PendingDisbursementApprovals",
  "Disbursed",
  "Closed",
] as const;
export type LoanAnalyticsStatus = (typeof LOAN_ANALYTICS_STATUSES)[number];

// ─── Response types (unconfirmed — see the module doc comment) ───────────────

export type AnalyticsSummary = {
  activeMembers: number;
  pendingActivationMembers: number;
  nonActiveMembers: number;
  totalMembers: number;
  savingsBalanceTotal: number;
  cycleContributionTotal: number;
  totalContribution: number;
  raw: UnknownRecord;
};

export type MonthlySavingsPoint = {
  /** The raw month label/date from the response, used for the x-axis as given. */
  month: string;
  amount: number;
};

export type MonthlyInvestmentPoint = {
  month: string;
  moneyMovedIntoPools: number;
  participantContributionAmount: number;
};

export type MonthlyLoanPoint = {
  month: string;
  requestedCount: number;
  requestedAmount: number;
  disbursedCount: number;
  disbursedAmount: number;
};

// ─── Response parsing ──────────────────────────────────────────────────────────

function num(sources: Array<UnknownRecord | null | undefined>, keys: string[]): number {
  for (const source of sources) {
    if (!source) continue;
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
    }
  }
  return 0;
}

function str(sources: Array<UnknownRecord | null | undefined>, keys: string[]): string {
  for (const source of sources) {
    if (!source) continue;
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return "";
}

function dataOf(response: unknown): UnknownRecord | undefined {
  return isRecord(response) && isRecord(response.data) ? response.data : isRecord(response) ? response : undefined;
}

/**
 * The three monthly-* endpoints return `{ from, to, months: [...] }` (confirmed
 * from a real response — not the `{ data: { items: [...] } }` envelope used
 * elsewhere in this codebase, and not wrapped in the standard success envelope
 * at all). Still checks "items" and a bare array as fallbacks in case that
 * ever changes or another analytics endpoint uses the shared envelope.
 */
function rowsOf(response: unknown): unknown[] {
  const data = dataOf(response);
  if (Array.isArray(response)) return response;
  if (data && Array.isArray((data as UnknownRecord).months)) return (data as UnknownRecord).months as unknown[];
  if (data && Array.isArray((data as UnknownRecord).items)) return (data as UnknownRecord).items as unknown[];
  if (Array.isArray(data)) return data as unknown[];
  return [];
}

function toSummary(row: UnknownRecord): AnalyticsSummary {
  const active = num([row], ["activeMembers", "ActiveMembers"]);
  const pending = num([row], ["pendingActivationMembers", "PendingActivationMembers"]);
  const nonActive = num([row], ["nonActiveMembers", "NonActiveMembers"]);
  const savingsBalanceTotal = num([row], ["savingsBalanceTotal", "SavingsBalanceTotal"]);
  const cycleContributionTotal = num([row], ["cycleContributionTotal", "CycleContributionTotal"]);
  return {
    activeMembers: active,
    pendingActivationMembers: pending,
    nonActiveMembers: nonActive,
    totalMembers: num([row], ["totalMembers", "TotalMembers"]) || active + pending + nonActive,
    savingsBalanceTotal,
    cycleContributionTotal,
    totalContribution: num([row], ["totalContribution", "TotalContribution"]) || savingsBalanceTotal + cycleContributionTotal,
    raw: row,
  };
}

/**
 * Every month row's x-axis label — confirmed from a real response: `label`
 * is a pre-formatted "Oct 2025" string; `month`/`year` are numbers (1-12 /
 * four-digit), not usable by `str()`'s string-only check, kept here only as
 * a last-resort fallback if a future response ever drops `label`.
 */
function monthLabel(row: UnknownRecord): string {
  const direct = str([row], ["label", "Label", "monthLabel", "period"]);
  if (direct) return direct;
  const year = num([row], ["year", "Year"]);
  const month = num([row], ["month", "Month"]);
  if (year && month) {
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
  }
  return "";
}

function toMonthlySavingsPoint(row: unknown): MonthlySavingsPoint | null {
  if (!isRecord(row)) return null;
  return {
    month: monthLabel(row),
    amount: num([row], ["amount", "Amount"]),
  };
}

function toMonthlyInvestmentPoint(row: unknown): MonthlyInvestmentPoint | null {
  if (!isRecord(row)) return null;
  return {
    month: monthLabel(row),
    moneyMovedIntoPools: num([row], ["moneyMovedIntoPools", "MoneyMovedIntoPools"]),
    participantContributionAmount: num([row], ["participantContributionAmount", "ParticipantContributionAmount"]),
  };
}

function toMonthlyLoanPoint(row: unknown): MonthlyLoanPoint | null {
  if (!isRecord(row)) return null;
  return {
    month: monthLabel(row),
    requestedCount: num([row], ["requestedCount", "RequestedCount"]),
    requestedAmount: num([row], ["requestedAmount", "RequestedAmount"]),
    disbursedCount: num([row], ["disbursedCount", "DisbursedCount"]),
    disbursedAmount: num([row], ["disbursedAmount", "DisbursedAmount"]),
  };
}

function dateQuery(params: DateRangeParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  return q;
}

// ─── Admin reads ───────────────────────────────────────────────────────────────

/** GET /api/Analytics/summary — dashboard summary cards. */
export async function getAnalyticsSummary(params: DateRangeParams = {}): Promise<AnalyticsSummary> {
  const q = dateQuery(params);
  const raw = assertAccepted(
    await adminApiFetch<unknown>(`/api/Analytics/summary${q.toString() ? `?${q}` : ""}`),
    "Could not load the dashboard summary.",
  );
  const data = dataOf(raw);
  if (!data) throw new Error("The analytics summary response was not recognised.");
  return toSummary(data);
}

export type MonthlySavingsParams = DateRangeParams & { category?: SavingsCategory; allCategories?: boolean };

/** GET /api/Analytics/monthly-savings — monthly savings for the savings graph. */
export async function getMonthlySavings(params: MonthlySavingsParams = {}): Promise<MonthlySavingsPoint[]> {
  const q = dateQuery(params);
  if (params.category) q.set("category", params.category);
  if (params.allCategories) q.set("allCategories", "true");
  const raw = assertAccepted(
    await adminApiFetch<unknown>(`/api/Analytics/monthly-savings${q.toString() ? `?${q}` : ""}`),
    "Could not load the monthly savings figures.",
  );
  return rowsOf(raw).map(toMonthlySavingsPoint).filter((row): row is MonthlySavingsPoint => row !== null);
}

/** GET /api/Analytics/monthly-investments — monthly investment figures for the investment graph. */
export async function getMonthlyInvestments(params: DateRangeParams = {}): Promise<MonthlyInvestmentPoint[]> {
  const q = dateQuery(params);
  const raw = assertAccepted(
    await adminApiFetch<unknown>(`/api/Analytics/monthly-investments${q.toString() ? `?${q}` : ""}`),
    "Could not load the monthly investment figures.",
  );
  return rowsOf(raw).map(toMonthlyInvestmentPoint).filter((row): row is MonthlyInvestmentPoint => row !== null);
}

export type MonthlyLoansParams = DateRangeParams & { status?: LoanAnalyticsStatus };

/** GET /api/Analytics/monthly-loans — monthly loan figures, requested and disbursed. */
export async function getMonthlyLoans(params: MonthlyLoansParams = {}): Promise<MonthlyLoanPoint[]> {
  const q = dateQuery(params);
  if (params.status) q.set("status", params.status);
  const raw = assertAccepted(
    await adminApiFetch<unknown>(`/api/Analytics/monthly-loans${q.toString() ? `?${q}` : ""}`),
    "Could not load the monthly loan figures.",
  );
  return rowsOf(raw).map(toMonthlyLoanPoint).filter((row): row is MonthlyLoanPoint => row !== null);
}
