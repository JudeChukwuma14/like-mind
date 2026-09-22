"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Check,
  Clock,
  KeyRound,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  User,
  Phone,
  MapPin,
  Briefcase,
  Users,
  FileCheck,
  Monitor,
  X,
  CheckCircle2,
  XCircle,
  UserRoundCog,
} from "lucide-react";
import { adminApiFetch, getApiErrorMessage } from "@/app/lib/api-client";
import {
  pluckMember,
  formatDate,
  formatDateTime,
} from "@/app/lib/member-profile";
import {
  getAllRoles,
  getAllPermissions,
  getUserAccess,
  setRoleInheritance,
  removeUserOverride,
  initiateRoleAssignment,
  approveRoleAssignment,
  rejectRoleAssignment,
  initiateUserPermissionChange,
  approveUserPermissionChange,
  rejectUserPermissionChange,
  initiateSetRolePermissions,
} from "@/app/lib/authorization-api";
import {
  initiateUserActivation,
  approveUserActivation,
  rejectUserActivation,
  initiateUserDeactivation,
  approveUserDeactivation,
  rejectUserDeactivation,
  activateStaff,
} from "@/app/lib/user-admin-api";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon
        className="w-4 h-4 shrink-0"
        style={{ color: "var(--admin-primary)" }}
      />
      <p
        className="text-[10px] font-bold tracking-widest uppercase"
        style={{ color: "var(--admin-muted)" }}
      >
        {label}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex justify-between items-start gap-4 py-2.5 border-b last:border-0"
      style={{ borderColor: "var(--admin-border)" }}
    >
      <span
        className="text-xs shrink-0"
        style={{ color: "var(--admin-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-xs text-right font-medium"
        style={{ color: "var(--admin-text)" }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: "var(--admin-surface)",
        borderColor: "var(--admin-border)",
      }}
    >
      {children}
    </div>
  );
}

function BoolBadge({
  value,
  trueLabel = "Yes",
  falseLabel = "No",
}: {
  value: boolean | null;
  trueLabel?: string;
  falseLabel?: string;
}) {
  if (value === null)
    return <span style={{ color: "var(--admin-muted)" }}>—</span>;
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
      style={
        value
          ? { background: "#dcfce7", color: "#166534" }
          : { background: "var(--admin-border)", color: "var(--admin-muted)" }
      }
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
}

// ─── Pending badge ─────────────────────────────────────────────────────────────

function PendingBadge({ label = "Pending Approval" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
      style={{ background: "rgba(251,191,36,0.15)", color: "#d97706" }}
    >
      <Clock className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─── Confirmation dialog backdrop ─────────────────────────────────────────────

function DialogBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl border p-6 space-y-5 shadow-2xl"
        style={{
          background: "var(--admin-surface)",
          borderColor: "var(--admin-border)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Reusable note textarea + Cancel/Confirm button row used inside dialogs.
 * Avoids duplicating the same structure across every lifecycle dialog.
 */
function NoteDialogBody({
  label,
  placeholder,
  inputId,
  isPending,
  confirmLabel,
  confirmStyle,
  onConfirm,
  onCancel,
}: {
  label: string;
  placeholder: string;
  inputId: string;
  isPending: boolean;
  confirmLabel: string;
  confirmStyle: React.CSSProperties;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");
  return (
    <>
      <div className="space-y-1.5">
        <label
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: "var(--admin-muted)" }}
        >
          {label}
        </label>
        <textarea
          id={inputId}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder={placeholder}
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
          type="button"
          disabled={isPending}
          onClick={() => onConfirm(note)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={confirmStyle}
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Please wait…
            </>
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </>
  );
}

// ─── Approve role assignment dialog ───────────────────────────────────────────

function ApproveRoleDialog({
  userName,
  requestedRoleName,
  inheritPermissions,
  isPending,
  onApprove,
  onCancel,
}: {
  userName: string;
  requestedRoleName: string;
  inheritPermissions: boolean;
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
          <h2
            className="text-base font-bold"
            style={{ color: "var(--admin-text)" }}
          >
            Approve Role Assignment
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
            Are you sure you want to approve this role assignment?
          </p>
        </div>
      </div>

      {/* Summary */}
      <div
        className="rounded-2xl border p-4 space-y-2"
        style={{
          background: "var(--admin-bg)",
          borderColor: "var(--admin-border)",
        }}
      >
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            User
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--admin-text)" }}
          >
            {userName}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Requested role
          </span>
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold"
            style={{ color: "var(--admin-text)" }}
          >
            <KeyRound
              className="w-3 h-3"
              style={{ color: "var(--admin-primary)" }}
            />
            {requestedRoleName}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Inherit role permissions
          </span>
          <BoolBadge
            value={inheritPermissions}
            trueLabel="Yes"
            falseLabel="No"
          />
        </div>
      </div>

      {/* Optional note */}
      <div className="space-y-1.5">
        <label
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: "var(--admin-muted)" }}
        >
          Approval note (optional)
        </label>
        <textarea
          id="approve-role-note"
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
          id="approve-role-submit-btn"
          type="button"
          disabled={isPending}
          onClick={() => onApprove(note)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#16a34a", color: "#fff" }}
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Approving…
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve Request
            </>
          )}
        </button>
      </div>
    </DialogBackdrop>
  );
}

// ─── Reject role assignment dialog ────────────────────────────────────────────

function RejectRoleDialog({
  userName,
  requestedRoleName,
  isPending,
  onReject,
  onCancel,
}: {
  userName: string;
  requestedRoleName: string;
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
          <h2
            className="text-base font-bold"
            style={{ color: "var(--admin-text)" }}
          >
            Reject Role Assignment
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
            Are you sure you want to reject this role assignment request?
          </p>
        </div>
      </div>

      {/* Summary */}
      <div
        className="rounded-2xl border p-4 space-y-2"
        style={{
          background: "var(--admin-bg)",
          borderColor: "var(--admin-border)",
        }}
      >
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            User
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--admin-text)" }}
          >
            {userName}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Requested role
          </span>
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold"
            style={{ color: "var(--admin-text)" }}
          >
            <KeyRound
              className="w-3 h-3"
              style={{ color: "var(--admin-primary)" }}
            />
            {requestedRoleName}
          </span>
        </div>
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <label
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: "var(--admin-muted)" }}
        >
          Rejection note
        </label>
        <textarea
          id="reject-role-note"
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
          id="reject-role-submit-btn"
          type="button"
          disabled={isPending}
          onClick={() => onReject(note)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Rejecting…
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5" /> Reject Request
            </>
          )}
        </button>
      </div>
    </DialogBackdrop>
  );
}

// ─── Approve permission change dialog ─────────────────────────────────────────

function ApprovePermDialog({
  userName,
  permissionCode,
  permissionName,
  isGrant,
  isPending,
  onApprove,
  onCancel,
}: {
  userName: string;
  permissionCode: string;
  permissionName: string;
  isGrant: boolean;
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
          <h2
            className="text-base font-bold"
            style={{ color: "var(--admin-text)" }}
          >
            Approve Permission Change
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
            Are you sure you want to approve this permission change request?
          </p>
        </div>
      </div>

      {/* Summary */}
      <div
        className="rounded-2xl border p-4 space-y-2"
        style={{
          background: "var(--admin-bg)",
          borderColor: "var(--admin-border)",
        }}
      >
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            User
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--admin-text)" }}
          >
            {userName}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Permission
          </span>
          <span
            className="text-xs font-mono font-semibold"
            style={{ color: "var(--admin-text)" }}
          >
            {permissionName || permissionCode}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Requested action
          </span>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={
              isGrant
                ? { background: "#dcfce7", color: "#166534" }
                : { background: "rgba(239,68,68,0.1)", color: "#ef4444" }
            }
          >
            {isGrant ? "Grant" : "Revoke"}
          </span>
        </div>
      </div>

      {/* Optional note */}
      <div className="space-y-1.5">
        <label
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: "var(--admin-muted)" }}
        >
          Approval note (optional)
        </label>
        <textarea
          id="approve-perm-note"
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
          id="approve-perm-submit-btn"
          type="button"
          disabled={isPending}
          onClick={() => onApprove(note)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#16a34a", color: "#fff" }}
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Approving…
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve Request
            </>
          )}
        </button>
      </div>
    </DialogBackdrop>
  );
}

// ─── Reject permission change dialog ──────────────────────────────────────────

function RejectPermDialog({
  userName,
  permissionCode,
  permissionName,
  isGrant,
  isPending,
  onReject,
  onCancel,
}: {
  userName: string;
  permissionCode: string;
  permissionName: string;
  isGrant: boolean;
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
          <h2
            className="text-base font-bold"
            style={{ color: "var(--admin-text)" }}
          >
            Reject Permission Change
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
            Are you sure you want to reject this permission change request?
          </p>
        </div>
      </div>

      {/* Summary */}
      <div
        className="rounded-2xl border p-4 space-y-2"
        style={{
          background: "var(--admin-bg)",
          borderColor: "var(--admin-border)",
        }}
      >
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            User
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--admin-text)" }}
          >
            {userName}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Permission
          </span>
          <span
            className="text-xs font-mono font-semibold"
            style={{ color: "var(--admin-text)" }}
          >
            {permissionName || permissionCode}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Requested action
          </span>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={
              isGrant
                ? { background: "#dcfce7", color: "#166534" }
                : { background: "rgba(239,68,68,0.1)", color: "#ef4444" }
            }
          >
            {isGrant ? "Grant" : "Revoke"}
          </span>
        </div>
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <label
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: "var(--admin-muted)" }}
        >
          Rejection note
        </label>
        <textarea
          id="reject-perm-note"
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
          id="reject-perm-submit-btn"
          type="button"
          disabled={isPending}
          onClick={() => onReject(note)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Rejecting…
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5" /> Reject Request
            </>
          )}
        </button>
      </div>
    </DialogBackdrop>
  );
}

// ─── Access & Permissions section ────────────────────────────────────────────

/** Accessible toggle switch — controlled, no local state. */
function ToggleSwitch({
  checked,
  onChange,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: checked ? "var(--admin-text)" : "var(--admin-border)",
      }}
    >
      <span
        className="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform"
        style={{
          background: checked ? "var(--admin-bg)" : "var(--admin-muted)",
          transform: checked ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </button>
  );
}

type AccessTab = "effective" | "role" | "granted" | "revoked" | "manage";

function TabButton({
  active,
  onClick,
  label,
  count,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0"
      style={
        active
          ? { background: "var(--admin-text)", color: "var(--admin-bg)" }
          : { background: "transparent", color: "var(--admin-muted)" }
      }
    >
      {label}
      {count !== undefined && (
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums"
          style={
            active
              ? {
                  background: "rgba(255,255,255,0.2)",
                  color: "var(--admin-bg)",
                }
              : highlight && count > 0
                ? {
                    background: "rgba(252,211,77,0.2)",
                    color: "var(--admin-primary)",
                  }
                : {
                    background: "var(--admin-border)",
                    color: "var(--admin-muted)",
                  }
          }
        >
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * A permission row used inside the tab panels.
 * Shows permission name + code + optional action button.
 */
function PermRow({
  code,
  permissionMap,
  actionSlot,
}: {
  code: string;
  permissionMap: Map<string, { name: string; category: string }>;
  actionSlot?: React.ReactNode;
}) {
  const info = permissionMap.get(code.toLowerCase());
  return (
    <div
      className="flex items-center justify-between gap-3 py-2.5"
      style={{ borderBottom: "1px solid var(--admin-border)" }}
    >
      <div className="min-w-0 flex-1">
        <p
          className="text-xs font-medium truncate"
          style={{ color: "var(--admin-text)" }}
        >
          {info?.name ?? code}
        </p>
        <p
          className="text-[10px] font-mono"
          style={{ color: "var(--admin-muted)" }}
        >
          {info?.category ? `${info.category} · ` : ""}
          {code}
        </p>
      </div>
      {actionSlot}
    </div>
  );
}

function EmptyTabState({ message }: { message: string }) {
  return (
    <p
      className="py-5 text-center text-xs"
      style={{ color: "var(--admin-muted)" }}
    >
      {message}
    </p>
  );
}

/** Stateful permission override picker (select + Request Grant / Request Revoke buttons). */
function AddOverrideControls({
  allPermissions,
  onRequestGrant,
  onRequestRevoke,
  disabled,
}: {
  allPermissions: {
    id: string;
    code: string;
    name: string;
    category: string;
  }[];
  onRequestGrant: (code: string) => void;
  onRequestRevoke: (code: string) => void;
  disabled?: boolean;
}) {
  const [selectedCode, setSelectedCode] = useState("");

  const groups = new Map<string, typeof allPermissions>();
  for (const p of allPermissions) {
    const list = groups.get(p.category) ?? [];
    list.push(p);
    groups.set(p.category, list);
  }
  const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div className="space-y-3">
      <select
        id="member-permission-override-select"
        value={selectedCode}
        onChange={(e) => setSelectedCode(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
        style={{
          background: "var(--admin-bg)",
          color: "var(--admin-text)",
          borderColor: "var(--admin-border)",
        }}
      >
        <option value="">Choose a permission…</option>
        {sortedGroups.map(([category, perms]) => (
          <optgroup key={category} label={category}>
            {perms.map((p) => (
              <option key={p.id} value={p.code}>
                {p.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          id="member-request-grant-permission-btn"
          type="button"
          disabled={!selectedCode || disabled}
          onClick={() => {
            onRequestGrant(selectedCode);
            setSelectedCode("");
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#dcfce7", color: "#166534" }}
        >
          <Check className="w-3.5 h-3.5" />
          Request Grant
        </button>
        <button
          id="member-request-revoke-permission-btn"
          type="button"
          disabled={!selectedCode || disabled}
          onClick={() => {
            onRequestRevoke(selectedCode);
            setSelectedCode("");
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
        >
          <ShieldOff className="w-3.5 h-3.5" />
          Request Revoke
        </button>
      </div>
      <p className="text-[10px]" style={{ color: "var(--admin-muted)" }}>
        Permission change requests require approval before they take effect.
      </p>
    </div>
  );
}

// ─── Dialog state types ───────────────────────────────────────────────────────

type RoleDialogKind = "approve" | "reject";
type PermDialogKind = "approve" | "reject";
type LifecycleDialogKind =
  | "approve-activate"
  | "reject-activate"
  | "approve-deactivate"
  | "reject-deactivate"
  | "confirm-activate-staff";

type RoleDialogState = {
  kind: RoleDialogKind;
  requestedRoleId: string;
  requestedRoleName: string;
  inheritPermissions: boolean;
} | null;

type PermDialogState = {
  kind: PermDialogKind;
  permissionCode: string;
  permissionName: string;
  isGrant: boolean;
} | null;

type LifecycleDialogState = {
  kind: LifecycleDialogKind;
} | null;

// ─── Main section component ───────────────────────────────────────────────────

function AccessAndPermissionsSection({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const queryClient = useQueryClient();
  const ACCESS_KEY = ["admin-user-access", userId] as const;

  const accessQuery = useQuery({
    queryKey: ACCESS_KEY,
    queryFn: () => getUserAccess(userId),
    enabled: Boolean(userId),
  });
  const rolesQuery = useQuery({
    queryKey: ["admin-roles"],
    queryFn: getAllRoles,
  });
  const permissionsQuery = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: getAllPermissions,
  });

  const permissionMap = new Map<string, { name: string; category: string }>();
  for (const p of permissionsQuery.data ?? []) {
    permissionMap.set(p.code.toLowerCase(), {
      name: p.name,
      category: p.category,
    });
  }

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<AccessTab>("effective");

  // ── Role assignment panel state ──
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [inheritOnAssign, setInheritOnAssign] = useState(true);
  const [showAssignPanel, setShowAssignPanel] = useState(false);

  // ── Dialog state ──
  const [roleDialog, setRoleDialog] = useState<RoleDialogState>(null);
  const [permDialog, setPermDialog] = useState<PermDialogState>(null);

  // ── Pending indicators (ephemeral — cleared on next data refresh) ──
  const [pendingRoleRequest, setPendingRoleRequest] = useState<{
    roleId: string;
    roleName: string;
    inherit: boolean;
  } | null>(null);
  const [pendingPermRequest, setPendingPermRequest] = useState<{
    code: string;
    name: string;
    isGrant: boolean;
  } | null>(null);

  const selectedRole = (rolesQuery.data ?? []).find(
    (r) => r.id === selectedRoleId,
  );
  const selectedRolePermsSource = selectedRole?.permissions != null && Array.isArray(selectedRole.permissions) 
    ? selectedRole.permissions 
    : [];
  const selectedRolePermCount = selectedRolePermsSource.length;

  const [selectedRolePerms, setSelectedRolePerms] = useState<Set<string>>(new Set());

  // Auto-populate when role changes
  useEffect(() => {
    if (selectedRoleId && rolesQuery.data) {
      const role = rolesQuery.data.find(r => r.id === selectedRoleId);
      const perms = role?.permissions ?? [];
      const codes = perms
        .map(p => (typeof p === "string" ? p : p?.code))
        .filter((c): c is string => Boolean(c)); // safe filter — no nulls
      setSelectedRolePerms(new Set(codes));
      setInheritOnAssign(true);
    } else {
      setSelectedRolePerms(new Set());
    }
  }, [selectedRoleId, rolesQuery.data]);

  const handleToggleRolePerm = (code: string) => {
    const next = new Set(selectedRolePerms);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setSelectedRolePerms(next);
    setInheritOnAssign(false); // They handpicked, override inheritance
  };

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ACCESS_KEY });
    // Clear pending indicators once actual data reloads
    setPendingRoleRequest(null);
    setPendingPermRequest(null);
  }

  // ── Maker mutations ──

  const initiateRoleAssignmentMutation = useMutation({
    mutationFn: () =>
      initiateRoleAssignment({
        userId,
        roleId: selectedRoleId,
        inheritRolePermissions: inheritOnAssign,
      }),
    onSuccess: (res) => {
      const msg = (res as any)?.message?.toLowerCase() || "";
      const isAutoApproved = msg.includes("already") || msg.includes("auto-approved") || msg.includes("assigned") || msg.includes("success");
      
      const roleName = selectedRole?.name ?? selectedRoleId;

      if (isAutoApproved) {
        toast.success((res as any)?.message || "Role assigned directly.");
        setPendingRoleRequest(null);
      } else {
        toast.success((res as any)?.message || "Role assignment request submitted for approval.");
        setPendingRoleRequest({
          roleId: selectedRoleId,
          roleName,
          inherit: inheritOnAssign,
        });
      }

      if (!inheritOnAssign && selectedRolePerms.size > 0) {
        // Chain the custom permissions request!
        initiateSetRolePermsMutation.mutate({
          userId,
          permissionCodes: Array.from(selectedRolePerms)
        });
      } else {
        // No custom permissions requested, finish up.
        setSelectedRoleId("");
        setShowAssignPanel(false);
        queryClient.invalidateQueries({ queryKey: ACCESS_KEY });
        queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      }
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const initiateSetRolePermsMutation = useMutation({
    mutationFn: ({ userId, permissionCodes }: { userId: string; permissionCodes: string[] }) => {
      const cleaned = permissionCodes.filter(Boolean); // hard guard against nulls
      return initiateSetRolePermissions({ userId, permissionCodes: cleaned });
    },
    onSuccess: (res) => {
      const msg = (res as any)?.message?.toLowerCase() || "";
      const isAutoApproved = msg.includes("already") || msg.includes("auto-approved") || msg.includes("success");
      
      if (isAutoApproved) {
        toast.success((res as any)?.message || "Role permissions handpicked directly.");
      } else {
        toast.success((res as any)?.message || "Role permissions request submitted for approval.");
        // We could track pending state for this, but the role itself is pending.
      }
      setSelectedRoleId("");
      setShowAssignPanel(false);
      queryClient.invalidateQueries({ queryKey: ACCESS_KEY });
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const initiatePermChangeMutation = useMutation({
    mutationFn: ({
      permissionCode,
      isGranted,
    }: {
      permissionCode: string;
      isGranted: boolean;
    }) => initiateUserPermissionChange({ userId, permissionCode, isGranted }),
    onSuccess: (res, variables) => {
      const { permissionCode, isGranted } = variables;
      const info = permissionMap.get(permissionCode.toLowerCase());
      
      const msg = (res as any)?.message?.toLowerCase() || "";
      const isAutoApproved = msg.includes("already") || msg.includes("auto-approved") || msg.includes("granted") || msg.includes("revoked") || msg.includes("success");
      
      if (isAutoApproved) {
        toast.success((res as any)?.message || `Permission ${isGranted ? "granted" : "revoked"} directly.`);
      } else {
        toast.success(
          (res as any)?.message || `Permission change request submitted for approval. (${isGranted ? "Grant" : "Revoke"} · ${info?.name ?? permissionCode})`
        );
        setPendingPermRequest({
          code: permissionCode,
          name: info?.name ?? permissionCode,
          isGrant: isGranted,
        });
      }
      queryClient.invalidateQueries({ queryKey: ACCESS_KEY });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  // ── Checker mutations — role ──

  const approveRoleMutation = useMutation({
    mutationFn: (note: string) => approveRoleAssignment(userId, note),
    onSuccess: () => {
      toast.success("Role assignment approved.");
      setRoleDialog(null);
      refresh();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const rejectRoleMutation = useMutation({
    mutationFn: (note: string) => rejectRoleAssignment(userId, note),
    onSuccess: () => {
      toast.success("Role assignment rejected.");
      setRoleDialog(null);
      refresh();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  // ── Checker mutations — permission ──

  const approvePermMutation = useMutation({
    mutationFn: (note: string) => approveUserPermissionChange(userId, note),
    onSuccess: () => {
      toast.success("Permission change approved.");
      setPermDialog(null);
      refresh();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const rejectPermMutation = useMutation({
    mutationFn: (note: string) => rejectUserPermissionChange(userId, note),
    onSuccess: () => {
      toast.success("Permission change rejected.");
      setPermDialog(null);
      refresh();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  // ── Unchanged mutations ──

  const inheritMutation = useMutation({
    mutationFn: (inherit: boolean) =>
      setRoleInheritance({ userId, inheritRolePermissions: inherit }),
    onSuccess: () => {
      toast.success("Inheritance setting updated.");
      refresh();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const removeOverride = useMutation({
    mutationFn: (code: string) =>
      removeUserOverride({ userId, permissionCode: code }),
    onSuccess: () => {
      toast.success("Override removed.");
      refresh();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  // ── Derived state ──

  const isLoading =
    accessQuery.isLoading || rolesQuery.isLoading || permissionsQuery.isLoading;
  const isError = accessQuery.isError;
  const access = accessQuery.data;
  const roles = rolesQuery.data ?? [];

  const anyMutating =
    initiateRoleAssignmentMutation.isPending ||
    initiatePermChangeMutation.isPending ||
    approveRoleMutation.isPending ||
    rejectRoleMutation.isPending ||
    approvePermMutation.isPending ||
    rejectPermMutation.isPending ||
    inheritMutation.isPending ||
    removeOverride.isPending;

  // Small remove-override button used in both Granted and Revoked tabs
  const RemoveBtn = ({ code }: { code: string }) => (
    <button
      type="button"
      title="Remove override"
      disabled={removeOverride.isPending}
      onClick={() => removeOverride.mutate(code)}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all hover:opacity-80 disabled:opacity-40 shrink-0"
      style={{ background: "var(--admin-border)", color: "var(--admin-muted)" }}
    >
      {removeOverride.isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <X className="w-3 h-3" />
      )}
      Remove
    </button>
  );

  return (
    <>
      {/* ── Dialogs (portaled over everything) ── */}
      {roleDialog?.kind === "approve" && (
        <ApproveRoleDialog
          userName={userName}
          requestedRoleName={roleDialog.requestedRoleName}
          inheritPermissions={roleDialog.inheritPermissions}
          isPending={approveRoleMutation.isPending}
          onApprove={(note) => approveRoleMutation.mutate(note)}
          onCancel={() => setRoleDialog(null)}
        />
      )}
      {roleDialog?.kind === "reject" && (
        <RejectRoleDialog
          userName={userName}
          requestedRoleName={roleDialog.requestedRoleName}
          isPending={rejectRoleMutation.isPending}
          onReject={(note) => rejectRoleMutation.mutate(note)}
          onCancel={() => setRoleDialog(null)}
        />
      )}
      {permDialog?.kind === "approve" && (
        <ApprovePermDialog
          userName={userName}
          permissionCode={permDialog.permissionCode}
          permissionName={permDialog.permissionName}
          isGrant={permDialog.isGrant}
          isPending={approvePermMutation.isPending}
          onApprove={(note) => approvePermMutation.mutate(note)}
          onCancel={() => setPermDialog(null)}
        />
      )}
      {permDialog?.kind === "reject" && (
        <RejectPermDialog
          userName={userName}
          permissionCode={permDialog.permissionCode}
          permissionName={permDialog.permissionName}
          isGrant={permDialog.isGrant}
          isPending={rejectPermMutation.isPending}
          onReject={(note) => rejectPermMutation.mutate(note)}
          onCancel={() => setPermDialog(null)}
        />
      )}

      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "var(--admin-surface)",
          borderColor: "var(--admin-border)",
        }}
      >
        {/* ── Section header ── */}
        <div
          className="px-5 py-4 border-b flex items-center gap-2"
          style={{ borderColor: "var(--admin-border)" }}
        >
          <Shield
            className="w-4 h-4 shrink-0"
            style={{ color: "var(--admin-primary)" }}
          />
          <p
            className="text-[10px] font-bold tracking-widest uppercase flex-1"
            style={{ color: "var(--admin-muted)" }}
          >
            Access &amp; Permissions
          </p>
          {access && (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium"
              style={{ color: "var(--admin-muted)" }}
            >
              <ShieldCheck
                className="w-3.5 h-3.5"
                style={{ color: "#16a34a" }}
              />
              {access.effectivePermissions.length} effective
            </span>
          )}
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div
            className="py-8 flex items-center justify-center gap-2 text-sm"
            style={{ color: "var(--admin-muted)" }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading access data…
          </div>
        )}

        {/* ── Error ── */}
        {isError && (
          <div className="p-6 text-center">
            <Shield
              className="w-8 h-8 mx-auto mb-2"
              style={{ color: "var(--admin-border)" }}
            />
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "var(--admin-accent)" }}
            >
              Unable to load access data
            </p>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              {getApiErrorMessage(accessQuery.error)}
            </p>
          </div>
        )}

        {/* ── Empty ── */}
        {!isLoading && !isError && !access && (
          <div
            className="p-6 text-center text-sm"
            style={{ color: "var(--admin-muted)" }}
          >
            No access data available for this user.
          </div>
        )}

        {access && (
          <>
            {/* ── Status bar: role + inheritance toggle ── */}
            <div
              className="px-5 py-4 border-b grid grid-cols-1 sm:grid-cols-2 gap-4"
              style={{
                borderColor: "var(--admin-border)",
                background: "var(--admin-bg)",
              }}
            >
              {/* Current role */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-widest font-bold mb-0.5"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    Assigned role
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: "var(--admin-text)" }}
                  >
                    <KeyRound
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--admin-primary)" }}
                    />
                    {access.roleName ?? "None"}
                  </span>
                  {pendingRoleRequest && (
                    <div className="mt-1.5">
                      <PendingBadge />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssignPanel((s) => !s)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80 shrink-0"
                  style={{
                    borderColor: "var(--admin-border)",
                    color: "var(--admin-muted)",
                    background: "var(--admin-surface)",
                  }}
                >
                  Request role change
                </button>
              </div>

              {/* Inheritance toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p
                    className="text-[10px] uppercase tracking-widest font-bold mb-0.5"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    Role inheritance
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    {access.inheritRolePermissions
                      ? "User receives all permissions from their role."
                      : "User does not inherit role permissions."}
                  </p>
                </div>
                <ToggleSwitch
                  id="member-inherit-toggle"
                  checked={access.inheritRolePermissions}
                  disabled={inheritMutation.isPending || anyMutating}
                  onChange={(next) => inheritMutation.mutate(next)}
                />
              </div>
            </div>

            {/* ── Pending role request info bar ── */}
            {pendingRoleRequest && (
              <div
                className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3"
                style={{
                  borderColor: "var(--admin-border)",
                  background: "rgba(251,191,36,0.06)",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Clock
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "#d97706" }}
                  />
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--admin-text)" }}
                  >
                    Pending role change request:{" "}
                    <span className="font-semibold">
                      {pendingRoleRequest.roleName}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="approve-pending-role-btn"
                    type="button"
                    disabled={anyMutating}
                    onClick={() =>
                      setRoleDialog({
                        kind: "approve",
                        requestedRoleId: pendingRoleRequest.roleId,
                        requestedRoleName: pendingRoleRequest.roleName,
                        inheritPermissions: pendingRoleRequest.inherit,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ background: "#dcfce7", color: "#166534" }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Approve
                  </button>
                  <button
                    id="reject-pending-role-btn"
                    type="button"
                    disabled={anyMutating}
                    onClick={() =>
                      setRoleDialog({
                        kind: "reject",
                        requestedRoleId: pendingRoleRequest.roleId,
                        requestedRoleName: pendingRoleRequest.roleName,
                        inheritPermissions: pendingRoleRequest.inherit,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                    }}
                  >
                    <XCircle className="w-3 h-3" />
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* ── Checker actions bar (always available for approvers) ── */}
            {!pendingRoleRequest && (
              <div
                className="px-5 py-3 border-b"
                style={{
                  borderColor: "var(--admin-border)",
                  background: "var(--admin-bg)",
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-widest font-bold mb-2"
                  style={{ color: "var(--admin-muted)" }}
                >
                  Checker actions
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    id="checker-approve-role-btn"
                    type="button"
                    disabled={anyMutating}
                    onClick={() => {
                      const roleName = access.roleName ?? "Unknown role";
                      setRoleDialog({
                        kind: "approve",
                        requestedRoleId: "",
                        requestedRoleName: roleName,
                        inheritPermissions: access.inheritRolePermissions,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ background: "#dcfce7", color: "#166534" }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Approve Role Assignment
                  </button>
                  <button
                    id="checker-reject-role-btn"
                    type="button"
                    disabled={anyMutating}
                    onClick={() => {
                      const roleName = access.roleName ?? "Unknown role";
                      setRoleDialog({
                        kind: "reject",
                        requestedRoleId: "",
                        requestedRoleName: roleName,
                        inheritPermissions: access.inheritRolePermissions,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                    }}
                  >
                    <XCircle className="w-3 h-3" />
                    Reject Role Assignment
                  </button>
                  <button
                    id="checker-approve-perm-btn"
                    type="button"
                    disabled={anyMutating}
                    onClick={() =>
                      setPermDialog({
                        kind: "approve",
                        permissionCode: "",
                        permissionName: "Pending permission",
                        isGrant: true,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ background: "#dbeafe", color: "#1d4ed8" }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Approve Permission Change
                  </button>
                  <button
                    id="checker-reject-perm-btn"
                    type="button"
                    disabled={anyMutating}
                    onClick={() =>
                      setPermDialog({
                        kind: "reject",
                        permissionCode: "",
                        permissionName: "Pending permission",
                        isGrant: true,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                    }}
                  >
                    <XCircle className="w-3 h-3" />
                    Reject Permission Change
                  </button>
                </div>
              </div>
            )}

            {/* ── Pending permission request info bar ── */}
            {pendingPermRequest && (
              <div
                className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3"
                style={{
                  borderColor: "var(--admin-border)",
                  background: "rgba(251,191,36,0.06)",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Clock
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "#d97706" }}
                  />
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--admin-text)" }}
                  >
                    Pending permission change:{" "}
                    <span className="font-semibold">
                      {pendingPermRequest.isGrant ? "Grant" : "Revoke"} ·{" "}
                      {pendingPermRequest.name}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="approve-pending-perm-btn"
                    type="button"
                    disabled={anyMutating}
                    onClick={() =>
                      setPermDialog({
                        kind: "approve",
                        permissionCode: pendingPermRequest.code,
                        permissionName: pendingPermRequest.name,
                        isGrant: pendingPermRequest.isGrant,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ background: "#dcfce7", color: "#166534" }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Approve
                  </button>
                  <button
                    id="reject-pending-perm-btn"
                    type="button"
                    disabled={anyMutating}
                    onClick={() =>
                      setPermDialog({
                        kind: "reject",
                        permissionCode: pendingPermRequest.code,
                        permissionName: pendingPermRequest.name,
                        isGrant: pendingPermRequest.isGrant,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                    }}
                  >
                    <XCircle className="w-3 h-3" />
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* ── Assign role panel (collapsible) ── */}
            {showAssignPanel && (
              <div
                className="px-5 py-4 border-b space-y-3"
                style={{
                  borderColor: "var(--admin-border)",
                  background: "var(--admin-surface)",
                }}
              >
                <div className="flex items-center gap-2">
                  <p
                    className="text-[10px] uppercase tracking-widest font-bold flex-1"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    Request role change
                  </p>
                  <PendingBadge label="Requires approval" />
                </div>
                <select
                  id="member-role-select"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  disabled={initiateRoleAssignmentMutation.isPending}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
                  style={{
                    background: "var(--admin-bg)",
                    color: "var(--admin-text)",
                    borderColor: "var(--admin-border)",
                  }}
                >
                  <option value="">Select a role…</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>

                {/* ─── Permission checklist (only shown when a role is selected) ─── */}
                {selectedRoleId && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p
                        className="text-[10px] uppercase tracking-widest font-bold"
                        style={{ color: "var(--admin-muted)" }}
                      >
                        Handpick permissions
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const allCodes = selectedRolePermsSource
                              .map(p => typeof p === "string" ? p : p?.code)
                              .filter((c): c is string => Boolean(c));
                            setSelectedRolePerms(new Set(allCodes));
                            setInheritOnAssign(false);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded-lg font-semibold transition-opacity hover:opacity-70"
                          style={{ background: "var(--admin-border)", color: "var(--admin-text)" }}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRolePerms(new Set());
                            setInheritOnAssign(false);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded-lg font-semibold transition-opacity hover:opacity-70"
                          style={{ background: "var(--admin-border)", color: "var(--admin-text)" }}
                        >
                          None
                        </button>
                      </div>
                    </div>
                    {selectedRolePermsSource.length === 0 ? (
                      <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                        This role has no permissions configured.
                      </p>
                    ) : (
                      <div
                        className="rounded-xl border divide-y overflow-y-auto"
                        style={{
                          maxHeight: "180px",
                          borderColor: "var(--admin-border)",
                          background: "var(--admin-bg)",
                        }}
                      >
                        {selectedRolePermsSource.map((perm, idx) => {
                          const code = typeof perm === "string" ? perm : perm?.code;
                          const name = typeof perm === "object" && perm !== null && (perm as any).name
                            ? (perm as any).name
                            : code;
                          if (!code) return null;
                          const isSelected = selectedRolePerms.has(code);
                          return (
                            <label
                              key={code ?? idx}
                              className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors hover:opacity-80"
                              style={{ borderColor: "var(--admin-border)" }}
                            >
                              <div
                                className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all"
                                style={
                                  isSelected
                                    ? { background: "#166534", borderColor: "#166534" }
                                    : { background: "transparent", borderColor: "var(--admin-border)" }
                                }
                              >
                                {isSelected && (
                                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={isSelected}
                                onChange={() => handleToggleRolePerm(code)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate" style={{ color: "var(--admin-text)" }}>
                                  {name}
                                </p>
                                <p className="text-[10px] font-mono" style={{ color: "var(--admin-muted)" }}>
                                  {code}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-[10px]" style={{ color: "var(--admin-muted)" }}>
                      {selectedRolePerms.size} of {selectedRolePermCount} selected
                    </p>
                  </div>
                )}

                <label
                  className="flex items-center gap-2 cursor-pointer text-xs"
                  style={{ color: "var(--admin-muted)" }}
                >
                  <input
                    id="member-inherit-on-assign"
                    type="checkbox"
                    checked={inheritOnAssign}
                    onChange={(e) => setInheritOnAssign(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  Inherit role permissions on assignment
                </label>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignPanel(false);
                      setSelectedRoleId("");
                    }}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    Cancel
                  </button>
                  <button
                    id="member-submit-role-request-btn"
                    type="button"
                    disabled={
                      !selectedRoleId ||
                      initiateRoleAssignmentMutation.isPending
                    }
                    onClick={() => initiateRoleAssignmentMutation.mutate()}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: "var(--admin-text)",
                      color: "var(--admin-bg)",
                    }}
                  >
                    {initiateRoleAssignmentMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                        Submitting…
                      </>
                    ) : (
                      "Submit for Approval"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── Tabs ── */}
            <div
              className="flex items-center gap-1 px-5 py-3 border-b overflow-x-auto"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <TabButton
                active={activeTab === "effective"}
                onClick={() => setActiveTab("effective")}
                label="Effective"
                count={access.effectivePermissions.length}
                highlight
              />
              <TabButton
                active={activeTab === "role"}
                onClick={() => setActiveTab("role")}
                label="Role"
                count={access.rolePermissions.length}
              />
              <TabButton
                active={activeTab === "granted"}
                onClick={() => setActiveTab("granted")}
                label="Granted"
                count={access.granted.length}
                highlight
              />
              <TabButton
                active={activeTab === "revoked"}
                onClick={() => setActiveTab("revoked")}
                label="Revoked"
                count={access.revoked.length}
              />
              <TabButton
                active={activeTab === "manage"}
                onClick={() => setActiveTab("manage")}
                label="Request change"
              />
            </div>

            {/* ── Tab content ── */}
            <div className="px-5 pt-3 pb-5">
              {/* EFFECTIVE */}
              {activeTab === "effective" && (
                <>
                  {access.effectivePermissions.length === 0 ? (
                    <EmptyTabState message="This user has no effective permissions." />
                  ) : (
                    <>
                      <p
                        className="text-xs mb-3"
                        style={{ color: "var(--admin-muted)" }}
                      >
                        The final set of permissions this user currently has, as
                        determined by the backend.
                      </p>
                      <div>
                        {access.effectivePermissions.map((code) => (
                          <PermRow
                            key={code}
                            code={code}
                            permissionMap={permissionMap}
                          />
                        ))}
                        <div className="h-px" />
                        {/* Remove bottom border on last item */}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ROLE PERMISSIONS */}
              {activeTab === "role" && (
                <>
                  {access.rolePermissions.length === 0 ? (
                    <EmptyTabState message="No permissions are assigned to this user's role." />
                  ) : (
                    <div>
                      {access.rolePermissions.map((code) => {
                        const isRevoked = access.revoked
                          .map((r) => r.toLowerCase())
                          .includes(code.toLowerCase());
                        const isPendingRevoke =
                          pendingPermRequest?.code.toLowerCase() ===
                            code.toLowerCase() && !pendingPermRequest.isGrant;
                        return (
                          <PermRow
                            key={code}
                            code={code}
                            permissionMap={permissionMap}
                            actionSlot={
                              isPendingRevoke ? (
                                <PendingBadge label="Revoke pending" />
                              ) : isRevoked ? (
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                                  style={{
                                    background: "rgba(239,68,68,0.1)",
                                    color: "#ef4444",
                                  }}
                                >
                                  Revoked
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={anyMutating}
                                  onClick={() =>
                                    initiatePermChangeMutation.mutate({
                                      permissionCode: code,
                                      isGranted: false,
                                    })
                                  }
                                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-80 disabled:opacity-40 shrink-0"
                                  style={{
                                    background: "rgba(239,68,68,0.1)",
                                    color: "#ef4444",
                                  }}
                                >
                                  {initiatePermChangeMutation.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin inline" />
                                  ) : (
                                    "Request revoke"
                                  )}
                                </button>
                              )
                            }
                          />
                        );
                      })}
                      <div className="h-px" />
                    </div>
                  )}
                </>
              )}

              {/* GRANTED */}
              {activeTab === "granted" && (
                <>
                  {access.granted.length === 0 ? (
                    <EmptyTabState message="No directly-granted permission overrides." />
                  ) : (
                    <div>
                      {access.granted.map((code) => (
                        <PermRow
                          key={code}
                          code={code}
                          permissionMap={permissionMap}
                          actionSlot={<RemoveBtn code={code} />}
                        />
                      ))}
                      <div className="h-px" />
                    </div>
                  )}
                </>
              )}

              {/* REVOKED */}
              {activeTab === "revoked" && (
                <>
                  {access.revoked.length === 0 ? (
                    <EmptyTabState message="No explicitly revoked permission overrides." />
                  ) : (
                    <div>
                      {access.revoked.map((code) => (
                        <PermRow
                          key={code}
                          code={code}
                          permissionMap={permissionMap}
                          actionSlot={<RemoveBtn code={code} />}
                        />
                      ))}
                      <div className="h-px" />
                    </div>
                  )}
                </>
              )}

              {/* REQUEST CHANGE — initiate permission override */}
              {activeTab === "manage" && (
                <div className="space-y-3 pt-1">
                  <p
                    className="text-xs"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    Select a permission and submit a grant or revoke request.
                    The change will be applied once a checker approves it.
                  </p>
                  {pendingPermRequest && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{
                        background: "rgba(251,191,36,0.1)",
                        border: "1px solid rgba(251,191,36,0.3)",
                      }}
                    >
                      <Clock
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: "#d97706" }}
                      />
                      <p className="text-xs" style={{ color: "#92400e" }}>
                        A permission change request is currently pending
                        approval. New requests can still be submitted.
                      </p>
                    </div>
                  )}
                  <AddOverrideControls
                    allPermissions={permissionsQuery.data ?? []}
                    onRequestGrant={(code) =>
                      initiatePermChangeMutation.mutate({
                        permissionCode: code,
                        isGranted: true,
                      })
                    }
                    onRequestRevoke={(code) =>
                      initiatePermChangeMutation.mutate({
                        permissionCode: code,
                        isGranted: false,
                      })
                    }
                    disabled={anyMutating}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: member,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => {
      try {
        const res = await adminApiFetch<unknown>(
          `/api/User/GetById?userId=${encodeURIComponent(id)}`,
        );
        console.info("[AdminUsers] GET /api/User/GetById raw response:", res);
        return pluckMember(res);
      } catch (primaryErr) {
        try {
          const res = await adminApiFetch<unknown>(
            `/api/User/GetStaffById?userId=${encodeURIComponent(id)}`,
          );
          console.info(
            "[AdminUsers] GET /api/User/GetStaffById raw response:",
            res,
          );
          return pluckMember(res);
        } catch {
          throw primaryErr;
        }
      }
    },
    enabled: Boolean(id),
  });

  // ── Lifecycle: pending state (cleared on data refresh) ──
  const [pendingActivation, setPendingActivation] = useState(false);
  const [pendingDeactivation, setPendingDeactivation] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [showDeactivateForm, setShowDeactivateForm] = useState(false);
  const [lifecycleDialog, setLifecycleDialog] =
    useState<LifecycleDialogState>(null);
  const [section, setSection] = useState<"overview" | "profile" | "access">("overview");

  const verify = useMutation({
    mutationFn: () =>
      adminApiFetch<unknown>(`/api/User/${id}/Verify`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Member verified.");
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  // ── Maker: Initiate activation ──
  const initiateActivate = useMutation({
    mutationFn: () => initiateUserActivation(id),
    onSuccess: (res) => {
      // Check if the backend auto-approved it (e.g. because we are RootAdmin)
      const msg = res.message?.toLowerCase() || "";
      const isAutoApproved = msg.includes("already") || msg.includes("auto-approved") || msg.includes("activated");

      if (isAutoApproved) {
        toast.success(res.message || "User activated directly.");
        setPendingActivation(false);
      } else {
        toast.success(res.message || "Activation request submitted for approval.");
        setPendingActivation(true);
      }
      
      // Always refetch to get the latest `isActive` status
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  // ── Checker: Approve activation ──
  const approveActivate = useMutation({
    mutationFn: (note: string) => approveUserActivation(id, note),
    onSuccess: () => {
      toast.success("Activation approved. Member is now active.");
      setLifecycleDialog(null);
      setPendingActivation(false);
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  // ── Checker: Reject activation ──
  const rejectActivate = useMutation({
    mutationFn: (note: string) => rejectUserActivation(id, note),
    onSuccess: () => {
      toast.success("Activation rejected.");
      setLifecycleDialog(null);
      setPendingActivation(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  // ── Maker: Initiate deactivation ──
  const initiateDeactivate = useMutation({
    mutationFn: () =>
      initiateUserDeactivation(id, { reason: deactivateReason }),
    onSuccess: (res) => {
      const msg = (res as any)?.message?.toLowerCase() || "";
      const isAutoApproved = msg.includes("already") || msg.includes("auto-approved") || msg.includes("deactivated") || msg.includes("success");

      if (isAutoApproved) {
        toast.success((res as any)?.message || "User deactivated directly.");
        setPendingDeactivation(false);
      } else {
        toast.success((res as any)?.message || "Deactivation request submitted for approval.");
        setPendingDeactivation(true);
      }
      setShowDeactivateForm(false);
      setDeactivateReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  // ── Checker: Approve deactivation ──
  const approveDeactivate = useMutation({
    mutationFn: (note: string) => approveUserDeactivation(id, note),
    onSuccess: () => {
      toast.success("Deactivation approved. Member is now inactive.");
      setLifecycleDialog(null);
      setPendingDeactivation(false);
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  // ── Checker: Reject deactivation ──
  const rejectDeactivate = useMutation({
    mutationFn: (note: string) => rejectUserDeactivation(id, note),
    onSuccess: () => {
      toast.success("Deactivation rejected.");
      setLifecycleDialog(null);
      setPendingDeactivation(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const activateAsStaff = useMutation({
    mutationFn: () => activateStaff(id),
    onSuccess: (res) => {
      const msg = (res as any)?.message?.toLowerCase() || "";
      const isAlreadyStaff = msg.includes("already") || msg.includes("staff");
      toast.success((res as any)?.message || (isAlreadyStaff ? "User is already a staff member." : "Staff activation successful."));
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setLifecycleDialog(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const anyLifecycleMutating =
    initiateActivate.isPending ||
    approveActivate.isPending ||
    rejectActivate.isPending ||
    initiateDeactivate.isPending ||
    approveDeactivate.isPending ||
    rejectDeactivate.isPending ||
    activateAsStaff.isPending;

  const firstName = member?.basicInfo?.firstName ?? null;
  const lastName = member?.basicInfo?.lastName ?? null;
  const middleName = member?.basicInfo?.middleName ?? null;
  const name =
    [firstName, middleName, lastName].filter(Boolean).join(" ") ||
    member?.email ||
    "Unnamed member";

  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "?";

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push("/admin/members")}
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: "var(--admin-muted)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to members
      </button>

      {/* Loading / Error */}
      {isLoading && (
        <div role="status" className="card-admin flex items-center justify-center gap-3 rounded-3xl p-12 text-sm admin-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading member…
        </div>
      )}
      {isError && (
        <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
          <p>{getApiErrorMessage(error)}</p>
          <button type="button" onClick={() => refetch()} className="mt-3 font-semibold underline">Try again</button>
        </div>
      )}
      {!isLoading && !isError && !member && <div className="card-admin rounded-3xl p-10 text-center"><h1 className="text-lg font-semibold">Member not found</h1><p className="mt-2 text-sm admin-text-muted">This account may be unavailable or the backend returned an empty record.</p></div>}

      {member && (
        <>
          {/* ── Hero card ── */}
          <div
            className="rounded-3xl border p-6 sm:p-8"
            style={{
              background: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
            }}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                style={{ background: "var(--admin-primary)", color: "#000" }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                {member.title && (
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-0.5"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    {member.title}
                  </p>
                )}
                <h1
                  className="text-2xl font-bold truncate"
                  style={{ color: "var(--admin-text)" }}
                >
                  {name}
                </h1>
                <p
                  className="text-sm mt-0.5 truncate"
                  style={{ color: "var(--admin-muted)" }}
                >
                  {member.email ?? "—"}
                </p>
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                    style={
                      member.isActive
                        ? { background: "#dcfce7", color: "#166534" }
                        : {
                            background: "var(--admin-border)",
                            color: "var(--admin-muted)",
                          }
                    }
                  >
                    {member.isActive ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      <ShieldAlert className="w-3 h-3" />
                    )}
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                  {member.status && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                      style={{
                        background: "var(--admin-border)",
                        color: "var(--admin-muted)",
                      }}
                    >
                      {member.status}
                    </span>
                  )}
                  {member.isVerified && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                      style={{ background: "#dbeafe", color: "#1d4ed8" }}
                    >
                      Verified
                    </span>
                  )}
                  {member.isStaff && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                      style={{ background: "#fef9c3", color: "#854d0e" }}
                    >
                      Staff
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick meta row */}
            <div
              className="mt-6 pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-4"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <div>
                <p
                  className="text-[10px] uppercase tracking-widest font-bold mb-1"
                  style={{ color: "var(--admin-muted)" }}
                >
                  Joined
                </p>
                <p className="text-sm" style={{ color: "var(--admin-text)" }}>
                  {formatDate(member.createdAt)}
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] uppercase tracking-widest font-bold mb-1"
                  style={{ color: "var(--admin-muted)" }}
                >
                  Last login
                </p>
                <p className="text-sm" style={{ color: "var(--admin-text)" }}>
                  {formatDateTime(member.lastLogin)}
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] uppercase tracking-widest font-bold mb-1"
                  style={{ color: "var(--admin-muted)" }}
                >
                  Terms accepted
                </p>
                <p className="text-sm" style={{ color: "var(--admin-text)" }}>
                  {member.termsAccepted ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>

          <nav aria-label="Member sections" className="card-admin flex flex-wrap gap-2 rounded-2xl p-2">
            {([
              { id: "overview", label: "Overview & actions", icon: ShieldCheck },
              { id: "profile", label: "Profile & records", icon: User },
              { id: "access", label: "Access & permissions", icon: UserRoundCog },
            ] as const).map(({ id: tab, label, icon: Icon }) => (
              <button
                key={tab}
                type="button"
                aria-pressed={section === tab}
                onClick={() => setSection(tab)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${section === tab ? "bg-[#171717] text-white" : "admin-text-muted hover:bg-black/5"}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>

          {/* ── Lifecycle dialogs (activation / deactivation checker actions) ── */}
          {lifecycleDialog?.kind === "approve-activate" && (
            <DialogBackdrop>
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "#dcfce7" }}
                >
                  <CheckCircle2
                    className="w-5 h-5"
                    style={{ color: "#16a34a" }}
                  />
                </div>
                <div>
                  <h2
                    className="text-base font-bold"
                    style={{ color: "var(--admin-text)" }}
                  >
                    Approve Activation
                  </h2>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    Approve this member&apos;s activation request?
                  </p>
                </div>
              </div>
              <NoteDialogBody
                label="Approval note (optional)"
                placeholder="Add a note for the audit trail…"
                inputId="approve-activate-note"
                isPending={approveActivate.isPending}
                confirmLabel="Approve Activation"
                confirmStyle={{ background: "#16a34a", color: "#fff" }}
                onConfirm={(note) => approveActivate.mutate(note)}
                onCancel={() => setLifecycleDialog(null)}
              />
            </DialogBackdrop>
          )}
          {lifecycleDialog?.kind === "reject-activate" && (
            <DialogBackdrop>
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(239,68,68,0.1)" }}
                >
                  <XCircle className="w-5 h-5" style={{ color: "#ef4444" }} />
                </div>
                <div>
                  <h2
                    className="text-base font-bold"
                    style={{ color: "var(--admin-text)" }}
                  >
                    Reject Activation
                  </h2>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    Reject this member&apos;s activation request?
                  </p>
                </div>
              </div>
              <NoteDialogBody
                label="Rejection note"
                placeholder="Reason for rejection…"
                inputId="reject-activate-note"
                isPending={rejectActivate.isPending}
                confirmLabel="Reject Activation"
                confirmStyle={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                }}
                onConfirm={(note) => rejectActivate.mutate(note)}
                onCancel={() => setLifecycleDialog(null)}
              />
            </DialogBackdrop>
          )}
          {lifecycleDialog?.kind === "approve-deactivate" && (
            <DialogBackdrop>
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "#dcfce7" }}
                >
                  <CheckCircle2
                    className="w-5 h-5"
                    style={{ color: "#16a34a" }}
                  />
                </div>
                <div>
                  <h2
                    className="text-base font-bold"
                    style={{ color: "var(--admin-text)" }}
                  >
                    Approve Deactivation
                  </h2>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    Approve deactivation for <strong>{name}</strong>?
                  </p>
                </div>
              </div>
              <NoteDialogBody
                label="Approval note (optional)"
                placeholder="Add a note for the audit trail…"
                inputId="approve-deactivate-note"
                isPending={approveDeactivate.isPending}
                confirmLabel="Approve Deactivation"
                confirmStyle={{ background: "#16a34a", color: "#fff" }}
                onConfirm={(note) => approveDeactivate.mutate(note)}
                onCancel={() => setLifecycleDialog(null)}
              />
            </DialogBackdrop>
          )}
          {lifecycleDialog?.kind === "reject-deactivate" && (
            <DialogBackdrop>
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(239,68,68,0.1)" }}
                >
                  <XCircle className="w-5 h-5" style={{ color: "#ef4444" }} />
                </div>
                <div>
                  <h2
                    className="text-base font-bold"
                    style={{ color: "var(--admin-text)" }}
                  >
                    Reject Deactivation
                  </h2>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    Reject the deactivation request for <strong>{name}</strong>?
                  </p>
                </div>
              </div>
              <NoteDialogBody
                label="Rejection note"
                placeholder="Reason for rejection…"
                inputId="reject-deactivate-note"
                isPending={rejectDeactivate.isPending}
                confirmLabel="Reject Deactivation"
                confirmStyle={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                }}
                onConfirm={(note) => rejectDeactivate.mutate(note)}
                onCancel={() => setLifecycleDialog(null)}
              />
            </DialogBackdrop>
          )}
          {lifecycleDialog?.kind === "confirm-activate-staff" && (
            <DialogBackdrop>
              <div className="flex items-start gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "#fef9c3" }}
                >
                  <KeyRound className="w-5 h-5" style={{ color: "#854d0e" }} />
                </div>
                <div>
                  <h2
                    className="text-base font-bold"
                    style={{ color: "var(--admin-text)" }}
                  >
                    Activate as Staff
                  </h2>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    Are you sure you want to activate <strong>{name}</strong> as staff? 
                    This will allow them to be assigned administrative roles.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLifecycleDialog(null)}
                  disabled={activateAsStaff.isPending}
                  className="px-4 py-2 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                  style={{ color: "var(--admin-text)" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => activateAsStaff.mutate()}
                  disabled={activateAsStaff.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "#854d0e", color: "#fff" }}
                >
                  {activateAsStaff.isPending ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Activating…</>
                  ) : (
                    "Confirm Activation"
                  )}
                </button>
              </div>
            </DialogBackdrop>
          )}

          {/* ── Actions ── */}
          {section === "overview" && <div
            className="max-w-3xl rounded-2xl border p-5 space-y-3"
            style={{
              background: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
            }}
          >
            <div className="mb-2">
              <h2 className="text-lg font-semibold">Account lifecycle</h2>
              <p className="mt-1 text-xs admin-text-muted">Verify identity, activate the account, or manage staff access. Each step shows its current state.</p>
            </div>

            {/* Step 1 — Verify */}
            <div
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
              style={
                member.isVerified
                  ? { background: "#f0fdf4", border: "1px solid #bbf7d0" }
                  : {
                      background: "var(--admin-bg)",
                      border: "1px solid var(--admin-border)",
                    }
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={
                    member.isVerified
                      ? { background: "#16a34a", color: "#fff" }
                      : {
                          background: "var(--admin-border)",
                          color: "var(--admin-muted)",
                        }
                  }
                >
                  {member.isVerified ? (
                    <ShieldCheck className="w-3 h-3" />
                  ) : (
                    "1"
                  )}
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: member.isVerified
                        ? "#15803d"
                        : "var(--admin-text)",
                    }}
                  >
                    {member.isVerified
                      ? "Identity verified"
                      : "Step 1 — Verify member"}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: member.isVerified
                        ? "#16a34a"
                        : "var(--admin-muted)",
                    }}
                  >
                    {member.isVerified
                      ? "KYC and identity checks passed."
                      : "Confirm the member's identity before activation."}
                  </p>
                </div>
              </div>
              {!member.isVerified && (
                <button
                  type="button"
                  onClick={() => verify.mutate()}
                  disabled={verify.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0 hover:opacity-90 active:scale-95"
                  style={{
                    background: "var(--admin-text)",
                    color: "var(--admin-bg)",
                  }}
                >
                  {verify.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Verify member
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Step 2 — Activate (maker-checker) */}
            <div
              className="space-y-2 px-4 py-3 rounded-xl"
              style={
                member.isActive
                  ? { background: "#f0fdf4", border: "1px solid #bbf7d0" }
                  : member.isVerified
                    ? {
                        background: "var(--admin-bg)",
                        border: "1px solid var(--admin-border)",
                      }
                    : {
                        background: "var(--admin-bg)",
                        border: "1px solid var(--admin-border)",
                        opacity: 0.45,
                      }
              }
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={
                      member.isActive
                        ? { background: "#16a34a", color: "#fff" }
                        : {
                            background: "var(--admin-border)",
                            color: "var(--admin-muted)",
                          }
                    }
                  >
                    {member.isActive ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      "2"
                    )}
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: member.isActive
                          ? "#15803d"
                          : "var(--admin-text)",
                      }}
                    >
                      {member.isActive
                        ? "Account activated"
                        : "Step 2 — Activate member"}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: member.isActive
                          ? "#16a34a"
                          : "var(--admin-muted)",
                      }}
                    >
                      {member.isActive
                        ? "Member can log in and use the platform."
                        : member.isVerified
                          ? pendingActivation
                            ? "Activation pending checker approval."
                            : "Verified — ready to request activation."
                          : "Complete Step 1 first."}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {pendingActivation && <PendingBadge />}
                  {!member.isActive &&
                    member.isVerified &&
                    !pendingActivation && (
                      <button
                        id="member-initiate-activate-btn"
                        type="button"
                        onClick={() => initiateActivate.mutate()}
                        disabled={anyLifecycleMutating}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                        style={{
                          background: "var(--admin-text)",
                          color: "var(--admin-bg)",
                        }}
                      >
                        {initiateActivate.isPending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                            Submitting…
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" /> Request
                            Activation
                          </>
                        )}
                      </button>
                    )}
                  {/* Checker actions */}
                  {pendingActivation && (
                    <>
                      <button
                        id="member-approve-activation-btn"
                        type="button"
                        disabled={anyLifecycleMutating}
                        onClick={() =>
                          setLifecycleDialog({ kind: "approve-activate" })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: "#dcfce7", color: "#166534" }}
                      >
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </button>
                      <button
                        id="member-reject-activation-btn"
                        type="button"
                        disabled={anyLifecycleMutating}
                        onClick={() =>
                          setLifecycleDialog({ kind: "reject-activate" })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          color: "#ef4444",
                        }}
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3 — Activate as Staff (gated on isActive) */}
            {member.isActive && (
              <div
                className="space-y-2 px-4 py-3 rounded-xl"
                style={
                  member.isStaff
                    ? { background: "#f0fdf4", border: "1px solid #bbf7d0" }
                    : {
                        background: "var(--admin-bg)",
                        border: "1px solid var(--admin-border)",
                      }
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style=
                        {member.isStaff
                          ? { background: "#16a34a", color: "#fff" }
                          : { background: "var(--admin-border)", color: "var(--admin-muted)" }
                        }
                    >
                      {member.isStaff ? <ShieldCheck className="w-3 h-3" /> : "3"}
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: member.isStaff ? "#15803d" : "var(--admin-text)" }}
                      >
                        {member.isStaff ? "Staff privileges granted" : "Step 3 — Activate as Staff"}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: member.isStaff ? "#16a34a" : "var(--admin-muted)" }}
                      >
                        {member.isStaff
                          ? "This member has staff access and can be assigned a role."
                          : "Required before a role can be assigned to this member."}
                      </p>
                    </div>
                  </div>
                  {!member.isStaff && (
                    <button
                      id="member-activate-staff-btn"
                      type="button"
                      disabled={anyLifecycleMutating}
                      onClick={() => setLifecycleDialog({ kind: "confirm-activate-staff" })}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 shrink-0"
                      style={{ background: "#fef9c3", color: "#854d0e", border: "1px solid #fde68a" }}
                    >
                      {activateAsStaff.isPending ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Activating…</>
                      ) : (
                        <><KeyRound className="w-3.5 h-3.5" /> Activate as Staff</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 4 — Deactivate (maker-checker) — only shown for active members */}
            {member.isActive && (
              <div
                className="space-y-2 px-4 py-3 rounded-xl"
                style={{
                  background: "var(--admin-bg)",
                  border: "1px solid var(--admin-border)",
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{
                        background: "var(--admin-border)",
                        color: "var(--admin-muted)",
                      }}
                    >
                      <ShieldAlert className="w-3 h-3" />
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--admin-text)" }}
                      >
                        Deactivate member
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--admin-muted)" }}
                      >
                        {pendingDeactivation
                          ? "Deactivation pending checker approval."
                          : "Submit a deactivation request for checker review."}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {pendingDeactivation && <PendingBadge />}
                    {!pendingDeactivation && (
                      <button
                        id="member-show-deactivate-form-btn"
                        type="button"
                        onClick={() => setShowDeactivateForm((v) => !v)}
                        disabled={anyLifecycleMutating}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          color: "#ef4444",
                        }}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        {showDeactivateForm ? "Cancel" : "Deactivate"}
                      </button>
                    )}
                    {/* Checker actions */}
                    {pendingDeactivation && (
                      <>
                        <button
                          id="member-approve-deactivation-btn"
                          type="button"
                          disabled={anyLifecycleMutating}
                          onClick={() =>
                            setLifecycleDialog({ kind: "approve-deactivate" })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                          style={{ background: "#dcfce7", color: "#166534" }}
                        >
                          <CheckCircle2 className="w-3 h-3" /> Approve
                        </button>
                        <button
                          id="member-reject-deactivation-btn"
                          type="button"
                          disabled={anyLifecycleMutating}
                          onClick={() =>
                            setLifecycleDialog({ kind: "reject-deactivate" })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#ef4444",
                          }}
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Deactivation reason input */}
                {showDeactivateForm && !pendingDeactivation && (
                  <div
                    className="mt-2 space-y-2 pt-2"
                    style={{ borderTop: "1px solid var(--admin-border)" }}
                  >
                    <label
                      className="text-[10px] font-bold tracking-widest uppercase"
                      style={{ color: "var(--admin-muted)" }}
                    >
                      Reason for deactivation
                    </label>
                    <textarea
                      id="member-deactivate-reason"
                      value={deactivateReason}
                      onChange={(e) => setDeactivateReason(e.target.value)}
                      rows={2}
                      placeholder="Enter the reason for deactivation…"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none border resize-none"
                      style={{
                        background: "var(--admin-surface)",
                        color: "var(--admin-text)",
                        borderColor: "var(--admin-border)",
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeactivateForm(false);
                          setDeactivateReason("");
                        }}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-70 transition-opacity"
                        style={{ color: "var(--admin-muted)" }}
                      >
                        Cancel
                      </button>
                      <button
                        id="member-submit-deactivate-btn"
                        type="button"
                        disabled={
                          !deactivateReason.trim() ||
                          initiateDeactivate.isPending
                        }
                        onClick={() => initiateDeactivate.mutate()}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          color: "#ef4444",
                        }}
                      >
                        {initiateDeactivate.isPending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                            Submitting…
                          </>
                        ) : (
                          "Submit for Approval"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>}

          {/* ── Detail sections ── */}
          {section === "profile" && <div><h2 className="text-lg font-semibold">Member record</h2><p className="mt-1 text-xs admin-text-muted">Personal, contact, employment, and KYC information returned by the backend.</p></div>}
          {section === "profile" && <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Basic Info */}
            {member.basicInfo && (
              <Card>
                <SectionHeading icon={User} label="Basic Information" />
                <InfoRow
                  label="First name"
                  value={member.basicInfo.firstName}
                />
                <InfoRow
                  label="Middle name"
                  value={member.basicInfo.middleName}
                />
                <InfoRow label="Last name" value={member.basicInfo.lastName} />
                <InfoRow label="Gender" value={member.basicInfo.gender} />
                <InfoRow
                  label="Date of birth"
                  value={formatDate(member.basicInfo.dateOfBirth)}
                />
                <InfoRow
                  label="Residency status"
                  value={member.basicInfo.residencyStatus}
                />
                <InfoRow
                  label="Province of residence"
                  value={member.basicInfo.provinceOfResidence}
                />
              </Card>
            )}

            {/* Contact */}
            {member.contact && (
              <Card>
                <SectionHeading icon={Phone} label="Contact" />
                <InfoRow label="Phone" value={member.contact.phoneNumber} />
                <InfoRow
                  label="Personal email"
                  value={member.contact.personalEmail}
                />
                <InfoRow label="Address" value={member.contact.homeAddress} />
                <InfoRow label="City" value={member.contact.city} />
                <InfoRow label="Province" value={member.contact.province} />
                <InfoRow
                  label="Postal code"
                  value={member.contact.postalCode}
                />
                <InfoRow label="Country" value={member.contact.country} />
              </Card>
            )}

            {/* Employment */}
            {member.employment && (
              <Card>
                <SectionHeading icon={Briefcase} label="Employment" />
                <InfoRow label="Status" value={member.employment.status} />
                <InfoRow
                  label="Employer"
                  value={member.employment.employerName}
                />
                <InfoRow label="Industry" value={member.employment.industry} />
                <InfoRow label="Job title" value={member.employment.jobTitle} />
                <InfoRow
                  label="Work location"
                  value={member.employment.workLocation}
                />
                <InfoRow
                  label="Years in role"
                  value={
                    member.employment.yearsInRole !== null
                      ? `${member.employment.yearsInRole} yr${member.employment.yearsInRole === 1 ? "" : "s"}`
                      : null
                  }
                />
              </Card>
            )}

            {/* Next of Kin */}
            {member.nextOfKin && (
              <Card>
                <SectionHeading icon={Users} label="Next of Kin" />
                <InfoRow label="Full name" value={member.nextOfKin.fullName} />
                <InfoRow
                  label="Relationship"
                  value={member.nextOfKin.relationship}
                />
                <InfoRow label="Email" value={member.nextOfKin.email} />
                <InfoRow label="Phone" value={member.nextOfKin.phoneNumber} />
                <InfoRow
                  label="Share"
                  value={
                    member.nextOfKin.sharePercentage !== null
                      ? `${member.nextOfKin.sharePercentage}%`
                      : null
                  }
                />
                <InfoRow
                  label="Primary beneficiary"
                  value={
                    <BoolBadge value={member.nextOfKin.isPrimaryBeneficiary} />
                  }
                />
              </Card>
            )}

            {/* Referee */}
            {member.referee && (
              <Card>
                <SectionHeading icon={MapPin} label="Referee" />
                {member.referee.skipReferee ? (
                  <p
                    className="text-xs"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    Referee was skipped.
                  </p>
                ) : (
                  <>
                    <InfoRow
                      label="Full name"
                      value={member.referee.refereeFullName}
                    />
                    <InfoRow
                      label="Member ID"
                      value={member.referee.memberId}
                    />
                    <InfoRow
                      label="Email"
                      value={member.referee.refereeEmail}
                    />
                    <InfoRow
                      label="Relationship"
                      value={member.referee.relationship}
                    />
                    <InfoRow
                      label="How long known"
                      value={
                        member.referee.howLongKnown !== null
                          ? `${member.referee.howLongKnown} yr${member.referee.howLongKnown === 1 ? "" : "s"}`
                          : null
                      }
                    />
                  </>
                )}
              </Card>
            )}

            {/* KYC Attestation */}
            {member.kycAttestation && (
              <Card>
                <SectionHeading icon={FileCheck} label="KYC Attestation" />
                <InfoRow
                  label="Signature kind"
                  value={member.kycAttestation.signatureKind}
                />
                <InfoRow
                  label="Signature name"
                  value={member.kycAttestation.signatureName}
                />
                <InfoRow
                  label="Bylaws version"
                  value={member.kycAttestation.bylawsVersion}
                />
                <InfoRow
                  label="Signed at"
                  value={formatDateTime(member.kycAttestation.signedAtUtc)}
                />
                <InfoRow
                  label="Signed from IP"
                  value={member.kycAttestation.signedFromIp}
                />
                <InfoRow
                  label="Info accurate"
                  value={
                    <BoolBadge
                      value={member.kycAttestation.informationAccurate}
                    />
                  }
                />
                <InfoRow
                  label="Agreed to bylaws"
                  value={
                    <BoolBadge value={member.kycAttestation.agreedToBylaws} />
                  }
                />
                <InfoRow
                  label="Data consent"
                  value={
                    <BoolBadge
                      value={member.kycAttestation.consentToDataProcessing}
                    />
                  }
                />
              </Card>
            )}
          </div>}

          {/* ── Devices ── */}
          {section === "profile" && member.deviceInfos.length > 0 && (
            <Card>
              <SectionHeading
                icon={Monitor}
                label={`Devices (${member.deviceInfos.length})`}
              />
              <div className="space-y-3">
                {member.deviceInfos.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-xl border p-3 text-xs space-y-1"
                    style={{ borderColor: "var(--admin-border)" }}
                  >
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--admin-muted)" }}>
                        Device OS
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: "var(--admin-text)" }}
                      >
                        {d.deviceOS ?? "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--admin-muted)" }}>
                        Device ID
                      </span>
                      <span
                        className="font-mono truncate max-w-[180px]"
                        style={{ color: "var(--admin-text)" }}
                      >
                        {d.deviceID ?? "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--admin-muted)" }}>
                        Last IP
                      </span>
                      <span style={{ color: "var(--admin-text)" }}>
                        {d.lastIp ?? "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--admin-muted)" }}>
                        Trusted until
                      </span>
                      <span style={{ color: "var(--admin-text)" }}>
                        {formatDateTime(d.trustedUntil)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Access & Permissions ── */}
          {section === "access" && <AccessAndPermissionsSection
            userId={member.id ?? id}
            userName={name}
          />}

          {/* Member ID footer */}
          {member.id && (
            <p
              className="pt-4 text-[10px] font-mono truncate"
              style={{ color: "var(--admin-muted)" }}
            >
              ID: {member.id}
            </p>
          )}
        </>
      )}
    </div>
  );
}
