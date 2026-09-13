/**
 * payments-api.ts
 *
 * Typed wrappers for the Payments endpoints.
 *
 * Payment lifecycle:
 *   DRAFT → SUBMITTED/PENDING_CONFIRMATION → CONFIRMED | REJECTED
 *
 * Member calls go through `apiFetch` (member JWT).
 * Admin confirmation calls go through `adminApiFetch` (admin JWT).
 *
 * Endpoint base:
 *   Member: NEXT_PUBLIC_API_BASE_URL
 *   Admin:  NEXT_PUBLIC_ADMIN_API_BASE_URL
 */

import { apiFetch, adminApiFetch, type ApiEnvelope } from "@/app/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "Draft"
  | "Submitted"
  | "PendingConfirmation"
  | "Confirmed"
  | "Rejected"
  | string;

/** A payment draft as returned by GET /api/Savings/GetMyDrafts */
export type PaymentDraft = {
  id: string;
  type: string | null;
  contributionMonth: string | null;
  amountPaid: number | null;
  currency: string | null;
  paymentDate: string | null;
  method: string | null;
  interacReferenceNumber: string | null;
  interacReferenceEmail: string | null;
  note: string | null;
  proofFileName: string | null;
  status: PaymentStatus | null;
  submittedAt: string | null;
  commitmentFeeTotalPaid: number | null;
  commitmentFeeRemaining: number | null;
};

/** A pending payment submission as returned by GET /api/Payments/PendingConfirmation */
export type PendingPayment = {
  id: string;
  memberId: string | null;
  memberName: string | null;
  memberEmail: string | null;
  amount: number | null;
  contributionType: string | null;
  referenceNumber: string | null;
  status: PaymentStatus | null;
  /** ISO date string */
  submittedAt: string | null;
  /** ISO date string */
  createdAt: string | null;
  proofUrl: string | null;
  note: string | null;
};

export type PendingPaymentPage = {
  items: PendingPayment[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

// ─── Payload types ────────────────────────────────────────────────────────────

// ─── Payload types ────────────────────────────────────────────────────────────

/** Body for POST /api/Payments/Draft (multipart/form-data) */
export type CreatePaymentDraftPayload = {
  Id?: string;
  Type: string; // e.g., 'ShareCapital', 'SavingsContribution', 'CommitmentFee'
  ContributionMonth?: string;
  AmountPaid?: number;
  Currency?: string;
  PaymentDate?: string;
  InteracReferenceEmail: string;
  Method: string;
  InteracReferenceNumber?: string;
  Note?: string;
  ProofOfPayment?: File;
};

/** Body for POST /api/Savings/{id}/Reject */
export type RejectPaymentPayload = {
  reason: string;
};

export type GetPendingPaymentsParams = {
  page?: number;
  pageSize?: number;
  type?: string;
  fromDate?: string;
  toDate?: string;
  reference?: string;
  onlyAssignedToMe?: boolean;
};

// ─── Member endpoints ─────────────────────────────────────────────────────────

/**
 * POST /api/Payments/Draft
 *
 * Creates a new payment draft. Must be sent as multipart/form-data.
 */
export async function createPaymentDraft(
  payload: CreatePaymentDraftPayload,
): Promise<unknown> {
  const formData = new FormData();
  if (payload.Id) formData.append("Id", payload.Id);
  formData.append("Type", payload.Type);
  if (payload.ContributionMonth) formData.append("ContributionMonth", payload.ContributionMonth);
  if (payload.AmountPaid != null) formData.append("AmountPaid", payload.AmountPaid.toString());
  if (payload.Currency) formData.append("Currency", payload.Currency);
  if (payload.PaymentDate) formData.append("PaymentDate", payload.PaymentDate);
  formData.append("InteracReferenceEmail", payload.InteracReferenceEmail);
  formData.append("Method", payload.Method);
  if (payload.InteracReferenceNumber) formData.append("InteracReferenceNumber", payload.InteracReferenceNumber);
  if (payload.Note) formData.append("Note", payload.Note);
  if (payload.ProofOfPayment) formData.append("ProofOfPayment", payload.ProofOfPayment);

  return apiFetch<unknown>("/api/Payments/Draft", {
    method: "POST",
    body: formData,
    // apiFetch automatically handles omitting Content-Type for FormData
  });
}

/**
 * POST /api/Payments/{id}/Submit
 *
 * Locks the draft and puts it into PENDING_CONFIRMATION state.
 * After submission the member can no longer edit the payment.
 * The backend must also enforce this — the frontend hiding the edit
 * button is for UX only.
 */
export async function submitPayment(paymentId: string): Promise<unknown> {
  return apiFetch<unknown>(
    `/api/Payments/${encodeURIComponent(paymentId)}/Submit`,
    { method: "POST" },
  );
}

// ─── Admin endpoints (require confirmmemberpayment permission) ─────────────────

/**
 * GET /api/Payments/PendingConfirmation
 *
 * Returns a paginated list of submitted payments awaiting admin confirmation.
 * Requires: confirmmemberpayment permission.
 */
export async function getPendingPayments(
  params: GetPendingPaymentsParams = {},
): Promise<PendingPaymentPage> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.type) q.set("type", params.type);
  if (params.fromDate) q.set("fromDate", params.fromDate);
  if (params.toDate) q.set("toDate", params.toDate);
  if (params.reference) q.set("reference", params.reference);
  if (params.onlyAssignedToMe != null)
    q.set("onlyAssignedToMe", String(params.onlyAssignedToMe));

  const url = `/api/Payments/PendingConfirmation${q.toString() ? `?${q.toString()}` : ""}`;
  const res = await adminApiFetch<ApiEnvelope<PendingPaymentPage>>(url);

  const data = res.data;
  if (!data) return { items: [], pageNumber: 1, pageSize: 20, totalCount: 0, totalPages: 1 };
  if (Array.isArray(data)) {
    const arr = data as PendingPayment[];
    return { items: arr, pageNumber: 1, pageSize: arr.length, totalCount: arr.length, totalPages: 1 };
  }
  return data as PendingPaymentPage;
}

/**
 * POST /api/Savings/{id}/Confirm
 *
 * Confirms a submitted payment. On success the backend should:
 * 1. Mark the payment as CONFIRMED
 * 2. Create a savings credit transaction
 * 3. Increase the member's savings balance
 *
 * Requires: confirmmemberpayment permission.
 */
export async function confirmPayment(paymentId: string): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/Savings/${encodeURIComponent(paymentId)}/Confirm`,
    { method: "POST" },
  );
}

/**
 * POST /api/Savings/{id}/Reject
 *
 * Rejects a submitted payment with a reason.
 * The payment is NOT credited to savings.
 *
 * Requires: confirmmemberpayment permission.
 */
export async function rejectPayment(
  paymentId: string,
  payload: RejectPaymentPayload,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/Savings/${encodeURIComponent(paymentId)}/Reject`,
    { method: "POST", body: payload },
  );
}
