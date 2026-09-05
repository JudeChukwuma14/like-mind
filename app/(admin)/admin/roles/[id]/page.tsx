"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, KeyRound, X } from "lucide-react";
import { adminApiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";

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

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

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

  const role = rolesQuery.data?.find((r) => r.id === id) ?? null;
  const grantedIds = useMemo(() => (role ? permissionIdsForRole(role) : new Set<string>()), [role]);

  const categories = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissionsQuery.data ?? []) {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissionsQuery.data]);

  const isLoading = rolesQuery.isLoading || permissionsQuery.isLoading;
  const isError = rolesQuery.isError || permissionsQuery.isError;
  const error = rolesQuery.error ?? permissionsQuery.error;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push("/admin/roles")}
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: "var(--admin-muted)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to roles
      </button>

      {/* Loading / Error */}
      {isLoading && (
        <div className="p-10 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
          Loading role…
        </div>
      )}
      {isError && (
        <div className="p-10 text-center text-sm" style={{ color: "var(--admin-accent)" }}>
          {getApiErrorMessage(error)}
        </div>
      )}
      {!isLoading && !isError && !role && (
        <div className="p-10 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
          Role not found.
        </div>
      )}

      {role && (
        <>
          {/* Hero */}
          <div
            className="rounded-3xl border p-6 sm:p-8"
            style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--admin-primary)", color: "#000" }}
              >
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold truncate" style={{ color: "var(--admin-text)" }}>
                  {humanizeRoleName(role.name)}
                </h1>
                <p className="text-sm mt-0.5 font-mono truncate" style={{ color: "var(--admin-muted)" }}>
                  {role.name}
                </p>
                {role.description && (
                  <p className="text-sm mt-2" style={{ color: "var(--admin-text)" }}>
                    {role.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--admin-muted)" }}>
                Permissions granted
              </p>
              <p className="text-sm" style={{ color: "var(--admin-text)" }}>
                {grantedIds.size} of {permissionsQuery.data?.length ?? 0}
              </p>
            </div>
          </div>

          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Read-only for now — editing a role&apos;s permissions isn&apos;t wired up to the API yet.
          </p>

          {/* Permission categories */}
          <div className="space-y-4">
            {categories.map(([category, perms]) => (
              <div
                key={category}
                className="rounded-2xl border p-5"
                style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
              >
                <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: "var(--admin-muted)" }}>
                  {category}
                </p>
                <div className="space-y-1 divide-y" style={{ borderColor: "var(--admin-border)" }}>
                  {perms.map((perm) => {
                    const granted = grantedIds.has(perm.id.toLowerCase()) || grantedIds.has(perm.code.toLowerCase());
                    return (
                      <div key={perm.id} className="flex items-center justify-between gap-4 py-2.5">
                        <span className="text-sm" style={{ color: "var(--admin-text)" }}>
                          {perm.name}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shrink-0"
                          style={
                            granted
                              ? { background: "#dcfce7", color: "#166534" }
                              : { background: "var(--admin-border)", color: "var(--admin-muted)" }
                          }
                        >
                          {granted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {granted ? "Granted" : "Not set"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Role ID footer */}
          <p className="pt-4 text-[10px] font-mono truncate" style={{ color: "var(--admin-muted)" }}>
            ID: {role.id}
          </p>
        </>
      )}
    </div>
  );
}
