
import { adminApiFetch } from "@/app/lib/api-client";
import {
  assertAccepted,
  isRecord,
  pickString,
  type UnknownRecord,
} from "@/app/lib/api-response";

// ─── Wire values (confirmed from the OpenAPI spec) ────────────────────────────

export const INTERVAL_UNITS = {
  days: "Days",
  months: "Months",
  years: "Years",
} as const;
export type IntervalUnit = (typeof INTERVAL_UNITS)[keyof typeof INTERVAL_UNITS];

export const PARTICIPATION_MODES = {
  allEligibleMembers: "AllEligibleMembers",
  selectedMembers: "SelectedMembers",
} as const;
export type ParticipationMode =
  (typeof PARTICIPATION_MODES)[keyof typeof PARTICIPATION_MODES];

/**
 * From the GET /{poolId} endpoint description ("Works regardless of the pool's
 * current status (Draft, PendingApproval, Open, Closed, Rejected)"). Not a named
 * enum in the spec, so this list is the description's wording, not a schema.
 */
export const POOL_STATUSES = [
  "Draft",
  "PendingApproval",
  "Open",
  "Closed",
  "Rejected",
] as const;
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

function pickNumber(
  sources: Array<UnknownRecord | null | undefined>,
  keys: string[],
): number | null {
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
  return isRecord(response) && isRecord(response.data)
    ? response.data
    : isRecord(response)
      ? response
      : undefined;
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
    totalContributed: pickNumber(
      [row],
      ["totalContributed", "capitalRaised", "raisedAmount"],
    ),
    participantCount: pickNumber(
      [row],
      ["participantCount", "investorCount", "memberCount"],
    ),
    indicativeYieldPercent: pickNumber([row], ["indicativeYieldPercent"]),
    maturityDateUtc:
      pickString([row], ["maturityDateUtc", "maturityDate"]) ?? null,
    createdAtUtc: pickString([row], ["createdAtUtc", "createdAt"]) ?? null,
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
    await adminApiFetch<unknown>(
      `/api/InvestmentPool/eligibility-preview/${safeId(cooperativeId, "cooperative")}`,
      {
        method: "POST",
        body: rules,
      },
    ),
    "Could not preview eligibility.",
  );
  const data = dataOf(raw) ?? {};
  return {
    eligibleCount: pickNumber(
      [data],
      ["eligibleCount", "matchingCount", "qualifyingCount"],
    ),
    totalMembers: pickNumber(
      [data],
      ["totalMembers", "totalCount", "memberCount"],
    ),
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
  const body: CreateInvestmentPoolPayload = {
    ...payload,
    name: payload.name.trim(),
  };
  if (body.participationMode !== PARTICIPATION_MODES.selectedMembers)
    delete body.overrides;

  const raw = assertAccepted(
    await adminApiFetch<unknown>(
      `/api/InvestmentPool/${safeId(cooperativeId, "cooperative")}`,
      {
        method: "POST",
        body,
      },
    ),
    "The investment pool was not accepted.",
  );
  const data = dataOf(raw);
  const poolId = data
    ? (pickString([data], ["id", "poolId", "investmentPoolId"]) ?? null)
    : null;
  const message = isRecord(raw)
    ? (pickString([raw], ["message"]) ?? null)
    : null;
  return { poolId, message, raw };
}

/** GET /api/InvestmentPool/{poolId} — works regardless of the pool's status. */
export async function getInvestmentPool(
  poolId: string,
): Promise<InvestmentPoolRecord> {
  const raw = assertAccepted(
    await adminApiFetch<unknown>(
      `/api/InvestmentPool/${safeId(poolId, "pool")}`,
    ),
    "Could not load the investment pool.",
  );
  const record = toInvestmentPool(dataOf(raw));
  if (!record)
    throw new Error("The investment pool response was not recognised.");
  return record;
}

/**
 * POST /api/InvestmentPool/{poolId}/approve — records one reviewer's approval.
 * The backend rejects this if the caller created the pool or already approved
 * it; there's no reliable way to pre-check either client-side (the response
 * shape doesn't confirm a "createdBy" field), so both surface as a normal
 * ApiError from the server.
 */
export async function approveInvestmentPool(
  poolId: string,
  note?: string,
): Promise<unknown> {
  return assertAccepted(
    await adminApiFetch<unknown>(
      `/api/InvestmentPool/${safeId(poolId, "pool")}/approve`,
      {
        method: "POST",
        body: note?.trim() ? { note: note.trim() } : {},
      },
    ),
    "Could not record the approval.",
  );
}

/** POST /api/InvestmentPool/{poolId}/reject — final; cannot be undone once accepted. */
export async function rejectInvestmentPool(
  poolId: string,
  note?: string,
): Promise<unknown> {
  return assertAccepted(
    await adminApiFetch<unknown>(
      `/api/InvestmentPool/${safeId(poolId, "pool")}/reject`,
      {
        method: "POST",
        body: note?.trim() ? { note: note.trim() } : {},
      },
    ),
    "Could not record the rejection.",
  );
}
