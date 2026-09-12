"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Loader2,
  Info,
} from "lucide-react";
import { adminApiFetch, getApiErrorMessage } from "@/app/lib/api-client";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";
import { pluckMember, formatDate } from "@/app/lib/member-profile";
import {
  getWithdrawalApprovalTiers,
  updateWithdrawalApprovalTiers,
  type ApprovalTier,
} from "@/app/lib/withdrawal-tiers-api";
import toast from "react-hot-toast";

const toggleSettings = [
  {
    id: "admin-setting-maintenance",
    label: "Maintenance Mode",
    description:
      "Temporarily take the platform offline for maintenance. Users will see a maintenance page.",
    defaultChecked: false,
    danger: true,
  },
  {
    id: "admin-setting-registrations",
    label: "Open Registrations",
    description:
      "Allow new users to sign up. Disable to make the platform invite-only.",
    defaultChecked: true,
    danger: false,
  },
  {
    id: "admin-setting-email-verification",
    label: "Email Verification Required",
    description:
      "New users must verify their email before accessing the platform.",
    defaultChecked: true,
    danger: false,
  },
  {
    id: "admin-setting-audit-log",
    label: "Audit Logging",
    description:
      "Record all admin actions to the audit log for compliance purposes.",
    defaultChecked: true,
    danger: false,
  },
];

/** "RootAdmin" -> "Root Admin" */
function humanizeRole(role: string): string {
  return role.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

// ─── Withdrawal Approval Tiers Card ──────────────────────────────────────────

function WithdrawalApprovalTiersCard() {
  const queryClient = useQueryClient();

  const { data: tiers = [], isLoading, isError, error } = useQuery({
    queryKey: ["withdrawal-approval-tiers"],
    queryFn: getWithdrawalApprovalTiers,
  });

  // Local editable copy
  const [localTiers, setLocalTiers] = useState<ApprovalTier[] | null>(null);
  const workingTiers: ApprovalTier[] = localTiers ?? tiers;

  const { mutate: save, isPending } = useMutation({
    mutationFn: (t: ApprovalTier[]) => updateWithdrawalApprovalTiers(t),
    onSuccess: () => {
      toast.success("Approval tiers saved.");
      setLocalTiers(null);
      queryClient.invalidateQueries({ queryKey: ["withdrawal-approval-tiers"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  function addTier() {
    const base: ApprovalTier[] = localTiers ?? tiers;
    setLocalTiers([...base, { minAmount: 0, maxAmount: null, requiredApprovals: 1 }]);
  }

  function removeTier(idx: number) {
    setLocalTiers(workingTiers.filter((_, i) => i !== idx));
  }

  function updateTier(idx: number, patch: Partial<ApprovalTier>) {
    setLocalTiers(workingTiers.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }

  function handleSave() {
    // Basic validation
    for (const t of workingTiers) {
      if (t.minAmount < 0) { toast.error("Min amount cannot be negative."); return; }
      if (t.maxAmount != null && t.maxAmount < t.minAmount) { toast.error("Max amount must be ≥ min amount."); return; }
      if (t.requiredApprovals < 1) { toast.error("Required approvals must be at least 1."); return; }
    }
    save(workingTiers);
  }

  const isDirty = localTiers !== null;

  return (
    <div
      className="p-6 rounded-2xl border"
      style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
    >
      <div className="flex items-start justify-between gap-4 mb-1">
        <h2 className="font-semibold" style={{ color: "var(--admin-text)" }}>
          Withdrawal Approval Tiers
        </h2>
        <button
          id="admin-add-tier-btn"
          type="button"
          onClick={addTier}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
          style={{ background: "var(--admin-primary)", color: "#000" }}
        >
          <Plus className="w-3.5 h-3.5" /> Add tier
        </button>
      </div>
      <p className="text-sm mb-2" style={{ color: "var(--admin-muted)" }}>
        Define how many approvals are required based on withdrawal or deduction amount.
      </p>

      {/* Snapshot notice */}
      <div
        className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-6 text-xs leading-relaxed"
        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "var(--admin-text)" }}
      >
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
        <span>
          Changing these rules <strong>only affects new requests</strong>. Existing pending or approving
          requests retain the approval count that was set when they were created.
        </span>
      </div>

      {isLoading && (
        <p className="text-sm py-4 text-center" style={{ color: "var(--admin-muted)" }}>
          Loading tiers…
        </p>
      )}
      {isError && (
        <p className="text-sm py-4 text-center" style={{ color: "var(--admin-accent)" }}>
          {getApiErrorMessage(error)}
        </p>
      )}

      {!isLoading && !isError && workingTiers.length === 0 && (
        <p className="text-sm py-6 text-center" style={{ color: "var(--admin-muted)" }}>
          No tiers configured. Click <strong>Add tier</strong> to create one.
        </p>
      )}

      {workingTiers.length > 0 && (
        <div className="space-y-3 mb-5">
          {/* Column headers */}
          <div
            className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto] gap-3 text-[10px] font-bold tracking-widest uppercase px-1"
            style={{ color: "var(--admin-muted)" }}
          >
            <span>Min Amount (₦)</span>
            <span>Max Amount (₦, blank = unlimited)</span>
            <span>Approvals</span>
            <span />
          </div>

          {workingTiers.map((tier, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-3 items-center p-3 rounded-xl"
              style={{ background: "var(--admin-bg)", border: "1px solid var(--admin-border)" }}
            >
              <div className="flex flex-col gap-1">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--admin-muted)" }}>Min Amount (₦)</span>
                <input
                  id={`tier-min-${idx}`}
                  type="number"
                  min={0}
                  value={tier.minAmount}
                  onChange={(e) => updateTier(idx, { minAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "var(--admin-surface)",
                    border: "1px solid var(--admin-border)",
                    color: "var(--admin-text)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--admin-muted)" }}>Max Amount (₦)</span>
                <input
                  id={`tier-max-${idx}`}
                  type="number"
                  min={0}
                  placeholder="Unlimited"
                  value={tier.maxAmount ?? ""}
                  onChange={(e) =>
                    updateTier(idx, { maxAmount: e.target.value === "" ? null : Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "var(--admin-surface)",
                    border: "1px solid var(--admin-border)",
                    color: "var(--admin-text)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--admin-muted)" }}>Approvals</span>
                <input
                  id={`tier-approvals-${idx}`}
                  type="number"
                  min={1}
                  value={tier.requiredApprovals}
                  onChange={(e) => updateTier(idx, { requiredApprovals: Number(e.target.value) })}
                  className="w-20 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "var(--admin-surface)",
                    border: "1px solid var(--admin-border)",
                    color: "var(--admin-text)",
                  }}
                />
              </div>
              <button
                id={`tier-remove-${idx}`}
                type="button"
                onClick={() => removeTier(idx)}
                className="p-2 rounded-lg transition-colors hover:opacity-80"
                style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}
                aria-label="Remove tier"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(isDirty || workingTiers.length > 0) && (
        <div className="flex justify-end gap-3">
          {isDirty && (
            <button
              type="button"
              onClick={() => setLocalTiers(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-70"
              style={{ color: "var(--admin-muted)" }}
            >
              Discard
            </button>
          )}
          <button
            id="admin-save-tiers-btn"
            type="button"
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff" }}
          >
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save tiers"}
          </button>
        </div>
      )}
    </div>
  );
}

function MyAccountCard() {
  const { user: authUser } = useAdminAuth();

  const { data: staff, isLoading, isError, error } = useQuery({
    queryKey: ["admin-my-staff-profile", authUser?.id],
    queryFn: async () => {
      const res = await adminApiFetch<unknown>(`/api/User/GetStaffById?userId=${encodeURIComponent(authUser!.id!)}`);
      return pluckMember(res);
    },
    enabled: Boolean(authUser?.id),
  });

  const name = staff
    ? [staff.basicInfo?.firstName, staff.basicInfo?.lastName].filter(Boolean).join(" ") || staff.email
    : authUser?.name || authUser?.email;

  const initials =
    (name ?? "?").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "?";

  return (
    <div
      className="p-6 rounded-2xl border"
      style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
    >
      <h2 className="font-semibold mb-1" style={{ color: "var(--admin-text)" }}>
        My account
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--admin-muted)" }}>
        Your own staff profile, from /api/User/GetStaffById.
      </p>

      {isLoading && (
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Loading…
        </p>
      )}
      {isError && (
        <p className="text-sm" style={{ color: "var(--admin-accent)" }}>
          {getApiErrorMessage(error)}
        </p>
      )}

      {staff && (
        <div className="flex items-start gap-4 flex-wrap">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
            style={{ background: "var(--admin-primary)", color: "#000" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-bold truncate" style={{ color: "var(--admin-text)" }}>
                {name ?? "Unnamed"}
              </p>
              {authUser?.role && (
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                  style={{ background: "var(--admin-primary)", color: "#000" }}
                >
                  {humanizeRole(authUser.role)}
                </span>
              )}
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--admin-muted)" }} />
                <span style={{ color: "var(--admin-text)" }}>{staff.email ?? "—"}</span>
              </div>
              {staff.contact?.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--admin-muted)" }} />
                  <span style={{ color: "var(--admin-text)" }}>{staff.contact.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                {staff.isVerified ? (
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "#16a34a" }} />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--admin-muted)" }} />
                )}
                <span style={{ color: "var(--admin-muted)" }}>
                  {staff.isVerified ? "Verified" : "Not verified"} · Joined {formatDate(staff.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SettingsClient() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--admin-text)" }}
        >
          System Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--admin-muted)" }}>
          Configure global platform behaviour, security, and integrations.
        </p>
      </div>

      {/* My account */}
      <MyAccountCard />

      {/* General settings */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          background: "var(--admin-surface)",
          borderColor: "var(--admin-border)",
        }}
      >
        <h2
          className="font-semibold mb-1"
          style={{ color: "var(--admin-text)" }}
        >
          General
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--admin-muted)" }}>
          Basic platform configuration.
        </p>
        <form id="admin-general-form" className="space-y-5">
          {[
            {
              id: "admin-platform-name",
              label: "Platform Name",
              value: "Kajola",
              type: "text",
            },
            {
              id: "admin-support-email",
              label: "Support Email",
              value: "support@kajola.io",
              type: "email",
            },
            {
              id: "admin-max-users",
              label: "Max Users per Workspace",
              value: "100",
              type: "number",
            },
          ].map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label
                htmlFor={field.id}
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--admin-muted)" }}
              >
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                defaultValue={field.value}
                className="px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--admin-border)",
                  color: "var(--admin-text)",
                }}
              />
            </div>
          ))}
          <div className="flex justify-end">
            <button
              id="admin-save-general"
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              }}
            >
              Save changes
            </button>
          </div>
        </form>
      </div>

      {/* Toggle settings */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          background: "var(--admin-surface)",
          borderColor: "var(--admin-border)",
        }}
      >
        <h2
          className="font-semibold mb-1"
          style={{ color: "var(--admin-text)" }}
        >
          Feature Flags
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--admin-muted)" }}>
          Toggle platform features on or off globally.
        </p>
        <ul
          className="space-y-1 divide-y"
          style={{ borderColor: "var(--admin-border)" }}
        >
          {toggleSettings.map((s) => (
            <li
              key={s.id}
              className="flex items-start justify-between gap-4 py-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--admin-text)" }}
                  >
                    {s.label}
                  </p>
                  {s.danger && (
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        background: "rgba(239,68,68,0.15)",
                        color: "#f87171",
                      }}
                    >
                      Caution
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-1 leading-relaxed"
                  style={{ color: "var(--admin-muted)" }}
                >
                  {s.description}
                </p>
              </div>
              <label
                htmlFor={s.id}
                className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1"
              >
                <input
                  id={s.id}
                  type="checkbox"
                  defaultChecked={s.defaultChecked}
                  className="sr-only peer"
                />
                <div
                  className="w-10 h-6 rounded-full peer-checked:opacity-100 transition-all"
                  style={{
                    background: s.danger
                      ? "rgba(239,68,68,0.5)"
                      : "rgba(245,158,11,0.5)",
                  }}
                />
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Withdrawal Approval Tiers */}
      <WithdrawalApprovalTiersCard />

      {/* Danger zone */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          background: "rgba(239,68,68,0.04)",
          borderColor: "rgba(239,68,68,0.2)",
        }}
      >
        <h2 className="font-semibold mb-1" style={{ color: "#f87171" }}>
          Danger Zone
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--admin-muted)" }}>
          Irreversible platform-level actions. Proceed with extreme caution.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="admin-reset-platform"
            type="button"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "rgba(239,68,68,0.6)" }}
          >
            Reset Platform Data
          </button>
          <button
            id="admin-purge-cache"
            type="button"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{
              color: "var(--admin-muted)",
              border: "1px solid var(--admin-border)",
            }}
          >
            Purge Cache
          </button>
        </div>
      </div>
    </div>
  );
}
