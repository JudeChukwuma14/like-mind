/**
 * investment-pool-api.ts
 *
 * Typed wrappers for the InvestmentPool endpoints:
 *
 *  - previewInvestmentPoolEligibility  POST /api/InvestmentPool/eligibility-preview/{cooperativeId}
 *  - createInvestmentPool              POST /api/InvestmentPool/{cooperativeId}
 *  - getInvestmentPool                 GET  /api/InvestmentPool/{poolId}
 *  - approveInvestmentPool             POST /api/InvestmentPool/{poolId}/approve
 *  - rejectInvestmentPool              POST /api/InvestmentPool/{poolId}/reject
 *  - getInvestmentPools                GET  /api/InvestmentPool                         (admin list, added later — see below)
 *  - getMyInvestments                  GET  /api/InvestmentPool/my-investments           (member, added later — see below)
 *  - increaseInvestmentContribution    POST /api/InvestmentPool/{poolId}/increase-contribution (member, added later)
 *
 * The first five are called with `adminApiFetch`: the eligibility preview and
 * create calls are scoped by `cooperativeId` (an admin managing one
 * cooperative's pools), and approve/reject require the `approveinvestmentpool`
 * permission, which only exists in the admin authorization system.
 *
 * getInvestmentPools is also `adminApiFetch` — its own description ("Works
 * regardless of the pool's current status (Draft, PendingApproval, Open,
 * Closed, Rejected)") implies full cross-status visibility, which only makes
 * sense for an admin. getMyInvestments and increaseInvestmentContribution use
 * `memberProfileApiFetch` instead — they are explicitly the authenticated
 * member's own data/actions, the same pattern applyForLoan already uses
 * successfully on this same host.
 *
 * The backend's OpenAPI spec documents every request body but gives NO
 * response schema for any of these endpoints (just "200: OK" / "200:
 * description" with no content) — every response is read defensively here,
 * the same way announcement-api.ts and notification-api.ts read undocumented
 * shapes, and every field name below is a best guess that should be checked
 * against a real response.
 */

import { adminApiFetch, memberProfileApiFetch } from "@/app/lib/api-client";
import {
  assertAccepted,
  isRecord,
  pickString,
  pluckPage,
  type UnknownRecord,
} from "@/app/lib/api-response";

// ─── Wire values (confirmed from the OpenAPI spec) ────────────────────────────

export const INTERVAL_UNITS = { days: "Days", months: "Months", years: "Years" } as const;
export type IntervalUnit = (typeof INTERVAL_UNITS)[keyof typeof INTERVAL_UNITS];

export const PARTICIPATION_MODES = {
  allEligibleMembers: "AllEligibleMembers",
  selectedMembers: "SelectedMembers",
} as const;
export type ParticipationMode = (typeof PARTICIPATION_MODES)[keyof typeof PARTICIPATION_MODES];

/**
 * The real `InvestmentPoolStatus` enum, confirmed from the OpenAPI spec's
 * component schema (used as the `status` query parameter on GET
 * /api/InvestmentPool). Includes "Approved" — a status the GET /{poolId}
 * endpoint's own description text doesn't mention, so don't trust that
 * description's wording as the full list again.
 */
export const POOL_STATUSES = ["Draft", "PendingApproval", "Approved", "Open", "Closed", "Rejected"] as const;
export type PoolStatus = (typeof POOL_STATUSES)[number];

// ─── Request types (from CreateInvestmentPoolRequest / eligibility-preview body) ──

export type EligibilityRules = {
  /** Null/omitted means no minimum tenure requirement. */
  minTenureMonths?: number | null;
  excludeMembersWithActiveLoan: boolean;
};

export type ParticipantOverride = {
  userId: string;
  /** true = force-include this member even if the eligibility rules would exclude them; false = force-exclude. */
  include: boolean;
  reason?: string | null;
};

export type CreateInvestmentPoolPayload = {
  name: string;
  assetClass: string;
  custodian: string;
  targetCapital: number;
  indicativeYieldPercent?: number | null;
  /**
   * Pool term length. The schema does not say what to send when `isContinuous`
   * is true (the field is not nullable), so this sends `0` in that case — an
   * assumption; confirm with the backend if continuous pools reject/ignore it.
   */
  cycleLengthValue: number;
  cycleLengthUnit: IntervalUnit;
  isContinuous: boolean;
  dividendPayoutIntervalValue?: number | null;
  dividendPayoutIntervalUnit: IntervalUnit;
  defaultContributionPercentage: number;
  participationMode: ParticipationMode;
  eligibilityRules: EligibilityRules;
  /** Only meaningful (and only sent) when `participationMode` is SelectedMembers. */
  overrides?: ParticipantOverride[];
};

// ─── Response types (unconfirmed — see the module doc comment) ───────────────

export type EligibilityPreviewResult = {
  eligibleCount: number | null;
  totalMembers: number | null;
  raw: UnknownRecord;
};

export type InvestmentPoolRecord = {
  id: string | null;
  name: string | null;
  assetClass: string | null;
  custodian: string | null;
  status: string | null;
  targetCapital: number | null;
  totalContributed: number | null;
  participantCount: number | null;
  indicativeYieldPercent: number | null;
  maturityDateUtc: string | null;
  createdAtUtc: string | null;
  /** The untouched response row, for fields this module doesn't model yet. */
  raw: UnknownRecord;
};

function pickNumber(sources: Array<UnknownRecord | null | undefined>, keys: string[]): number | null {
  for (const source of sources) {
    if (!source) continue;
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "number" && Number.isFinite(value)) return value;
    }
  }
  return null;
}

function dataOf(response: unknown): UnknownRecord | undefined {
  return isRecord(response) && isRecord(response.data) ? response.data : isRecord(response) ? response : undefined;
}

/** Keep all response-field knowledge for a pool row in this function. */
function toInvestmentPool(row: unknown): InvestmentPoolRecord | null {
  if (!isRecord(row)) return null;
  return {
    id: pickString([row], ["id", "poolId", "investmentPoolId"]) ?? null,
    name: pickString([row], ["name"]) ?? null,
    assetClass: pickString([row], ["assetClass"]) ?? null,
    custodian: pickString([row], ["custodian"]) ?? null,
    status: pickString([row], ["status"]) ?? null,
    targetCapital: pickNumber([row], ["targetCapital"]),
    totalContributed: pickNumber([row], ["totalContributed", "capitalRaised", "raisedAmount"]),
    participantCount: pickNumber([row], ["participantCount", "investorCount", "memberCount"]),
    indicativeYieldPercent: pickNumber([row], ["indicativeYieldPercent"]),
    maturityDateUtc: pickString([row], ["maturityDateUtc", "maturityDate"]) ?? null,
    createdAtUtc: pickString([row], ["createdAtUtc", "createdAt"]) ?? null,
    raw: row,
  };
}

export type InvestmentPoolPage = {
  pools: InvestmentPoolRecord[];
  page: number;
  pageSize: number;
  totalCount: number | null;
  hasMore: boolean;
};

/** A row from GET /my-investments — one member's participation in one pool, not the pool itself. */
export type MyInvestmentRecord = {
  poolId: string | null;
  poolName: string | null;
  assetClass: string | null;
  poolStatus: string | null;
  contributionAmount: number | null;
  contributionPercentage: number | null;
  /** The participation's own status (e.g. Active), separate from the pool's status. */
  participationStatus: string | null;
  joinedAtUtc: string | null;
  /** The untouched response row, for fields this module doesn't model yet. */
  raw: UnknownRecord;
};

export type MyInvestmentPage = {
  investments: MyInvestmentRecord[];
  page: number;
  pageSize: number;
  totalCount: number | null;
  hasMore: boolean;
};

/** Keep all response-field knowledge for a my-investments row in this function. */
function toMyInvestment(row: unknown): MyInvestmentRecord | null {
  if (!isRecord(row)) return null;
  return {
    poolId: pickString([row], ["poolId", "investmentPoolId", "id"]) ?? null,
    poolName: pickString([row], ["poolName", "name"]) ?? null,
    assetClass: pickString([row], ["assetClass"]) ?? null,
    poolStatus: pickString([row], ["poolStatus"]) ?? null,
    contributionAmount: pickNumber([row], ["contributionAmount", "amountContributed", "totalContributed"]),
    contributionPercentage: pickNumber([row], ["contributionPercentage"]),
    participationStatus: pickString([row], ["participationStatus", "status"]) ?? null,
    joinedAtUtc: pickString([row], ["joinedAtUtc", "createdAtUtc", "joinedAt"]) ?? null,
    raw: row,
  };
}

function safeId(id: string, label: string): string {
  if (!id.trim()) throw new Error(`Invalid ${label} id.`);
  return encodeURIComponent(id.trim());
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * POST /api/InvestmentPool/eligibility-preview/{cooperativeId} — pure read, no
 * side effects, safe to call on every keystroke change to the eligibility rules.
 */
export async function previewInvestmentPoolEligibility(
  cooperativeId: string,
  rules: EligibilityRules,
): Promise<EligibilityPreviewResult> {
  const raw = assertAccepted(
    await adminApiFetch<unknown>(`/api/InvestmentPool/eligibility-preview/${safeId(cooperativeId, "cooperative")}`, {
      method: "POST",
      body: rules,
    }),
    "Could not preview eligibility.",
  );
  const data = dataOf(raw) ?? {};
  return {
    eligibleCount: pickNumber([data], ["eligibleCount", "matchingCount", "qualifyingCount"]),
    totalMembers: pickNumber([data], ["totalMembers", "totalCount", "memberCount"]),
    raw: data,
  };
}

/**
 * POST /api/InvestmentPool/{cooperativeId} — submits for approval; does not open
 * the pool or move money (see the module doc comment). Returns whatever id could
 * be found in the response, defensively — there is no list endpoint to fall back
 * on if this comes back null, so the caller must show the raw response to the
 * admin in that case.
 */
export async function createInvestmentPool(
  cooperativeId: string,
  payload: CreateInvestmentPoolPayload,
): Promise<{ poolId: string | null; message: string | null; raw: unknown }> {
  const body: CreateInvestmentPoolPayload = { ...payload, name: payload.name.trim() };
  if (body.participationMode !== PARTICIPATION_MODES.selectedMembers) delete body.overrides;

  const raw = assertAccepted(
    await adminApiFetch<unknown>(`/api/InvestmentPool/${safeId(cooperativeId, "cooperative")}`, {
      method: "POST",
      body,
    }),
    "The investment pool was not accepted.",
  );
  const data = dataOf(raw);
  const poolId = data ? (pickString([data], ["id", "poolId", "investmentPoolId"]) ?? null) : null;
  const message = isRecord(raw) ? (pickString([raw], ["message"]) ?? null) : null;
  return { poolId, message, raw };
}

/** GET /api/InvestmentPool/{poolId} — works regardless of the pool's status. */
export async function getInvestmentPool(poolId: string): Promise<InvestmentPoolRecord> {
  const raw = assertAccepted(
    await adminApiFetch<unknown>(`/api/InvestmentPool/${safeId(poolId, "pool")}`),
    "Could not load the investment pool.",
  );
  const record = toInvestmentPool(dataOf(raw));
  if (!record) throw new Error("The investment pool response was not recognised.");
  return record;
}

/**
 * POST /api/InvestmentPool/{poolId}/approve — records one reviewer's approval.
 * The backend rejects this if the caller created the pool or already approved
 * it; there's no reliable way to pre-check either client-side (the response
 * shape doesn't confirm a "createdBy" field), so both surface as a normal
 * ApiError from the server.
 */
export async function approveInvestmentPool(poolId: string, note?: string): Promise<unknown> {
  return assertAccepted(
    await adminApiFetch<unknown>(`/api/InvestmentPool/${safeId(poolId, "pool")}/approve`, {
      method: "POST",
      body: note?.trim() ? { note: note.trim() } : {},
    }),
    "Could not record the approval.",
  );
}

/** POST /api/InvestmentPool/{poolId}/reject — final; cannot be undone once accepted. */
export async function rejectInvestmentPool(poolId: string, note?: string): Promise<unknown> {
  return assertAccepted(
    await adminApiFetch<unknown>(`/api/InvestmentPool/${safeId(poolId, "pool")}/reject`, {
      method: "POST",
      body: note?.trim() ? { note: note.trim() } : {},
    }),
    "Could not record the rejection.",
  );
}

export type GetInvestmentPoolsParams = {
  pageNumber?: number;
  pageSize?: number;
  status?: PoolStatus;
};

/**
 * GET /api/InvestmentPool — paginated list across all statuses (Draft,
 * PendingApproval, Open, Closed, Rejected), optionally filtered by `status`.
 * Admin-only in effect (see the module doc comment); use getMyInvestments for
 * a member's own participations instead.
 */
export async function getInvestmentPools(params: GetInvestmentPoolsParams = {}): Promise<InvestmentPoolPage> {
  const q = new URLSearchParams();
  if (params.pageNumber) q.set("pageNumber", String(params.pageNumber));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.status) q.set("status", params.status);
  const raw = assertAccepted(
    await adminApiFetch<unknown>(`/api/InvestmentPool${q.toString() ? `?${q}` : ""}`),
    "Could not load investment pools.",
  );
  const page = pluckPage(raw, params.pageNumber ?? 1, params.pageSize ?? 20, "Investment pools");
  return {
    pools: page.rows.map(toInvestmentPool).filter((row): row is InvestmentPoolRecord => row !== null),
    page: page.page,
    pageSize: page.pageSize,
    totalCount: page.totalCount,
    hasMore: page.hasMore,
  };
}

export type GetMyInvestmentsParams = {
  pageNumber?: number;
  pageSize?: number;
};

/** GET /api/InvestmentPool/my-investments — the signed-in member's own pool participations. */
export async function getMyInvestments(params: GetMyInvestmentsParams = {}): Promise<MyInvestmentPage> {
  const q = new URLSearchParams();
  if (params.pageNumber) q.set("pageNumber", String(params.pageNumber));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  const raw = assertAccepted(
    await memberProfileApiFetch<unknown>(`/api/InvestmentPool/my-investments${q.toString() ? `?${q}` : ""}`),
    "Could not load your investments.",
  );
  const page = pluckPage(raw, params.pageNumber ?? 1, params.pageSize ?? 20, "Your investments");
  return {
    investments: page.rows.map(toMyInvestment).filter((row): row is MyInvestmentRecord => row !== null),
    page: page.page,
    pageSize: page.pageSize,
    totalCount: page.totalCount,
    hasMore: page.hasMore,
  };
}

/**
 * POST /api/InvestmentPool/{poolId}/increase-contribution — lets a member
 * voluntarily raise their own contribution percentage above whatever uniform
 * rate the admin funded the pool at. Debits only the incremental difference
 * from their savings balance immediately. Only allowed while the pool is Open
 * and the participant is Active (per the endpoint's own description) — the
 * backend enforces this; this wrapper does not pre-check it.
 */
export async function increaseInvestmentContribution(poolId: string, newContributionPercentage: number): Promise<unknown> {
  return assertAccepted(
    await memberProfileApiFetch<unknown>(`/api/InvestmentPool/${safeId(poolId, "pool")}/increase-contribution`, {
      method: "POST",
      body: { newContributionPercentage },
    }),
    "Could not increase your contribution.",
  );
}
