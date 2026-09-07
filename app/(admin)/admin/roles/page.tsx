"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, KeyRound, Search, Shield, X } from "lucide-react";
import toast from "react-hot-toast";
import { adminApiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────
// Confirmed against the live /api/admin/authorization/GetAllRoles response —
// no member count or last-edited metadata exists on this endpoint.
type RolePermissionRef = string | { id?: string | null; code?: string | null };

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: RolePermissionRef[] | null;
};

type Permission = {
  id: string;
  code: string;
  name: string;
  category: string;
};

/** Defensively accept bare id/code strings or objects from the API. */
function permissionIdsForRole(role: Role): Set<string> {
  const ids = new Set<string>();
  for (const p of role.permissions ?? []) {
    if (typeof p === "string") {
      ids.add(p.toLowerCase());
    } else if (p && typeof p === "object") {
      if (p.id) ids.add(p.id.toLowerCase());
      if (p.code) ids.add(p.code.toLowerCase());
    }
  }
  return ids;
}

/** "UserAdmin" → "User Admin" */
function humanizeRoleName(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

/** First two words of the humanised name → initials */
function roleInitials(name: string): string {
  return humanizeRoleName(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function RoleSkeleton() {
  return (
    <div
      className="grid grid-cols-12 gap-4 items-center px-6 py-5 border-b last:border-0"
      style={{ borderColor: "var(--admin-border)" }}
    >
      <div className="col-span-6 md:col-span-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl shrink-0 animate-pulse"
          style={{ background: "var(--admin-border)" }}
        />
        <div className="space-y-2 flex-1 min-w-0">
          <div
            className="h-3.5 rounded animate-pulse"
            style={{ background: "var(--admin-border)", width: "55%" }}
          />
          <div
            className="h-2.5 rounded animate-pulse"
            style={{ background: "var(--admin-border)", width: "35%" }}
          />
        </div>
      </div>
      <div className="col-span-0 hidden md:block md:col-span-5">
        <div
          className="h-3 rounded animate-pulse"
          style={{ background: "var(--admin-border)", width: "70%" }}
        />
      </div>
      <div className="col-span-6 md:col-span-3 flex justify-end">
        <div
          className="h-5 w-24 rounded-full animate-pulse"
          style={{ background: "var(--admin-border)" }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RolesPage() {
  const [search, setSearch] = useState("");

  const rolesQuery = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await adminApiFetch<ApiEnvelope<Role[]>>(
        "/api/admin/authorization/GetAllRoles",
      );
      return res.data ?? [];
    },
  });

  const permissionsQuery = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: async () => {
      const res = await adminApiFetch<ApiEnvelope<Permission[]>>(
        "/api/admin/authorization/GetAllPermissions",
      );
      return res.data ?? [];
    },
  });

  const roles = rolesQuery.data ?? [];
  const totalPermissions = permissionsQuery.data?.length ?? 0;

  const permissionCountByRole = useMemo(() => {
    const counts = new Map<string, number>();
    for (const role of rolesQuery.data ?? [])
      counts.set(role.id, permissionIdsForRole(role).size);
    return counts;
  }, [rolesQuery.data]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? roles.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          humanizeRoleName(r.name).toLowerCase().includes(q) ||
          (r.description?.toLowerCase() ?? "").includes(q),
      )
    : roles;

  const isLoading = rolesQuery.isLoading || permissionsQuery.isLoading;
  const isError = rolesQuery.isError || permissionsQuery.isError;
  const error = rolesQuery.error ?? permissionsQuery.error;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-bold tracking-widest uppercase mb-1"
            style={{ color: "var(--admin-muted)" }}
          >
            System / Access Control
          </p>
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: "var(--admin-text)" }}
          >
            Roles &amp; Permissions
          </h1>
          <p className="text-sm mt-1.5 max-w-md" style={{ color: "var(--admin-muted)" }}>
            Manage administrative roles, define permission sets, and control
            what each user can do across the platform.
          </p>

          {/* Stats row */}
          {!isLoading && !isError && (
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
                style={{
                  color: "var(--admin-text)",
                  borderColor: "var(--admin-border)",
                  background: "var(--admin-surface)",
                }}
              >
                <KeyRound className="w-3.5 h-3.5" style={{ color: "var(--admin-primary)" }} />
                {roles.length} role{roles.length !== 1 ? "s" : ""}
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
                style={{
                  color: "var(--admin-text)",
                  borderColor: "var(--admin-border)",
                  background: "var(--admin-surface)",
                }}
              >
                <Shield className="w-3.5 h-3.5" style={{ color: "var(--admin-primary)" }} />
                {totalPermissions} permission{totalPermissions !== 1 ? "s" : ""} available
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => toast("Role creation isn't wired up to the API yet.")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shrink-0 transition-all hover:opacity-90 active:scale-95"
          style={{ background: "var(--admin-text)", color: "var(--admin-bg)" }}
        >
          New role
        </button>
      </div>

      {/* ── Search ── */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm w-full sm:w-80"
        style={{
          borderColor: "var(--admin-border)",
          background: "var(--admin-surface)",
          color: "var(--admin-muted)",
        }}
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search roles…"
          className="bg-transparent border-none outline-none w-full text-sm min-w-0"
          style={{ color: "var(--admin-text)" }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="shrink-0 transition-opacity hover:opacity-70"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-3xl border overflow-hidden"
        style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
      >
        {/* Column headers */}
        <div
          className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b text-[10px] font-bold tracking-widest uppercase"
          style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}
        >
          <div className="col-span-6 md:col-span-4">Role</div>
          <div className="col-span-0 hidden md:block md:col-span-5">Description</div>
          <div className="col-span-6 md:col-span-3 text-right">Permissions</div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            <RoleSkeleton />
            <RoleSkeleton />
            <RoleSkeleton />
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="p-10 text-center">
            <KeyRound
              className="w-9 h-9 mx-auto mb-3"
              style={{ color: "var(--admin-border)" }}
            />
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--admin-accent)" }}>
              Unable to load roles
            </p>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              {getApiErrorMessage(error)}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="p-12 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--admin-border)" }}
            >
              <KeyRound className="w-6 h-6" style={{ color: "var(--admin-muted)" }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--admin-text)" }}>
              {search ? "No roles match your search" : "No roles available"}
            </p>
            <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--admin-muted)" }}>
              {search
                ? `No roles match "${search}". Try a different term.`
                : "There are currently no roles configured in this system."}
            </p>
          </div>
        )}

        {/* Role rows */}
        {!isLoading && !isError && (
          <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            {filtered.map((role) => {
              const count = permissionCountByRole.get(role.id) ?? 0;
              return (
                <Link
                  href={`/admin/roles/${role.id}`}
                  key={role.id}
                  className="hover-admin-border group grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors"
                >
                  {/* Avatar + name */}
                  <div className="col-span-6 md:col-span-4 flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 select-none"
                      style={{ background: "var(--admin-primary)", color: "#000" }}
                    >
                      {roleInitials(role.name)}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: "var(--admin-text)" }}
                      >
                        {humanizeRoleName(role.name)}
                      </p>
                      <p
                        className="text-[10px] font-mono truncate"
                        style={{ color: "var(--admin-muted)" }}
                      >
                        {role.name}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div
                    className="col-span-0 hidden md:block md:col-span-5 text-sm truncate"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    {role.description || "—"}
                  </div>

                  {/* Permission count + arrow */}
                  <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider shrink-0"
                      style={
                        count > 0
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
                      {count} permission{count !== 1 ? "s" : ""}
                    </span>
                    <ChevronRight
                      className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                      style={{ color: "var(--admin-muted)" }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Search result count */}
      {search && !isLoading && !isError && (
        <p className="text-xs text-right" style={{ color: "var(--admin-muted)" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  );
}
