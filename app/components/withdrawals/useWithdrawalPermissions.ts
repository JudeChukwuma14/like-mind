"use client";

import { useAdminAccess } from "@/app/lib/useAdminAccess";

type WithdrawalAction = "review" | "deduct" | "manageTiers";

const permissionCode: Record<WithdrawalAction, string> = {
  review: "approvewithdrawal",
  deduct: "initiatededuction",
  manageTiers: "manageapprovaltiers",
};

/** UI visibility only; the withdrawal service remains authoritative. */
export function useWithdrawalPermissions() {
  const { hasPermission, isLoading, error } = useAdminAccess();
  return {
    can: (action: WithdrawalAction) => hasPermission(permissionCode[action]),
    isLoading,
    error,
  };
}
