/**
 * announcement-api.ts
 *
 * Typed wrappers for the Announcement endpoints.
 *
 *  - createAnnouncement  POST /api/Announcement/{cooperativeId}   (admin JWT)
 *  - getAnnouncementInbox GET /api/Announcement/inbox              (member JWT)
 *  - markAnnouncementRead POST /api/Announcement/{id}/mark-read    (member JWT)
 *
 * All three live on the cooperative/admin backend host
 * (NEXT_PUBLIC_ADMIN_API_BASE_URL). The two member calls use
 * `memberProfileApiFetch` — the same host, authenticated with the member's own
 * token, exactly like the loan and savings member endpoints.
 */

import { adminApiFetch, memberProfileApiFetch } from "@/app/lib/api-client";
import {
  assertAccepted,
  isRecord,
  pickBoolean,
  pickString,
  pluckPage,
} from "@/app/lib/api-response";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─── Wire values ──────────────────────────────────────────────────────────────

export const SCHEDULE_TYPES = {
  sendNow: "SendNow",
  scheduleForLater: "ScheduleForLater",
} as const;
export type ScheduleType = (typeof SCHEDULE_TYPES)[keyof typeof SCHEDULE_TYPES];

/**
 * Wire values for `audienceType`, taken from the backend's AnnouncementAudienceType
 * enum. `ByRole` pairs with `audienceRoleId`. Nothing else in the app hard-codes
 * these strings.
 */
export const AUDIENCE_TYPES = {
  allMembers: "AllMembers",
  activeOnly: "ActiveOnly",
  byRole: "ByRole",
  outstandingLoans: "OutstandingLoans",
} as const;
export type AudienceType = (typeof AUDIENCE_TYPES)[keyof typeof AUDIENCE_TYPES];

// ─── Create (admin) ───────────────────────────────────────────────────────────

export type CreateAnnouncementPayload = {
  title: string;
  message: string;
  audienceType: AudienceType;
  audienceRoleId?: string;
  sendInApp: boolean;
  sendEmail: boolean;
  /** Accepted by the API but currently a no-op — no SMS provider is wired up yet. */
  sendSms: boolean;
  scheduleType: ScheduleType;
  /** ISO-8601 UTC. Required when `scheduleType` is ScheduleForLater, ignored otherwise. */
  scheduledAtUtc?: string;
};

/** POST /api/Announcement/{cooperativeId} — dispatch now or schedule for later. */
export async function createAnnouncement(
  cooperativeId: string,
  payload: CreateAnnouncementPayload,
): Promise<unknown> {
  if (!UUID.test(cooperativeId)) {
    throw new Error("Select a valid cooperative before publishing.");
  }

  const body: CreateAnnouncementPayload = {
    ...payload,
    title: payload.title.trim(),
    message: payload.message.trim(),
  };
  if (body.scheduleType !== SCHEDULE_TYPES.scheduleForLater)
    delete body.scheduledAtUtc;
  if (body.audienceType === AUDIENCE_TYPES.byRole) {
    if (!body.audienceRoleId || !UUID.test(body.audienceRoleId)) {
      throw new Error("Choose a role to target before publishing.");
    }
  } else {
    delete body.audienceRoleId;
  }

  return assertAccepted(
    await adminApiFetch<unknown>(
      `/api/Announcement/${encodeURIComponent(cooperativeId)}`,
      {
        method: "POST",
        body,
      },
    ),
    "The announcement was not accepted.",
  );
}

// ─── Inbox (member) ───────────────────────────────────────────────────────────

/** Page size shared by the notifications screen and the topbar bell so they hit one cache entry. */
export const INBOX_PAGE_SIZE = 20;

export type InboxAnnouncement = {
  /** The announcement id — what mark-read expects. */
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  readAtUtc: string | null;
  receivedAtUtc: string | null;
};

export type InboxPage = {
  items: InboxAnnouncement[];
  page: number;
  pageSize: number;
  totalCount: number | null;
  hasMore: boolean;
};

/**
 * Maps one inbox row (an AnnouncementRecipient) to the shape the UI uses. Fields
 * may sit on the row or on a nested `announcement` object, so both are checked.
 * Keep all response-field knowledge in this function.
 */
function toInboxAnnouncement(row: unknown): InboxAnnouncement | null {
  if (!isRecord(row)) return null;
  const nested = isRecord(row.announcement) ? row.announcement : undefined;
  const sources = [row, nested];

  const readAtUtc = pickString([row], ["readAtUtc", "readAt"]) ?? null;
  return {
    id:
      pickString([row], ["announcementId"]) ??
      pickString([nested], ["id"]) ??
      pickString([row], ["id"]) ??
      "",
    title: pickString(sources, ["title", "subject"]) ?? "Announcement",
    message: pickString(sources, ["message", "body", "content"]) ?? "",
    isRead: pickBoolean([row], ["isRead", "read"]) ?? readAtUtc !== null,
    readAtUtc,
    receivedAtUtc:
      pickString(sources, [
        "sentAtUtc",
        "dispatchedAtUtc",
        "createdAtUtc",
        "createdAt",
      ]) ?? null,
  };
}

/** GET /api/Announcement/inbox?page=&pageSize= — the caller's own announcements, newest first. */
export async function getAnnouncementInbox(
  page = 1,
  pageSize = INBOX_PAGE_SIZE,
): Promise<InboxPage> {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
  const params = new URLSearchParams({
    page: String(safePage),
    pageSize: String(safeSize),
  });

  const raw = await memberProfileApiFetch<unknown>(
    `/api/Announcement/inbox?${params.toString()}`,
  );
  const paged = pluckPage(
    assertAccepted(raw, "Could not load your announcements."),
    safePage,
    safeSize,
    "The announcement inbox",
  );

  return {
    items: paged.rows
      .map(toInboxAnnouncement)
      .filter((item): item is InboxAnnouncement => item !== null),
    page: paged.page,
    pageSize: paged.pageSize,
    totalCount: paged.totalCount,
    hasMore: paged.hasMore,
  };
}

/** POST /api/Announcement/{announcementId}/mark-read — idempotent; already-read is a no-op, not an error. */
export async function markAnnouncementRead(
  announcementId: string,
): Promise<unknown> {
  if (!announcementId.trim())
    throw new Error(
      "This announcement has no id, so it can't be marked as read.",
    );
  return assertAccepted(
    await memberProfileApiFetch<unknown>(
      `/api/Announcement/${encodeURIComponent(announcementId)}/mark-read`,
      {
        method: "POST",
      },
    ),
    "Could not mark the announcement as read.",
  );
}
