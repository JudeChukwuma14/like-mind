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

export type AssignRolePayload = {
  userId: string;
  roleId: string;
  inheritRolePermissions: boolean;
};

export type SetRoleInheritancePayload = {
  userId: string;
  inheritRolePermissions: boolean;
};

export type SetUserPermissionPayload = {
  userId: string;
  permissionCode: string;
  isGranted: boolean;
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

/** POST /api/admin/authorization/users/assign-role */
export async function assignRole(payload: AssignRolePayload): Promise<unknown> {
  return adminApiFetch<unknown>("/api/admin/authorization/users/assign-role", {
    method: "POST",
    body: payload,
  });
}

/** POST /api/admin/authorization/users/set-role-inheritance */
export async function setRoleInheritance(
  payload: SetRoleInheritancePayload,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    "/api/admin/authorization/users/set-role-inheritance",
    { method: "POST", body: payload },
  );
}

/** POST /api/admin/authorization/users/set-permission */
export async function setUserPermission(
  payload: SetUserPermissionPayload,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    "/api/admin/authorization/users/set-permission",
    { method: "POST", body: payload },
  );
}

/** POST /api/admin/authorization/users/remove-override */
export async function removeUserOverride(
  payload: RemoveUserOverridePayload,
): Promise<unknown> {
  return adminApiFetch<unknown>(
    "/api/admin/authorization/users/remove-override",
    { method: "POST", body: payload },
  );
}
