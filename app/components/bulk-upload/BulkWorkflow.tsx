"use client";

import { useRef, useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Copy, FileSpreadsheet, Loader2, ShieldCheck, UploadCloud, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/app/lib/api-client";
import { formatValue, humanizeKey } from "@/app/components/loans/loan-data";
import {
  commitBulkUpload, isValidBatchId, previewBulkUpload, reviewBulkUpload, rowValidity,
  type BulkPreview, type BulkRow, type BulkUploadKind,
} from "@/app/lib/bulk-upload-api";

const config: Record<BulkUploadKind, { label: string; singular: string; guidance: string; previewPermission: string; commitPermission: string }> = {
  Savings: {
    label: "Savings credits", singular: "savings", guidance: "Each row needs a member email and amount. Preview validates the member before any balance can change.",
    previewPermission: "previewmembersavingsbyupload", commitPermission: "commitmembersavingsbyupload",
  },
  LoanRepayment: {
    label: "Loan repayments", singular: "loan repayment", guidance: "Each row needs a member email, loan reference and amount. The backend checks ownership and that the loan is Disbursed. Payments go to the oldest unpaid installment first; overpayments fail that row.",
    previewPermission: "previewmemberloansbyupload", commitPermission: "commitmemberloanbyupload",
  },
};

function responseMessage(response: unknown): string | undefined {
  if (response && typeof response === "object" && "message" in response && typeof response.message === "string") return response.message;
  return undefined;
}

function downloadPreview(response: unknown, batchId: string) {
  const blob = new Blob([JSON.stringify(response, null, 2) ?? "null"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = `batch-preview-${batchId}.json`;
    document.body.append(link);
    link.click();
    link.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

function ResponsePanel({ response, title }: { response: unknown; title: string }) {
  return <div className="rounded-2xl border p-4" style={{ borderColor: "var(--admin-border)" }}>
    <h3 className="text-sm font-semibold">{title}</h3>
    {responseMessage(response) && <p className="mt-2 text-sm admin-text-muted">{responseMessage(response)}</p>}
    <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-amber-600">View complete backend response</summary><pre className="mt-3 max-h-96 overflow-auto rounded-xl p-3 text-xs" style={{ background: "var(--admin-bg)" }}>{JSON.stringify(response, null, 2) ?? "No response body"}</pre></details>
  </div>;
}

function PreviewRows({ rows }: { rows: BulkRow[] }) {
  if (!rows.length) return <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">The preview did not expose recognizable row results. For safety, this screen will not submit the batch until its response shape can be verified.</p>;
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Row validation</h3><p className="text-xs admin-text-muted">{rows.length} row{rows.length === 1 ? "" : "s"} returned{rows.length > 50 ? " · first 50 shown" : ""}</p></div>
    <div className="max-h-[36rem] space-y-2 overflow-y-auto pr-1">{rows.slice(0, 50).map((row, index) => {
      const validity = rowValidity(row);
      return <div key={index} className="rounded-xl border p-4" style={{ borderColor: "var(--admin-border)" }}>
        <div className="mb-3 flex items-center justify-between gap-2"><span className="text-xs font-bold admin-text-muted">{typeof row.rowNumber === "number" || typeof row.rowNumber === "string" ? `Row ${row.rowNumber}` : `Result ${index + 1}`}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${validity === true ? "bg-emerald-100 text-emerald-800" : validity === false ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"}`}>{validity === true ? "Valid" : validity === false ? "Invalid" : "Check details"}</span></div>
        <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{Object.entries(row).map(([key, value]) => <div key={key} className="min-w-0"><dt className="text-[10px] font-bold uppercase tracking-wider admin-text-muted">{humanizeKey(key)}</dt><dd className="break-words text-sm">{formatValue(value)}</dd></div>)}</dl>
      </div>;
    })}</div>
  </div>;
}

function BatchId({ value }: { value: string }) {
  return <div className="flex flex-wrap items-center gap-2 rounded-xl border p-3" style={{ borderColor: "var(--admin-border)" }}><span className="text-xs font-semibold admin-text-muted">Batch ID</span><code className="min-w-0 flex-1 break-all text-xs font-semibold">{value}</code><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(value); toast.success("Batch ID copied"); } catch { toast.error("Could not copy. Select the ID instead."); } }} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "var(--admin-border)" }}><Copy className="h-3.5 w-3.5" /> Copy</button></div>;
}

export function BulkWorkflow({ kind, onBusyChange }: { kind: BulkUploadKind; onBusyChange?: (busy: boolean) => void }) {
  const details = config[kind];
  const actionLock = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BulkPreview | null>(null);
  const [submission, setSubmission] = useState<unknown>(null);
  const [commitAttempted, setCommitAttempted] = useState(false);
  const [previewReviewed, setPreviewReviewed] = useState(false);
  const [busy, setBusy] = useState<"preview" | "commit" | "review" | null>(null);
  const [confirmCommit, setConfirmCommit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [verified, setVerified] = useState(false);
  const [decision, setDecision] = useState<boolean | null>(null);
  const [reviewResult, setReviewResult] = useState<unknown>(null);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);

  const canCommit = Boolean(preview?.batchId && preview.rows.length && preview.validCount !== undefined && preview.validCount > 0 && previewReviewed && submission === null && !commitAttempted);

  async function runPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || actionLock.current || commitAttempted) return;
    actionLock.current = true;
    setBusy("preview"); onBusyChange?.(true); setError(null); setPreview(null); setSubmission(null); setPreviewReviewed(false);
    try {
      const result = await previewBulkUpload(kind, file);
      setPreview(result);
      if (!result.batchId) setError("Preview returned no valid batchId. Do not submit this batch; ask the backend for the preview response shape.");
      else if (!result.rows.length) setError("Preview returned a batch ID but no recognizable per-row results. Submission is disabled until those rows can be inspected.");
      else if (result.validCount === undefined) setError("Preview did not clearly identify which rows are valid. Submission is disabled until the backend response shape is confirmed.");
      else toast.success("Preview complete. No balances or loans were changed.");
    } catch (reason) { setError(getApiErrorMessage(reason)); }
    finally { actionLock.current = false; setBusy(null); onBusyChange?.(false); }
  }

  async function runCommit() {
    if (!canCommit || !preview?.batchId || actionLock.current) return;
    actionLock.current = true;
    setCommitAttempted(true);
    setBusy("commit"); onBusyChange?.(true); setError(null);
    try {
      const result = await commitBulkUpload(kind, preview.batchId);
      setSubmission(result ?? { message: "The server accepted the Commit request without a response body." });
      setConfirmCommit(false);
      toast.success("Commit request accepted. Review the backend result below.");
    } catch (reason) {
      setConfirmCommit(false);
      setError(`${getApiErrorMessage(reason)} This batch cannot be submitted again from this screen. Confirm its state with the backend before preparing any replacement upload.`);
    }
    finally { actionLock.current = false; setBusy(null); onBusyChange?.(false); }
  }

  async function runReview() {
    if (decision === null || actionLock.current) return;
    const batchId = reviewId.trim();
    if (!isValidBatchId(batchId)) { setError("Enter a valid batch ID to review."); return; }
    if (batchId.toLowerCase() === preview?.batchId?.toLowerCase()) { setError("You cannot review a batch you uploaded in this session."); return; }
    if (reviewedIds.includes(batchId.toLowerCase())) { setDecision(null); setError("You have already recorded a decision for this batch in this session."); return; }
    if (!reviewNote.trim() || !verified) { setError("Add a note and confirm you independently inspected the batch details."); return; }
    actionLock.current = true;
    setBusy("review"); onBusyChange?.(true); setError(null);
    try {
      const result = await reviewBulkUpload(kind, batchId, decision, reviewNote);
      setReviewResult(result ?? { message: "The server accepted the review without a response body." });
      setReviewedIds((ids) => [...ids, batchId.toLowerCase()]);
      setDecision(null); setReviewId(""); setReviewNote(""); setVerified(false);
      toast.success("Review decision recorded. The backend determines the final batch status.");
    } catch (reason) { setDecision(null); setError(getApiErrorMessage(reason)); }
    finally { actionLock.current = false; setBusy(null); onBusyChange?.(false); }
  }

  return <div className="space-y-6">
    <section className="card-admin rounded-3xl p-5 md:p-7">
      <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600"><UploadCloud className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Maker · step 1</p><h2 className="mt-1 text-xl font-semibold">Preview {details.singular} file</h2><p className="mt-1 text-sm leading-6 admin-text-muted">{details.guidance}</p></div></div>
      <form onSubmit={runPreview} className="mt-6 space-y-4"><label className="grid gap-2 text-sm font-semibold"><span>Upload file</span><input type="file" accept=".csv,.xls,.xlsx" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setPreview(null); setSubmission(null); setCommitAttempted(false); setPreviewReviewed(false); setError(null); setConfirmCommit(false); }} className="input-admin w-full rounded-xl p-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-amber-400 file:px-4 file:py-2 file:font-semibold file:text-black" /></label><p className="text-xs admin-text-muted">Choose the backend-supported CSV or spreadsheet template. Required content: {kind === "Savings" ? "member email and amount" : "member email, loan reference and amount"}. No local header format is assumed. Permission: {details.previewPermission}.</p><button type="submit" disabled={!file || busy !== null || commitAttempted} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50">{busy === "preview" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />} Preview file</button>{commitAttempted && <p className="text-xs admin-text-muted">A Commit request was already attempted for this preview. Keep its response visible and verify its status before preparing another batch.</p>}</form>
    </section>

    {preview && <section className="card-admin space-y-5 rounded-3xl p-5 md:p-7"><div className="flex items-start gap-3"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-amber-600" /><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Maker · step 2</p><h2 className="mt-1 text-xl font-semibold">Check validation before submitting</h2><p className="mt-1 text-sm admin-text-muted">Preview never posts money. Only rows accepted by the backend are candidates for Commit.</p></div></div>
      {preview.batchId && <BatchId value={preview.batchId} />}
      <div className="flex flex-wrap gap-3">{preview.validCount !== undefined && <div className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-900">{preview.validCount} valid</div>}{preview.invalidCount !== undefined && <div className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-900">{preview.invalidCount} invalid</div>}</div>
      <PreviewRows rows={preview.rows} />
      {preview.batchId && <button type="button" onClick={() => downloadPreview(preview.raw, preview.batchId!)} className="rounded-full border px-4 py-2 text-xs font-semibold" style={{ borderColor: "var(--admin-border)" }}>Download full validation JSON</button>}
      <ResponsePanel response={preview.raw} title="Preview response" />
      {submission !== null ? <div role="status" className="space-y-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-sm text-emerald-900"><p className="font-semibold">Commit request accepted</p><p>Do not submit this batch again. The backend response below is the source of truth for whether rows were posted or await reviewer approval.</p><ResponsePanel response={submission} title="Commit response" /></div> : <><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={previewReviewed} onChange={(event) => setPreviewReviewed(event.target.checked)} className="mt-1 h-4 w-4 accent-amber-500" /><span>I reviewed the complete validation response, including any rows not shown in the first 50 results.</span></label><p className="text-xs admin-text-muted">Permission: {details.commitPermission}. A failed row must not be counted as posted; review the response after submission.</p><button type="button" disabled={!canCommit || busy !== null} onClick={() => { setError(null); setConfirmCommit(true); }} className="rounded-full bg-[#181817] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Continue to Commit</button></>}
    </section>}

    <section className="card-admin space-y-5 rounded-3xl p-5 md:p-7"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600"><ClipboardCheck className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Checker · separate reviewer</p><h2 className="mt-1 text-xl font-semibold">Review a {details.singular} batch</h2><p className="mt-1 text-sm leading-6 admin-text-muted">The uploader cannot review their own batch. A reviewer can decide only once; one rejection ends the batch. Enough distinct approvals trigger posting automatically on the backend.</p></div></div>
      <div role="note" className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><p>These screenshots provide no endpoint to list or inspect pending batches. Use a batch ID only after you have independently verified its full validation details through a trusted process. Never approve from the ID alone.</p></div>
      <p className="text-xs admin-text-muted">The backend enforces review permissions and prevents the uploader or a repeat reviewer from voting. The provided loan-review Swagger note repeats the savings permission names; confirm the correct loan-review role assignment with the backend.</p>
      <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-semibold"><span>Batch ID</span><input value={reviewId} onChange={(event) => { setReviewId(event.target.value); setReviewResult(null); setDecision(null); }} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="input-admin rounded-xl px-4 py-3 font-mono text-sm" /></label><label className="grid gap-2 text-sm font-semibold"><span>Decision note</span><textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} rows={3} placeholder="Explain your approval or rejection" className="input-admin resize-y rounded-xl px-4 py-3 text-sm" /></label></div>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} className="mt-1 h-4 w-4 accent-amber-500" /><span>I have independently checked the batch contents and validation results, and this is not my own upload.</span></label>
      <div className="flex flex-wrap gap-2"><button type="button" disabled={busy !== null || !isValidBatchId(reviewId) || !reviewNote.trim() || !verified || reviewedIds.includes(reviewId.trim().toLowerCase())} onClick={() => { setDecision(true); setError(null); }} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><ShieldCheck className="h-4 w-4" /> Approve</button><button type="button" disabled={busy !== null || !isValidBatchId(reviewId) || !reviewNote.trim() || !verified || reviewedIds.includes(reviewId.trim().toLowerCase())} onClick={() => { setDecision(false); setError(null); }} className="inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-40"><XCircle className="h-4 w-4" /> Reject</button></div>
      {reviewResult !== null && <ResponsePanel response={reviewResult} title="Review response" />}
    </section>

    {error && <p role="alert" className="whitespace-pre-line rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

    {confirmCommit && preview?.batchId && <div role="dialog" aria-modal="true" aria-labelledby={`${kind}-commit-title`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-lg space-y-5 rounded-3xl p-6 shadow-2xl" style={{ background: "var(--admin-surface)" }}><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Final check</p><h2 id={`${kind}-commit-title`} className="mt-1 text-xl font-semibold">Submit this batch?</h2></div><p className="text-sm leading-6 admin-text-muted">This calls the Commit endpoint for batch <code className="break-all font-semibold">{preview.batchId}</code>. The backend will process valid rows according to its approval rules. Do not click twice or assume a successful request means every row posted.</p><div className="flex justify-end gap-2"><button type="button" disabled={busy === "commit"} onClick={() => setConfirmCommit(false)} className="rounded-full border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Cancel</button><button type="button" disabled={busy === "commit"} onClick={runCommit} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50">{busy === "commit" && <Loader2 className="h-4 w-4 animate-spin" />} Submit once</button></div></div></div>}

    {decision !== null && <div role="dialog" aria-modal="true" aria-labelledby={`${kind}-review-title`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-lg space-y-5 rounded-3xl p-6 shadow-2xl" style={{ background: "var(--admin-surface)" }}><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Irreversible decision</p><h2 id={`${kind}-review-title`} className="mt-1 text-xl font-semibold">{decision ? "Approve" : "Reject"} this batch?</h2></div><p className="text-sm leading-6 admin-text-muted">Batch <code className="break-all font-semibold">{reviewId.trim()}</code>. {decision ? "If this reaches the approval threshold, the backend posts valid rows automatically." : "One rejection ends the batch."} You cannot vote twice.</p><div className="rounded-xl border p-3 text-sm" style={{ borderColor: "var(--admin-border)" }}>Note: {reviewNote.trim()}</div><div className="flex justify-end gap-2"><button type="button" disabled={busy === "review"} onClick={() => setDecision(null)} className="rounded-full border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--admin-border)" }}>Cancel</button><button type="button" disabled={busy === "review"} onClick={runReview} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${decision ? "bg-emerald-600" : "bg-red-600"}`}>{busy === "review" && <Loader2 className="h-4 w-4 animate-spin" />} Confirm {decision ? "approval" : "rejection"}</button></div></div></div>}
  </div>;
}
