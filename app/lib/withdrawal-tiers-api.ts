/**
 * withdrawal-tiers-api.ts
 *
 * Typed wrappers for the WithdrawalApprovalTiers configuration endpoints.
 *
 * These tiers determine how many approvals are required based on the amount
 * of a withdrawal or deduction request. The configuration is stored centrally
 * and consulted at request-creation time. The required approval count is then
 * SNAPSHOTTED onto each request, so changing tiers only affects NEW requests.
 *
 * All calls go through `adminApiFetch` (admin JWT).
 * Endpoint base: NEXT_PUBLIC_ADMIN_API_BASE_URL
 *
 * Requires: manageapprovaltiers permission.
 */

import { adminApiFetch, type ApiEnvelope } from "@/app/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single approval tier rule.
 *
 * Example:
 *   minAmount: 0, maxAmount: 100000, requiredApprovals: 1
 *   → Requests up to $100,000 require 1 approval.
 *
 *   minAmount: 100001, maxAmount: 500000, requiredApprovals: 2
 *   → Requests $100,001 – $500,000 require 2 approvals.
 */
export type ApprovalTier = {
  /** Inclusive lower bound of the amount range */
  minAmount: number;
  /** Inclusive upper bound of the amount range (null = no upper limit) */
  maxAmount: number | null;
  /** Number of distinct admin approvals required */
  requiredApprovals: number;
};

/**
 * The full tier configuration as returned by GET /api/WithdrawalApprovalTiers.
 * The backend may return tiers directly as an array or nested in a data envelope.
 */
export type WithdrawalApprovalTiersConfig = {
  tiers: ApprovalTier[];
};

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/WithdrawalApprovalTiers
 *
 * Retrieves the current withdrawal approval tier configuration.
 * Requires: manageapprovaltiers permission.
 */
export async function getWithdrawalApprovalTiers(): Promise<ApprovalTier[]> {
  const res = await adminApiFetch<ApiEnvelope<WithdrawalApprovalTiersConfig | ApprovalTier[]>>(
    "/api/WithdrawalApprovalTiers",
  );
  const data = res.data;
  if (!data) return [];
  // Handle both { tiers: [...] } and bare array shapes defensively
  if (Array.isArray(data)) return data as ApprovalTier[];
  if ("tiers" in data && Array.isArray(data.tiers)) return data.tiers;
  return [];
}

/**
 * PUT /api/WithdrawalApprovalTiers
 *
 * Replaces the entire tier configuration.
 *
 * The UI must validate before calling:
 *   - Tiers have no overlapping ranges
 *   - No negative amounts
 *   - minAmount ≤ maxAmount (or maxAmount is null for open-ended)
 *   - requiredApprovals ≥ 1
 *   - No gaps that leave an amount range without a tier (unless allowed by rules)
 *   - Tiers are ordered appropriately
 *
 * Important: This only affects NEW financial requests. Existing pending or
 * approving requests retain the requiredApprovals that were snapshotted at
 * their creation time and are NOT retroactively updated.
 *
 * Requires: manageapprovaltiers permission.
 */
export async function updateWithdrawalApprovalTiers(
  tiers: ApprovalTier[],
): Promise<unknown> {
  return adminApiFetch<unknown>("/api/WithdrawalApprovalTiers", {
    method: "PUT",
    body: { tiers },
  });
}
