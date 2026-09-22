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
  const granted = new Set((access.data?.effectivePermissions ?? []).map((code) => code.toLowerCase()));
  return {
    isRootAdmin: Boolean(rootAdmin),
    can: (action: LoanAction) => rootAdmin || granted.has("*") || granted.has(permissionCode[action]),
    isLoading: !rootAdmin && access.isLoading,
    error: rootAdmin ? null : access.error,
  };
}
