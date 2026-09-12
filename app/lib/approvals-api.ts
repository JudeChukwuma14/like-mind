/**
 * approvals-api.ts
 *
 * Typed wrappers for the central Approvals endpoints.
 * All calls go through `adminApiFetch` which automatically injects
 * the admin JWT — do not add token handling here.
 *
 * Endpoint base: NEXT_PUBLIC_ADMIN_API_BASE_URL
 */

import { adminApiFetch, type ApiEnvelope } from "@/app/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single approval request as returned by GET /api/Approvals.
 * Field names match the backend response — do not rename.
 */
export type ApprovalRequest = {
  id: string;
  /** Human-readable action type, e.g. "AssignRole", "ActivateUser" */
  actionType: string | null;
  status: "Pending" | "Approved" | "Rejected" | string;
  /** Display name or ID of the user who created this request */
  requestedBy: string | null;
  /** Display name or ID of the user assigned to action this request */
  assignedTo: string | null;
  /** ISO date string */
  createdAt: string | null;
  /** ISO date string */
  updatedAt: string | null;
  /** Optional extra detail about the request */
  note: string | null;
  /** The ID of the subject of the action (e.g. the user being activated) */
  subjectId: string | null;
  /** Human-readable subject name */
  subjectName: string | null;
};

export type ApprovalPage = {
  items: ApprovalRequest[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type GetApprovalsParams = {
  status?: string;
  actionType?: string;
  page?: number;
  pageSize?: number;
};

export type ReassignApprovalPayload = {
  /** ID of the user to reassign the approval to */
  userId: string;
};

export type ApprovalNotePayload = {
  note: string;
};

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/Approvals
 *
 * Returns a paginated list of approval requests.
 * Supports filtering by status, actionType, page, and pageSize.
 */
export async function getApprovals(
  params: GetApprovalsParams = {},
): Promise<ApprovalPage> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.actionType) q.set("actionType", params.actionType);
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));

  const url = `/api/Approvals${q.toString() ? `?${q.toString()}` : ""}`;
  const res = await adminApiFetch<ApiEnvelope<ApprovalPage>>(url);
  // Defensively handle both paginated and bare-array shapes
  const data = res.data;
  if (!data) return { items: [], pageNumber: 1, pageSize: 20, totalCount: 0, totalPages: 1 };
  // If the backend returns items directly (not nested) handle that case too
  if (Array.isArray(data)) {
    const arr = data as ApprovalRequest[];
    return { items: arr, pageNumber: 1, pageSize: arr.length, totalCount: arr.length, totalPages: 1 };
  }
  return data as ApprovalPage;
}

/**
 * POST /api/Approvals/{id}/Reassign
 *
 * Reassigns an approval request to another user.
 * Requires: reassignapproval permission.
 */
export async function reassignApproval(
  approvalId: string,
  payload: ReassignApprovalPayload,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/Approvals/${encodeURIComponent(approvalId)}/Reassign`,
    { method: "POST", body: payload },
  );
}
