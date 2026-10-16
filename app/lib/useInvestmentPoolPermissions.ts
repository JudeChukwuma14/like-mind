"use client";

import { useAdminAccess } from "@/app/lib/useAdminAccess";

/**
 * UI visibility only; the backend remains authoritative and additionally
 * enforces (per the endpoint description) that a pool's own creator can't
 * approve or reject their own request, and nobody can approve the same pool
 * twice — neither of which can be checked client-side without a confirmed
 * "created by" field in the pool response, so those show up as a normal
 * ApiError from the server instead of being pre-empted here.
 */
export function useInvestmentPoolPermissions() {
  const { hasPermission, isLoading, error } = useAdminAccess();
  return {
    canReview: hasPermission("approveinvestmentpool"),
    isLoading,
    error,
  };
}
