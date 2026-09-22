import type { GetLoansParams } from "@/app/lib/loan-api";

/** Member and staff cache namespaces are distinct because they use different credentials. */
export const loanKeys = {
  memberLists: ["member-loans"] as const,
  memberList: (params: GetLoansParams) => [...loanKeys.memberLists, params.page ?? 1, params.pageSize ?? 20, params.status ?? "", params.onlyMine ?? true] as const,
  memberDetail: (id: string) => ["member-loan", id] as const,
  memberApprovals: (id: string) => ["member-loan-approvals", id] as const,
  memberDisbursementApprovals: (id: string) => ["member-disbursement-approvals", id] as const,
  memberInstallments: (id: string) => ["member-installments", id] as const,
  adminLists: ["admin-loans"] as const,
  adminList: (params: GetLoansParams) => [...loanKeys.adminLists, params.page ?? 1, params.pageSize ?? 20, params.status ?? "", params.onlyMine ?? false] as const,
  adminDetail: (id: string) => ["admin-loan", id] as const,
  adminApprovals: (id: string) => ["admin-loan-approvals", id] as const,
  adminDisbursementApprovals: (id: string) => ["admin-disbursement-approvals", id] as const,
  adminInstallments: (id: string) => ["admin-installments", id] as const,
  approvalTiers: ["loan-approval-tiers"] as const,
  approvalTierProposals: ["loan-approval-tier-proposals"] as const,
  disbursementTiers: ["loan-disbursement-tiers"] as const,
  policy: (cooperativeId: string) => ["loan-policy", cooperativeId] as const,
  policyProposals: (cooperativeId: string) => ["loan-policy", cooperativeId, "pending-proposals"] as const,
};
