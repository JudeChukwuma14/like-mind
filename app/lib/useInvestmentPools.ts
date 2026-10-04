"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveInvestmentPool,
  createInvestmentPool,
  getInvestmentPool,
  getInvestmentPools,
  previewInvestmentPoolEligibility,
  rejectInvestmentPool,
  type CreateInvestmentPoolPayload,
  type EligibilityRules,
  type GetInvestmentPoolsParams,
} from "@/app/lib/investment-pool-api";

export const investmentPoolKeys = {
  detail: (poolId: string) => ["investment-pool", poolId] as const,
  list: (params: GetInvestmentPoolsParams) => ["investment-pools", params] as const,
};

// ─── Reads ─────────────────────────────────────────────────────────────────────

export function useInvestmentPool(poolId: string, enabled = true) {
  return useQuery({
    queryKey: investmentPoolKeys.detail(poolId),
    queryFn: () => getInvestmentPool(poolId),
    enabled: enabled && Boolean(poolId.trim()),
    retry: false,
  });
}

/** GET /api/InvestmentPool — the real paginated list, added after this file's other hooks. */
export function useInvestmentPoolsList(params: GetInvestmentPoolsParams) {
  return useQuery({
    queryKey: investmentPoolKeys.list(params),
    queryFn: () => getInvestmentPools(params),
  });
}

/** Pure read, no side effects — safe to call on every change to the eligibility rules. */
export function useEligibilityPreview() {
  return useMutation({
    mutationFn: ({ cooperativeId, rules }: { cooperativeId: string; rules: EligibilityRules }) =>
      previewInvestmentPoolEligibility(cooperativeId, rules),
  });
}

// ─── Writes ────────────────────────────────────────────────────────────────────

export function useCreateInvestmentPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cooperativeId, payload }: { cooperativeId: string; payload: CreateInvestmentPoolPayload }) =>
      createInvestmentPool(cooperativeId, payload),
    onSuccess: (result) => {
      if (result.poolId) queryClient.invalidateQueries({ queryKey: investmentPoolKeys.detail(result.poolId) });
    },
  });
}

function useReviewMutation(action: (poolId: string, note?: string) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ poolId, note }: { poolId: string; note?: string }) => action(poolId, note),
    onSuccess: (_result, { poolId }) => {
      queryClient.invalidateQueries({ queryKey: investmentPoolKeys.detail(poolId) });
    },
  });
}

export const useApproveInvestmentPool = () => useReviewMutation(approveInvestmentPool);
export const useRejectInvestmentPool = () => useReviewMutation(rejectInvestmentPool);

// ─── Locally remembered pool ids ────────────────────────────────────────────────

/**
 * There is no list endpoint (see investment-pool-api.ts) — the backend has no way
 * to answer "what pools exist" or "what's pending my approval", only GET-by-id.
 * This is a this-browser-only convenience so an admin doesn't have to keep pool
 * ids in a text file: every id they've created or looked up here is remembered
 * locally. It is never treated as authoritative, and a page reload elsewhere
 * (or another admin's browser) will not show pools recorded here.
 */
const STORAGE_KEY = "kajola_recent_investment_pools";
const MAX_REMEMBERED = 25;

export type RecentInvestmentPool = { id: string; name: string | null; cooperativeId: string; savedAtUtc: string };

function readRecentPools(): RecentInvestmentPool[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is RecentInvestmentPool => Boolean(entry) && typeof entry === "object" && typeof (entry as RecentInvestmentPool).id === "string")
      : [];
  } catch {
    return [];
  }
}

export function useRecentInvestmentPools(cooperativeId: string) {
  const [isClient, setIsClient] = useState(false);
  const [all, setAll] = useState<RecentInvestmentPool[]>([]);

  useEffect(() => {
    setIsClient(true);
    setAll(readRecentPools());
  }, []);

  const remember = useCallback((entry: { id: string; name: string | null; cooperativeId: string }) => {
    setAll((current) => {
      const next = [
        { ...entry, savedAtUtc: new Date().toISOString() },
        ...current.filter((existing) => existing.id !== entry.id),
      ].slice(0, MAX_REMEMBERED);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Best-effort only — storage may be full or unavailable (private browsing, etc).
      }
      return next;
    });
  }, []);

  const forget = useCallback((id: string) => {
    setAll((current) => {
      const next = current.filter((existing) => existing.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Best-effort only.
      }
      return next;
    });
  }, []);

  return {
    isClient,
    pools: isClient ? all.filter((entry) => entry.cooperativeId === cooperativeId) : [],
    remember,
    forget,
  };
}
