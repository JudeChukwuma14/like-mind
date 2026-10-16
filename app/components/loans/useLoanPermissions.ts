"use client";

import { useAdminAccess } from "@/app/lib/useAdminAccess";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";

export type LoanAction =
  | "initiateLoan"
  | "rejectAtTriage"
  | "approveLoan"
  | "rejectLoan"
  | "initiateDisbursement"
  | "approveDisbursement"
  | "rejectDisbursement"
  | "recordRepayment"
  | "approvalTiers"
  | "reviewApprovalTierChanges"
  | "manageLoanPolicy"
  | "reviewLoanPolicyChanges";

/** The action-to-code mapping comes from the supplied Loan Swagger contract. */
const permissionCode: Record<LoanAction, string> = {
  initiateLoan: "initiateloan",
  rejectAtTriage: "rejectloan",
  approveLoan: "approveloan",
  rejectLoan: "approveloan",
  initiateDisbursement: "initiatedisbursement",
  approveDisbursement: "approvedisbursement",
  rejectDisbursement: "approvedisbursement",
  recordRepayment: "recordloanrepayment",
  approvalTiers: "manageapprovaltiers",
  reviewApprovalTierChanges: "reviewapprovaltierchanges",
  manageLoanPolicy: "manageloanpolicy",
  reviewLoanPolicyChanges: "reviewloanpolicychanges",
};

function normalizePermissionCode(value: unknown): string {
  const code =
    typeof value === "string"
      ? value
      : value && typeof value === "object"
        ? ["code", "permissionCode", "name"]
            .map((key) => (value as Record<string, unknown>)[key])
            .find((item): item is string => typeof item === "string")
        : undefined;
  if (!code) return "";
  if (code.trim() === "*") return "*";
  return code.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function permissionClaims(claims: Record<string, unknown>): unknown[] {
  return Object.entries(claims)
    .filter(([key]) => /permission/i.test(key.split(/[/:]/).pop() ?? key))
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]));
}

/**
 * UI visibility only. Every mutation still relies on server authorization.
 *
 * Unlike the other three `use*Permissions` hooks, this one needs more than a
 * simple `effectivePermissions` membership check — it also merges in raw JWT
 * claims (permissionClaims) and a couple of extra UserAccess fields
 * (granted, rolePermissions) the others don't use — so it reads `access`
 * directly from useAdminAccess() instead of calling its `hasPermission`.
 */
export function useLoanPermissions() {
  const { user } = useAdminAuth();
  const { rootAdmin, access, isLoading, error } = useAdminAccess();
  const accessRecord = access as (typeof access & { permissions?: unknown[] }) | undefined;
  const granted = new Set(
    [
      ...permissionClaims(user?.claims ?? {}),
      ...(access?.effectivePermissions ?? []),
      ...(access?.granted ?? []),
      ...(access?.rolePermissions ?? []),
      ...(accessRecord?.permissions ?? []),
    ].map(normalizePermissionCode),
  );
  return {
    isRootAdmin: Boolean(rootAdmin),
    can: (action: LoanAction) =>
      rootAdmin ||
      granted.has("*") ||
      granted.has(normalizePermissionCode(permissionCode[action])),
    isLoading,
    error,
  };
}
