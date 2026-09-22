"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserAccess } from "@/app/lib/authorization-api";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";

/** UI visibility only; the payments service remains authoritative. */
export function usePaymentPermissions() {
  const { user } = useAdminAuth();
  const rootFromToken = user?.role?.replace(/[\s_-]/g, "").toLowerCase() === "rootadmin";
  const tokenId = typeof user?.claims.jti === "string" ? user.claims.jti : "";
  const access = useQuery({
    queryKey: ["admin-user-access", user?.id, tokenId],
    queryFn: () => getUserAccess(user!.id!),
    enabled: Boolean(user?.id) && !rootFromToken,
  });
  const rootAdmin = rootFromToken || access.data?.roleName?.replace(/[\s_-]/g, "").toLowerCase() === "rootadmin";
  const permissions = new Set((access.data?.effectivePermissions ?? []).map((code) => code.toLowerCase()));
  return { canConfirm: Boolean(rootAdmin || permissions.has("*") || permissions.has("confirmmemberpayment")), isLoading: !rootAdmin && access.isLoading };
}
