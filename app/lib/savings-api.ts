/**
 * savings-api.ts
 *
 * Typed wrappers for the Savings endpoints consumed by members.
 * All calls go through `apiFetch` which injects the member JWT.
 *
 * Endpoint base: NEXT_PUBLIC_API_BASE_URL
 *
 * Key distinction:
 *   - A SUBMITTED payment is NOT yet savings.
 *   - A CONFIRMED payment creates a savings transaction and credits balance.
 *   - Only confirmed transactions affect the available savings balance.
 */

import { apiFetch, type ApiEnvelope } from "@/app/lib/api-client";
import type { PaymentDraft } from "@/app/lib/payments-api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SavingsTransactionType =
  | "Credit"
  | "Debit"
  | "ContributionConfirmed"
  | "WithdrawalCompleted"
  | "DeductionCompleted"
  | string;

export type SavingsTransaction = {
  id: string;
  amount: number | null;
  type: SavingsTransactionType | null;
  /** Human-readable description */
  description: string | null;
  /** ISO date string */
  createdAt: string | null;
  referenceId: string | null;
};

export type SavingsAccount = {
  balance: {
    userId: string | null;
    balance: number | null;
    currency: string | null;
  } | null;
  transactions: {
    items: SavingsTransaction[] | null;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  } | null;
};

export type GetMySavingsParams = {
  page?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  reference?: string;
};

export type GetMyDraftsParams = {
  page?: number;
  pageSize?: number;
  type?: string;
  fromDate?: string;
  toDate?: string;
  reference?: string;
};

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/Savings/GetMySavings
 *
 * Returns the authenticated member's savings account with balance and
 * paginated transaction history.
 */
export async function getMySavings(params: GetMySavingsParams = {}): Promise<SavingsAccount | null> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.fromDate) q.set("fromDate", params.fromDate);
  if (params.toDate) q.set("toDate", params.toDate);
  if (params.reference) q.set("reference", params.reference);

  const url = `/api/Savings/GetMySavings${q.toString() ? `?${q.toString()}` : ""}`;
  const res = await apiFetch<ApiEnvelope<SavingsAccount>>(url);
  return res.data ?? null;
}

/**
 * GET /api/Savings/GetMyDrafts
 *
 * Returns the authenticated member's payment drafts.
 */
export async function getMyDrafts(params: GetMyDraftsParams = {}): Promise<PaymentDraft[]> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.type) q.set("type", params.type);
  if (params.fromDate) q.set("fromDate", params.fromDate);
  if (params.toDate) q.set("toDate", params.toDate);
  if (params.reference) q.set("reference", params.reference);

  const url = `/api/Savings/GetMyDrafts${q.toString() ? `?${q.toString()}` : ""}`;
  // NOTE: Depending on the backend this might be a paginated envelope. We return the array for now.
  const res = await apiFetch<ApiEnvelope<PaymentDraft[] | any>>(url);
  if (res.data && Array.isArray(res.data)) {
    return res.data;
  } else if (res.data && Array.isArray(res.data.items)) {
    return res.data.items;
  }
  return [];
}
