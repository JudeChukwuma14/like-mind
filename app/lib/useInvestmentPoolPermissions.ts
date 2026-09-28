"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserAccess } from "@/app/lib/authorization-api";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";

/**
 * UI visibility only; the backend remains authoritative and additionally
 * enforces (per the endpoint description) that a pool's own creator can't
 * approve or reject their own request, and nobody can approve the same pool
 * twice — neither of which can be checked client-side without a confirmed
 * "created by" field in the pool response, so those show up as a normal
 * ApiError from the server instead of being pre-empted here.
 */
export function useInvestmentPoolPermissions() {
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
  return {
    canReview: Boolean(rootAdmin || permissions.has("*") || permissions.has("approveinvestmentpool")),
    isLoading: !rootAdmin && access.isLoading,
    error: rootAdmin ? null : access.error,
  };
}
