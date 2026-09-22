"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserAccess } from "@/app/lib/authorization-api";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";

type WithdrawalAction = "review" | "deduct" | "manageTiers";

const permissionCode: Record<WithdrawalAction, string> = {
  review: "approvewithdrawal",
  deduct: "initiatededuction",
  manageTiers: "manageapprovaltiers",
};

/** UI visibility only; the withdrawal service remains authoritative. */
export function useWithdrawalPermissions() {
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
    can: (action: WithdrawalAction) => Boolean(rootAdmin || granted.has("*") || granted.has(permissionCode[action])),
    isLoading: !rootAdmin && access.isLoading,
    error: rootAdmin ? null : access.error,
  };
}
