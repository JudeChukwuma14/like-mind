/**
 * savings-api.ts
 *
 * Typed wrappers for the Savings endpoints consumed by members.
 * Calls use the member JWT on the cooperative API host.
 *
 * Endpoint base: NEXT_PUBLIC_ADMIN_API_BASE_URL
 *
 * Key distinction:
 *   - A SUBMITTED payment is NOT yet savings.
 *   - A CONFIRMED payment creates a savings transaction and credits balance.
 *   - Only confirmed transactions affect the available savings balance.
 */

import { ensureApiSuccess, memberProfileApiFetch, type ApiEnvelope } from "@/app/lib/api-client";
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
  transactionType: string | null;
  category: string | null;
  contributionType: string | null;
  amount: number | null;
  balanceAfter: number | null;
  reference: string | null;
  description: string | null;
  transactionDate: string | null;
  createdAt: string | null;
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
  const res = await memberProfileApiFetch<ApiEnvelope<SavingsAccount | null>>(url);
  return ensureApiSuccess(res).data ?? null;
}

/**
 * GET /api/Savings/GetMyDrafts
 *
 * Returns the authenticated member's payment drafts.
 */
export type PaymentDraftPage = { items: PaymentDraft[]; pageNumber: number; pageSize: number; totalCount: number; totalPages: number };

export async function getMyDraftsPage(params: GetMyDraftsParams = {}): Promise<PaymentDraftPage> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.type) q.set("type", params.type);
  if (params.fromDate) q.set("fromDate", params.fromDate);
  if (params.toDate) q.set("toDate", params.toDate);
  if (params.reference) q.set("reference", params.reference);

  const url = `/api/Savings/GetMyDrafts${q.toString() ? `?${q.toString()}` : ""}`;
  const res = await memberProfileApiFetch<ApiEnvelope<PaymentDraft[] | PaymentDraftPage>>(url);
  const data = ensureApiSuccess(res).data;
  if (data == null) return { items: [], pageNumber: 1, pageSize: 20, totalCount: 0, totalPages: 1 };
  if (Array.isArray(data)) return { items: data, pageNumber: 1, pageSize: data.length, totalCount: data.length, totalPages: 1 };
  if (data && Array.isArray(data.items)) return data;
  throw new Error("The payment drafts response had an unexpected format.");
}

/** Convenience for the draft editor; list screens should use getMyDraftsPage. */
export async function getMyDrafts(params: GetMyDraftsParams = {}): Promise<PaymentDraft[]> {
  return (await getMyDraftsPage(params)).items;
}

/** Locate a draft when the backend has no GET-by-id route. */
export async function getMyDraftById(id: string): Promise<PaymentDraft | null> {
  for (let page = 1; page <= 20; page++) {
    const result = await getMyDraftsPage({ page, pageSize: 100 });
    const draft = result.items.find((item) => item.id === id);
    if (draft) return draft;
    if (page >= result.totalPages || result.items.length === 0) break;
  }
  return null;
}
