"use client";

import { useAdminAccess } from "@/app/lib/useAdminAccess";

/** UI visibility only; the payments service remains authoritative. */
export function usePaymentPermissions() {
  const { hasPermission, isLoading } = useAdminAccess();
  return { canConfirm: hasPermission("confirmmemberpayment"), isLoading };
}
