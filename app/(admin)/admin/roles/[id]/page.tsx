"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Loader2,
  Save,
  Search,
  Shield,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/app/lib/api-client";
import {
  getAllRoles,
  getAllPermissions,
  getRolePermissions,
  type Permission,
} from "@/app/lib/authorization-api";

/** "UserAdmin" → "User Admin" */
function humanizeRoleName(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

// ─── Loading skeletons ────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div
      className="rounded-3xl border p-6 sm:p-8 animate-pulse"
      style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-2xl shrink-0"
          style={{ background: "var(--admin-border)" }}
        />
        <div className="space-y-3 flex-1">
          <div
            className="h-6 rounded"
            style={{ background: "var(--admin-border)", width: "45%" }}
          />
          <div
            className="h-3.5 rounded"
            style={{ background: "var(--admin-border)", width: "60%" }}
          />
        </div>
      </div>
      <div
        className="pt-5 border-t grid grid-cols-2 gap-4"
        style={{ borderColor: "var(--admin-border)" }}
      >
        <div className="space-y-2">
          <div
            className="h-2.5 rounded"
            style={{ background: "var(--admin-border)", width: "60%" }}
          />
          <div
            className="h-7 rounded"
            style={{ background: "var(--admin-border)", width: "30%" }}
          />
        </div>
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "var(--admin-border)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b animate-pulse"
        style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-3 rounded animate-pulse"
            style={{ background: "var(--admin-border)", width: 120 }}
          />
          <div
            className="h-5 w-10 rounded-full animate-pulse"
            style={{ background: "var(--admin-border)" }}
          />
        </div>
        <div
          className="h-3 w-16 rounded animate-pulse"
          style={{ background: "var(--admin-border)" }}
        />
      </div>
      <div
        className="px-5 py-2 divide-y animate-pulse"
        style={{ background: "var(--admin-bg)", borderColor: "var(--admin-border)" }}
      >
        {[80, 65, 90].map((w, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div
              className="w-4 h-4 rounded border shrink-0"
              style={{ background: "var(--admin-border)" }}
            />
            <div className="space-y-1.5 flex-1">
              <div
                className="h-3 rounded"
                style={{ background: "var(--admin-border)", width: `${w}%` }}
              />
              <div
                className="h-2.5 rounded"
                style={{ background: "var(--admin-border)", width: "35%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Queries ─────────────────────────────────────────────────────────────────

  const rolesQuery = useQuery({
    queryKey: ["admin-roles"],
    queryFn: getAllRoles,
  });

  const permissionsQuery = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: getAllPermissions,
  });

  const rolePermsQuery = useQuery({
    queryKey: ["admin-role-permissions", id],
    queryFn: () => getRolePermissions(id),
    enabled: Boolean(id),
  });

  // ── Derived ─────────────────────────────────────────────────────────────────

  const role = rolesQuery.data?.find((r) => r.id === id) ?? null;

  const serverGrantedCodes = useMemo<Set<string>>(() => {
    const s = new Set<string>();
    for (const c of rolePermsQuery.data ?? []) s.add(c.toLowerCase());
    return s;
  }, [rolePermsQuery.data]);

  const categories = useMemo<[string, Permission[]][]>(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissionsQuery.data ?? []) {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissionsQuery.data]);

  // ── Edit state ──────────────────────────────────────────────────────────────

  const isEditing = false;
  const displayedCodes = serverGrantedCodes;

  // Stubs for unimplemented edit state to satisfy TypeScript
  const clearAll = (perms: Permission[]) => {};
  const selectAll = (perms: Permission[]) => {};
  const togglePermission = (code: string) => {};
  const cancelEdit = () => {};
  const added = 0;
  const removed = 0;
  const isSaving = false;
  const savePermissions = { mutate: () => {} };

  // ── Search state ─────────────────────────────────────────────────────────────

  const [showOnlyGranted, setShowOnlyGranted] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState("");
  const q = permissionSearch.trim().toLowerCase();

  const filteredCategories = useMemo<[string, Permission[]][]>(() => {
    return categories
      .map(([cat, perms]): [string, Permission[]] => {
        let matching = perms;
        
        if (q) {
          const catMatches = cat.toLowerCase().includes(q);
          if (!catMatches) {
            matching = matching.filter(
              (p) =>
                p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
            );
          }
        }
        
        if (showOnlyGranted) {
          matching = matching.filter((p) =>
            displayedCodes.has(p.id.toLowerCase()) || displayedCodes.has(p.code.toLowerCase())
          );
        }
        
        return [cat, matching];
      })
      .filter(([, perms]) => perms.length > 0);
  }, [categories, q, showOnlyGranted, displayedCodes]);

  // ── Collapse state ───────────────────────────────────────────────────────────

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapse = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const selectedInCategory = (perms: Permission[]) =>
    perms.filter(
      (p) =>
        displayedCodes.has(p.id.toLowerCase()) ||
        displayedCodes.has(p.code.toLowerCase()),
    ).length;

  const allInCategory = (perms: Permission[]) => selectedInCategory(perms) === perms.length;

  // ── Loading / error splits ───────────────────────────────────────────────────

  const isRoleLoading = rolesQuery.isLoading;
  const isPermsLoading = permissionsQuery.isLoading || rolePermsQuery.isLoading;
  const isError = rolesQuery.isError || permissionsQuery.isError || rolePermsQuery.isError;
  const error = rolesQuery.error ?? permissionsQuery.error ?? rolePermsQuery.error;

  const editedCount = serverGrantedCodes.size;
  const hasChanges = false;

  return (
    <div className={`max-w-3xl mx-auto space-y-5 ${isEditing ? "pb-28" : "pb-12"}`}>
      {/* ── Back nav ── */}
      <button
        type="button"
        onClick={() => router.push("/admin/roles")}
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: "var(--admin-muted)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Roles &amp; Permissions
      </button>

      {/* ── Error ── */}
      {isError && (
        <div
          className="p-10 text-center rounded-2xl border"
          style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
        >
          <Shield
            className="w-9 h-9 mx-auto mb-3"
            style={{ color: "var(--admin-border)" }}
          />
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--admin-accent)" }}>
            Unable to load role
          </p>
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            {getApiErrorMessage(error)}
          </p>
        </div>
      )}

      {/* ── Role not found ── */}
      {!isRoleLoading && !isError && !role && (
        <div className="p-10 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
          Role not found.
        </div>
      )}

      {/* ── Hero card ── */}
      {isRoleLoading && <HeroSkeleton />}

      {role && (
        <div
          className="rounded-3xl border p-6 sm:p-8"
          style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Role info */}
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "var(--admin-primary)", color: "#000" }}
              >
                <KeyRound className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <h1
                  className="text-2xl font-bold truncate"
                  style={{ color: "var(--admin-text)" }}
                >
                  {humanizeRoleName(role.name)}
                </h1>
                <p
                  className="text-xs font-mono mt-0.5 truncate"
                  style={{ color: "var(--admin-muted)" }}
                >
                  {role.name}
                </p>
                {role.description && (
                  <p
                    className="text-sm mt-2 max-w-sm"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    {role.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div
            className="mt-6 pt-5 border-t grid grid-cols-2 sm:grid-cols-3 gap-5"
            style={{ borderColor: "var(--admin-border)" }}
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-widest font-bold mb-0.5"
                style={{ color: "var(--admin-muted)" }}
              >
                Assigned
              </p>
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ color: "var(--admin-text)" }}
              >
                {isPermsLoading ? (
                  <span
                    className="inline-block w-10 h-7 rounded animate-pulse"
                    style={{ background: "var(--admin-border)" }}
                  />
                ) : (
                  editedCount
                )}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
                of {permissionsQuery.data?.length ?? 0} permissions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Permission editor (only after role loads) ── */}
      {role && (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm flex-1"
              style={{
                borderColor: "var(--admin-border)",
                background: "var(--admin-surface)",
                color: "var(--admin-muted)",
              }}
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <input
                type="text"
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                placeholder="Search permissions by name, code, or category…"
                className="bg-transparent border-none outline-none w-full text-sm"
                style={{ color: "var(--admin-text)" }}
              />
              {permissionSearch && (
                <button
                  type="button"
                  onClick={() => setPermissionSearch("")}
                  className="shrink-0 transition-opacity hover:opacity-70"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Toggle Granted */}
            <button
              onClick={() => setShowOnlyGranted(!showOnlyGranted)}
              className={`px-4 py-2.5 rounded-full border text-sm font-medium transition-colors whitespace-nowrap ${
                showOnlyGranted ? "border-transparent" : "bg-transparent"
              }`}
              style={
                showOnlyGranted
                  ? { background: "var(--admin-primary)", color: "#000" }
                  : { borderColor: "var(--admin-border)", color: "var(--admin-text)" }
              }
            >
              {showOnlyGranted ? "Show all permissions" : "Show only assigned"}
            </button>
          </div>

          {/* Permissions loading skeleton */}
          {isPermsLoading && (
            <div className="space-y-3">
              <CategorySkeleton />
              <CategorySkeleton />
            </div>
          )}

          {/* No search results */}
          {!isPermsLoading && q && filteredCategories.length === 0 && (
            <div
              className="p-8 text-center rounded-2xl border"
              style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
            >
              <Search
                className="w-7 h-7 mx-auto mb-3"
                style={{ color: "var(--admin-border)" }}
              />
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--admin-text)" }}>
                No permissions found
              </p>
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                Try changing your search term.
              </p>
            </div>
          )}

          {/* Category list */}
          {!isPermsLoading && (
            <div className="space-y-3">
              {filteredCategories.map(([category, perms]) => {
                const isCollapsed = !q && collapsed.has(category);
                const selCount = selectedInCategory(perms);
                const allSel = allInCategory(perms);

                return (
                  <div
                    key={category}
                    className="rounded-2xl border overflow-hidden"
                    style={{ borderColor: "var(--admin-border)" }}
                  >
                    {/* Category header */}
                    <div
                      className="flex items-center gap-3 px-5 py-3.5"
                      style={{
                        background: "var(--admin-surface)",
                        borderBottom: isCollapsed
                          ? "none"
                          : "1px solid var(--admin-border)",
                      }}
                    >
                      {/* Category name + count — clicking toggles collapse */}
                      <button
                        type="button"
                        onClick={() => !q && toggleCollapse(category)}
                        disabled={Boolean(q)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                      >
                        <span
                          className="text-xs font-bold tracking-widest uppercase truncate"
                          style={{ color: "var(--admin-muted)" }}
                        >
                          {category}
                        </span>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 tabular-nums"
                          style={
                            selCount > 0
                              ? {
                                  background: "rgba(252,211,77,0.15)",
                                  color: "var(--admin-primary)",
                                }
                              : {
                                  background: "var(--admin-border)",
                                  color: "var(--admin-muted)",
                                }
                          }
                        >
                          {selCount}/{perms.length}
                        </span>
                      </button>

                      {/* Per-category actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() =>
                              allSel ? clearAll(perms) : selectAll(perms)
                            }
                            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-opacity hover:opacity-80"
                            style={{
                              background: "var(--admin-border)",
                              color: "var(--admin-text)",
                            }}
                          >
                            {allSel ? "Clear all" : "Select all"}
                          </button>
                        )}
                        {!q && (
                          <button
                            type="button"
                            onClick={() => toggleCollapse(category)}
                            className="w-6 h-6 flex items-center justify-center rounded-md transition-opacity hover:opacity-70"
                          >
                            {isCollapsed ? (
                              <ChevronDown
                                className="w-4 h-4"
                                style={{ color: "var(--admin-muted)" }}
                              />
                            ) : (
                              <ChevronUp
                                className="w-4 h-4"
                                style={{ color: "var(--admin-muted)" }}
                              />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Permission rows */}
                    {!isCollapsed && (
                      <div
                        className="divide-y"
                        style={{
                          background: "var(--admin-bg)",
                          borderColor: "var(--admin-border)",
                        }}
                      >
                        {perms.map((perm) => {
                          const granted =
                            displayedCodes.has(perm.id.toLowerCase()) ||
                            displayedCodes.has(perm.code.toLowerCase());

                          return (
                            <div
                              key={perm.id}
                              className={`flex items-center gap-4 px-5 py-3 transition-colors${
                                isEditing
                                  ? " cursor-pointer hover-admin-border"
                                  : ""
                              }`}
                              onClick={
                                isEditing
                                  ? () => togglePermission(perm.code)
                                  : undefined
                              }
                            >
                              {/* Custom checkbox */}
                              <div
                                className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all"
                                style={
                                  granted
                                    ? {
                                        background: "#166534",
                                        borderColor: "#166534",
                                      }
                                    : {
                                        background: "transparent",
                                        borderColor: "var(--admin-border)",
                                      }
                                }
                              >
                                {granted && (
                                  <Check
                                    className="w-2.5 h-2.5 text-white"
                                    strokeWidth={3}
                                  />
                                )}
                              </div>

                              {/* Name + code */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm font-medium"
                                  style={{ color: "var(--admin-text)" }}
                                >
                                  {perm.name}
                                </p>
                                <p
                                  className="text-[10px] font-mono"
                                  style={{ color: "var(--admin-muted)" }}
                                >
                                  {perm.code}
                                </p>
                              </div>

                              {/* Status badge (view mode only) */}
                              {!isEditing && (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shrink-0"
                                  style={
                                    granted
                                      ? { background: "#dcfce7", color: "#166534" }
                                      : {
                                          background: "var(--admin-border)",
                                          color: "var(--admin-muted)",
                                        }
                                  }
                                >
                                  {granted ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <X className="w-3 h-3" />
                                  )}
                                  {granted ? "Granted" : "Not set"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Role ID footer */}
          {!isPermsLoading && (
            <p
              className="text-[10px] font-mono pt-2"
              style={{ color: "var(--admin-muted)" }}
            >
              Role ID: {id}
            </p>
          )}
        </>
      )}

      {/* ── Floating save bar ── */}
      {isEditing && (
        <div
          className="fixed z-50 flex items-center gap-3 px-5 py-3 rounded-2xl border"
          style={{
            bottom: "1.5rem",
            left: "calc(var(--admin-sidebar-offset, 0px) / 2 + 50%)",
            transform: "translateX(-50%)",
            background: "var(--admin-surface)",
            borderColor: "var(--admin-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.1)",
            maxWidth: "min(calc(100vw - 2rem), 480px)",
            width: "max-content",
          }}
        >
          {/* Summary */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>
              {editedCount} permission{editedCount !== 1 ? "s" : ""} selected
            </p>
            {hasChanges && (
              <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-primary)" }}>
                {[
                  added > 0 && `+${added} to add`,
                  removed > 0 && `−${removed} to remove`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          <div
            className="w-px h-8 shrink-0"
            style={{ background: "var(--admin-border)" }}
          />

          <button
            type="button"
            onClick={cancelEdit}
            disabled={isSaving}
            className="text-sm font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70 disabled:opacity-40 shrink-0"
            style={{ color: "var(--admin-muted)" }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => savePermissions.mutate()}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 shrink-0"
            style={{ background: "var(--admin-text)", color: "var(--admin-bg)" }}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      )}
    </div>
  );
}
