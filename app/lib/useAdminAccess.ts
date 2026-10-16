"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserAccess, type UserAccess } from "@/app/lib/authorization-api";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";

/**
 * Shared base for every `use*Permissions` hook — root-admin detection and the
 * `GET /api/admin/authorization/users/{id}/access` query were previously
 * copy-pasted nearly verbatim across useInvestmentPoolPermissions,
 * usePaymentPermissions, useWithdrawalPermissions and useLoanPermissions.
 * Those hooks now wrap this one instead of re-implementing it.
 *
 * UI visibility only — the backend remains authoritative and is the only
 * place separation-of-duties (e.g. "can't approve your own request") is
 * enforced; this hook exists purely to decide what to show, not to guard
 * anything. `hasPermission` checks `effectivePermissions` (already the
 * server-computed role + granted − revoked set); a hook with richer needs
 * (useLoanPermissions merges in raw JWT claims too) can read `access`
 * directly instead of using `hasPermission`.
 */
export function useAdminAccess() {
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
    rootAdmin,
    /** The raw UserAccess response, for hooks that need more than a simple membership check. */
    access: access.data as UserAccess | undefined,
    hasPermission: (code: string) => Boolean(rootAdmin || permissions.has("*") || permissions.has(code.toLowerCase())),
    isLoading: !rootAdmin && access.isLoading,
    error: rootAdmin ? null : access.error,
  };
}
