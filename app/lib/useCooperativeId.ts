"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCooperatives } from "@/app/lib/cooperative-id-api";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";
import { useSelectedCooperative } from "@/app/providers/CooperativeSelectionProvider";

/** A deliberate, session-only choice from the backend list, never JWT `sub`. */
export function useCooperativeId(enabled = true) {
  const { user, isLoading: authLoading } = useAdminAuth();
  const { selectedId, selectCooperative } = useSelectedCooperative();
  const tokenId = typeof user?.claims.jti === "string" ? user.claims.jti : "";
  const query = useQuery({
    queryKey: ["admin-cooperatives", user?.id, tokenId],
    queryFn: getAllCooperatives,
    enabled: enabled && !authLoading && Boolean(user),
    refetchOnMount: "always",
    retry: 1,
  });
  const options = query.data ?? [];
  // Do not use a stale list from a prior mount or a failed refresh.
  const listReady = enabled && query.isSuccess && query.isFetchedAfterMount && !query.isFetching;
  const cooperativeId = listReady && options.some((option) => option.id === selectedId) ? selectedId : undefined;
  return { ...query, options, selectedId, selectCooperative, cooperativeId, authLoading, listReady };
}
