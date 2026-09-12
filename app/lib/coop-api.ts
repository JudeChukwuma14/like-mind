/**
 * coop-api.ts
 *
 * Typed wrappers for Cooperative Account endpoints used in the admin
 * dashboard — specifically the EditSetup approval workflow.
 *
 * The initial CreateAccount / CompleteSetup / UploadLogo calls used during
 * the onboarding wizard remain in their respective page files and are
 * NOT duplicated here.
 *
 * All calls go through `adminApiFetch`.
 * Endpoint base: NEXT_PUBLIC_ADMIN_API_BASE_URL
 */

import { adminApiFetch } from "@/app/lib/api-client";
import type { CompleteSetupRequest } from "@/app/(admin)/setup/complete-setup-mapper";

// ─── Payload types ────────────────────────────────────────────────────────────

/**
 * The EditSetup/Initiate body is structurally identical to CompleteSetup —
 * it contains the full proposed cooperative configuration.
 * We reuse `CompleteSetupRequest` to stay in sync with the mapper.
 */
export type EditSetupPayload = CompleteSetupRequest;

export type ApprovalNotePayload = {
  note: string;
};

// ─── Cooperative Setup Edit ───────────────────────────────────────────────────

/**
 * MAKER — POST /api/CooperativeAccount/EditSetup/{cooperativeAccountId}/Initiate
 *
 * Submits a proposed edit to the cooperative setup for checker review.
 * The existing setup is NOT changed until a checker approves it.
 *
 * Requires: initiatecooperativesetup permission.
 */
export async function initiateCooperativeSetupEdit(
  cooperativeAccountId: string,
  payload: EditSetupPayload,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/CooperativeAccount/EditSetup/${encodeURIComponent(cooperativeAccountId)}/Initiate`,
    { method: "POST", body: payload },
  );
}

/**
 * CHECKER — POST /api/CooperativeAccount/EditSetup/{cooperativeAccountId}/Approve
 *
 * Approves the pending cooperative setup edit.
 * The new configuration is applied when this succeeds.
 *
 * Requires: approvecooperativesetup permission.
 */
export async function approveCooperativeSetupEdit(
  cooperativeAccountId: string,
  note: string,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/CooperativeAccount/EditSetup/${encodeURIComponent(cooperativeAccountId)}/Approve`,
    { method: "POST", body: { note } satisfies ApprovalNotePayload },
  );
}

/**
 * CHECKER — POST /api/CooperativeAccount/EditSetup/{cooperativeAccountId}/Reject
 *
 * Rejects the pending cooperative setup edit.
 * The existing setup remains unchanged.
 */
export async function rejectCooperativeSetupEdit(
  cooperativeAccountId: string,
  note: string,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/CooperativeAccount/EditSetup/${encodeURIComponent(cooperativeAccountId)}/Reject`,
    { method: "POST", body: { note } satisfies ApprovalNotePayload },
  );
}
