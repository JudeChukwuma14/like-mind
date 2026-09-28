"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { CooperativeIdStatus } from "@/app/components/CooperativeIdStatus";
import { getApiErrorMessage } from "@/app/lib/api-client";
import {
  INTERVAL_UNITS,
  PARTICIPATION_MODES,
  type CreateInvestmentPoolPayload,
  type IntervalUnit,
  type ParticipantOverride,
  type ParticipationMode,
} from "@/app/lib/investment-pool-api";
import { useCooperativeId } from "@/app/lib/useCooperativeId";
import { useInvestmentPoolPermissions } from "@/app/lib/useInvestmentPoolPermissions";
import {
  useApproveInvestmentPool,
  useCreateInvestmentPool,
  useEligibilityPreview,
  useInvestmentPool,
  useRecentInvestmentPools,
  useRejectInvestmentPool,
} from "@/app/lib/useInvestmentPools";

const LABEL = "mb-3 block text-[10px] font-bold uppercase tracking-widest admin-text-muted";
const FIELD =
  "input-admin w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[color:var(--brand)]/40";
const FIELD_INVALID = "ring-2 ring-red-400/60";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_STYLE: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  PendingApproval: "bg-amber-100 text-amber-700",
  Open: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-500",
  Rejected: "bg-red-100 text-red-700",
};

function money(value: number | null): string {
  return value === null ? "—" : `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

// ─── New pool ──────────────────────────────────────────────────────────────────

function EligibilityRulesFields({
  minTenureMonths,
  setMinTenureMonths,
  excludeActiveLoan,
  setExcludeActiveLoan,
}: {
  minTenureMonths: string;
  setMinTenureMonths: (v: string) => void;
  excludeActiveLoan: boolean;
  setExcludeActiveLoan: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="pool-min-tenure" className="mb-2 block text-xs font-semibold admin-text-muted">
          Minimum tenure (months)
        </label>
        <input
          id="pool-min-tenure"
          type="number"
          min={0}
          step={1}
          value={minTenureMonths}
          onChange={(event) => setMinTenureMonths(event.target.value)}
          placeholder="No minimum"
          className={FIELD}
        />
      </div>
      <label className="flex items-center gap-3 self-end pb-3 text-sm font-medium">
        <input
          type="checkbox"
          checked={excludeActiveLoan}
          onChange={(event) => setExcludeActiveLoan(event.target.checked)}
          className="h-5 w-5 accent-(--brand)"
        />
        Exclude members with an active loan
      </label>
    </div>
  );
}

function NewPoolForm({
  cooperativeId,
  onCreated,
}: {
  cooperativeId: string | undefined;
  onCreated: (poolId: string, name: string) => void;
}) {
  const create = useCreateInvestmentPool();
  const preview = useEligibilityPreview();
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [name, setName] = useState("");
  const [assetClass, setAssetClass] = useState("");
  const [custodian, setCustodian] = useState("");
  const [targetCapital, setTargetCapital] = useState("");
  const [indicativeYield, setIndicativeYield] = useState("");
  const [isContinuous, setIsContinuous] = useState(false);
  const [cycleLengthValue, setCycleLengthValue] = useState("12");
  const [cycleLengthUnit, setCycleLengthUnit] = useState<IntervalUnit>(INTERVAL_UNITS.months);
  const [payoutValue, setPayoutValue] = useState("");
  const [payoutUnit, setPayoutUnit] = useState<IntervalUnit>(INTERVAL_UNITS.months);
  const [contributionPercent, setContributionPercent] = useState("");
  const [participationMode, setParticipationMode] = useState<ParticipationMode>(PARTICIPATION_MODES.allEligibleMembers);
  const [minTenureMonths, setMinTenureMonths] = useState("");
  const [excludeActiveLoan, setExcludeActiveLoan] = useState(false);
  const [overrides, setOverrides] = useState<ParticipantOverride[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rules = useMemo(
    () => ({
      minTenureMonths: minTenureMonths.trim() ? Number(minTenureMonths) : null,
      excludeMembersWithActiveLoan: excludeActiveLoan,
    }),
    [minTenureMonths, excludeActiveLoan],
  );

  // Live preview: pure read, safe to re-run on every rule change (per the endpoint's own description).
  useEffect(() => {
    if (!cooperativeId) return;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      preview.mutate({ cooperativeId, rules });
    }, 400);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooperativeId, rules.minTenureMonths, rules.excludeMembersWithActiveLoan]);

  const errors = {
    name: name.trim() ? undefined : "Name the pool.",
    assetClass: assetClass.trim() ? undefined : "Describe the asset class.",
    custodian: custodian.trim() ? undefined : "Name the custodian.",
    targetCapital: Number(targetCapital) > 0 ? undefined : "Enter a target capital above zero.",
    cycleLengthValue:
      isContinuous || (Number.isInteger(Number(cycleLengthValue)) && Number(cycleLengthValue) >= 1)
        ? undefined
        : "Enter a term of at least 1.",
    contributionPercent:
      contributionPercent.trim() && Number(contributionPercent) >= 0 && Number(contributionPercent) <= 100
        ? undefined
        : "Enter a percentage between 0 and 100.",
    overrides:
      participationMode === PARTICIPATION_MODES.selectedMembers && overrides.length === 0
        ? "Add at least one member override, or switch to all eligible members."
        : overrides.some((row) => !UUID.test(row.userId))
          ? "Every override needs a valid member ID (UUID)."
          : undefined,
  };
  const show = (field: keyof typeof errors) => (submitted ? errors[field] : undefined);
  const hasErrors = Object.values(errors).some(Boolean);

  function addOverride() {
    setOverrides((rows) => [...rows, { userId: "", include: true, reason: "" }]);
  }
  function updateOverride(index: number, patch: Partial<ParticipantOverride>) {
    setOverrides((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }
  function removeOverride(index: number) {
    setOverrides((rows) => rows.filter((_, i) => i !== index));
  }

  function requestSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!cooperativeId || hasErrors) return;
    setConfirmOpen(true);
  }

  function submit() {
    if (!cooperativeId) return;
    const payload: CreateInvestmentPoolPayload = {
      name: name.trim(),
      assetClass: assetClass.trim(),
      custodian: custodian.trim(),
      targetCapital: Number(targetCapital),
      indicativeYieldPercent: indicativeYield.trim() ? Number(indicativeYield) : null,
      cycleLengthValue: isContinuous ? 0 : Number(cycleLengthValue),
      cycleLengthUnit,
      isContinuous,
      dividendPayoutIntervalValue: payoutValue.trim() ? Number(payoutValue) : null,
      dividendPayoutIntervalUnit: payoutUnit,
      defaultContributionPercentage: Number(contributionPercent),
      participationMode,
      eligibilityRules: rules,
      overrides: participationMode === PARTICIPATION_MODES.selectedMembers ? overrides : undefined,
    };

    create.mutate(
      { cooperativeId, payload },
      {
        onSuccess: (result) => {
          setConfirmOpen(false);
          if (result.poolId) {
            toast.success("Submitted for approval");
            onCreated(result.poolId, payload.name);
          } else {
            toast.success(result.message ?? "Submitted for approval, but the response had no pool id to open — look it up once you have it.");
          }
        },
        onError: (error) => {
          setConfirmOpen(false);
          toast.error(getApiErrorMessage(error));
        },
      },
    );
  }

  const busy = create.isPending;

  return (
    <form onSubmit={requestSubmit} noValidate className="space-y-8">
      {!cooperativeId && <p className="text-sm admin-text-muted">Choose a cooperative above to create a pool.</p>}
      <fieldset disabled={!cooperativeId || busy} className="space-y-8 disabled:opacity-60">
        <div className="card-admin rounded-3xl p-5 md:p-7">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest admin-text-muted">Identity</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="pool-name" className={LABEL}>Pool name</label>
              <input id="pool-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Treasury bills · Q3" className={`${FIELD} ${show("name") ? FIELD_INVALID : ""}`} />
              {show("name") && <p role="alert" className="mt-2 text-xs text-red-600">{show("name")}</p>}
            </div>
            <div>
              <label htmlFor="pool-asset-class" className={LABEL}>Asset class</label>
              <input id="pool-asset-class" value={assetClass} onChange={(e) => setAssetClass(e.target.value)} placeholder="e.g. Sovereign · short-term" className={`${FIELD} ${show("assetClass") ? FIELD_INVALID : ""}`} />
              {show("assetClass") && <p role="alert" className="mt-2 text-xs text-red-600">{show("assetClass")}</p>}
            </div>
            <div>
              <label htmlFor="pool-custodian" className={LABEL}>Custodian</label>
              <input id="pool-custodian" value={custodian} onChange={(e) => setCustodian(e.target.value)} placeholder="e.g. UBA Treasury" className={`${FIELD} ${show("custodian") ? FIELD_INVALID : ""}`} />
              {show("custodian") && <p role="alert" className="mt-2 text-xs text-red-600">{show("custodian")}</p>}
            </div>
          </div>
        </div>

        <div className="card-admin rounded-3xl p-5 md:p-7">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest admin-text-muted">Terms</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label htmlFor="pool-target-capital" className={LABEL}>Target capital</label>
              <input id="pool-target-capital" type="number" min={0} step="0.01" value={targetCapital} onChange={(e) => setTargetCapital(e.target.value)} className={`${FIELD} ${show("targetCapital") ? FIELD_INVALID : ""}`} />
              {show("targetCapital") && <p role="alert" className="mt-2 text-xs text-red-600">{show("targetCapital")}</p>}
            </div>
            <div>
              <label htmlFor="pool-yield" className={LABEL}>Indicative yield (%)</label>
              <input id="pool-yield" type="number" min={0} step="0.01" value={indicativeYield} onChange={(e) => setIndicativeYield(e.target.value)} placeholder="Optional" className={FIELD} />
            </div>
            <div>
              <label htmlFor="pool-contribution" className={LABEL}>Default contribution (%)</label>
              <input id="pool-contribution" type="number" min={0} max={100} step="0.01" value={contributionPercent} onChange={(e) => setContributionPercent(e.target.value)} className={`${FIELD} ${show("contributionPercent") ? FIELD_INVALID : ""}`} />
              {show("contributionPercent") && <p role="alert" className="mt-2 text-xs text-red-600">{show("contributionPercent")}</p>}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <span className={LABEL}>Term</span>
              <label className="mb-3 flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" checked={isContinuous} onChange={(e) => setIsContinuous(e.target.checked)} className="h-5 w-5 accent-(--brand)" />
                Continuous — no fixed term
              </label>
              {!isContinuous && (
                <div className="flex gap-3">
                  <input type="number" min={1} step={1} value={cycleLengthValue} onChange={(e) => setCycleLengthValue(e.target.value)} className={`${FIELD} w-24 ${show("cycleLengthValue") ? FIELD_INVALID : ""}`} />
                  <div className="relative flex-1">
                    <select value={cycleLengthUnit} onChange={(e) => setCycleLengthUnit(e.target.value as IntervalUnit)} className={`${FIELD} appearance-none pr-9`}>
                      {Object.values(INTERVAL_UNITS).map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 admin-text-muted" />
                  </div>
                </div>
              )}
              {show("cycleLengthValue") && <p role="alert" className="mt-2 text-xs text-red-600">{show("cycleLengthValue")}</p>}
            </div>
            <div>
              <span className={LABEL}>Dividend payout interval (optional)</span>
              <div className="flex gap-3">
                <input type="number" min={1} step={1} value={payoutValue} onChange={(e) => setPayoutValue(e.target.value)} placeholder="At maturity" className={`${FIELD} w-24`} />
                <div className="relative flex-1">
                  <select value={payoutUnit} onChange={(e) => setPayoutUnit(e.target.value as IntervalUnit)} className={`${FIELD} appearance-none pr-9`}>
                    {Object.values(INTERVAL_UNITS).map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 admin-text-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-admin rounded-3xl p-5 md:p-7">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-widest admin-text-muted">Member eligibility</h2>
          <p className="mb-5 text-xs admin-text-muted">This only submits the pool for approval — it does not open it or move any money yet.</p>
          <EligibilityRulesFields minTenureMonths={minTenureMonths} setMinTenureMonths={setMinTenureMonths} excludeActiveLoan={excludeActiveLoan} setExcludeActiveLoan={setExcludeActiveLoan} />

          <div className="mt-5 rounded-2xl border p-4 text-sm" style={{ borderColor: "var(--admin-border)" }}>
            {!cooperativeId ? (
              <span className="admin-text-muted">Choose a cooperative to preview matching members.</span>
            ) : preview.isPending ? (
              <span className="inline-flex items-center gap-2 admin-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Checking who matches…</span>
            ) : preview.isError ? (
              <span className="text-red-600">{getApiErrorMessage(preview.error)}</span>
            ) : preview.data ? (
              <span className="font-semibold">
                {preview.data.eligibleCount ?? "?"} of {preview.data.totalMembers ?? "?"} members match these rules
              </span>
            ) : (
              <span className="admin-text-muted">Preview appears here once a cooperative is selected.</span>
            )}
          </div>

          <div className="mt-6">
            <span className={LABEL}>Who can join</span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  [PARTICIPATION_MODES.allEligibleMembers, "All eligible members"],
                  [PARTICIPATION_MODES.selectedMembers, "Selected members"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setParticipationMode(value)}
                  className={participationMode === value ? "btn-primary rounded-full px-4 py-1.5 text-sm font-medium" : "rounded-full border px-4 py-1.5 text-sm font-medium admin-text-muted hover:bg-black/5"}
                  style={participationMode === value ? undefined : { borderColor: "var(--admin-border)" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {participationMode === PARTICIPATION_MODES.selectedMembers && (
            <div className="mt-5 space-y-3">
              <p className="text-xs admin-text-muted">
                There&apos;s no member picker for this yet — enter each member&apos;s ID directly. Included members join
                regardless of the rules above; excluded members are kept out even if they&apos;d otherwise match.
              </p>
              {overrides.map((row, index) => (
                <div key={index} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center" style={{ borderColor: "var(--admin-border)" }}>
                  <input
                    value={row.userId}
                    onChange={(e) => updateOverride(index, { userId: e.target.value })}
                    placeholder="Member ID (UUID)"
                    aria-invalid={Boolean(row.userId) && !UUID.test(row.userId)}
                    className={`${FIELD} flex-1 font-mono text-xs ${row.userId && !UUID.test(row.userId) ? FIELD_INVALID : ""}`}
                  />
                  <select value={row.include ? "include" : "exclude"} onChange={(e) => updateOverride(index, { include: e.target.value === "include" })} className={`${FIELD} sm:w-32`}>
                    <option value="include">Include</option>
                    <option value="exclude">Exclude</option>
                  </select>
                  <input value={row.reason ?? ""} onChange={(e) => updateOverride(index, { reason: e.target.value })} placeholder="Reason (optional)" className={`${FIELD} sm:w-48`} />
                  <button type="button" onClick={() => removeOverride(index)} aria-label="Remove override" className="shrink-0 self-start rounded-full p-2 text-red-600 hover:bg-red-50 sm:self-center">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addOverride} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold hover:bg-black/5" style={{ borderColor: "var(--admin-border)" }}>
                <Plus className="h-3.5 w-3.5" /> Add member override
              </button>
              {show("overrides") && <p role="alert" className="text-xs text-red-600">{show("overrides")}</p>}
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
          <Plus className="h-4 w-4" /> Submit for approval
        </button>
      </fieldset>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pool-confirm-title"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) setConfirmOpen(false); }}
        >
          <div className="card-admin w-full max-w-md rounded-3xl p-6 shadow-2xl" style={{ color: "var(--admin-text)" }}>
            <h2 id="pool-confirm-title" className="text-xl font-semibold">Submit this pool for approval?</h2>
            <p className="mt-2 text-sm admin-text-muted">
              This computes the participant list and creates a pending approval request. It does not open the pool
              or move any money — that only happens once enough reviewers approve.
            </p>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="admin-text-muted">Name</dt><dd className="text-right font-medium">{name.trim()}</dd></div>
              <div className="flex justify-between gap-4"><dt className="admin-text-muted">Target capital</dt><dd className="text-right font-medium">{money(Number(targetCapital) || null)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="admin-text-muted">Audience</dt><dd className="text-right font-medium">{participationMode === PARTICIPATION_MODES.allEligibleMembers ? "All eligible members" : `${overrides.length} selected member(s)`}</dd></div>
            </dl>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirmOpen(false)} disabled={busy} className="rounded-full border px-5 py-2.5 text-sm font-semibold hover:bg-black/5 disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}>Go back</button>
              <button type="button" onClick={submit} disabled={busy} className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} {busy ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

// ─── Look up a pool ────────────────────────────────────────────────────────────

function PoolDetail({ poolId }: { poolId: string }) {
  const pool = useInvestmentPool(poolId);
  const permissions = useInvestmentPoolPermissions();
  const approve = useApproveInvestmentPool();
  const reject = useRejectInvestmentPool();
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");

  function runReview() {
    if (!confirmAction) return;
    const mutation = confirmAction === "approve" ? approve : reject;
    mutation.mutate(
      { poolId, note },
      {
        onSuccess: () => {
          toast.success(confirmAction === "approve" ? "Approval recorded" : "Pool rejected");
          setConfirmAction(null);
          setNote("");
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  if (pool.isPending) {
    return <div className="card-admin flex items-center gap-3 rounded-3xl p-8 text-sm admin-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading pool…</div>;
  }
  if (pool.isError) {
    return (
      <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p>{getApiErrorMessage(pool.error)}</p>
        <button type="button" onClick={() => pool.refetch()} className="mt-3 font-semibold underline">Try again</button>
      </div>
    );
  }
  const data = pool.data!;
  const status = data.status ?? "Unknown";
  const canReview = status === "PendingApproval" && permissions.canReview;
  const busy = approve.isPending || reject.isPending;

  return (
    <div className="card-admin space-y-5 rounded-3xl p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{data.name ?? "Untitled pool"}</h2>
          <p className="mt-1 font-mono text-xs admin-text-muted">{data.id ?? poolId}</p>
        </div>
        <span className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLE[status] ?? "bg-gray-100 text-gray-700"}`}>{status}</span>
      </div>

      <dl className="grid grid-cols-2 gap-4 border-t pt-5 text-sm sm:grid-cols-3" style={{ borderColor: "var(--admin-border)" }}>
        <div><dt className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">Asset class</dt><dd className="mt-1 font-medium">{data.assetClass ?? "—"}</dd></div>
        <div><dt className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">Custodian</dt><dd className="mt-1 font-medium">{data.custodian ?? "—"}</dd></div>
        <div><dt className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">Target capital</dt><dd className="mt-1 font-medium">{money(data.targetCapital)}</dd></div>
        <div><dt className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">Contributed so far</dt><dd className="mt-1 font-medium">{money(data.totalContributed)}</dd></div>
        <div><dt className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">Participants</dt><dd className="mt-1 font-medium">{data.participantCount ?? "—"}</dd></div>
        <div><dt className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">Indicative yield</dt><dd className="mt-1 font-medium">{data.indicativeYieldPercent === null ? "—" : `${data.indicativeYieldPercent}%`}</dd></div>
      </dl>

      {status === "PendingApproval" && !permissions.canReview && !permissions.isLoading && (
        <p className="flex items-center gap-2 text-xs admin-text-muted"><ShieldAlert className="h-4 w-4" /> You don&apos;t have permission to approve or reject pools.</p>
      )}

      {canReview && (
        <div className="flex flex-wrap gap-3 border-t pt-5" style={{ borderColor: "var(--admin-border)" }}>
          <button type="button" onClick={() => setConfirmAction("approve")} disabled={busy} className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
            <CheckCircle2 className="h-4 w-4" /> Approve
          </button>
          <button type="button" onClick={() => setConfirmAction("reject")} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">
            <X className="h-4 w-4" /> Reject
          </button>
        </div>
      )}

      {confirmAction && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-confirm-title"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) setConfirmAction(null); }}
        >
          <div className="card-admin w-full max-w-md rounded-3xl p-6 shadow-2xl" style={{ color: "var(--admin-text)" }}>
            <h2 id="review-confirm-title" className="text-xl font-semibold">
              {confirmAction === "approve" ? "Record your approval?" : "Reject this pool?"}
            </h2>
            <p className="mt-2 text-sm admin-text-muted">
              {confirmAction === "approve"
                ? "Funding only happens once enough reviewers approve — this may just record one of several needed approvals."
                : "A rejection is final. It moves the pool straight to Rejected regardless of any approvals already collected, and can't be undone."}
            </p>
            {confirmAction === "reject" && (
              <div role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> This cannot be undone.
              </div>
            )}
            <label htmlFor="review-note" className="mb-2 mt-4 block text-xs font-semibold admin-text-muted">Note (optional)</label>
            <textarea id="review-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={`${FIELD} resize-y`} />
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirmAction(null)} disabled={busy} className="rounded-full border px-5 py-2.5 text-sm font-semibold hover:bg-black/5 disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}>Go back</button>
              <button
                type="button"
                onClick={runReview}
                disabled={busy}
                className={confirmAction === "approve" ? "btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-70" : "inline-flex items-center justify-center gap-2 rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-70"}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? "Saving…" : confirmAction === "approve" ? "Approve" : "Reject pool"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LookupPool({ cooperativeId }: { cooperativeId: string | undefined }) {
  const [input, setInput] = useState("");
  const [activeId, setActiveId] = useState("");
  const recent = useRecentInvestmentPools(cooperativeId ?? "");
  const pool = useInvestmentPool(activeId, Boolean(activeId));

  useEffect(() => {
    if (activeId && pool.data && cooperativeId) {
      recent.remember({ id: activeId, name: pool.data.name, cooperativeId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, pool.data, cooperativeId]);

  function load(id: string) {
    const trimmed = id.trim();
    if (!UUID.test(trimmed)) {
      toast.error("Enter a valid pool ID (UUID).");
      return;
    }
    setActiveId(trimmed);
  }

  return (
    <div className="space-y-6">
      <div className="card-admin rounded-3xl p-5 md:p-7">
        <label htmlFor="pool-lookup" className={LABEL}>Pool ID</label>
        <div className="flex gap-3">
          <input id="pool-lookup" value={input} onChange={(e) => setInput(e.target.value)} placeholder="00000000-0000-0000-0000-000000000000" className={`${FIELD} font-mono text-xs`} />
          <button type="button" onClick={() => load(input)} className="btn-primary inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
            <Search className="h-4 w-4" /> Load
          </button>
        </div>

        {recent.pools.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest admin-text-muted">Recently opened on this device</p>
            <div className="flex flex-wrap gap-2">
              {recent.pools.map((entry) => (
                <button key={entry.id} type="button" onClick={() => { setInput(entry.id); load(entry.id); }} className="rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-black/5" style={{ borderColor: "var(--admin-border)" }}>
                  {entry.name ?? entry.id.slice(0, 8)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] admin-text-muted">This list only lives in your browser — the backend has no way to list pools, only look one up by id.</p>
          </div>
        )}
      </div>

      {activeId && <PoolDetail key={activeId} poolId={activeId} />}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function InvestmentsPage() {
  const cooperative = useCooperativeId();
  const cooperativeId = cooperative.cooperativeId;
  const [tab, setTab] = useState<"new" | "lookup">("new");
  const [justCreated, setJustCreated] = useState<{ id: string; name: string } | null>(null);
  const recent = useRecentInvestmentPools(cooperativeId ?? "");

  function handleCreated(poolId: string, name: string) {
    if (cooperativeId) recent.remember({ id: poolId, name, cooperativeId });
    setJustCreated({ id: poolId, name });
    setTab("lookup");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      <header>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest admin-text-muted">Investments</p>
        <h1 className="text-4xl font-bold tracking-tight">Investment pools</h1>
        <p className="mt-2 text-sm admin-text-muted">
          There is no pool list from the backend yet — only an ID lookup. Pools you create or open here are
          remembered on this device for convenience, under &quot;Recently opened.&quot;
        </p>
      </header>

      <CooperativeIdStatus selection={cooperative} />

      {justCreated && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p><span className="font-semibold">{justCreated.name}</span> was submitted for approval. Pool ID: <span className="font-mono text-xs">{justCreated.id}</span></p>
          <button type="button" onClick={() => setJustCreated(null)} aria-label="Dismiss" className="shrink-0 rounded-full p-1 hover:bg-green-100"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div role="tablist" aria-label="Investment pool actions" className="flex w-fit gap-1 rounded-full border p-1" style={{ borderColor: "var(--admin-border)" }}>
        {(
          [
            ["new", "New pool"],
            ["lookup", "Look up a pool"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={tab === value ? "btn-primary rounded-full px-5 py-2 text-sm font-semibold" : "rounded-full px-5 py-2 text-sm font-semibold admin-text-muted hover:bg-black/5"}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "new" ? (
        <NewPoolForm cooperativeId={cooperativeId} onCreated={handleCreated} />
      ) : (
        <LookupPool cooperativeId={cooperativeId} />
      )}
    </div>
  );
}
