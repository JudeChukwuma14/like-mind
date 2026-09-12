/**
 * user-admin-api.ts
 *
 * Typed wrappers for User management endpoints that require the admin JWT:
 *   - Activation (Initiate / Approve / Reject)
 *   - Deactivation (Initiate / Approve / Reject)
 *   - Activate as Staff
 *   - Bulk user import
 *
 * All calls go through `adminApiFetch`.
 *
 * Endpoint base: NEXT_PUBLIC_ADMIN_API_BASE_URL
 */

import { adminApiFetch, type ApiEnvelope } from "@/app/lib/api-client";

// ─── Payload types ────────────────────────────────────────────────────────────

/** Body for the deactivation initiate step. */
export type InitiateDeactivationPayload = {
  reason: string;
};

/** Body for approval / rejection steps that accept a note. */
export type ApprovalNotePayload = {
  note: string;
};

/**
 * Summary returned by POST /api/User/BulkImport.
 * ⚠️ UNVERIFIED — inspect actual backend response and tighten these types
 * if the field names differ. All optional to be defensive.
 */
export type BulkImportResult = {
  totalRows?: number | null;
  created?: number | null;
  skipped?: number | null;
  failed?: number | null;
  /** Detailed messages for rows that failed validation */
  errors?: { row?: number | null; message?: string | null }[] | null;
};

// ─── User Activation ──────────────────────────────────────────────────────────

/**
 * MAKER — POST /api/User/{userId}/Activate/Initiate
 *
 * Initiates an activation request. The user is NOT immediately activated;
 * a checker must approve or reject it.
 */
export async function initiateUserActivation(userId: string): Promise<ApiEnvelope<unknown>> {
  return adminApiFetch<ApiEnvelope<unknown>>(
    `/api/User/${encodeURIComponent(userId)}/Activate/Initiate`,
    { method: "POST" },
  );
}

/**
 * CHECKER — POST /api/User/{userId}/Activate/Approve
 *
 * Approves the pending activation request for the given user.
 */
export async function approveUserActivation(
  userId: string,
  note: string,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/User/${encodeURIComponent(userId)}/Activate/Approve`,
    { method: "POST", body: { note } satisfies ApprovalNotePayload },
  );
}

/**
 * CHECKER — POST /api/User/{userId}/Activate/Reject
 *
 * Rejects the pending activation request for the given user.
 */
export async function rejectUserActivation(
  userId: string,
  note: string,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/User/${encodeURIComponent(userId)}/Activate/Reject`,
    { method: "POST", body: { note } satisfies ApprovalNotePayload },
  );
}

// ─── User Deactivation ────────────────────────────────────────────────────────

/**
 * MAKER — POST /api/User/{userId}/Deactivate/Initiate
 *
 * Initiates a deactivation request. The user is NOT immediately deactivated;
 * a checker must approve or reject it.
 */
export async function initiateUserDeactivation(
  userId: string,
  payload: InitiateDeactivationPayload,
): Promise<ApiEnvelope<unknown>> {
  return adminApiFetch<ApiEnvelope<unknown>>(
    `/api/User/${encodeURIComponent(userId)}/Deactivate/Initiate`,
    { method: "POST", body: payload },
  );
}

/**
 * CHECKER — POST /api/User/{userId}/Deactivate/Approve
 *
 * Approves the pending deactivation request for the given user.
 */
export async function approveUserDeactivation(
  userId: string,
  note: string,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/User/${encodeURIComponent(userId)}/Deactivate/Approve`,
    { method: "POST", body: { note } satisfies ApprovalNotePayload },
  );
}

/**
 * CHECKER — POST /api/User/{userId}/Deactivate/Reject
 *
 * Rejects the pending deactivation request for the given user.
 */
export async function rejectUserDeactivation(
  userId: string,
  note: string,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/User/${encodeURIComponent(userId)}/Deactivate/Reject`,
    { method: "POST", body: { note } satisfies ApprovalNotePayload },
  );
}

// ─── Staff Activation ─────────────────────────────────────────────────────

/**
 * POST /api/Auth/{userId}/activate-staff
 *
 * Elevates the user to staff status. This step is required BEFORE a role
 * can be assigned. Must be called after the user is verified and active.
 * RootAdmin bypasses any restrictions.
 */
export async function activateStaff(userId: string): Promise<ApiEnvelope<unknown>> {
  return adminApiFetch<ApiEnvelope<unknown>>(
    `/api/Auth/${encodeURIComponent(userId)}/activate-staff`,
    { method: "POST" },
  );
}

// ─── Bulk Import ──────────────────────────────────────────────────────────────

/**
 * POST /api/User/BulkImport
 *
 * Accepts a .xlsx or .csv file and bulk-creates users.
 * Returns a summary of created / skipped / failed rows.
 */
export async function bulkImportUsers(
  file: File,
): Promise<ApiEnvelope<BulkImportResult>> {
  const formData = new FormData();
  formData.append("file", file);
  return adminApiFetch<ApiEnvelope<BulkImportResult>>(
    "/api/User/BulkImport",
    { method: "POST", body: formData },
  );
}
