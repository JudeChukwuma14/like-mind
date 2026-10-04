"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, TrendingUp } from "lucide-react";
import {
  getMyInvestments,
  increaseInvestmentContribution,
  type MyInvestmentRecord,
} from "@/app/lib/investment-pool-api";
import { getApiErrorMessage } from "@/app/lib/api-client";

const PAGE_SIZE = 20;

function formatAmount(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function StatusBadge({ value }: { value: string | null }) {
  const normalized = (value ?? "").toLowerCase();
  const classes =
    normalized === "active" || normalized === "open"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : normalized === "rejected" || normalized === "closed" || normalized === "withdrawn"
        ? "bg-red-50 text-red-700 border-red-100"
        : "bg-(--accent-50) text-(--accent-700) border-(--accent-100)";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${classes}`}>
      {value || "Unknown"}
    </span>
  );
}

function IncreaseContributionForm({ investment, onDone }: { investment: MyInvestmentRecord; onDone: () => void }) {
  const [value, setValue] = useState(investment.contributionPercentage != null ? String(investment.contributionPercentage) : "");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newContributionPercentage: number) =>
      increaseInvestmentContribution(investment.poolId!, newContributionPercentage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-investments"] });
      onDone();
    },
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    mutation.mutate(parsed);
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-3 border-t pt-4" style={{ borderColor: "var(--dash-border)" }}>
      <label className="grid gap-1.5 text-xs font-semibold dash-text-muted">
        New contribution %
        <input
          type="number"
          min={investment.contributionPercentage ?? 0}
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
          className="input-dash w-32 rounded-xl px-3 py-2 text-sm outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {mutation.isPending ? "Submitting…" : "Confirm increase"}
      </button>
      <button type="button" onClick={onDone} className="rounded-full border px-5 py-2.5 text-sm font-semibold dash-text-muted" style={{ borderColor: "var(--dash-border)" }}>
        Cancel
      </button>
      {mutation.isError && (
        <p role="alert" className="w-full text-sm text-red-700">{getApiErrorMessage(mutation.error)}</p>
      )}
    </form>
  );
}

function InvestmentCard({ investment }: { investment: MyInvestmentRecord }) {
  const [increasing, setIncreasing] = useState(false);
  const canIncrease =
    investment.poolId &&
    (investment.poolStatus ?? "").toLowerCase() === "open" &&
    (investment.participationStatus ?? "").toLowerCase() === "active";

  return (
    <div className="card-dash rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold dash-text">{investment.poolName || "Investment pool"}</h3>
            <StatusBadge value={investment.poolStatus} />
          </div>
          {investment.assetClass && <p className="mt-1 text-xs dash-text-muted">{investment.assetClass}</p>}
        </div>
        {canIncrease && !increasing && (
          <button
            type="button"
            onClick={() => setIncreasing(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold dash-text hover:bg-black/5"
            style={{ borderColor: "var(--dash-border)" }}
          >
            <TrendingUp className="h-3.5 w-3.5" /> Increase contribution
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-y-5 gap-x-4 border-t pt-5 sm:grid-cols-4" style={{ borderColor: "var(--dash-border)" }}>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest dash-text-muted">Your stake</p>
          <p className="text-sm font-semibold dash-text">{formatAmount(investment.contributionAmount)}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest dash-text-muted">Contribution %</p>
          <p className="text-sm font-semibold dash-text">{investment.contributionPercentage != null ? `${investment.contributionPercentage}%` : "—"}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest dash-text-muted">Your status</p>
          <StatusBadge value={investment.participationStatus} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest dash-text-muted">Joined</p>
          <p className="text-sm font-semibold dash-text">{formatDate(investment.joinedAtUtc)}</p>
        </div>
      </div>

      {increasing && investment.poolId && (
        <IncreaseContributionForm investment={investment} onDone={() => setIncreasing(false)} />
      )}
    </div>
  );
}

export default function InvestmentsPage() {
  const [page, setPage] = useState(1);

  const investments = useQuery({
    queryKey: ["my-investments", page],
    queryFn: () => getMyInvestments({ pageNumber: page, pageSize: PAGE_SIZE }),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10 dash-text">
      <header className="relative overflow-hidden rounded-3xl bg-[#181817] p-6 text-white md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-(--accent-400)/15 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-(--accent-300)">Investments</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Your investment pools</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
            Pools you&apos;re participating in, your stake in each, and their current status.
          </p>
        </div>
      </header>

      <section className="card-dash rounded-3xl p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-(--accent-600)">Total participations</p>
        {investments.isLoading ? (
          <p role="status" className="mt-4 flex items-center gap-2 text-sm dash-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
        ) : investments.isError ? (
          <p role="alert" className="mt-4 text-sm text-red-700">{getApiErrorMessage(investments.error)}</p>
        ) : (
          <p className="mt-3 text-4xl font-bold tracking-tight">{investments.data?.totalCount ?? investments.data?.investments.length ?? 0}</p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Your pools</h2>
          <button
            type="button"
            onClick={() => investments.refetch()}
            disabled={investments.isFetching}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50"
            style={{ borderColor: "var(--dash-border)" }}
          >
            <RefreshCw className={`h-4 w-4 ${investments.isFetching ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {investments.isLoading ? (
          <div className="card-dash rounded-3xl p-10 text-center text-sm dash-text-muted">Loading your investments…</div>
        ) : investments.isError ? (
          <div role="alert" className="card-dash rounded-3xl p-10 text-center text-sm text-red-700">
            <p>{getApiErrorMessage(investments.error)}</p>
            <button type="button" onClick={() => investments.refetch()} className="mt-3 font-semibold underline">Retry</button>
          </div>
        ) : !investments.data?.investments.length ? (
          <div className="card-dash rounded-3xl p-10 text-center text-sm dash-text-muted">
            You&apos;re not participating in any investment pool yet.
          </div>
        ) : (
          <div className="space-y-4">
            {investments.data.investments.map((investment) => (
              <InvestmentCard key={investment.poolId ?? `${investment.poolName}-${investment.joinedAtUtc}`} investment={investment} />
            ))}
          </div>
        )}

        {investments.data && investments.data.hasMore !== undefined && (investments.data.hasMore || page > 1) && (
          <nav aria-label="Investment pages" className="flex items-center justify-between border-t pt-5 text-sm" style={{ borderColor: "var(--dash-border)" }}>
            <button
              type="button"
              disabled={page <= 1 || investments.isFetching}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-full border px-4 py-2 disabled:opacity-40"
              style={{ borderColor: "var(--dash-border)" }}
            >
              Previous
            </button>
            <span className="text-xs dash-text-muted">Page {page}</span>
            <button
              type="button"
              disabled={!investments.data.hasMore || investments.isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border px-4 py-2 disabled:opacity-40"
              style={{ borderColor: "var(--dash-border)" }}
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
