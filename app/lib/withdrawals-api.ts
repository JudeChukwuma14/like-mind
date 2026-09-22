/**
 * withdrawals-api.ts
 *
 * Typed wrappers for the Withdrawals and Deductions endpoints.
 *
 * Withdrawal lifecycle:
 *   PENDING → APPROVING → APPROVED → COMPLETED | REJECTED
 *
 * Key rules enforced by the backend:
 *   - A withdrawal is NOT completed on creation; it enters the approval workflow.
 *   - The required approval count is snapshotted at creation time from the
 *     configured approval tiers. Changes to tiers do NOT affect existing requests.
 *   - An approver cannot approve the same request twice.
 *   - Concurrent approvals are safely handled server-side.
 *   - Approving requires: approvewithdrawal permission.
 *   - Initiating a deduction requires: initiatededuction permission.
 *
 * Member calls → `memberProfileApiFetch` (member JWT on cooperative API host)
 * Admin calls  → `adminApiFetch` (admin JWT)
 *
 * Endpoint base:
 *   NEXT_PUBLIC_ADMIN_API_BASE_URL (member and admin withdrawals endpoints)
 */

import {
  adminApiFetch,
  memberProfileApiFetch,
  ensureApiSuccess,
  type ApiEnvelope,
} from "@/app/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WithdrawalStatus =
  | "Pending"
  | "Approving"
  | "Approved"
  | "Completed"
  | "Rejected"
  | "Failed"
  | string;

export type WithdrawalType = "Withdrawal" | "Deduction" | string;

/** Individual approval record for a withdrawal/deduction request */
export type WithdrawalApprovalRecord = {
  id: string | null;
  approverId: string | null;
  approverName: string | null;
  status: "Approved" | "Rejected" | string | null;
  /** ISO date string */
  approvedAt: string | null;
  /** ISO date string */
  rejectedAt: string | null;
  rejectionReason: string | null;
};

/** A withdrawal or deduction request */
export type WithdrawalRequest = {
  id: string;
  type: WithdrawalType | null;
  category?: "Withdrawal" | "CooperativeDeduction" | string | null;
  memberId: string | null;
  memberName: string | null;
  memberEmail: string | null;
  amount: number | null;
  reason: string | null;
  status: WithdrawalStatus | null;
  /** Number of approvals required (snapshotted at creation from tier config) */
  requiredApprovals: number | null;
  /** Current count of valid approvals received */
  currentApprovals: number | null;
  approvalRecords: WithdrawalApprovalRecord[] | null;
  rejectionReason: string | null;
  /** ISO date string */
  createdAt: string | null;
  /** ISO date string */
  approvedAt: string | null;
  /** ISO date string */
  completedAt: string | null;
  /** ISO date string */
  rejectedAt: string | null;
};

export type WithdrawalPage = {
  items: WithdrawalRequest[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

// ─── Payload types ────────────────────────────────────────────────────────────

/** Body for POST /api/Withdrawals/Withdraw */
export type CreateWithdrawalPayload = {
  amount: number;
  reason?: string | null;
};

/**
 * Body for POST /api/Withdrawals/Deduct
 *
 * Initiates a deduction request. This can be applied to all users or specific target users.
 */
export type CreateDeductionPayload = {
  amountPerUser: number;
  reason: string;
  applyToAllUsers: boolean;
  targetUserIds?: string[] | null;
};

/** Body for POST /api/Withdrawals/{id}/Reject */
export type RejectWithdrawalPayload = {
  note: string;
};

/** Body for POST /api/Withdrawals/{id}/Approve */
export type ApproveWithdrawalPayload = {
  note: string;
};

export type GetWithdrawalsParams = {
  page?: number;
  pageSize?: number;
  category?: string; // e.g., 'Withdrawal', 'CooperativeDeduction'
  status?: string;   // e.g., 'PendingApprovals', 'Approved', 'Rejected'
  onlyMine?: boolean;
};

// ─── Member endpoints ─────────────────────────────────────────────────────────

/**
 * POST /api/Withdrawals/Withdraw
 *
 * Creates a withdrawal request for the authenticated member.
 * The request enters the approval workflow — it is NOT completed immediately.
 * The backend validates:
 *   1. Amount is positive
 *   2. Member has sufficient savings balance
 *   3. An applicable approval tier exists for the amount
 *   4. The required approval count is snapshotted onto the request
 */
export async function requestWithdrawal(
  payload: CreateWithdrawalPayload,
): Promise<unknown> {
  const response = await memberProfileApiFetch<ApiEnvelope<unknown>>("/api/Withdrawals/Withdraw", {
    method: "POST",
    body: payload,
  });
  return ensureApiSuccess(response);
}

// ─── Admin endpoints ──────────────────────────────────────────────────────────

/**
 * POST /api/Withdrawals/Deduct
 *
 * Initiates a deduction from one or more user accounts.
 * The deduction enters the same approval workflow as withdrawals.
 *
 * Requires: initiatededuction permission.
 */
export async function initiateDeduction(
  payload: CreateDeductionPayload,
): Promise<unknown> {
  const response = await adminApiFetch<ApiEnvelope<unknown>>("/api/Withdrawals/Deduct", {
    method: "POST",
    body: payload,
  });
  return ensureApiSuccess(response);
}

/**
 * GET /api/Withdrawals
 *
 * Returns a paginated list of withdrawal and deduction requests.
 * Admins see all requests; members see only their own (backend-enforced).
 *
 * Requires: approvewithdrawal permission for admin-wide view.
 */
function withdrawalsPath(params: GetWithdrawalsParams): string {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.category) q.set("category", params.category);
  if (params.status) q.set("status", params.status);
  if (params.onlyMine != null) q.set("onlyMine", String(params.onlyMine));

  return `/api/Withdrawals${q.toString() ? `?${q.toString()}` : ""}`;
}

function withdrawalPage(response: ApiEnvelope<WithdrawalPage | WithdrawalRequest[]> | WithdrawalPage | WithdrawalRequest[]): WithdrawalPage {
  const data = Array.isArray(response) ? response : "success" in response ? ensureApiSuccess(response).data : response;
  if (!data) return { items: [], pageNumber: 1, pageSize: 20, totalCount: 0, totalPages: 1 };
  if (Array.isArray(data)) {
    const arr = data as WithdrawalRequest[];
    return { items: arr, pageNumber: 1, pageSize: arr.length, totalCount: arr.length, totalPages: 1 };
  }
  return data as WithdrawalPage;
}

export async function getWithdrawals(params: GetWithdrawalsParams = {}): Promise<WithdrawalPage> {
  const response = await adminApiFetch<ApiEnvelope<WithdrawalPage | WithdrawalRequest[]> | WithdrawalPage | WithdrawalRequest[]>(withdrawalsPath(params));
  return withdrawalPage(response);
}

/** Same list endpoint, but use the member JWT on the cooperative API host. */
export async function getMyWithdrawals(params: Omit<GetWithdrawalsParams, "onlyMine"> = {}): Promise<WithdrawalPage> {
  const response = await memberProfileApiFetch<ApiEnvelope<WithdrawalPage | WithdrawalRequest[]> | WithdrawalPage | WithdrawalRequest[]>(withdrawalsPath({ ...params, onlyMine: true }));
  return withdrawalPage(response);
}

/**
 * GET /api/Withdrawals/{id}
 *
 * Returns the full detail of a single withdrawal or deduction request,
 * including the individual approval records.
 *
 * Requires: approvewithdrawal permission.
 */
export async function getWithdrawal(
  withdrawalId: string,
): Promise<WithdrawalRequest> {
  const res = await adminApiFetch<ApiEnvelope<WithdrawalRequest> | WithdrawalRequest>(
    `/api/Withdrawals/${encodeURIComponent(withdrawalId)}`,
  );
  return "success" in res ? ensureApiSuccess(res).data : res;
}

/**
 * POST /api/Withdrawals/{id}/Approve
 *
 * Records the authenticated admin's approval for this request.
 * Backend behaviour:
 *   1. Verifies approvewithdrawal permission.
 *   2. Verifies the request is still in an approvable state.
 *   3. Verifies the caller has not already approved this request.
 *   4. Creates an approval record.
 *   5. If required approvals reached → marks request APPROVED.
 *   6. Duplicate and concurrent approvals are prevented server-side.
 *
 * Requires: approvewithdrawal permission.
 */
export async function approveWithdrawal(
  withdrawalId: string,
  payload: ApproveWithdrawalPayload,
): Promise<unknown> {
  const response = await adminApiFetch<ApiEnvelope<unknown>>(
    `/api/Withdrawals/${encodeURIComponent(withdrawalId)}/Approve`,
    { method: "POST", body: payload },
  );
  return ensureApiSuccess(response);
}

/**
 * POST /api/Withdrawals/{id}/Reject
 *
 * Rejects a withdrawal or deduction request.
 * Backend behaviour:
 *   1. Verifies approvewithdrawal permission.
 *   2. Verifies the request is still rejectable.
 *   3. Stores the rejection reason.
 *   4. Marks request REJECTED — prevents further approvals.
 *   5. Does NOT execute a financial transaction.
 *
 * Requires: approvewithdrawal permission.
 */
export async function rejectWithdrawal(
  withdrawalId: string,
  payload: RejectWithdrawalPayload,
): Promise<unknown> {
  const response = await adminApiFetch<ApiEnvelope<unknown>>(
    `/api/Withdrawals/${encodeURIComponent(withdrawalId)}/Reject`,
    { method: "POST", body: payload },
  );
  return ensureApiSuccess(response);
}
