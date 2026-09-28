"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserAccess } from "@/app/lib/authorization-api";
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
  const code = typeof value === "string"
    ? value
    : value && typeof value === "object"
      ? ["code", "permissionCode", "name"].map((key) => (value as Record<string, unknown>)[key]).find((item): item is string => typeof item === "string")
      : undefined;
  if (!code) return "";
  if (code.trim() === "*") return "*";
  return code.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function permissionClaims(claims: Record<string, unknown>): unknown[] {
  return Object.entries(claims)
    .filter(([key]) => /permission/i.test(key.split(/[/:]/).pop() ?? key))
    .flatMap(([, value]) => Array.isArray(value) ? value : [value]);
}

/** UI visibility only. Every mutation still relies on server authorization. */
export function useLoanPermissions() {
  const { user } = useAdminAuth();
  const rootAdminFromToken = user?.role?.replace(/[\s_-]/g, "").toLowerCase() === "rootadmin";
  const tokenId = typeof user?.claims.jti === "string" ? user.claims.jti : "";
  const access = useQuery({
    queryKey: ["admin-user-access", user?.id, tokenId],
    queryFn: () => getUserAccess(user!.id!),
    enabled: Boolean(user?.id) && !rootAdminFromToken,
  });
  const rootAdmin = rootAdminFromToken || access.data?.roleName?.replace(/[\s_-]/g, "").toLowerCase() === "rootadmin";
  const accessRecord = access.data as (typeof access.data & { permissions?: unknown[] }) | undefined;
  const granted = new Set([
    ...permissionClaims(user?.claims ?? {}),
    ...(access.data?.effectivePermissions ?? []),
    ...(access.data?.granted ?? []),
    ...(access.data?.rolePermissions ?? []),
    ...(accessRecord?.permissions ?? []),
  ].map(normalizePermissionCode));
  return {
    isRootAdmin: Boolean(rootAdmin),
    can: (action: LoanAction) => rootAdmin || granted.has("*") || granted.has(normalizePermissionCode(permissionCode[action])),
    isLoading: !rootAdmin && access.isLoading,
    error: rootAdmin ? null : access.error,
  };
}