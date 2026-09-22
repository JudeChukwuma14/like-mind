"use client";

import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { getApiErrorMessage } from "@/app/lib/api-client";
import { useCooperativeId } from "@/app/lib/useCooperativeId";

type Selection = ReturnType<typeof useCooperativeId>;

export function CooperativeSelector({ selection, onChange, disabled = false }: {
  selection: Selection;
  onChange?: (id: string) => void;
  disabled?: boolean;
}) {
  const loading = selection.authLoading || selection.isFetching || (selection.isPending && !selection.isError);
  const hasSelection = Boolean(selection.cooperativeId);

  return <section className="card-admin rounded-3xl p-5 md:p-7">
    <div className="flex items-start gap-3">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <div>
        <h2 className="text-lg font-semibold">Choose a cooperative</h2>
        <p className="mt-1 text-sm leading-6 admin-text-muted">This temporary list includes cooperatives from multiple users. Confirm the ID before viewing or changing its data. The backend must still enforce your access to the selected cooperative.</p>
      </div>
    </div>

    {loading ? <div className="mt-5 flex items-center gap-2 text-sm admin-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading cooperatives…</div> : selection.isError ? <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>{getApiErrorMessage(selection.error)}</p><button type="button" onClick={() => selection.refetch()} className="mt-2 font-semibold underline">Try again</button></div> : selection.options.length === 0 ? <div className="mt-5 rounded-2xl border p-4 text-sm admin-text-muted" style={{ borderColor: "var(--admin-border)" }}>No cooperatives were returned. <button type="button" onClick={() => selection.refetch()} className="font-semibold underline">Refresh list</button></div> : <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="grid min-w-0 flex-1 gap-2 text-sm font-semibold">
        <span>Cooperative ID</span>
        <select
          value={selection.cooperativeId ?? ""}
          onChange={(event) => (onChange ?? selection.selectCooperative)(event.target.value)}
          disabled={disabled}
          className="input-admin min-h-12 w-full rounded-xl px-4 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-amber-400/40 disabled:opacity-50 sm:text-sm"
          aria-label="Select cooperative ID"
        >
          <option value="">Select a cooperative…</option>
          {selection.options.map((option) => <option key={option.id} value={option.id}>{option.id}</option>)}
        </select>
      </label>
      <button type="button" onClick={() => selection.refetch()} disabled={disabled} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}><RefreshCw className="h-4 w-4" /> Refresh IDs</button>
    </div>}
    {selection.listReady && !hasSelection && selection.options.length > 0 && <p className="mt-3 text-xs admin-text-muted">Select an ID to load this page. Nothing is requested for a cooperative until you choose one.</p>}
    {selection.listReady && selection.selectedId && !hasSelection && <p role="alert" className="mt-3 text-xs text-amber-700">Your previous selection is no longer in the list. Choose another cooperative.</p>}
  </section>;
}
