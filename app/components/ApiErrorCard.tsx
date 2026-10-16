"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Themed replacement for the plain "role=alert red box + underlined retry
 * link" pattern repeated across every query error state. Self-contained (no
 * dependency on admin-/dash-surface classes) so it renders correctly on any
 * page regardless of which dashboard it's used in.
 */
export function ApiErrorCard({
  title,
  message,
  onRetry,
  retryLabel = "Try again",
  compact = false,
  className = "",
}: {
  title?: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div
        role="alert"
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/25 bg-red-500/6 p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            {title && <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{title}</p>}
            <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>{message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-red-700 active:bg-red-800"
        >
          <RefreshCw className="h-3.5 w-3.5" /> {retryLabel}
        </button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 rounded-3xl border border-red-500/25 bg-red-500/6 p-8 text-center ${className}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/15 text-red-600">
        <AlertTriangle className="h-5 w-5" />
      </span>
      {title && <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{title}</p>}
      <p className="max-w-sm text-sm font-medium" style={{ color: "var(--fg)" }}>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:bg-red-800"
      >
        <RefreshCw className="h-4 w-4" /> {retryLabel}
      </button>
    </div>
  );
}
