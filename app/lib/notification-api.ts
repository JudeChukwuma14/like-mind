/**
 * notification-api.ts
 *
 * Typed wrappers for the Notification endpoints (entity-linked notification
 * records, separate from Announcements):
 *
 *  - getNotifications   GET   /api/Notification?pageNumber=&pageSize=&isVerified=
 *  - getNotification    GET   /api/Notification/{id}
 *  - verifyNotification PATCH /api/Notification/{id}/verify   (marks verified/read)
 *  - createNotification POST  /api/Notification
 *
 * Every call takes an explicit `scope` because the token that should call these
 * (admin or member) is decided by the screen using them, not by this module.
 * Both scopes hit the same cooperative/admin backend host.
 *
 * Response shape (from the backend's OpenAPI spec): each row is
 * `{ id: uuid, targetEntityData: { targetEntityType, notificationType,
 * targetEntityId, notificationId, isNotificationVerified, createdAtUtc, ... },
 * createdAtUtc }`, and lists come back as the standard paged envelope.
 *
 * Known backend inconsistency: the spec declares the `{id}` PATH parameter as an
 * integer, yet every notification id it returns is a UUID. Ids are therefore
 * treated as opaque strings here and passed straight through; if the by-id and
 * verify calls 400/404 for real ids, that is a backend routing/spec issue.
 */

import { adminApiFetch, memberProfileApiFetch } from "@/app/lib/api-client";
import {
  assertAccepted,
  isRecord,
  pickBoolean,
  pickString,
  pluckPage,
  type UnknownRecord,
} from "@/app/lib/api-response";

export type NotificationScope = "admin" | "member";

function fetcher(scope: NotificationScope) {
  return scope === "admin" ? adminApiFetch : memberProfileApiFetch;
}

export type NotificationRecord = {
  id: string;
  targetEntityType: string | null;
  notificationType: string | null;
  targetEntityId: string | null;
  notificationId: string | null;
  isVerified: boolean;
  createdAtUtc: string | null;
  /** The untouched response row, for fields this module doesn't model yet. */
  raw: UnknownRecord;
};

export type NotificationPage = {
  items: NotificationRecord[];
  pageNumber: number;
  pageSize: number;
  totalCount: number | null;
  hasMore: boolean;
};

export type CreateNotificationPayload = {
  targetEntityType: string;
  notificationType: string;
  targetEntityId: string;
  /** Optional in the API. */
  notificationId?: string;
};

/** Keep all response-field knowledge for notification rows in this function. */
function toNotification(row: unknown): NotificationRecord | null {
  if (!isRecord(row)) return null;
  const data = isRecord(row.targetEntityData) ? row.targetEntityData : undefined;
  const id = pickString([row], ["id"]) ?? pickString([data], ["id"]);
  if (!id) return null;
  return {
    id,
    targetEntityType: pickString([data, row], ["targetEntityType"]) ?? null,
    notificationType: pickString([data, row], ["notificationType"]) ?? null,
    targetEntityId: pickString([data, row], ["targetEntityId"]) ?? null,
    notificationId: pickString([data, row], ["notificationId"]) ?? null,
    isVerified: pickBoolean([data, row], ["isNotificationVerified", "isVerified"]) ?? false,
    createdAtUtc: pickString([row, data], ["createdAtUtc", "createdAt"]) ?? null,
    raw: row,
  };
}

function safeId(id: string): string {
  if (!id.trim()) throw new Error("Invalid notification id.");
  return encodeURIComponent(id.trim());
}

/** GET /api/Notification — omit `isVerified` to return both verified and unverified. */
export async function getNotifications(
  scope: NotificationScope,
  { pageNumber = 1, pageSize = 20, isVerified }: { pageNumber?: number; pageSize?: number; isVerified?: boolean } = {},
): Promise<NotificationPage> {
  const page = Math.max(1, Math.floor(pageNumber));
  const size = Math.min(100, Math.max(1, Math.floor(pageSize)));
  const params = new URLSearchParams({ pageNumber: String(page), pageSize: String(size) });
  if (isVerified !== undefined) params.set("isVerified", String(isVerified));

  const raw = await fetcher(scope)<unknown>(`/api/Notification?${params.toString()}`);
  const paged = pluckPage(assertAccepted(raw, "Could not load notifications."), page, size, "The notification list");

  return {
    items: paged.rows.map(toNotification).filter((item): item is NotificationRecord => item !== null),
    pageNumber: paged.page,
    pageSize: paged.pageSize,
    totalCount: paged.totalCount,
    hasMore: paged.hasMore,
  };
}

/** GET /api/Notification/{id} */
export async function getNotification(scope: NotificationScope, id: string): Promise<NotificationRecord> {
  const raw = assertAccepted(
    await fetcher(scope)<unknown>(`/api/Notification/${safeId(id)}`),
    "Could not load the notification.",
  );
  const record = toNotification(isRecord(raw) && isRecord(raw.data) ? raw.data : raw);
  if (!record) throw new Error("The notification response was not recognised.");
  return record;
}

/** PATCH /api/Notification/{id}/verify — marks a notification as verified/read. */
export async function verifyNotification(scope: NotificationScope, id: string): Promise<unknown> {
  return assertAccepted(
    await fetcher(scope)<unknown>(`/api/Notification/${safeId(id)}/verify`, { method: "PATCH" }),
    "Could not mark the notification as verified.",
  );
}

/** POST /api/Notification — creates a notification record for a target entity (replies 201). */
export async function createNotification(
  scope: NotificationScope,
  payload: CreateNotificationPayload,
): Promise<unknown> {
  return assertAccepted(
    await fetcher(scope)<unknown>("/api/Notification", { method: "POST", body: payload }),
    "The notification was not created.",
  );
}
