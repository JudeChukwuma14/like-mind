/**
 * authorization-api.ts
 *
 * Typed wrappers for every Role & Permissions backend endpoint.
 * All calls go through `adminApiFetch` which automatically injects
 * the admin JWT — do not add token handling here.
 *
 * Endpoint base: NEXT_PUBLIC_ADMIN_API_BASE_URL
 */

import { adminApiFetch, type ApiEnvelope } from "@/app/lib/api-client";

// ─── Shared types ─────────────────────────────────────────────────────────────

export type Role = {
  id: string;
  name: string;
  description: string | null;
  /** Shape isn't guaranteed — may be bare strings or objects. */
  permissions: (string | { id?: string | null; code?: string | null })[] | null;
};

export type Permission = {
  id: string;
  code: string;
  name: string;
  category: string;
};

export type UserAccess = {
  userId: string;
  email: string | null;
  roleName: string | null;
  inheritRolePermissions: boolean;
  rolePermissions: string[];
  granted: string[];
  revoked: string[];
  effectivePermissions: string[];
};

// ─── Payload types ────────────────────────────────────────────────────────────

export type UpdateRolePermissionsPayload = {
  roleId: string;
  permissionCodes: string[];
};

/** Payload for the maker step of role assignment. */
export type InitiateRoleAssignmentPayload = {
  userId: string;
  roleId: string;
  inheritRolePermissions: boolean;
};

export type SetRoleInheritancePayload = {
  userId: string;
  inheritRolePermissions: boolean;
};

/** Payload for the maker step of a permission change (grant or revoke). */
export type InitiateUserPermissionChangePayload = {
  userId: string;
  permissionCode: string;
  /** true = grant this permission; false = revoke it */
  isGranted: boolean;
};

/** Payload for the checker approve/reject steps. */
export type ApprovalNotePayload = {
  note: string;
};

export type RemoveUserOverridePayload = {
  userId: string;
  permissionCode: string;
};

// ─── API functions ────────────────────────────────────────────────────────────

/** GET /api/admin/authorization/GetAllRoles */
export async function getAllRoles(): Promise<Role[]> {
  const res = await adminApiFetch<ApiEnvelope<Role[]>>(
    "/api/admin/authorization/GetAllRoles",
  );
  return res.data ?? [];
}

/** GET /api/admin/authorization/GetAllPermissions */
export async function getAllPermissions(): Promise<Permission[]> {
  const res = await adminApiFetch<ApiEnvelope<Permission[]>>(
    "/api/admin/authorization/GetAllPermissions",
  );
  return res.data ?? [];
}

/** GET /api/admin/authorization/roles/{roleId}/permissions */
export async function getRolePermissions(roleId: string): Promise<string[]> {
  const res = await adminApiFetch<ApiEnvelope<string[]>>(
    `/api/admin/authorization/roles/${encodeURIComponent(roleId)}/permissions`,
  );
  // Backend may return bare strings (codes) or nothing — normalise to string[].
  return (res.data ?? []).map((p) => (typeof p === "string" ? p : String(p)));
}

/** GET /api/admin/authorization/users/{userId}/access */
export async function getUserAccess(userId: string): Promise<UserAccess> {
  const res = await adminApiFetch<ApiEnvelope<UserAccess>>(
    `/api/admin/authorization/users/${encodeURIComponent(userId)}/access`,
  );
  return res.data;
}

/** PUT /api/admin/authorization/roles/permissions */
export async function updateRolePermissions(
  payload: UpdateRolePermissionsPayload,
): Promise<unknown> {
  return adminApiFetch<unknown>("/api/admin/authorization/roles/permissions", {
    method: "PUT",
    body: payload,
  });
}

// ─── Maker-checker: Role assignment ──────────────────────────────────────────

/**
 * MAKER — POST /api/admin/authorization/users/assign-role/initiate
 *
 * Initiates a role-assignment request. The user does NOT immediately receive
 * the role; a checker must approve or reject it.
 */
export async function initiateRoleAssignment(
  payload: InitiateRoleAssignmentPayload,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    "/api/admin/authorization/users/assign-role/initiate",
    { method: "POST", body: payload },
  );
}

/**
 * CHECKER — POST /api/admin/authorization/users/assign-role/{userId}/approve
 *
 * Approves the pending role-assignment request for the given user.
 */
export async function approveRoleAssignment(
  userId: string,
  note: string,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/admin/authorization/users/assign-role/${encodeURIComponent(userId)}/approve`,
    { method: "POST", body: { note } satisfies ApprovalNotePayload },
  );
}

/**
 * CHECKER — POST /api/admin/authorization/users/assign-role/{userId}/reject
 *
 * Rejects the pending role-assignment request for the given user.
 */
export async function rejectRoleAssignment(
  userId: string,
  note: string,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/admin/authorization/users/assign-role/${encodeURIComponent(userId)}/reject`,
    { method: "POST", body: { note } satisfies ApprovalNotePayload },
  );
}

// ─── Maker-checker: User permission change ───────────────────────────────────

/**
 * MAKER — POST /api/admin/authorization/users/set-permission/initiate
 *
 * Initiates a permission-change request (grant or revoke).  The permission is
 * NOT immediately applied; a checker must approve or reject it.
 */
export async function initiateUserPermissionChange(
  payload: InitiateUserPermissionChangePayload,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    "/api/admin/authorization/users/set-permission/initiate",
    { method: "POST", body: payload },
  );
}

/**
 * CHECKER — POST /api/admin/authorization/users/set-permission/{userId}/approve
 *
 * Approves the pending permission-change request for the given user.
 */
export async function approveUserPermissionChange(
  userId: string,
  note: string,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/admin/authorization/users/set-permission/${encodeURIComponent(userId)}/approve`,
    { method: "POST", body: { note } satisfies ApprovalNotePayload },
  );
}

/**
 * CHECKER — POST /api/admin/authorization/users/set-permission/{userId}/reject
 *
 * Rejects the pending permission-change request for the given user.
 */
export async function rejectUserPermissionChange(
  userId: string,
  note: string,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    `/api/admin/authorization/users/set-permission/${encodeURIComponent(userId)}/reject`,
    { method: "POST", body: { note } satisfies ApprovalNotePayload },
  );
}

// ─── Unchanged endpoints ──────────────────────────────────────────────────────

/** POST /api/admin/authorization/users/set-role-inheritance */
export async function setRoleInheritance(
  payload: SetRoleInheritancePayload,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    "/api/admin/authorization/users/set-role-inheritance",
    { method: "POST", body: payload },
  );
}

/**
 * POST /api/admin/authorization/users/remove-override
 *
 * Removes a user-level permission override (grant or revoke).
 * No maker-checker variant has been provided for this endpoint — it continues
 * to apply immediately.
 */
export async function removeUserOverride(
  payload: RemoveUserOverridePayload,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    "/api/admin/authorization/users/remove-override",
    { method: "POST", body: payload },
  );
}
