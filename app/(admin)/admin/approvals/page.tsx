"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Clock,
  CheckCircle2,
  XCircle,
  UserCog,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
  AlertTriangle,
  X,
  Search,
} from "lucide-react";
import {
  getApprovals,
  reassignApproval,
  type ApprovalRequest,
} from "@/app/lib/approvals-api";
import { adminApiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffOption = { id: string; firstName: string | null; lastName: string | null; email: string | null };

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

// Action types are user-facing labels for what the backend sends
const ACTION_TYPE_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "AssignRole", label: "Role Assignment" },
  { value: "SetPermission", label: "Permission Change" },
  { value: "ActivateUser", label: "User Activation" },
  { value: "DeactivateUser", label: "User Deactivation" },
  { value: "EditCooperativeSetup", label: "Cooperative Setup Edit" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function actionLabel(actionType: string | null): string {
  const found = ACTION_TYPE_OPTIONS.find((o) => o.value === actionType);
  return found?.label ?? actionType ?? "Unknown";
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    Pending: { bg: "rgba(251,191,36,0.15)", color: "#d97706" },
    Approved: { bg: "#dcfce7", color: "#166534" },
    Rejected: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
  };
  const s = styles[status] ?? { bg: "var(--admin-border)", color: "var(--admin-muted)" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
      style={s}
    >
      {status === "Pending" && <Clock className="w-3 h-3" />}
      {status === "Approved" && <CheckCircle2 className="w-3 h-3" />}
      {status === "Rejected" && <XCircle className="w-3 h-3" />}
      {status}
    </span>
  );
}

// ─── Dialog backdrop ──────────────────────────────────────────────────────────

function DialogBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl border p-6 space-y-5 shadow-2xl"
        style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Approve dialog ───────────────────────────────────────────────────────────

function ApproveDialog({
  request,
  isPending,
  onApprove,
  onCancel,
}: {
  request: ApprovalRequest;
  isPending: boolean;
  onApprove: (note: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");
  return (
    <DialogBackdrop>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "#dcfce7" }}
        >
          <CheckCircle2 className="w-5 h-5" style={{ color: "#16a34a" }} />
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--admin-text)" }}>
            Approve Request
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
            Approve this {actionLabel(request.actionType)} request?
          </p>
        </div>
      </div>

      {/* Summary */}
      <div
        className="rounded-2xl border p-4 space-y-2 text-xs"
        style={{ background: "var(--admin-bg)", borderColor: "var(--admin-border)" }}
      >
        <div className="flex justify-between gap-4">
          <span style={{ color: "var(--admin-muted)" }}>Action</span>
          <span className="font-semibold" style={{ color: "var(--admin-text)" }}>
            {actionLabel(request.actionType)}
          </span>
        </div>
        {request.subjectName && (
          <div className="flex justify-between gap-4">
            <span style={{ color: "var(--admin-muted)" }}>Subject</span>
            <span className="font-semibold" style={{ color: "var(--admin-text)" }}>
              {request.subjectName}
            </span>
          </div>
        )}
        {request.requestedBy && (
          <div className="flex justify-between gap-4">
            <span style={{ color: "var(--admin-muted)" }}>Requested by</span>
            <span className="font-semibold" style={{ color: "var(--admin-text)" }}>
              {request.requestedBy}
            </span>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <span style={{ color: "var(--admin-muted)" }}>Submitted</span>
          <span style={{ color: "var(--admin-text)" }}>{formatDate(request.createdAt)}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: "var(--admin-muted)" }}
        >
          Approval note (optional)
        </label>
        <textarea
          id="approval-approve-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Add a note for the audit trail…"
          className="w-full px-3 py-2 rounded-xl text-sm outline-none border resize-none"
          style={{
            background: "var(--admin-bg)",
            color: "var(--admin-text)",
            borderColor: "var(--admin-border)",
          }}
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="text-xs font-medium px-4 py-2 rounded-xl transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ color: "var(--admin-muted)" }}
        >
          Cancel
        </button>
        <button
          id="approval-approve-submit-btn"
          type="button"
          disabled={isPending}
          onClick={() => onApprove(note)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#16a34a", color: "#fff" }}
        >
          {isPending ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Approving…</>
          ) : (
            <><CheckCircle2 className="w-3.5 h-3.5" /> Approve</>
          )}
        </button>
      </div>
    </DialogBackdrop>
  );
}

// ─── Reject dialog ────────────────────────────────────────────────────────────

function RejectDialog({
  request,
  isPending,
  onReject,
  onCancel,
}: {
  request: ApprovalRequest;
  isPending: boolean;
  onReject: (note: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");
  return (
    <DialogBackdrop>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(239,68,68,0.1)" }}
        >
          <XCircle className="w-5 h-5" style={{ color: "#ef4444" }} />
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--admin-text)" }}>
            Reject Request
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
            Reject this {actionLabel(request.actionType)} request?
          </p>
        </div>
      </div>

      {/* Summary */}
      <div
        className="rounded-2xl border p-4 space-y-2 text-xs"
        style={{ background: "var(--admin-bg)", borderColor: "var(--admin-border)" }}
      >
        <div className="flex justify-between gap-4">
          <span style={{ color: "var(--admin-muted)" }}>Action</span>
          <span className="font-semibold" style={{ color: "var(--admin-text)" }}>
            {actionLabel(request.actionType)}
          </span>
        </div>
        {request.subjectName && (
          <div className="flex justify-between gap-4">
            <span style={{ color: "var(--admin-muted)" }}>Subject</span>
            <span className="font-semibold" style={{ color: "var(--admin-text)" }}>
              {request.subjectName}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: "var(--admin-muted)" }}
        >
          Rejection note
        </label>
        <textarea
          id="approval-reject-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Reason for rejection…"
          className="w-full px-3 py-2 rounded-xl text-sm outline-none border resize-none"
          style={{
            background: "var(--admin-bg)",
            color: "var(--admin-text)",
            borderColor: "var(--admin-border)",
          }}
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="text-xs font-medium px-4 py-2 rounded-xl transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ color: "var(--admin-muted)" }}
        >
          Cancel
        </button>
        <button
          id="approval-reject-submit-btn"
          type="button"
          disabled={isPending}
          onClick={() => onReject(note)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
        >
          {isPending ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Rejecting…</>
          ) : (
            <><XCircle className="w-3.5 h-3.5" /> Reject</>
          )}
        </button>
      </div>
    </DialogBackdrop>
  );
}

// ─── Reassign dialog ──────────────────────────────────────────────────────────

function ReassignDialog({
  request,
  isPending,
  onReassign,
  onCancel,
}: {
  request: ApprovalRequest;
  isPending: boolean;
  onReassign: (userId: string) => void;
  onCancel: () => void;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");

  // Search staff members
  const staffQuery = useQuery({
    queryKey: ["staff-search-reassign", searchInput],
    queryFn: async (): Promise<StaffOption[]> => {
      if (!searchInput.trim()) return [];
      const res = await adminApiFetch<ApiEnvelope<{ items: StaffOption[] } | StaffOption[]>>(
        `/api/User/search?q=${encodeURIComponent(searchInput)}&pageSize=10`,
      );
      const data = res.data;
      if (!data) return [];
      if (Array.isArray(data)) return data as StaffOption[];
      if ("items" in data && Array.isArray(data.items)) return data.items as StaffOption[];
      return [];
    },
    enabled: searchInput.trim().length >= 2,
  });

  const staffResults = staffQuery.data ?? [];

  function staffLabel(s: StaffOption): string {
    const name = [s.firstName, s.lastName].filter(Boolean).join(" ");
    return name || s.email || s.id;
  }

  return (
    <DialogBackdrop>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(99,102,241,0.12)" }}
        >
          <UserCog className="w-5 h-5" style={{ color: "#6366f1" }} />
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--admin-text)" }}>
            Reassign Approval
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
            Transfer this {actionLabel(request.actionType)} request to another approver.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: "var(--admin-muted)" }}
        >
          Search for approver
        </label>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ background: "var(--admin-bg)", borderColor: "var(--admin-border)" }}
        >
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--admin-muted)" }} />
          <input
            id="reassign-search-input"
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSelectedUserId("");
              setSelectedUserName("");
            }}
            placeholder="Search by name or email…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--admin-text)" }}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSelectedUserId("");
                setSelectedUserName("");
              }}
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" style={{ color: "var(--admin-muted)" }} />
            </button>
          )}
        </div>

        {/* Results */}
        {staffQuery.isLoading && (
          <div className="flex items-center gap-2 py-2 text-xs" style={{ color: "var(--admin-muted)" }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…
          </div>
        )}
        {staffResults.length > 0 && !selectedUserId && (
          <div
            className="rounded-xl border divide-y max-h-40 overflow-y-auto"
            style={{ borderColor: "var(--admin-border)" }}
          >
            {staffResults.map((s) => (
              <button
                key={s.id}
                type="button"
                className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-black/5"
                style={{ color: "var(--admin-text)" }}
                onClick={() => {
                  setSelectedUserId(s.id);
                  setSelectedUserName(staffLabel(s));
                  setSearchInput(staffLabel(s));
                }}
              >
                <span className="font-semibold">{staffLabel(s)}</span>
                {s.email && (
                  <span style={{ color: "var(--admin-muted)" }}> — {s.email}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Selected */}
        {selectedUserId && (
          <div
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)" }}
          >
            <span style={{ color: "var(--admin-text)" }}>
              Assigning to <strong>{selectedUserName}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedUserId("");
                setSelectedUserName("");
                setSearchInput("");
              }}
            >
              <X className="w-3.5 h-3.5" style={{ color: "var(--admin-muted)" }} />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="text-xs font-medium px-4 py-2 rounded-xl transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ color: "var(--admin-muted)" }}
        >
          Cancel
        </button>
        <button
          id="approval-reassign-submit-btn"
          type="button"
          disabled={!selectedUserId || isPending}
          onClick={() => onReassign(selectedUserId)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#6366f1", color: "#fff" }}
        >
          {isPending ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reassigning…</>
          ) : (
            <><UserCog className="w-3.5 h-3.5" /> Reassign</>
          )}
        </button>
      </div>
    </DialogBackdrop>
  );
}

// ─── Approval row ─────────────────────────────────────────────────────────────

type DialogState =
  | { kind: "approve"; request: ApprovalRequest }
  | { kind: "reject"; request: ApprovalRequest }
  | { kind: "reassign"; request: ApprovalRequest }
  | null;

function ApprovalRow({
  request,
  onAction,
  isMutating,
}: {
  request: ApprovalRequest;
  onAction: (dialog: DialogState) => void;
  isMutating: boolean;
}) {
  return (
    <div
      className="grid grid-cols-12 gap-3 items-start px-5 py-4 border-b transition-colors"
      style={{ borderColor: "var(--admin-border)" }}
    >
      {/* Action type + subject */}
      <div className="col-span-12 md:col-span-4">
        <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>
          {actionLabel(request.actionType)}
        </p>
        {request.subjectName && (
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--admin-muted)" }}>
            {request.subjectName}
          </p>
        )}
        {request.note && (
          <p className="text-xs mt-1 italic truncate" style={{ color: "var(--admin-muted)" }}>
            &ldquo;{request.note}&rdquo;
          </p>
        )}
      </div>

      {/* Status */}
      <div className="col-span-6 md:col-span-2">
        <StatusBadge status={request.status} />
      </div>

      {/* Requested by / assigned to */}
      <div className="col-span-6 md:col-span-3 text-xs space-y-1">
        {request.requestedBy && (
          <p style={{ color: "var(--admin-muted)" }}>
            By <span className="font-medium" style={{ color: "var(--admin-text)" }}>{request.requestedBy}</span>
          </p>
        )}
        {request.assignedTo && (
          <p style={{ color: "var(--admin-muted)" }}>
            To <span className="font-medium" style={{ color: "var(--admin-text)" }}>{request.assignedTo}</span>
          </p>
        )}
        <p style={{ color: "var(--admin-muted)" }}>{formatDateTime(request.createdAt)}</p>
      </div>

      {/* Actions */}
      <div className="col-span-12 md:col-span-3 flex flex-wrap gap-2 justify-end">
        {request.status === "Pending" && (
          <>
            <button
              id={`approve-approval-${request.id}`}
              type="button"
              disabled={isMutating}
              onClick={() => onAction({ kind: "approve", request })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: "#dcfce7", color: "#166534" }}
            >
              <CheckCircle2 className="w-3 h-3" />
              Approve
            </button>
            <button
              id={`reject-approval-${request.id}`}
              type="button"
              disabled={isMutating}
              onClick={() => onAction({ kind: "reject", request })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
            >
              <XCircle className="w-3 h-3" />
              Reject
            </button>
            <button
              id={`reassign-approval-${request.id}`}
              type="button"
              disabled={isMutating}
              onClick={() => onAction({ kind: "reassign", request })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}
            >
              <UserCog className="w-3 h-3" />
              Reassign
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApprovalsPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [actionType, setActionType] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);

  const queryKey = ["admin-approvals", page, status, actionType] as const;

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey,
    queryFn: () => getApprovals({ page, pageSize: PAGE_SIZE, status, actionType }),
  });

  const approvals = data?.items ?? [];

  // ── Approve mutation ──

  const approveMutation = useMutation({
    mutationFn: async ({ request, note }: { request: ApprovalRequest; note: string }) => {
      // The approval endpoint depends on action type — route accordingly.
      // We call the central endpoint pattern if available, otherwise fallback.
      return adminApiFetch<unknown>(
        buildApproveEndpoint(request),
        { method: "POST", body: { note } },
      );
    },
    onSuccess: () => {
      toast.success("Request approved.");
      setDialog(null);
      queryClient.invalidateQueries({ queryKey: ["admin-approvals"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  // ── Reject mutation ──

  const rejectMutation = useMutation({
    mutationFn: async ({ request, note }: { request: ApprovalRequest; note: string }) => {
      return adminApiFetch<unknown>(
        buildRejectEndpoint(request),
        { method: "POST", body: { note } },
      );
    },
    onSuccess: () => {
      toast.success("Request rejected.");
      setDialog(null);
      queryClient.invalidateQueries({ queryKey: ["admin-approvals"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  // ── Reassign mutation ──

  const reassignMutation = useMutation({
    mutationFn: ({ approvalId, userId }: { approvalId: string; userId: string }) =>
      reassignApproval(approvalId, { userId }),
    onSuccess: () => {
      toast.success("Approval reassigned.");
      setDialog(null);
      queryClient.invalidateQueries({ queryKey: ["admin-approvals"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const anyMutating =
    approveMutation.isPending || rejectMutation.isPending || reassignMutation.isPending;

  function handleFilterChange(kind: "status" | "actionType", value: string) {
    if (kind === "status") setStatus(value);
    else setActionType(value);
    setPage(1);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* ── Dialogs ── */}
      {dialog?.kind === "approve" && (
        <ApproveDialog
          request={dialog.request}
          isPending={approveMutation.isPending}
          onApprove={(note) => approveMutation.mutate({ request: dialog.request, note })}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "reject" && (
        <RejectDialog
          request={dialog.request}
          isPending={rejectMutation.isPending}
          onReject={(note) => rejectMutation.mutate({ request: dialog.request, note })}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "reassign" && (
        <ReassignDialog
          request={dialog.request}
          isPending={reassignMutation.isPending}
          onReassign={(userId) =>
            reassignMutation.mutate({ approvalId: dialog.request.id, userId })
          }
          onCancel={() => setDialog(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-bold tracking-widest uppercase mb-1"
            style={{ color: "var(--admin-muted)" }}
          >
            Maker-Checker
          </p>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>
            Approval Requests
          </h1>
          {data && (
            <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
              {data.totalCount} request{data.totalCount === 1 ? "" : "s"}
            </p>
          )}
        </div>
        <button
          id="approvals-refresh-btn"
          type="button"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-approvals"] })}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:opacity-80 disabled:opacity-40 self-start"
          style={{
            borderColor: "var(--admin-border)",
            color: "var(--admin-muted)",
            background: "var(--admin-surface)",
          }}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <select
          id="approvals-filter-status"
          value={status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="px-4 py-2 rounded-full text-sm font-medium border outline-none"
          style={{
            background: "var(--admin-surface)",
            color: "var(--admin-text)",
            borderColor: "var(--admin-border)",
          }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          id="approvals-filter-action"
          value={actionType}
          onChange={(e) => handleFilterChange("actionType", e.target.value)}
          className="px-4 py-2 rounded-full text-sm font-medium border outline-none"
          style={{
            background: "var(--admin-surface)",
            color: "var(--admin-text)",
            borderColor: "var(--admin-border)",
          }}
        >
          {ACTION_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {(status || actionType) && (
          <button
            type="button"
            onClick={() => {
              setStatus("");
              setActionType("");
              setPage(1);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-3xl border overflow-hidden"
        style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-12 gap-3 px-5 py-4 border-b text-[10px] font-bold tracking-widest uppercase"
          style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}
        >
          <div className="col-span-12 md:col-span-4">Request</div>
          <div className="col-span-6 md:col-span-2">Status</div>
          <div className="col-span-6 md:col-span-3">Details</div>
          <div className="col-span-12 md:col-span-3 text-right">Actions</div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div
            className="p-12 flex items-center justify-center gap-2 text-sm"
            style={{ color: "var(--admin-muted)" }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading approval requests…
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="p-12 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto" style={{ color: "var(--admin-accent)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--admin-accent)" }}>
              Failed to load approvals
            </p>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              {getApiErrorMessage(error)}
            </p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && approvals.length === 0 && (
          <div className="p-12 text-center space-y-2">
            <Inbox className="w-8 h-8 mx-auto" style={{ color: "var(--admin-border)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--admin-muted)" }}>
              No approval requests found
            </p>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              {status || actionType ? "Try clearing the filters." : "Nothing pending review."}
            </p>
          </div>
        )}

        {/* Rows */}
        {approvals.map((req) => (
          <ApprovalRow
            key={req.id}
            request={req}
            onAction={setDialog}
            isMutating={anyMutating}
          />
        ))}
      </div>

      {/* ── Pagination ── */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Page {data.pageNumber} of {data.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Endpoint routing helpers ─────────────────────────────────────────────────

/**
 * Routes approval actions to the correct backend endpoint based on action type.
 *
 * Some action types have a dedicated endpoint; others may use the
 * generic (subject-based) pattern. This keeps actionType-specific
 * routing centralised so the rest of the UI is not polluted.
 */
function buildApproveEndpoint(request: ApprovalRequest): string {
  const id = request.subjectId ?? request.id;
  switch (request.actionType) {
    case "AssignRole":
      return `/api/admin/authorization/users/assign-role/${encodeURIComponent(id)}/approve`;
    case "SetPermission":
      return `/api/admin/authorization/users/set-permission/${encodeURIComponent(id)}/approve`;
    case "ActivateUser":
      return `/api/User/${encodeURIComponent(id)}/Activate/Approve`;
    case "DeactivateUser":
      return `/api/User/${encodeURIComponent(id)}/Deactivate/Approve`;
    case "EditCooperativeSetup":
      return `/api/CooperativeAccount/EditSetup/${encodeURIComponent(id)}/Approve`;
    default:
      // Fall back to the approval ID itself — some endpoints may accept approval-id-based routes
      return `/api/Approvals/${encodeURIComponent(request.id)}/Approve`;
  }
}

function buildRejectEndpoint(request: ApprovalRequest): string {
  const id = request.subjectId ?? request.id;
  switch (request.actionType) {
    case "AssignRole":
      return `/api/admin/authorization/users/assign-role/${encodeURIComponent(id)}/reject`;
    case "SetPermission":
      return `/api/admin/authorization/users/set-permission/${encodeURIComponent(id)}/reject`;
    case "ActivateUser":
      return `/api/User/${encodeURIComponent(id)}/Activate/Reject`;
    case "DeactivateUser":
      return `/api/User/${encodeURIComponent(id)}/Deactivate/Reject`;
    case "EditCooperativeSetup":
      return `/api/CooperativeAccount/EditSetup/${encodeURIComponent(id)}/Reject`;
    default:
      return `/api/Approvals/${encodeURIComponent(request.id)}/Reject`;
  }
}
