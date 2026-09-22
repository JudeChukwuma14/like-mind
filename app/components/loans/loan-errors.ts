import { ApiError, getApiErrorMessage } from "@/app/lib/api-client";

type ErrorPayload = Record<string, unknown>;

export type LoanErrorDetails = {
  message: string;
  fieldErrors: Partial<Record<"amount" | "tenure" | "purpose" | "guarantors" | "file", string>>;
  suggestedTenure?: number;
  reference?: string;
};

function isRecord(value: unknown): value is ErrorPayload {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function firstMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) return value.find((item): item is string => typeof item === "string" && Boolean(item.trim()));
  return undefined;
}

/** Converts ASP.NET validation and business-rule responses into form guidance. */
export function getLoanErrorDetails(error: unknown): LoanErrorDetails {
  const message = getApiErrorMessage(error);
  const fieldErrors: LoanErrorDetails["fieldErrors"] = {};
  let reference: string | undefined;

  if (error instanceof ApiError && isRecord(error.payload)) {
    const payload = error.payload;
    const errors = payload.errors;
    if (isRecord(errors)) {
      for (const [key, value] of Object.entries(errors)) {
        const fieldMessage = firstMessage(value);
        if (!fieldMessage) continue;
        const normalized = key.toLowerCase();
        if (normalized.includes("amount")) fieldErrors.amount = fieldMessage;
        else if (normalized.includes("tenure")) fieldErrors.tenure = fieldMessage;
        else if (normalized.includes("purpose")) fieldErrors.purpose = fieldMessage;
        else if (normalized.includes("guarantor")) fieldErrors.guarantors = fieldMessage;
        else if (normalized.includes("bankstatement") || normalized.includes("file")) fieldErrors.file = fieldMessage;
      }
    }
    const rawReference = payload.correlationId ?? payload.traceId;
    if (typeof rawReference === "string" && rawReference.trim()) reference = rawReference;
  }

  // Business-rule failures are commonly returned in the envelope message,
  // rather than ValidationProblemDetails. Associate them with the relevant
  // control while still displaying the server's exact explanation.
  if (!fieldErrors.tenure && /tenure|term/i.test(message)) fieldErrors.tenure = message;
  if (!fieldErrors.amount && /principal|loan amount|\bamount\b/i.test(message)) fieldErrors.amount = message;

  const maxTenureMatch = message.match(/maximum allowed (?:term|tenure) of\s+(\d+)\s+months?/i);
  const suggestedTenure = maxTenureMatch ? Number(maxTenureMatch[1]) : undefined;
  return {
    message,
    fieldErrors,
    suggestedTenure: suggestedTenure && Number.isInteger(suggestedTenure) && suggestedTenure > 0 ? suggestedTenure : undefined,
    reference,
  };
}

export function getLoanScreenError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Your session has expired. Sign in again to continue.";
    if (error.status === 403) return "You do not have access to this loan or action.";
    if (error.status === 404) return "This loan could not be found.";
    if (error.status >= 500) return "The loan service is temporarily unavailable. Please try again.";
  }
  return getApiErrorMessage(error);
}
