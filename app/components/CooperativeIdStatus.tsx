"use client";

import { Loader2 } from "lucide-react";
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
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>{getApiErrorMessage(selection.error)}</p>
        <button type="button" onClick={() => selection.refetch()} className="mt-2 font-semibold underline">
          Try again
        </button>
      </div>
    );
  }
  return null;
}
