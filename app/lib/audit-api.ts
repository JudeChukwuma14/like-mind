/**
 * audit-api.ts
 *
 * Typed wrappers for the AuditLogs admin endpoints.
 * All calls go through `adminApiFetch` (admin JWT).
 *
 * Endpoints:
 *   GET /api/AuditLogs           — paginated list
 *   GET /api/AuditLogs/{id}      — single log entry
 */

import { adminApiFetch, type ApiEnvelope } from "@/app/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuditLog = {
  id: number;
  entityName: string;
  entityId: string;
  action: string;
  /** Raw JSON string: { [field]: { Old: any; New: any } } */
  changes: string;
  performedBy: string | null;
  performedByName: string | null;
  occurredAt: string;
};

export type AuditLogPage = {
  items: AuditLog[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type GetAuditLogsParams = {
  page?: number;
  pageSize?: number;
  entityName?: string;
  entityId?: string;
  action?: string;
  performedBy?: string;
  fromDate?: string;
  toDate?: string;
};

/** Parsed version of a single change field */
export type ChangeEntry = {
  field: string;
  old: unknown;
  new: unknown;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parses the raw `changes` JSON string into a readable list of field changes.
 * Returns an empty array if parsing fails.
 */
export function parseChanges(raw: string): ChangeEntry[] {
  try {
    const obj = JSON.parse(raw) as Record<string, { Old: unknown; New: unknown }>;
    return Object.entries(obj).map(([field, { Old, New }]) => ({
      field,
      old: Old,
      new: New,
    }));
  } catch {
    return [];
  }
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/AuditLogs
 *
 * Returns a paginated list of audit log entries.
 * Requires admin authentication.
 */
export async function getAuditLogs(
  params: GetAuditLogsParams = {},
): Promise<AuditLogPage> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.entityName) q.set("entityName", params.entityName);
  if (params.entityId) q.set("entityId", params.entityId);
  if (params.action) q.set("action", params.action);
  if (params.performedBy) q.set("performedBy", params.performedBy);
  if (params.fromDate) q.set("fromDate", params.fromDate);
  if (params.toDate) q.set("toDate", params.toDate);

  const url = `/api/AuditLogs${q.toString() ? `?${q.toString()}` : ""}`;
  const res = await adminApiFetch<ApiEnvelope<AuditLogPage>>(url);

  const data = res.data;
  if (!data) return { items: [], pageNumber: 1, pageSize: 50, totalCount: 0, totalPages: 1 };
  if (Array.isArray(data)) {
    const arr = data as AuditLog[];
    return { items: arr, pageNumber: 1, pageSize: arr.length, totalCount: arr.length, totalPages: 1 };
  }
  return data as AuditLogPage;
}

/**
 * GET /api/AuditLogs/{id}
 *
 * Returns a single audit log entry by numeric ID.
 * Requires admin authentication.
 */
export async function getAuditLogById(id: number): Promise<AuditLog> {
  const res = await adminApiFetch<ApiEnvelope<AuditLog>>(`/api/AuditLogs/${id}`);
  return res.data;
}
