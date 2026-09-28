"use client";

import { useQuery } from "@tanstack/react-query";
import { getCooperativeId } from "@/app/lib/cooperative-id-api";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";

/**
 * Single-cooperative-per-deployment model — there is exactly one cooperative,
 * so there is nothing for the admin to choose between. This fetches its id once
 * (long-cached, since it cannot change for the life of the deployment) and every
 * cooperative-scoped screen shares that one query result. Render
 * `<CooperativeIdStatus selection={...} />` while it loads or if it fails; once
 * `cooperativeId` is set, use it directly.
 */
export function useCooperativeId(enabled = true) {
  const { user, isLoading: authLoading } = useAdminAuth();
  const query = useQuery({
    queryKey: ["cooperative-id"],
    queryFn: getCooperativeId,
    enabled: enabled && !authLoading && Boolean(user),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
  return { ...query, cooperativeId: query.data, authLoading };
}
