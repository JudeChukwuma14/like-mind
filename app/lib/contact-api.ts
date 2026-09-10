/**
 * contact-api.ts
 *
 * Typed wrappers for every Contact backend endpoint.
 * The public POST uses `adminApiFetch` because /api/Contact lives on the
 * cooperative/admin backend (NEXT_PUBLIC_ADMIN_API_BASE_URL), same host as
 * Members, Roles, etc. Do not add token handling here — the client already
 * injects the admin JWT via interceptor.
 *
 * Endpoint base: NEXT_PUBLIC_ADMIN_API_BASE_URL
 */

import { adminApiFetch, type ApiEnvelope } from "@/app/lib/api-client";

// ─── Shared types ─────────────────────────────────────────────────────────────

/**
 * Subject options accepted by the API.
 * Mapped to human-readable labels in the UI.
 */
export const CONTACT_SUBJECTS = [
  { value: "MembershipApplication", label: "Membership application" },
  { value: "GeneralInquiry",        label: "General inquiries"      },
  { value: "Partnership",           label: "Partnerships"           },
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]["value"];

/** Shape of a contact message as returned by the list / detail endpoints. */
export type ContactMessage = {
  id: string;
  fullName: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  isVerified: boolean;
  createdAtUtc: string | null;
  replyMessage: string | null;
  repliedAtUtc: string | null;
};

/** Paginated response returned by GET /api/Contact and GET /api/Contact/Verified */
export type ContactPage = {
  items: ContactMessage[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

// ─── Payload types ────────────────────────────────────────────────────────────

export type SubmitContactPayload = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  agreeToPrivacyPolicy: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Defensively extract a paginated result from the raw API envelope.
 * Different endpoints may return the page wrapper directly in `data` or
 * one level deeper; this handles both shapes and logs unexpected ones.
 */
function pluckContactPage(raw: unknown, pageNumber: number, pageSize: number): ContactPage {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  // Try data.items first (standard envelope), then data directly.
  const data =
    obj.data && typeof obj.data === "object"
      ? (obj.data as Record<string, unknown>)
      : obj;

  if (Array.isArray(data.items)) {
    return {
      items: data.items as ContactMessage[],
      pageNumber: typeof data.pageNumber === "number" ? data.pageNumber : pageNumber,
      pageSize:   typeof data.pageSize   === "number" ? data.pageSize   : pageSize,
      totalCount: typeof data.totalCount === "number" ? data.totalCount : (data.items as unknown[]).length,
      totalPages: typeof data.totalPages === "number" ? data.totalPages : 1,
    };
  }

  // If the response is itself an array (no wrapper)
  if (Array.isArray(data)) {
    return {
      items: data as ContactMessage[],
      pageNumber,
      pageSize,
      totalCount: (data as unknown[]).length,
      totalPages: 1,
    };
  }

  console.info("[ContactAPI] Unexpected response shape:", raw);
  return { items: [], pageNumber, pageSize, totalCount: 0, totalPages: 1 };
}

// ─── API functions ────────────────────────────────────────────────────────────

/** POST /api/Contact — submit a public contact message (no auth required by backend) */
export async function submitContactMessage(
  payload: SubmitContactPayload,
): Promise<unknown> {
  return adminApiFetch<unknown>("/api/Contact", {
    method: "POST",
    body: payload,
  });
}

/** GET /api/Contact?pageNumber=&pageSize= — list all contact messages */
export async function getContactMessages(
  pageNumber: number,
  pageSize: number,
): Promise<ContactPage> {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize:   String(pageSize),
  });
  const raw = await adminApiFetch<unknown>(`/api/Contact?${params.toString()}`);
  return pluckContactPage(raw, pageNumber, pageSize);
}

/** GET /api/Contact/{id} — fetch a single contact message by ID */
export async function getContactMessage(id: string): Promise<ContactMessage> {
  const raw = await adminApiFetch<ApiEnvelope<ContactMessage>>(
    `/api/Contact/${encodeURIComponent(id)}`,
  );
  // Prefer the envelope `data` field; fall back to the raw response itself.
  return (raw.data ?? raw) as ContactMessage;
}

/**
 * GET /api/Contact/Verified?IsVerified=&pageNumber=&pageSize=
 * Filter messages by verification status.
 */
export async function getVerifiedContactMessages(
  pageNumber: number,
  pageSize: number,
  isVerified: boolean,
): Promise<ContactPage> {
  const params = new URLSearchParams({
    IsVerified: String(isVerified),
    pageNumber:  String(pageNumber),
    pageSize:    String(pageSize),
  });
  const raw = await adminApiFetch<unknown>(
    `/api/Contact/Verified?${params.toString()}`,
  );
  return pluckContactPage(raw, pageNumber, pageSize);
}

/** PATCH /api/Contact/{id}/verify — mark a contact message as verified */
export async function verifyContactMessage(id: string): Promise<unknown> {
  return adminApiFetch<unknown>(`/api/Contact/${encodeURIComponent(id)}/verify`, {
    method: "PATCH",
  });
}

/** POST /api/Contact/{id}/Reply — reply to a contact message */
export async function replyContactMessage(id: string, replyMessage: string): Promise<unknown> {
  return adminApiFetch<unknown>(`/api/Contact/${encodeURIComponent(id)}/Reply`, {
    method: "POST",
    body: { replyMessage },
  });
}
