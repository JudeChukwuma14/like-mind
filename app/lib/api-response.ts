/**
 * api-response.ts
 *
 * Small, dependency-free helpers for reading API responses whose exact shape
 * is only partly known: HTTP 200 with `{ success: false }`, paged results that
 * come back either bare or wrapped in the standard envelope, and fields that
 * may live on the row or on a nested object.
 */

import { ApiError } from "@/app/lib/api-client";

export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** First non-empty string (numbers are stringified) for any of `keys`, checking each source in order. */
export function pickString(sources: Array<UnknownRecord | null | undefined>, keys: string[]): string | undefined {
  for (const source of sources) {
    if (!source) continue;
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value;
      if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }
  }
  return undefined;
}

export function pickBoolean(sources: Array<UnknownRecord | null | undefined>, keys: string[]): boolean | undefined {
  for (const source of sources) {
    if (!source) continue;
    for (const key of keys) {
      if (typeof source[key] === "boolean") return source[key] as boolean;
    }
  }
  return undefined;
}

function pickNumber(source: UnknownRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

/** Some endpoints answer HTTP 200 with a failed application-level envelope. Surface that as an ApiError. */
export function assertAccepted<T>(response: T, fallbackMessage: string): T {
  if (isRecord(response) && response.success === false) {
    const { message, statusCode } = response;
    throw new ApiError(
      typeof message === "string" && message.trim() ? message : fallbackMessage,
      typeof statusCode === "number" ? statusCode : 0,
      response,
    );
  }
  return response;
}

export type PagedRows = {
  rows: unknown[];
  page: number;
  pageSize: number;
  totalCount: number | null;
  hasMore: boolean;
};

/**
 * Extracts the rows and paging facts from a list response. Accepts a bare array,
 * `{ data: [...] }`, `{ items: [...] }` or `{ data: { items: [...] } }`. An
 * unrecognised body throws, so the UI shows a retryable error instead of a
 * misleading empty state.
 */
export function pluckPage(raw: unknown, page: number, pageSize: number, label: string): PagedRows {
  const outer = isRecord(raw) ? raw : undefined;
  const inner = outer && isRecord(outer.data) ? outer.data : outer;
  const rows: unknown[] | undefined = Array.isArray(raw)
    ? raw
    : outer && Array.isArray(outer.data)
      ? outer.data
      : inner && Array.isArray(inner.items)
        ? inner.items
        : undefined;

  if (!rows) {
    if (outer && outer.success === true && (outer.data === null || outer.data === undefined)) {
      return { rows: [], page, pageSize, totalCount: 0, hasMore: false };
    }
    throw new Error(`${label} returned an unexpected response.`);
  }

  const meta: UnknownRecord = outer && (Array.isArray(outer.data) || !inner) ? outer : (inner ?? {});
  const currentPage = pickNumber(meta, ["pageNumber", "page"]) ?? page;
  const size = pickNumber(meta, ["pageSize"]) ?? pageSize;
  const totalCount = pickNumber(meta, ["totalCount", "total"]) ?? null;
  const totalPages = pickNumber(meta, ["totalPages"]);
  const explicitHasNext = typeof meta.hasNextPage === "boolean" ? meta.hasNextPage : undefined;

  const hasMore =
    explicitHasNext ??
    (totalPages !== undefined
      ? currentPage < totalPages
      : totalCount !== null
        ? currentPage * size < totalCount
        : rows.length >= size);

  return { rows, page: currentPage, pageSize: size, totalCount, hasMore };
}
