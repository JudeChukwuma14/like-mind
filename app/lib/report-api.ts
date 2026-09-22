import axios from "axios";
import { ApiError, adminApiClient, adminApiFetch } from "@/app/lib/api-client";
import { ensureSuccessfulResponse, unwrapLoanResponse, LOAN_STATUSES, type LoanStatus } from "@/app/lib/loan-api";

export { LOAN_STATUSES };
export type { LoanStatus };

export type ReportFormat = "csv" | "xlsx";
export type LoanPortfolioFilters = {
  status?: LoanStatus | "";
  disbursedFrom?: string;
  disbursedTo?: string;
  appliedFrom?: string;
  appliedTo?: string;
};
export type SavingsTransactionFilters = { fromDate?: string; toDate?: string };
type ReportKind = "loans" | "balance" | "transactions";

function reportPath(kind: ReportKind, cooperativeId?: string): string {
  if (kind === "loans") {
    if (!cooperativeId) throw new Error("Your admin session is missing the cooperative ID needed for this report.");
    return `/api/Report/Loans/Portfolio/${encodeURIComponent(cooperativeId)}`;
  }
  return kind === "balance" ? "/api/Report/Savings/Balance" : "/api/Report/Savings/Transactions";
}

function withQuery(path: string, params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  return query.size ? `${path}?${query.toString()}` : path;
}

function reportUrl(kind: ReportKind, filters: LoanPortfolioFilters | SavingsTransactionFilters = {}, cooperativeId?: string, format?: ReportFormat): string {
  return withQuery(reportPath(kind, cooperativeId), { ...filters, format });
}

async function getReport(path: string): Promise<unknown> {
  return unwrapLoanResponse(ensureSuccessfulResponse(await adminApiFetch<unknown>(path)));
}

export function getLoanPortfolioReport(cooperativeId: string, filters: LoanPortfolioFilters = {}): Promise<unknown> {
  return getReport(reportUrl("loans", filters, cooperativeId));
}

export function getSavingsBalanceReport(): Promise<unknown> {
  return getReport(reportUrl("balance"));
}

export function getSavingsTransactionsReport(filters: SavingsTransactionFilters = {}): Promise<unknown> {
  return getReport(reportUrl("transactions", filters));
}

function readMessage(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || !("message" in value)) return undefined;
  return typeof value.message === "string" && value.message.trim() ? value.message : undefined;
}

async function exportReport(path: string, format: ReportFormat, fileName: string): Promise<void> {
  if (!adminApiClient.defaults.baseURL) throw new Error("NEXT_PUBLIC_ADMIN_API_BASE_URL is not set. Add it to .env.local.");
  let blob: Blob;
  try {
    const response = await adminApiClient.get<Blob>(path, {
      responseType: "blob",
      headers: { Accept: format === "csv" ? "text/csv, application/octet-stream" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream" },
    });
    blob = response.data;
    if (blob.type.includes("json")) {
      const body = await blob.text();
      let payload: unknown = body;
      try { payload = JSON.parse(body); } catch { /* Preserve the backend text. */ }
      throw new ApiError(readMessage(payload) ?? "The report endpoint did not return a downloadable file.", response.status, payload);
    }
    if (blob.size === 0) throw new ApiError("The report endpoint returned an empty file.", response.status, null);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      let payload: unknown = raw;
      if (raw instanceof Blob) {
        const body = await raw.text();
        try { payload = JSON.parse(body); } catch { payload = body; }
      }
      throw new ApiError(readMessage(payload) ?? (typeof payload === "string" && payload.trim() ? payload : error.message), error.response?.status ?? 0, payload);
    }
    throw error;
  }

  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.${format}`;
    document.body.append(link);
    link.click();
    link.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

export function exportLoanPortfolioReport(cooperativeId: string, filters: LoanPortfolioFilters, format: ReportFormat): Promise<void> {
  return exportReport(reportUrl("loans", filters, cooperativeId, format), format, "loan-portfolio-report");
}

export function exportSavingsBalanceReport(format: ReportFormat): Promise<void> {
  return exportReport(reportUrl("balance", {}, undefined, format), format, "savings-balance-report");
}

export function exportSavingsTransactionsReport(filters: SavingsTransactionFilters, format: ReportFormat): Promise<void> {
  return exportReport(reportUrl("transactions", filters, undefined, format), format, "savings-transactions-report");
}
