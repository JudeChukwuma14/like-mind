"use client";

import { Loader2 } from "lucide-react";
import { ApiErrorCard } from "@/app/components/ApiErrorCard";
import { getApiErrorMessage } from "@/app/lib/api-client";

type CooperativeIdSelection = {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
};

/**
 * This deployment has exactly one cooperative (see `useCooperativeId`), so there
 * is nothing to pick — this only ever shows a loading or error state, never a
 * picker. Renders nothing once the id has loaded successfully.
 */
export function CooperativeIdStatus({ selection }: { selection: CooperativeIdSelection }) {
  if (selection.isLoading) {
    return (
      <div className="card-admin flex items-center gap-2 rounded-3xl p-5 text-sm admin-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading cooperative…
      </div>
    );
  }
  if (selection.isError) {
    return <ApiErrorCard message={getApiErrorMessage(selection.error)} onRetry={() => selection.refetch()} compact />;
  }
  return null;
}
