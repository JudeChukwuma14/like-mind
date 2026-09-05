"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, KeyRound, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { adminApiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";

// Confirmed against the live /api/admin/authorization/GetAllRoles response —
// no member count or last-edited metadata exists on this endpoint, so the
// table only surfaces what the API actually returns.
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

/** Role.permissions' element shape isn't documented — defensively accept bare id/code strings or objects. */
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

/** "UserAdmin" -> "User Admin" */
function humanizeRoleName(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

export default function RolesPage() {
  const [search, setSearch] = useState("");

  const rolesQuery = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await adminApiFetch<ApiEnvelope<Role[]>>("/api/admin/authorization/GetAllRoles");
      return res.data ?? [];
    },
  });

  const permissionsQuery = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: async () => {
      const res = await adminApiFetch<ApiEnvelope<Permission[]>>("/api/admin/authorization/GetAllPermissions");
      return res.data ?? [];
    },
  });

  const roles = rolesQuery.data ?? [];
  const permissionCountByRole = useMemo(() => {
    const counts = new Map<string, number>();
    for (const role of rolesQuery.data ?? []) counts.set(role.id, permissionIdsForRole(role).size);
    return counts;
  }, [rolesQuery.data]);

  const filtered = search.trim()
    ? roles.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()))
    : roles;

  const isLoading = rolesQuery.isLoading || permissionsQuery.isLoading;
  const isError = rolesQuery.isError || permissionsQuery.isError;
  const error = rolesQuery.error ?? permissionsQuery.error;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-bold tracking-widest uppercase mb-1"
            style={{ color: "var(--admin-muted)" }}
          >
            Members / Access
          </p>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>
            Roles &amp; permissions
          </h1>
          {!isLoading && !isError && (
            <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
              {roles.length} role{roles.length === 1 ? "" : "s"} · {permissionsQuery.data?.length ?? 0} permissions available
            </p>
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

      {/* Search */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm sm:w-80"
        style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)", color: "var(--admin-muted)" }}
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search roles"
          className="bg-transparent border-none outline-none w-full text-sm min-w-0"
          style={{ color: "var(--admin-text)" }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="shrink-0 transition-colors hover:opacity-70"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className="rounded-3xl border overflow-hidden"
        style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
      >
        <div
          className="grid grid-cols-12 gap-4 px-6 py-4 border-b text-[10px] font-bold tracking-widest uppercase"
          style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}
        >
          <div className="col-span-5 md:col-span-4">Role</div>
          <div className="col-span-5 hidden md:block">Scope</div>
          <div className="col-span-7 md:col-span-3 text-right">Permissions</div>
        </div>

        {isLoading && (
          <div className="p-10 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
            Loading roles…
          </div>
        )}

        {isError && (
          <div className="p-10 text-center text-sm" style={{ color: "var(--admin-accent)" }}>
            {getApiErrorMessage(error)}
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="p-10 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
            No roles found.
          </div>
        )}

        <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
          {filtered.map((role) => {
            const count = permissionCountByRole.get(role.id) ?? 0;
            return (
              <Link
                href={`/admin/roles/${role.id}`}
                key={role.id}
                className="hover-admin-border grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors"
              >
                <div className="col-span-5 md:col-span-4 flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--admin-primary)", color: "#000" }}
                  >
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--admin-text)" }}>
                      {humanizeRoleName(role.name)}
                    </p>
                    <p className="text-xs font-mono truncate" style={{ color: "var(--admin-muted)" }}>
                      {role.name}
                    </p>
                  </div>
                </div>

                <div className="col-span-5 hidden md:block text-sm truncate" style={{ color: "var(--admin-muted)" }}>
                  {role.description || "—"}
                </div>

                <div className="col-span-7 md:col-span-3 flex items-center justify-end gap-3">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                    style={{ background: "var(--admin-border)", color: "var(--admin-muted)" }}
                  >
                    {count} permission{count === 1 ? "" : "s"}
                  </span>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--admin-muted)" }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
