"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { adminApiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";

// Confirmed against the live /api/User swagger schema (UserListItemDto /
// UserListItemDtoPagedResult) — this is the full set of fields the backend
// actually returns; no role/balance/cycle data exists on this endpoint.
type MemberListItem = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: string;
};

type MemberPage = {
  items: MemberListItem[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

const PAGE_SIZE = 20;

type StatusFilter = "all" | "active" | "inactive";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SearchMode = "none" | "id" | "email" | "text";

function classify(query: string): SearchMode {
  const trimmed = query.trim();
  if (!trimmed) return "none";
  if (UUID_RE.test(trimmed)) return "id";
  if (EMAIL_RE.test(trimmed)) return "email";
  return "text";
}

function fullName(m: MemberListItem): string {
  return [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || "Unnamed";
}

function initialsFor(m: MemberListItem): string {
  const parts = fullName(m).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

type RoleOption = { id: string; name: string };

/**
 * /api/Auth/SearchUsersByRole has no documented response schema, but every
 * other paginated user endpoint on this backend returns the same
 * UserListItemDtoPagedResult envelope — assume that here too, defensively,
 * and log the raw response if it doesn't match so this can be tightened up.
 */
function pluckPagedResult(raw: unknown): MemberPage {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const data = obj.data && typeof obj.data === "object" ? (obj.data as Record<string, unknown>) : null;
  const items = data && Array.isArray(data.items) ? (data.items as MemberListItem[]) : null;
  if (!data || !items) {
    console.info("[AdminUsers] SearchUsersByRole raw response (unexpected shape):", raw);
    return { items: [], pageNumber: 1, pageSize: PAGE_SIZE, totalCount: 0, totalPages: 1 };
  }
  return {
    items,
    pageNumber: typeof data.pageNumber === "number" ? data.pageNumber : 1,
    pageSize: typeof data.pageSize === "number" ? data.pageSize : PAGE_SIZE,
    totalCount: typeof data.totalCount === "number" ? data.totalCount : items.length,
    totalPages: typeof data.totalPages === "number" ? data.totalPages : 1,
  };
}

/**
 * /api/User/GetById and /api/User/GetUserByEmail have no documented
 * response schema (swagger just says "200 OK", "a user in details").
 * Pulled defensively, same approach as the member detail page — raw
 * response is logged so the real shape can be confirmed later.
 */
function pluckSingleResult(raw: unknown): MemberListItem | null {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const data = obj.data && typeof obj.data === "object" ? (obj.data as Record<string, unknown>) : obj;
  console.info("[AdminUsers] single-lookup raw response:", raw);

  const str = (src: Record<string, unknown>, k: string) =>
    typeof src[k] === "string" ? (src[k] as string) : null;

  const id = str(data, "id");
  if (!id) return null;

  // The GetById response nests firstName/lastName inside basicInfo
  const basicInfo =
    data.basicInfo && typeof data.basicInfo === "object"
      ? (data.basicInfo as Record<string, unknown>)
      : null;

  return {
    id,
    email: str(data, "email"),
    firstName: basicInfo ? str(basicInfo, "firstName") : str(data, "firstName"),
    lastName: basicInfo ? str(basicInfo, "lastName") : str(data, "lastName"),
    isActive: typeof data.isActive === "boolean" ? data.isActive : false,
    createdAt: str(data, "createdAt") ?? "",
  };
}

export default function MembersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [roleId, setRoleId] = useState("");

  // Debounce so exact-lookup/search calls don't fire on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Shares its query key with the Roles page, so if that's already been
  // visited this reads from cache instead of firing a second request.
  const rolesQuery = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await adminApiFetch<ApiEnvelope<RoleOption[]>>("/api/admin/authorization/GetAllRoles");
      return res.data ?? [];
    },
  });

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    if (roleId) setRoleId(""); // typing a search overrides an active role filter
  };

  const handleRoleChange = (nextRoleId: string) => {
    setRoleId(nextRoleId);
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const mode = classify(search);
  const isActiveParam = status === "active" ? true : status === "inactive" ? false : undefined;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-users", mode, search, page, status, roleId],
    queryFn: async (): Promise<MemberPage> => {
      if (roleId) {
        const params = new URLSearchParams({ roleId, page: String(page), pageSize: String(PAGE_SIZE) });
        const res = await adminApiFetch<unknown>(`/api/Auth/SearchUsersByRole?${params.toString()}`);
        return pluckPagedResult(res);
      }
      if (mode === "id") {
        const res = await adminApiFetch<unknown>(`/api/User/GetById?userId=${encodeURIComponent(search)}`);
        const item = pluckSingleResult(res);
        return { items: item ? [item] : [], pageNumber: 1, pageSize: 1, totalCount: item ? 1 : 0, totalPages: 1 };
      }
      if (mode === "email") {
        const res = await adminApiFetch<unknown>(`/api/User/GetUserByEmail?email=${encodeURIComponent(search)}`);
        const item = pluckSingleResult(res);
        return { items: item ? [item] : [], pageNumber: 1, pageSize: 1, totalCount: item ? 1 : 0, totalPages: 1 };
      }

      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (isActiveParam !== undefined) params.set("isActive", String(isActiveParam));

      if (mode === "text") {
        params.set("q", search);
        const res = await adminApiFetch<ApiEnvelope<MemberPage>>(`/api/User/search?${params.toString()}`);
        return res.data;
      }
      const res = await adminApiFetch<ApiEnvelope<MemberPage>>(`/api/User/Users?${params.toString()}`);
      return res.data;
    },
  });

  const result = data;
  const members = result?.items ?? [];
  const exactLookup = mode === "id" || mode === "email";
  const statusTabsDisabled = exactLookup || Boolean(roleId);
  const roles = rolesQuery.data ?? [];
  const selectedRoleName = roles.find((r) => r.id === roleId)?.name;

  const handleTabChange = (next: StatusFilter) => {
    setStatus(next);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div>
        <p
          className="text-[10px] font-bold tracking-widest uppercase mb-1"
          style={{ color: "var(--admin-muted)" }}
        >
          Directory
        </p>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>
          Members
        </h1>
        {result && (
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            {result.totalCount} member{result.totalCount === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {/* Search + status tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm sm:w-80"
          style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)", color: "var(--admin-muted)" }}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            placeholder="Search by name, email, or paste a member ID"
            className="bg-transparent border-none outline-none w-full text-sm min-w-0"
            style={{ color: "var(--admin-text)" }}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => handleSearchInputChange("")}
              aria-label="Clear search"
              className="shrink-0 transition-colors hover:opacity-70"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={roleId}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="px-4 py-2 rounded-full text-sm font-medium border outline-none"
          style={{ background: "var(--admin-surface)", color: "var(--admin-text)", borderColor: "var(--admin-border)" }}
        >
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          {(["all", "active", "inactive"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              disabled={statusTabsDisabled}
              onClick={() => handleTabChange(s)}
              className="px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors border disabled:opacity-40 disabled:cursor-not-allowed"
              style={
                status === s
                  ? { background: "var(--admin-text)", color: "var(--admin-bg)", borderColor: "var(--admin-text)" }
                  : { background: "var(--admin-surface)", color: "var(--admin-muted)", borderColor: "var(--admin-border)" }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {exactLookup && (
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Showing an exact match for {mode === "id" ? "this member ID" : "this email"} — status filters don&apos;t apply here.
        </p>
      )}
      {roleId && (
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Filtering by role{selectedRoleName ? ` — ${selectedRoleName}` : ""} — status filters don&apos;t apply here.
        </p>
      )}

      {/* Table */}
      <div
        className="rounded-3xl border overflow-hidden"
        style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
      >
        <div
          className="grid grid-cols-12 gap-4 px-6 py-4 border-b text-[10px] font-bold tracking-widest uppercase"
          style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}
        >
          <div className="col-span-6 md:col-span-5">Member</div>
          <div className="col-span-3 hidden md:block">Joined</div>
          <div className="col-span-6 md:col-span-4 text-right">Status</div>
        </div>

        {isLoading && (
          <div className="p-10 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
            Loading members…
          </div>
        )}

        {isError && (
          <div className="p-10 text-center text-sm" style={{ color: "var(--admin-accent)" }}>
            {getApiErrorMessage(error)}
          </div>
        )}

        {!isLoading && !isError && members.length === 0 && (
          <div className="p-10 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
            No members found.
          </div>
        )}

        <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
          {members.map((m) => (
            <Link
              href={`/admin/members/${m.id}`}
              key={m.id}
              className="hover-admin-border grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors"
            >
              <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "var(--admin-primary)", color: "#000" }}
                >
                  {initialsFor(m)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--admin-text)" }}>
                    {fullName(m)}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--admin-muted)" }}>
                    {m.email ?? "—"}
                  </p>
                </div>
              </div>

              <div className="col-span-3 hidden md:block text-sm" style={{ color: "var(--admin-muted)" }}>
                {formatDate(m.createdAt)}
              </div>

              <div className="col-span-6 md:col-span-4 flex items-center justify-end gap-3">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                  style={
                    m.isActive
                      ? { background: "#dcfce7", color: "#166534" }
                      : { background: "var(--admin-border)", color: "var(--admin-muted)" }
                  }
                >
                  {m.isActive ? "Active" : "Inactive"}
                </span>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--admin-muted)" }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {result && !exactLookup && result.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Page {result.pageNumber} of {result.totalPages}
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
              onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
              disabled={page >= result.totalPages}
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
