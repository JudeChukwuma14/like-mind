"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
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
} from "lucide-react";
import { adminApiFetch, getApiErrorMessage } from "@/app/lib/api-client";
import { pluckMember, formatDate, formatDateTime } from "@/app/lib/member-profile";
import {
  getAllRoles,
  getAllPermissions,
  getUserAccess,
  assignRole,
  setRoleInheritance,
  setUserPermission,
  removeUserOverride,
} from "@/app/lib/authorization-api";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--admin-primary)" }} />
      <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>
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
      <span className="text-xs shrink-0" style={{ color: "var(--admin-muted)" }}>{label}</span>
      <span className="text-xs text-right font-medium" style={{ color: "var(--admin-text)" }}>
        {value || "—"}
      </span>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
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
  if (value === null) return <span style={{ color: "var(--admin-muted)" }}>—</span>;
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
      style={{ background: checked ? "var(--admin-text)" : "var(--admin-border)" }}
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
              ? { background: "rgba(255,255,255,0.2)", color: "var(--admin-bg)" }
              : highlight && count > 0
              ? { background: "rgba(252,211,77,0.2)", color: "var(--admin-primary)" }
              : { background: "var(--admin-border)", color: "var(--admin-muted)" }
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
        <p className="text-xs font-medium truncate" style={{ color: "var(--admin-text)" }}>
          {info?.name ?? code}
        </p>
        <p className="text-[10px] font-mono" style={{ color: "var(--admin-muted)" }}>
          {info?.category ? `${info.category} · ` : ""}{code}
        </p>
      </div>
      {actionSlot}
    </div>
  );
}

function EmptyTabState({ message }: { message: string }) {
  return (
    <p className="py-5 text-center text-xs" style={{ color: "var(--admin-muted)" }}>
      {message}
    </p>
  );
}

/** Stateful permission override picker (select + Grant / Revoke buttons). */
function AddOverrideControls({
  allPermissions,
  onGrant,
  onRevoke,
  disabled,
}: {
  allPermissions: { id: string; code: string; name: string; category: string }[];
  onGrant: (code: string) => void;
  onRevoke: (code: string) => void;
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
          id="member-grant-permission-btn"
          type="button"
          disabled={!selectedCode || disabled}
          onClick={() => {
            onGrant(selectedCode);
            setSelectedCode("");
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#dcfce7", color: "#166534" }}
        >
          <Check className="w-3.5 h-3.5" />
          Grant
        </button>
        <button
          id="member-revoke-permission-btn"
          type="button"
          disabled={!selectedCode || disabled}
          onClick={() => {
            onRevoke(selectedCode);
            setSelectedCode("");
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
        >
          <ShieldOff className="w-3.5 h-3.5" />
          Revoke
        </button>
      </div>
    </div>
  );
}

function AccessAndPermissionsSection({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const ACCESS_KEY = ["admin-user-access", userId] as const;

  // ── Queries ────────────────────────────────────────────────────────────────
  const accessQuery = useQuery({
    queryKey: ACCESS_KEY,
    queryFn: () => getUserAccess(userId),
    enabled: Boolean(userId),
  });
  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: getAllRoles });
  const permissionsQuery = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: getAllPermissions,
  });

  // ── Lookup map: lowercase code -> { name, category } ──────────────────────
  const permissionMap = new Map<string, { name: string; category: string }>();
  for (const p of permissionsQuery.data ?? []) {
    permissionMap.set(p.code.toLowerCase(), { name: p.name, category: p.category });
  }

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AccessTab>("effective");

  // ── Assign role state ──────────────────────────────────────────────────────
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [inheritOnAssign, setInheritOnAssign] = useState(true);
  const [showAssignPanel, setShowAssignPanel] = useState(false);

  // Permission count for the currently-selected role in the assign dropdown
  const selectedRole = (rolesQuery.data ?? []).find((r) => r.id === selectedRoleId);
  const selectedRolePermCount =
    selectedRole?.permissions != null
      ? Array.isArray(selectedRole.permissions)
        ? selectedRole.permissions.length
        : 0
      : 0;

  // ── Mutations ──────────────────────────────────────────────────────────────
  function refresh() {
    queryClient.invalidateQueries({ queryKey: ACCESS_KEY });
  }

  const assignRoleMutation = useMutation({
    mutationFn: () =>
      assignRole({ userId, roleId: selectedRoleId, inheritRolePermissions: inheritOnAssign }),
    onSuccess: () => {
      toast.success("Role assigned.");
      setSelectedRoleId("");
      setShowAssignPanel(false);
      refresh();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const inheritMutation = useMutation({
    mutationFn: (inherit: boolean) =>
      setRoleInheritance({ userId, inheritRolePermissions: inherit }),
    onSuccess: () => { toast.success("Inheritance setting updated."); refresh(); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const grantPermission = useMutation({
    mutationFn: (code: string) =>
      setUserPermission({ userId, permissionCode: code, isGranted: true }),
    onSuccess: () => { toast.success("Permission granted."); refresh(); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const revokePermission = useMutation({
    mutationFn: (code: string) =>
      setUserPermission({ userId, permissionCode: code, isGranted: false }),
    onSuccess: () => { toast.success("Permission revoked."); refresh(); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const removeOverride = useMutation({
    mutationFn: (code: string) => removeUserOverride({ userId, permissionCode: code }),
    onSuccess: () => { toast.success("Override removed."); refresh(); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  // ── Derived ────────────────────────────────────────────────────────────────
  const isLoading = accessQuery.isLoading || rolesQuery.isLoading || permissionsQuery.isLoading;
  const isError = accessQuery.isError;
  const access = accessQuery.data;
  const roles = rolesQuery.data ?? [];
  const anyMutating =
    assignRoleMutation.isPending ||
    inheritMutation.isPending ||
    grantPermission.isPending ||
    revokePermission.isPending ||
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
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
    >
      {/* ── Section header ── */}
      <div
        className="px-5 py-4 border-b flex items-center gap-2"
        style={{ borderColor: "var(--admin-border)" }}
      >
        <Shield className="w-4 h-4 shrink-0" style={{ color: "var(--admin-primary)" }} />
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
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#16a34a" }} />
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
          <p className="text-sm font-medium mb-1" style={{ color: "var(--admin-accent)" }}>
            Unable to load access data
          </p>
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            {getApiErrorMessage(accessQuery.error)}
          </p>
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && !isError && !access && (
        <div className="p-6 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
          No access data available for this user.
        </div>
      )}

      {access && (
        <>
          {/* ── Status bar: role + inheritance toggle ── */}
          <div
            className="px-5 py-4 border-b grid grid-cols-1 sm:grid-cols-2 gap-4"
            style={{ borderColor: "var(--admin-border)", background: "var(--admin-bg)" }}
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
                Change role
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
                <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
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

          {/* ── Assign role panel (collapsible) ── */}
          {showAssignPanel && (
            <div
              className="px-5 py-4 border-b space-y-3"
              style={{
                borderColor: "var(--admin-border)",
                background: "var(--admin-surface)",
              }}
            >
              <p
                className="text-[10px] uppercase tracking-widest font-bold"
                style={{ color: "var(--admin-muted)" }}
              >
                Assign new role
              </p>
              <select
                id="member-role-select"
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                disabled={assignRoleMutation.isPending}
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

              {/* Role permission count preview */}
              {selectedRoleId && (
                <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                  This role has{" "}
                  <span className="font-semibold" style={{ color: "var(--admin-text)" }}>
                    {selectedRolePermCount} permission
                    {selectedRolePermCount !== 1 ? "s" : ""}
                  </span>{" "}
                  configured.
                </p>
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
                  id="member-assign-role-btn"
                  type="button"
                  disabled={!selectedRoleId || assignRoleMutation.isPending}
                  onClick={() => assignRoleMutation.mutate()}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "var(--admin-text)", color: "var(--admin-bg)" }}
                >
                  {assignRoleMutation.isPending ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Assigning…</>
                  ) : (
                    "Assign role"
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
              label="Add override"
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
                        <PermRow key={code} code={code} permissionMap={permissionMap} />
                      ))}
                      <div className="h-px" />{/* Remove bottom border on last item */}
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
                      return (
                        <PermRow
                          key={code}
                          code={code}
                          permissionMap={permissionMap}
                          actionSlot={
                            isRevoked ? (
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
                                onClick={() => revokePermission.mutate(code)}
                                className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-80 disabled:opacity-40 shrink-0"
                                style={{
                                  background: "rgba(239,68,68,0.1)",
                                  color: "#ef4444",
                                }}
                              >
                                {revokePermission.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin inline" />
                                ) : (
                                  "Revoke"
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

            {/* MANAGE — add override */}
            {activeTab === "manage" && (
              <div className="space-y-3 pt-1">
                <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                  Select a permission and grant or revoke it directly for this user,
                  regardless of their role.
                </p>
                <AddOverrideControls
                  allPermissions={permissionsQuery.data ?? []}
                  onGrant={(code) => grantPermission.mutate(code)}
                  onRevoke={(code) => revokePermission.mutate(code)}
                  disabled={anyMutating}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
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
  } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => {
      // The members list (/api/User/Users) mixes regular members and staff
      // together with no isStaff field to tell them apart in advance, so
      // there's no way to know which detail endpoint applies before trying.
      // GetById is the common case; if the target turns out to be staff,
      // fall back to the staff-specific lookup.
      try {
        const res = await adminApiFetch<unknown>(`/api/User/GetById?userId=${encodeURIComponent(id)}`);
        console.info("[AdminUsers] GET /api/User/GetById raw response:", res);
        return pluckMember(res);
      } catch (primaryErr) {
        try {
          const res = await adminApiFetch<unknown>(`/api/User/GetStaffById?userId=${encodeURIComponent(id)}`);
          console.info("[AdminUsers] GET /api/User/GetStaffById raw response:", res);
          return pluckMember(res);
        } catch {
          throw primaryErr;
        }
      }
    },
    enabled: Boolean(id),
  });

  const verify = useMutation({
    mutationFn: () =>
      adminApiFetch<unknown>(`/api/Auth/${id}/VerifyUser`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Member verified.");
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const activate = useMutation({
    mutationFn: () =>
      adminApiFetch<unknown>(`/api/Auth/${id}/activate`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Member activated.");
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
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
        <div className="p-10 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
          Loading member…
        </div>
      )}
      {isError && (
        <div className="p-10 text-center text-sm" style={{ color: "var(--admin-accent)" }}>
          {getApiErrorMessage(error)}
        </div>
      )}

      {member && (
        <>
          {/* ── Hero card ── */}
          <div
            className="rounded-3xl border p-6 sm:p-8"
            style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
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
                  <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--admin-muted)" }}>
                    {member.title}
                  </p>
                )}
                <h1 className="text-2xl font-bold truncate" style={{ color: "var(--admin-text)" }}>
                  {name}
                </h1>
                <p className="text-sm mt-0.5 truncate" style={{ color: "var(--admin-muted)" }}>
                  {member.email ?? "—"}
                </p>
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                    style={
                      member.isActive
                        ? { background: "#dcfce7", color: "#166534" }
                        : { background: "var(--admin-border)", color: "var(--admin-muted)" }
                    }
                  >
                    {member.isActive ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                  {member.status && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                      style={{ background: "var(--admin-border)", color: "var(--admin-muted)" }}
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
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--admin-muted)" }}>Joined</p>
                <p className="text-sm" style={{ color: "var(--admin-text)" }}>{formatDate(member.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--admin-muted)" }}>Last login</p>
                <p className="text-sm" style={{ color: "var(--admin-text)" }}>{formatDateTime(member.lastLogin)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--admin-muted)" }}>Terms accepted</p>
                <p className="text-sm" style={{ color: "var(--admin-text)" }}>{member.termsAccepted ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div
            className="rounded-2xl border p-5 space-y-3"
            style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
          >
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>
              Actions
            </p>

            {/* Step 1 — Verify */}
            <div
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
              style={
                member.isVerified
                  ? { background: "#f0fdf4", border: "1px solid #bbf7d0" }
                  : { background: "var(--admin-bg)", border: "1px solid var(--admin-border)" }
              }
            >
              <div className="flex items-center gap-3">
                {/* Step indicator */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={
                    member.isVerified
                      ? { background: "#16a34a", color: "#fff" }
                      : { background: "var(--admin-border)", color: "var(--admin-muted)" }
                  }
                >
                  {member.isVerified ? <ShieldCheck className="w-3 h-3" /> : "1"}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: member.isVerified ? "#15803d" : "var(--admin-text)" }}>
                    {member.isVerified ? "Identity verified" : "Step 1 — Verify member"}
                  </p>
                  <p className="text-xs" style={{ color: member.isVerified ? "#16a34a" : "var(--admin-muted)" }}>
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
                  style={{ background: "var(--admin-text)", color: "var(--admin-bg)" }}
                >
                  {verify.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Verify member</>
                  )}
                </button>
              )}
            </div>

            {/* Step 2 — Activate */}
            <div
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
              style={
                member.isActive
                  ? { background: "#f0fdf4", border: "1px solid #bbf7d0" }
                  : member.isVerified
                    ? { background: "var(--admin-bg)", border: "1px solid var(--admin-border)" }
                    : { background: "var(--admin-bg)", border: "1px solid var(--admin-border)", opacity: 0.45 }
              }
            >
              <div className="flex items-center gap-3">
                {/* Step indicator */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={
                    member.isActive
                      ? { background: "#16a34a", color: "#fff" }
                      : { background: "var(--admin-border)", color: "var(--admin-muted)" }
                  }
                >
                  {member.isActive ? <ShieldCheck className="w-3 h-3" /> : "2"}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: member.isActive ? "#15803d" : "var(--admin-text)" }}>
                    {member.isActive ? "Account activated" : "Step 2 — Activate member"}
                  </p>
                  <p className="text-xs" style={{ color: member.isActive ? "#16a34a" : "var(--admin-muted)" }}>
                    {member.isActive
                      ? "Member can log in and use the platform."
                      : member.isVerified
                        ? "Verified — ready to activate."
                        : "Complete Step 1 first."}
                  </p>
                </div>
              </div>
              {!member.isActive && member.isVerified && (
                <button
                  type="button"
                  onClick={() => activate.mutate()}
                  disabled={activate.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0 hover:opacity-90 active:scale-95"
                  style={{ background: "var(--admin-text)", color: "var(--admin-bg)" }}
                >
                  {activate.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Activating…</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Activate member</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── Detail sections ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            {member.basicInfo && (
              <Card>
                <SectionHeading icon={User} label="Basic Information" />
                <InfoRow label="First name" value={member.basicInfo.firstName} />
                <InfoRow label="Middle name" value={member.basicInfo.middleName} />
                <InfoRow label="Last name" value={member.basicInfo.lastName} />
                <InfoRow label="Gender" value={member.basicInfo.gender} />
                <InfoRow label="Date of birth" value={formatDate(member.basicInfo.dateOfBirth)} />
                <InfoRow label="Residency status" value={member.basicInfo.residencyStatus} />
                <InfoRow label="Province of residence" value={member.basicInfo.provinceOfResidence} />
              </Card>
            )}

            {/* Contact */}
            {member.contact && (
              <Card>
                <SectionHeading icon={Phone} label="Contact" />
                <InfoRow label="Phone" value={member.contact.phoneNumber} />
                <InfoRow label="Personal email" value={member.contact.personalEmail} />
                <InfoRow label="Address" value={member.contact.homeAddress} />
                <InfoRow label="City" value={member.contact.city} />
                <InfoRow label="Province" value={member.contact.province} />
                <InfoRow label="Postal code" value={member.contact.postalCode} />
                <InfoRow label="Country" value={member.contact.country} />
              </Card>
            )}

            {/* Employment */}
            {member.employment && (
              <Card>
                <SectionHeading icon={Briefcase} label="Employment" />
                <InfoRow label="Status" value={member.employment.status} />
                <InfoRow label="Employer" value={member.employment.employerName} />
                <InfoRow label="Industry" value={member.employment.industry} />
                <InfoRow label="Job title" value={member.employment.jobTitle} />
                <InfoRow label="Work location" value={member.employment.workLocation} />
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
                <InfoRow label="Relationship" value={member.nextOfKin.relationship} />
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
                  value={<BoolBadge value={member.nextOfKin.isPrimaryBeneficiary} />}
                />
              </Card>
            )}

            {/* Referee */}
            {member.referee && (
              <Card>
                <SectionHeading icon={MapPin} label="Referee" />
                {member.referee.skipReferee ? (
                  <p className="text-xs" style={{ color: "var(--admin-muted)" }}>Referee was skipped.</p>
                ) : (
                  <>
                    <InfoRow label="Full name" value={member.referee.refereeFullName} />
                    <InfoRow label="Member ID" value={member.referee.memberId} />
                    <InfoRow label="Email" value={member.referee.refereeEmail} />
                    <InfoRow label="Relationship" value={member.referee.relationship} />
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
                <InfoRow label="Signature kind" value={member.kycAttestation.signatureKind} />
                <InfoRow label="Signature name" value={member.kycAttestation.signatureName} />
                <InfoRow label="Bylaws version" value={member.kycAttestation.bylawsVersion} />
                <InfoRow label="Signed at" value={formatDateTime(member.kycAttestation.signedAtUtc)} />
                <InfoRow label="Signed from IP" value={member.kycAttestation.signedFromIp} />
                <InfoRow label="Info accurate" value={<BoolBadge value={member.kycAttestation.informationAccurate} />} />
                <InfoRow label="Agreed to bylaws" value={<BoolBadge value={member.kycAttestation.agreedToBylaws} />} />
                <InfoRow label="Data consent" value={<BoolBadge value={member.kycAttestation.consentToDataProcessing} />} />
              </Card>
            )}
          </div>

          {/* ── Devices ── */}
          {member.deviceInfos.length > 0 && (
            <Card>
              <SectionHeading icon={Monitor} label={`Devices (${member.deviceInfos.length})`} />
              <div className="space-y-3">
                {member.deviceInfos.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-xl border p-3 text-xs space-y-1"
                    style={{ borderColor: "var(--admin-border)" }}
                  >
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--admin-muted)" }}>Device OS</span>
                      <span className="font-medium" style={{ color: "var(--admin-text)" }}>{d.deviceOS ?? "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--admin-muted)" }}>Device ID</span>
                      <span className="font-mono truncate max-w-[180px]" style={{ color: "var(--admin-text)" }}>{d.deviceID ?? "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--admin-muted)" }}>Last IP</span>
                      <span style={{ color: "var(--admin-text)" }}>{d.lastIp ?? "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--admin-muted)" }}>Trusted until</span>
                      <span style={{ color: "var(--admin-text)" }}>{formatDateTime(d.trustedUntil)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Access & Permissions ── */}
          <AccessAndPermissionsSection userId={member.id ?? id} />

          {/* Member ID footer */}
          {member.id && (
            <p className="pt-4 text-[10px] font-mono truncate" style={{ color: "var(--admin-muted)" }}>
              ID: {member.id}
            </p>
          )}
        </>
      )}
    </div>
  );
}
