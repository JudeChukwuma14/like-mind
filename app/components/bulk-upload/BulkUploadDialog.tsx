"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { BulkWorkflow } from "@/app/components/bulk-upload/BulkWorkflow";
import type { BulkUploadKind } from "@/app/lib/bulk-upload-api";

/** Keep the workflow mounted when closed so an accepted Commit result is not lost. */
export function BulkUploadDialog({ kind, open, onClose }: { kind: BulkUploadKind; open: boolean; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const title = kind === "Savings" ? "Bulk savings upload & review" : "Bulk loan repayments";

  return <div className={open ? "fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm md:p-6" : "hidden"} role="dialog" aria-modal="true" aria-label={title}>
    <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl shadow-2xl" style={{ background: "var(--admin-bg)", color: "var(--admin-text)" }}>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-5 py-4 md:px-7" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
        <div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Financial operations</p><h2 className="mt-1 text-xl font-semibold">{title}</h2></div>
        <button type="button" onClick={onClose} disabled={busy} aria-label={`Close ${title}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border disabled:opacity-40" style={{ borderColor: "var(--admin-border)" }}><X className="h-4 w-4" /></button>
      </div>
      <div className="space-y-5 overflow-y-auto p-4 md:p-7"><BulkWorkflow kind={kind} onBusyChange={setBusy} /></div>
    </div>
  </div>;
}
