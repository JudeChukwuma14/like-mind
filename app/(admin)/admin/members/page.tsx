"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Search, X, Upload, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { adminApiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";
import { bulkImportUsers, type BulkImportResult } from "@/app/lib/user-admin-api";

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
  roleName?: string | null;
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
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [roleId, setRoleId] = useState("");
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [showImportResult, setShowImportResult] = useState(false);

  const bulkImport = useMutation({
    mutationFn: (file: File) => bulkImportUsers(file),
    onSuccess: (res) => {
      const result = res.data ?? {};
      setImportResult(result);
      setShowImportResult(true);
      // Refresh member list
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      if ((result.failed ?? 0) > 0) toast("Import processed. Review the failed rows in the summary.");
      else toast.success("Bulk import completed.");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx") {
      toast.error("Please select a .csv or .xlsx file.");
      e.target.value = "";
      return;
    }
    bulkImport.mutate(file);
    e.target.value = "";
  };

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
    if (classify(value) === "id" || classify(value) === "email") setStatus("all");
  };

  const handleRoleChange = (nextRoleId: string) => {
    setRoleId(nextRoleId);
    setSearchInput("");
    setSearch("");
    setStatus("all");
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

  const hasFilters = Boolean(searchInput || roleId || status !== "all");

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setRoleId("");
    setStatus("all");
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      {/* ── Bulk Import Result Modal ── */}
      {showImportResult && importResult && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-result-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl border p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: (importResult.failed ?? 0) > 0 ? "#fef3c7" : "#dcfce7" }}
              >
                {(importResult.failed ?? 0) > 0 ? <AlertTriangle className="w-5 h-5 text-amber-700" /> : <CheckCircle2 className="w-5 h-5 text-green-700" />}
              </div>
              <div>
                <h2 id="import-result-title" className="text-base font-bold" style={{ color: "var(--admin-text)" }}>Import processed</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>Review which rows were created, skipped, or failed.</p>
              </div>
            </div>

            <div
              className="rounded-2xl border p-4 space-y-2 text-xs"
              style={{ background: "var(--admin-bg)", borderColor: "var(--admin-border)" }}
            >
              {importResult.totalRows !== undefined && importResult.totalRows !== null && (
                <div className="flex justify-between gap-4">
                  <span style={{ color: "var(--admin-muted)" }}>Total rows</span>
                  <span className="font-semibold" style={{ color: "var(--admin-text)" }}>{importResult.totalRows}</span>
                </div>
              )}
              {importResult.created !== undefined && importResult.created !== null && (
                <div className="flex justify-between gap-4">
                  <span style={{ color: "var(--admin-muted)" }}>Created</span>
                  <span className="font-bold" style={{ color: "#166534" }}>{importResult.created}</span>
                </div>
              )}
              {importResult.skipped !== undefined && importResult.skipped !== null && (
                <div className="flex justify-between gap-4">
                  <span style={{ color: "var(--admin-muted)" }}>Skipped (duplicate email)</span>
                  <span className="font-bold" style={{ color: "#d97706" }}>{importResult.skipped}</span>
                </div>
              )}
              {importResult.failed !== undefined && importResult.failed !== null && (
                <div className="flex justify-between gap-4">
                  <span style={{ color: "var(--admin-muted)" }}>Failed validation</span>
                  <span className="font-bold" style={{ color: "#ef4444" }}>{importResult.failed}</span>
                </div>
              )}
            </div>

            {/* Error details */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>
                  Validation Errors
                </p>
                <ul className="max-h-32 overflow-y-auto space-y-1">
                  {importResult.errors.map((e, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                      <span style={{ color: "var(--admin-text)" }}>
                        {e.row !== null && e.row !== undefined ? `Row ${e.row}: ` : ""}{e.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <button
                id="bulk-import-close-btn"
                type="button"
                onClick={() => setShowImportResult(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--admin-text)", color: "var(--admin-bg)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="hidden"
        onChange={handleFileSelect}
      />

      <header className="card-admin flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">People · Directory</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Members</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 admin-text-muted">Find an account, review its details, and manage verification or access from one place.</p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <button
            id="members-bulk-import-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={bulkImport.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bulkImport.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Importing…</> : <><Upload className="h-4 w-4" /> Import members</>}
          </button>
          <p className="text-xs admin-text-muted">Upload a CSV or XLSX file</p>
        </div>
      </header>

      <section className="card-admin space-y-5 rounded-3xl p-5 md:p-6" aria-label="Find and filter members">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="text-lg font-semibold">Find members</h2><p className="mt-1 text-xs admin-text-muted">Search by name, email, or an exact member ID.</p></div>
          {hasFilters && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-semibold admin-text-muted hover:underline"><X className="h-3.5 w-3.5" /> Clear filters</button>}
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)]">
          <label className="grid gap-1.5 text-xs font-semibold admin-text-muted">
            Search
            <span className="input-admin flex items-center gap-2 rounded-xl px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0" />
              <input type="search" value={searchInput} onChange={(e) => handleSearchInputChange(e.target.value)} placeholder="Name, email or member ID" className="w-full min-w-0 bg-transparent text-sm font-normal outline-none" style={{ color: "var(--admin-text)" }} />
            </span>
          </label>
          <label className="grid gap-1.5 text-xs font-semibold admin-text-muted">
            Role
            <select value={roleId} onChange={(e) => handleRoleChange(e.target.value)} className="input-admin rounded-xl px-3 py-2.5 text-sm font-medium outline-none">
              <option value="">All roles</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: "var(--admin-border)" }}>
          <span className="mr-1 text-xs font-semibold admin-text-muted">Status</span>
          {(["all", "active", "inactive"] as StatusFilter[]).map((s) => (
            <button key={s} type="button" disabled={statusTabsDisabled} onClick={() => handleTabChange(s)} aria-pressed={status === s} className="rounded-full border px-4 py-2 text-xs font-semibold capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-40" style={status === s ? { background: "var(--admin-text)", color: "var(--admin-bg)", borderColor: "var(--admin-text)" } : { background: "var(--admin-surface)", color: "var(--admin-muted)", borderColor: "var(--admin-border)" }}>{s}</button>
          ))}
        </div>
      </section>

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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-5" style={{ borderColor: "var(--admin-border)" }}>
          <div>
            <h2 className="text-lg font-semibold">Directory results</h2>
            <p className="mt-1 text-xs admin-text-muted">{result ? `${result.totalCount} matching account${result.totalCount === 1 ? "" : "s"}` : "Accounts returned by the directory"}</p>
          </div>
          {result && !exactLookup && result.totalCount > 0 && <span className="rounded-full border px-3 py-1.5 text-xs font-medium admin-text-muted" style={{ borderColor: "var(--admin-border)" }}>Page {result.pageNumber} of {result.totalPages}</span>}
        </div>
        <div
          className="grid grid-cols-12 gap-4 px-6 py-4 border-b text-[10px] font-bold tracking-widest uppercase"
          style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}
        >
          <div className="col-span-6 md:col-span-4">Member</div>
          <div className="col-span-3 hidden md:block">Role</div>
          <div className="col-span-2 hidden md:block">Joined</div>
          <div className="col-span-6 md:col-span-3 text-right">Status</div>
        </div>

        {isLoading && (
          <div className="p-10 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
            Loading members…
          </div>
        )}

        {isError && (
          <div className="p-10 text-center text-sm" role="alert" style={{ color: "var(--admin-accent)" }}>
            <p>{getApiErrorMessage(error)}</p>
            <button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })} className="mt-3 font-semibold underline">Try again</button>
          </div>
        )}

        {!isLoading && !isError && members.length === 0 && (
          <div className="px-6 py-14 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
            <Search className="mx-auto mb-3 h-6 w-6" />
            <p className="font-semibold" style={{ color: "var(--admin-text)" }}>No accounts found</p>
            <p className="mt-1">{hasFilters ? "Try a different search or clear the filters." : "Accounts will appear here when they are available."}</p>
            {hasFilters && <button type="button" onClick={clearFilters} className="mt-3 font-semibold underline">Clear filters</button>}
          </div>
        )}

        <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
          {members.map((m) => (
            <Link
              href={`/admin/members/${m.id}`}
              key={m.id}
              className="hover-admin-border grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors"
            >
              <div className="col-span-6 md:col-span-4 flex items-center gap-3 min-w-0">
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

              <div className="col-span-3 hidden md:block text-sm truncate capitalize" style={{ color: "var(--admin-muted)" }}>
                {m.roleName ? m.roleName.replace(/([A-Z])/g, ' $1').trim() : "Member"}
              </div>

              <div className="col-span-2 hidden md:block text-sm" style={{ color: "var(--admin-muted)" }}>
                {formatDate(m.createdAt)}
              </div>

              <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-3">
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
