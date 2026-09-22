/**
 * Loan API wrappers. Request shapes are limited to the published contract.
 * Response objects remain open-ended because their schema was not supplied.
 */
import { ApiError, adminApiFetch, memberProfileApiFetch } from "@/app/lib/api-client";

/** Validation limits returned by GET /api/Loan/Calculate. */
export const LOAN_CALCULATOR_LIMITS = {
  amount: { min: 100, max: 6000 },
  tenureMonths: { min: 1, max: 60 },
} as const;

export const LOAN_STATUSES = [
  "PendingReview",
  "PendingApprovals",
  "Approved",
  "Rejected",
  "PendingDisbursementApprovals",
  "Disbursed",
  "Closed",
] as const;

export type LoanStatus = (typeof LOAN_STATUSES)[number];
export type LoanRecord = Record<string, unknown>;
export type LoanCalculationResult = Record<string, unknown>;

export type LoanPage = {
  items: LoanRecord[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ApplyForLoanPayload = {
  PrincipalAmount: number;
  TenureMonths: number;
  Purpose: string;
  /** Guarantor email addresses; the Apply endpoint rejects phone numbers. */
  GuarantorContacts?: string[];
  BankStatementFile?: File;
};

export type GetLoansParams = {
  page?: number;
  pageSize?: number;
  status?: LoanStatus | "";
  onlyMine?: boolean;
};

export type LoanApprovalTier = {
  minAmount: number;
  maxAmount: number;
  requiredApprovals: number;
};

export type RepaymentProofPayload = {
  AmountPaid: number;
  ProofFile: File;
  Note?: string;
};

type LoanRequestOptions = { method?: "GET" | "POST" | "PUT"; body?: unknown };
type Fetcher = <T>(path: string, options?: LoanRequestOptions) => Promise<T>;

function isRecord(value: unknown): value is LoanRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getCaseInsensitive(record: LoanRecord, key: string): unknown {
  const actualKey = Object.keys(record).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
  return actualKey ? record[actualKey] : undefined;
}

export function unwrapLoanResponse(value: unknown): unknown {
  if (!isRecord(value)) return value;
  const data = getCaseInsensitive(value, "data");
  return data === undefined ? value : data;
}

function unwrapSuccessfulResponse(value: unknown): unknown {
  return unwrapLoanResponse(ensureSuccessfulResponse(value));
}

export function ensureSuccessfulResponse<T>(response: T): T {
  if (!isRecord(response)) return response;
  const success = getCaseInsensitive(response, "success");
  if (success !== false) return response;
  const rawMessage = getCaseInsensitive(response, "message");
  const rawStatus = getCaseInsensitive(response, "statusCode");
  const status = typeof rawStatus === "number" ? rawStatus : Number(rawStatus);
  throw new ApiError(
    typeof rawMessage === "string" && rawMessage.trim() ? rawMessage : "The loan request was not accepted.",
    Number.isFinite(status) ? status : 0,
    response,
  );
}

function asFiniteNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalisePage(response: unknown, requestedPage = 1, requestedPageSize = 20): LoanPage {
  const data = unwrapLoanResponse(response);
  if (Array.isArray(data)) {
    const items = data.filter(isRecord);
    return { items, pageNumber: requestedPage, pageSize: requestedPageSize, totalCount: items.length, totalPages: items.length ? 1 : 0 };
  }
  if (!isRecord(data)) {
    return { items: [], pageNumber: requestedPage, pageSize: requestedPageSize, totalCount: 0, totalPages: 0 };
  }
  const rawItems = getCaseInsensitive(data, "items");
  const items = Array.isArray(rawItems) ? rawItems.filter(isRecord) : [];
  const totalCount = asFiniteNumber(getCaseInsensitive(data, "totalCount"), items.length);
  const pageSize = asFiniteNumber(getCaseInsensitive(data, "pageSize"), requestedPageSize);
  const pageNumber = asFiniteNumber(getCaseInsensitive(data, "pageNumber") ?? getCaseInsensitive(data, "page"), requestedPage);
  const totalPages = asFiniteNumber(getCaseInsensitive(data, "totalPages"), pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0);
  return { items, pageNumber, pageSize, totalCount, totalPages };
}

async function fetchLoans(fetcher: Fetcher, params: GetLoansParams = {}): Promise<LoanPage> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize), onlyMine: String(params.onlyMine ?? false) });
  if (params.status) query.set("status", params.status);
  return normalisePage(ensureSuccessfulResponse(await fetcher<unknown>(`/api/Loan?${query.toString()}`)), page, pageSize);
}

async function fetchLoan(fetcher: Fetcher, id: string): Promise<LoanRecord> {
  const data = unwrapSuccessfulResponse(await fetcher<unknown>(`/api/Loan/GetLoanByLoanId/${encodeURIComponent(id)}`));
  if (!isRecord(data)) throw new Error("The loan response was empty or invalid.");
  return data;
}

async function fetchLoanCollection(fetcher: Fetcher, path: string): Promise<LoanRecord[]> {
  const data = unwrapSuccessfulResponse(await fetcher<unknown>(path));
  if (Array.isArray(data)) return data.filter(isRecord);
  if (isRecord(data)) {
    const items = getCaseInsensitive(data, "items");
    if (Array.isArray(items)) return items.filter(isRecord);
    const firstArray = Object.values(data).find(Array.isArray);
    if (Array.isArray(firstArray)) return firstArray.filter(isRecord);
  }
  if (data == null) return [];
  throw new Error("The loan service returned an unexpected list format.");
}

export async function calculateLoan(amount: number, tenureMonths: number): Promise<LoanCalculationResult> {
  const query = new URLSearchParams({ Amount: String(amount), TenureMonths: String(tenureMonths) });
  const response = ensureSuccessfulResponse(await memberProfileApiFetch<unknown>(`/api/Loan/Calculate?${query.toString()}`));
  const data = unwrapLoanResponse(response);
  if (!isRecord(data) || Object.keys(data).length === 0) throw new Error("The calculator returned an empty response.");
  return data;
}

export async function applyForLoan(payload: ApplyForLoanPayload): Promise<unknown> {
  const formData = new FormData();
  formData.append("PrincipalAmount", String(payload.PrincipalAmount));
  formData.append("TenureMonths", String(payload.TenureMonths));
  formData.append("Purpose", payload.Purpose);
  for (const contact of payload.GuarantorContacts ?? []) formData.append("GuarantorContacts", contact);
  if (payload.BankStatementFile) formData.append("BankStatementFile", payload.BankStatementFile);
  // Loan/Apply lives on the cooperative/admin host but authenticates the
  // ordinary member, matching the member-profile client configuration.
  const response = await memberProfileApiFetch<unknown>("/api/Loan/Apply", { method: "POST", body: formData });
  return ensureSuccessfulResponse(response);
}

export function getMemberLoans(params: GetLoansParams = {}): Promise<LoanPage> { return fetchLoans(memberProfileApiFetch as Fetcher, params); }
export function getAdminLoans(params: GetLoansParams = {}): Promise<LoanPage> { return fetchLoans(adminApiFetch as Fetcher, params); }
export function getMemberLoan(id: string): Promise<LoanRecord> { return fetchLoan(memberProfileApiFetch as Fetcher, id); }
export function getAdminLoan(id: string): Promise<LoanRecord> { return fetchLoan(adminApiFetch as Fetcher, id); }

export function getMemberLoanApprovals(id: string): Promise<LoanRecord[]> {
  return fetchLoanCollection(memberProfileApiFetch as Fetcher, `/api/Loan/${encodeURIComponent(id)}/Approvals`);
}

export function getAdminLoanApprovals(id: string): Promise<LoanRecord[]> {
  return fetchLoanCollection(adminApiFetch as Fetcher, `/api/Loan/${encodeURIComponent(id)}/Approvals`);
}

export function getMemberDisbursementApprovals(id: string): Promise<LoanRecord[]> {
  return fetchLoanCollection(memberProfileApiFetch as Fetcher, `/api/Loan/${encodeURIComponent(id)}/Disbursement/Approvals`);
}

export function getAdminDisbursementApprovals(id: string): Promise<LoanRecord[]> {
  return fetchLoanCollection(adminApiFetch as Fetcher, `/api/Loan/${encodeURIComponent(id)}/Disbursement/Approvals`);
}

export function getMemberInstallments(id: string): Promise<LoanRecord[]> {
  return fetchLoanCollection(memberProfileApiFetch as Fetcher, `/api/Loan/${encodeURIComponent(id)}/Installments`);
}

export function getAdminInstallments(id: string): Promise<LoanRecord[]> {
  return fetchLoanCollection(adminApiFetch as Fetcher, `/api/Loan/${encodeURIComponent(id)}/Installments`);
}

function postAdmin(path: string, body: unknown): Promise<unknown> {
  return adminApiFetch<unknown>(path, { method: "POST", body }).then(ensureSuccessfulResponse);
}

export function initiateLoan(id: string, note: string): Promise<unknown> { return postAdmin(`/api/Loan/${encodeURIComponent(id)}/Initiate`, { note }); }
export function rejectAtTriage(id: string, note: string): Promise<unknown> { return postAdmin(`/api/Loan/${encodeURIComponent(id)}/RejectAtTriage`, { note }); }
export function approveLoan(id: string, note: string): Promise<unknown> { return postAdmin(`/api/Loan/${encodeURIComponent(id)}/Approve`, { note }); }
export function rejectLoan(id: string, note: string): Promise<unknown> { return postAdmin(`/api/Loan/${encodeURIComponent(id)}/Reject`, { note }); }
export function initiateDisbursement(id: string, disbursementReference: string): Promise<unknown> { return postAdmin(`/api/Loan/${encodeURIComponent(id)}/Disbursement/Initiate`, { disbursementReference }); }
export function approveDisbursement(disbursementId: string, note: string): Promise<unknown> { return postAdmin(`/api/Loan/Disbursement/${encodeURIComponent(disbursementId)}/Approve`, { note }); }
export function rejectDisbursement(disbursementId: string, note: string): Promise<unknown> { return postAdmin(`/api/Loan/Disbursement/${encodeURIComponent(disbursementId)}/Reject`, { note }); }

export function repayInstallment(installmentId: string, amountPaid: number): Promise<unknown> {
  return adminApiFetch<unknown>(`/api/Loan/Installments/${encodeURIComponent(installmentId)}/Repay`, { method: "POST", body: { amountPaid } }).then(ensureSuccessfulResponse);
}

export function repayFromSavings(installmentId: string, amountPaid: number): Promise<unknown> {
  return memberProfileApiFetch<unknown>(`/api/Loan/Installments/${encodeURIComponent(installmentId)}/RepayFromSavings`, {
    method: "POST",
    body: { amountPaid },
  }).then(ensureSuccessfulResponse);
}

export function submitRepaymentProof(installmentId: string, payload: RepaymentProofPayload): Promise<unknown> {
  const formData = new FormData();
  formData.append("AmountPaid", String(payload.AmountPaid));
  formData.append("ProofFile", payload.ProofFile);
  if (payload.Note?.trim()) formData.append("Note", payload.Note.trim());
  return memberProfileApiFetch<unknown>(`/api/Loan/Installments/${encodeURIComponent(installmentId)}/SubmitRepaymentProof`, {
    method: "POST",
    body: formData,
  }).then(ensureSuccessfulResponse);
}

export function reviewRepaymentClaim(claimId: string, approve: boolean, reviewNote: string): Promise<unknown> {
  return postAdmin(`/api/Loan/RepaymentClaims/${encodeURIComponent(claimId)}/Review`, { approve, reviewNote });
}

function parseTierResponse(response: unknown): LoanApprovalTier[] {
  let value = unwrapLoanResponse(response);
  if (typeof value === "string") {
    try { value = unwrapLoanResponse(JSON.parse(value)); }
    catch { throw new Error("The approval tiers response was not valid JSON."); }
  }
  if (isRecord(value)) value = getCaseInsensitive(value, "tiers");
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const minAmount = Number(getCaseInsensitive(item, "minAmount"));
    const maxAmount = Number(getCaseInsensitive(item, "maxAmount"));
    const requiredApprovals = Number(getCaseInsensitive(item, "requiredApprovals"));
    return [{ minAmount, maxAmount, requiredApprovals }].filter((tier) => Object.values(tier).every(Number.isFinite));
  });
}

export async function getLoanDisbursementTiers(): Promise<LoanApprovalTier[]> {
  return parseTierResponse(ensureSuccessfulResponse(await adminApiFetch<unknown>("/api/LoanDisbursement/Loans/Disbursement/ApprovalTiers")));
}

export function updateLoanDisbursementTiers(tiers: LoanApprovalTier[]): Promise<unknown> {
  return adminApiFetch<unknown>("/api/LoanDisbursement/Loans/Disbursement/ApprovalTiers", { method: "PUT", body: { tiers } }).then(ensureSuccessfulResponse);
}
