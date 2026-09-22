"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Filter,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Activity,
  User,
  Clock,
  Database,
  Search,
} from "lucide-react";
import {
  getAuditLogs,
  getAuditLogById,
  parseChanges,
  type GetAuditLogsParams,
} from "@/app/lib/audit-api";
import { getApiErrorMessage } from "@/app/lib/api-client";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function fmtValue(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return JSON.stringify(v);
}

function humanizeField(field: string): string {
  return field.replace(/([A-Z])/g, " $1").trim();
}

const ACTION_COLORS: Record<string, string> = {
  Added: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Modified: "bg-amber-50 text-amber-700 border-amber-200",
  Deleted: "bg-red-50 text-red-700 border-red-200",
};

const ENTITY_COLORS: Record<string, string> = {
  User: "bg-blue-50 text-blue-700",
  PaymentSubmission: "bg-purple-50 text-purple-700",
  SavingsAccount: "bg-emerald-50 text-emerald-700",
  SavingsTransaction: "bg-teal-50 text-teal-700",
  OtpNotification: "bg-gray-50 text-gray-600",
  DeviceInfo: "bg-orange-50 text-orange-700",
  LoanApplication: "bg-indigo-50 text-indigo-700",
  PendingApproval: "bg-yellow-50 text-yellow-700",
};

// ─── Detail Drawer ─────────────────────────────────────────────────────────────

function DetailDrawer({ logId, onClose }: { logId: number; onClose: () => void }) {
  const { data: log, isLoading } = useQuery({
    queryKey: ["audit-log", logId],
    queryFn: () => getAuditLogById(logId),
  });

  const changes = log ? parseChanges(log.changes) : [];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Audit Log #{logId}</p>
            <h2 className="text-xl font-bold text-[#111]">Change Details</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
          </div>
        )}

        {log && (
          <div className="p-6 space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Entity</span>
                </div>
                <p className="font-bold text-[#111] text-sm">{log.entityName}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{log.entityId}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {log.action}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Performed By</span>
                </div>
                <p className="font-bold text-[#111] text-sm">{log.performedByName ?? "System"}</p>
                {log.performedBy && <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{log.performedBy}</p>}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Occurred At</span>
                </div>
                <p className="font-bold text-[#111] text-sm">{fmtDate(log.occurredAt)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#111] mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#111] text-white flex items-center justify-center text-[10px] font-bold">{changes.length}</span>
                Field Changes
              </h3>

              {changes.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-6 text-center text-sm text-gray-500">No field changes recorded.</div>
              ) : (
                <div className="space-y-3">
                  {changes.map((c, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{humanizeField(c.field)}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-semibold text-red-400 uppercase mb-1">Before</p>
                          <p className="text-sm font-medium text-[#111] break-all">{fmtValue(c.old)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-emerald-500 uppercase mb-1">After</p>
                          <p className="text-sm font-medium text-[#111] break-all">{fmtValue(c.new)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filters, setFilters] = useState<GetAuditLogsParams>({
    page: 1,
    pageSize: 50,
    entityName: "",
    entityId: "",
    action: "",
    fromDate: "",
    toDate: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => getAuditLogs(filters),
  });

  const logs = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = filters.page ?? 1;

  function setPage(p: number) {
    setFilters((f) => ({ ...f, page: p }));
  }

  const pageNumbers = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    const start = Math.max(1, currentPage - 2);
    return start + i;
  }).filter((p) => p <= totalPages);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase mb-2">AUDIT LOGS</p>
          <h1 className="text-4xl font-medium tracking-tight text-[#111]">System activity</h1>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-colors shadow-sm ${
            showFilters ? "bg-black text-white border-black" : "bg-white text-black border-black/10 hover:bg-black/5"
          }`}
        >
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: totalCount.toLocaleString() },
          { label: "This Page", value: logs.length },
          { label: "Added", value: logs.filter((l) => l.action === "Added").length },
          { label: "Modified", value: logs.filter((l) => l.action === "Modified").length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
            <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-[#111]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-[#F5F3EC] p-6 rounded-3xl border border-black/5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-black/60">Entity Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <input
                type="text"
                placeholder="e.g. PaymentSubmission"
                className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-black/30 transition"
                value={filters.entityName}
                onChange={(e) => setFilters((f) => ({ ...f, entityName: e.target.value, page: 1 }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-black/60">Entity ID</label>
            <input
              type="text"
              placeholder="UUID..."
              className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black/30 transition"
              value={filters.entityId}
              onChange={(e) => setFilters((f) => ({ ...f, entityId: e.target.value, page: 1 }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-black/60">Action</label>
            <select
              className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black/30 transition"
              value={filters.action}
              onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value, page: 1 }))}
            >
              <option value="">All Actions</option>
              <option value="Added">Added</option>
              <option value="Modified">Modified</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-black/60">From Date</label>
            <input
              type="datetime-local"
              className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black/30 transition"
              value={filters.fromDate}
              onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value, page: 1 }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-black/60">To Date</label>
            <input
              type="datetime-local"
              className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black/30 transition"
              value={filters.toDate}
              onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value, page: 1 }))}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, pageSize: 50, entityName: "", entityId: "", action: "", fromDate: "", toDate: "" })}
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-black/5 transition-colors"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[80px_180px_120px_1fr_200px_80px] gap-4 px-6 py-4 bg-gray-50/50 border-b border-black/5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entity</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Changes Summary</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Performed By</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">View</p>
        </div>

        {isLoading && (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-6 text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{getApiErrorMessage(error)}</p>
          </div>
        )}

        {!isLoading && !error && logs.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-500">No audit log entries found.</div>
        )}

        <div className="divide-y divide-black/[0.04]">
          {!isLoading && logs.map((log) => {
            const changes = parseChanges(log.changes);
            const changesSummary = changes.map((c) => humanizeField(c.field)).slice(0, 3).join(", ");
            const moreCount = changes.length - 3;
            const entityColor = ENTITY_COLORS[log.entityName] ?? "bg-gray-50 text-gray-600";
            const actionColor = ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600 border-gray-200";

            return (
              <div
                key={log.id}
                className="flex flex-col md:grid md:grid-cols-[80px_180px_120px_1fr_200px_80px] md:items-center gap-3 md:gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors"
              >
                <span className="text-xs font-mono text-black/40 font-bold">#{log.id}</span>

                <div className="flex flex-col gap-1">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold w-fit ${entityColor}`}>
                    {log.entityName}
                  </span>
                  <p className="text-xs text-gray-400 font-mono truncate max-w-[160px]">
                    {log.entityId.slice(0, 16)}…
                  </p>
                </div>

                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border w-fit ${actionColor}`}>
                  {log.action}
                </span>

                <div className="text-sm text-[#111]">
                  {changesSummary || "—"}
                  {moreCount > 0 && <span className="text-gray-400 ml-1">+{moreCount} more</span>}
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-[#111]">{log.performedByName ?? "System"}</span>
                  <span className="text-xs text-gray-400">{fmtDate(log.occurredAt)}</span>
                </div>

                <div className="md:text-right">
                  <button
                    onClick={() => setSelectedId(log.id)}
                    className="text-xs font-bold text-black/60 hover:text-black transition-colors px-3 py-1.5 rounded-full border border-black/10 hover:border-black/30"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Page {currentPage} of {totalPages} · {totalCount.toLocaleString()} total events
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="px-3 py-1.5 text-gray-600 font-medium hover:text-gray-900 flex items-center gap-1 transition-colors text-sm disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg font-medium flex items-center justify-center text-sm transition-colors ${
                  p === currentPage ? "bg-black text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="px-3 py-1.5 text-gray-900 font-medium hover:text-black flex items-center gap-1 transition-colors border border-gray-200 rounded-full bg-white ml-2 text-sm shadow-sm disabled:opacity-30"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedId !== null && (
        <DetailDrawer logId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}


