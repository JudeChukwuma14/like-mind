import { ApiError, adminApiFetch } from "@/app/lib/api-client";

export type BulkUploadKind = "Savings" | "LoanRepayment";
export type BulkRow = Record<string, unknown>;
export type BulkPreview = {
  batchId?: string;
  data: unknown;
  raw: unknown;
  rows: BulkRow[];
  validCount?: number;
  invalidCount?: number;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function read(record: Record<string, unknown>, key: string): unknown {
  const matchingKey = Object.keys(record).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
  return matchingKey ? record[matchingKey] : undefined;
}

function accepted(response: unknown): unknown {
  if (!isRecord(response) || read(response, "success") !== false) return response;
  const message = read(response, "message");
  const statusCode = read(response, "statusCode");
  throw new ApiError(
    typeof message === "string" && message.trim() ? message : "The batch request was not accepted.",
    typeof statusCode === "number" ? statusCode : 0,
    response,
  );
}

function dataOf(response: unknown): unknown {
  return isRecord(response) && read(response, "data") !== undefined ? read(response, "data") : response;
}

/** Only an explicit batchId is safe to use in a financial Commit request. */
export function findBatchId(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  const direct = read(value, "batchId");
  if (typeof direct === "string" && UUID.test(direct.trim())) return direct.trim();
  for (const key of ["data", "batch", "preview", "result"]) {
    const nested = read(value, key);
    if (isRecord(nested)) {
      const id = findBatchId(nested);
      if (id) return id;
    }
  }
  return undefined;
}

function rowList(value: unknown): BulkRow[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value)) return [];
  for (const key of ["rows", "rowResults", "validationResults", "previewRows", "items", "results"]) {
    const candidate = read(value, key);
    if (Array.isArray(candidate)) return candidate.filter(isRecord);
  }
  const validRows = read(value, "validRows");
  const invalidRows = read(value, "invalidRows");
  if (Array.isArray(validRows) || Array.isArray(invalidRows)) {
    return [
      ...(Array.isArray(validRows) ? validRows.filter(isRecord).map((row) => ({ ...row, isValid: true })) : []),
      ...(Array.isArray(invalidRows) ? invalidRows.filter(isRecord).map((row) => ({ ...row, isValid: false })) : []),
    ];
  }
  for (const key of ["preview", "result"]) {
    const nested = rowList(read(value, key));
    if (nested.length) return nested;
  }
  return [];
}

export function rowValidity(row: BulkRow): boolean | undefined {
  for (const key of ["isValid", "valid"]) {
    const value = read(row, key);
    if (typeof value === "boolean") return value;
  }
  const status = read(row, "status");
  if (typeof status === "string") {
    if (status.toLowerCase() === "valid") return true;
    if (status.toLowerCase() === "invalid") return false;
  }
  return undefined;
}

function count(value: unknown, keys: string[]): number | undefined {
  if (!isRecord(value)) return undefined;
  for (const key of keys) {
    const candidate = read(value, key);
    if (typeof candidate === "number" && Number.isInteger(candidate) && candidate >= 0) return candidate;
  }
  return undefined;
}

export function parseBulkPreview(response: unknown): BulkPreview {
  accepted(response);
  const data = dataOf(response);
  const rows = rowList(data);
  const validCount = count(data, ["validCount", "validRowsCount", "validRowCount"]) ?? (rows.length && rows.every((row) => rowValidity(row) !== undefined) ? rows.filter((row) => rowValidity(row)).length : undefined);
  const invalidCount = count(data, ["invalidCount", "invalidRowsCount", "invalidRowCount"]) ?? (rows.length && rows.every((row) => rowValidity(row) !== undefined) ? rows.filter((row) => rowValidity(row) === false).length : undefined);
  return { batchId: findBatchId(response), data, raw: response, rows, validCount, invalidCount };
}

export function isValidBatchId(value: string): boolean {
  return UUID.test(value.trim());
}

/** The field name is exactly `file`; the browser supplies the multipart boundary. */
export async function previewBulkUpload(kind: BulkUploadKind, file: File): Promise<BulkPreview> {
  const body = new FormData();
  body.append("file", file);
  const response = await adminApiFetch<unknown>(`/api/BulkUpload/${kind}/Preview`, { method: "POST", body });
  return parseBulkPreview(response);
}

export async function commitBulkUpload(kind: BulkUploadKind, batchId: string): Promise<unknown> {
  if (!isValidBatchId(batchId)) throw new Error("A valid batch ID is required before submission.");
  return accepted(await adminApiFetch<unknown>(`/api/BulkUpload/${kind}/${encodeURIComponent(batchId.trim())}/Commit`, { method: "POST" }));
}

export async function reviewBulkUpload(kind: BulkUploadKind, batchId: string, approve: boolean, note: string): Promise<unknown> {
  if (!isValidBatchId(batchId)) throw new Error("Enter a valid batch ID to review.");
  if (!note.trim()) throw new Error("Add a review note before recording your decision.");
  return accepted(await adminApiFetch<unknown>(`/api/BulkUpload/${kind}/${encodeURIComponent(batchId.trim())}/Review`, {
    method: "POST",
    body: { approve, note: note.trim() },
  }));
}
