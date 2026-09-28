"use client";

import { useMemo, useState } from "react";
import { CheckCheck, ChevronLeft, ChevronRight, Inbox, Loader2, Megaphone, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/app/lib/api-client";
import { INBOX_PAGE_SIZE, type InboxAnnouncement } from "@/app/lib/announcement-api";
import {
  useAnnouncementInbox,
  useMarkAllAnnouncementsRead,
  useMarkAnnouncementRead,
} from "@/app/lib/useAnnouncements";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const LONG_MESSAGE = 180;

/** "Just now" / "5m ago" / "3h ago" / "2d ago" / "15 Oct". `now` comes from the query, keeping render pure. */
function formatWhen(iso: string | null, now: number): string {
  const time = iso ? Date.parse(iso) : Number.NaN;
  if (Number.isNaN(time)) return "";
  const diff = now - time;
  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  const sameYear = new Date(time).getFullYear() === new Date(now).getFullYear();
  return new Date(time).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  });
}

type Group = { label: string; items: InboxAnnouncement[] };

function groupByRecency(items: InboxAnnouncement[], now: number): Group[] {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const weekStart = startOfToday - 6 * DAY;
  const today: InboxAnnouncement[] = [];
  const week: InboxAnnouncement[] = [];
  const earlier: InboxAnnouncement[] = [];

  for (const item of items) {
    const time = item.receivedAtUtc ? Date.parse(item.receivedAtUtc) : Number.NaN;
    if (Number.isNaN(time)) earlier.push(item);
    else if (time >= startOfToday) today.push(item);
    else if (time >= weekStart) week.push(item);
    else earlier.push(item);
  }

  return [
    { label: "Today", items: today },
    { label: "Earlier this week", items: week },
    { label: "Earlier", items: earlier },
  ].filter((group) => group.items.length > 0);
}

function AnnouncementCard({
  item,
  now,
  expanded,
  marking,
  onToggle,
  onMarkRead,
}: {
  item: InboxAnnouncement;
  now: number;
  expanded: boolean;
  marking: boolean;
  onToggle: () => void;
  onMarkRead: () => void;
}) {
  const isLong = item.message.length > LONG_MESSAGE;
  const when = formatWhen(item.receivedAtUtc, now);

  return (
    <li className="card-dash rounded-3xl p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className="mt-4 h-1.5 w-1.5 shrink-0" aria-hidden="true">
          {!item.isRead && (
            <span className="block h-1.5 w-1.5 rounded-full" style={{ background: "var(--dash-primary)", boxShadow: "0 0 8px var(--dash-primary)" }} />
          )}
        </div>
        <div
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "color-mix(in srgb, var(--dash-primary) 14%, transparent)", color: "var(--dash-primary)" }}
        >
          <Megaphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className={`text-sm ${item.isRead ? "font-medium" : "font-semibold"}`}>
              {item.title}
              {!item.isRead && <span className="sr-only"> (unread)</span>}
            </h3>
            {when && <span className="text-[11px] font-semibold dash-text-muted">{when}</span>}
          </div>
          {item.message && (
            <p className={`mt-1 whitespace-pre-line wrap-break-word text-[13px] dash-text-muted ${expanded ? "" : "line-clamp-3"}`}>
              {item.message}
            </p>
          )}
          {(isLong || (!item.isRead && item.id)) && (
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {isLong && (
                <button type="button" onClick={onToggle} aria-expanded={expanded} className="text-xs font-semibold underline-offset-2 hover:underline">
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
              {!item.isRead && item.id && (
                <button
                  type="button"
                  onClick={onMarkRead}
                  disabled={marking}
                  aria-label={`Mark "${item.title}" as read`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold underline-offset-2 hover:underline disabled:opacity-50"
                  style={{ color: "var(--dash-primary)" }}
                >
                  {marking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
                  Mark as read
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function LoadingList() {
  return (
    <ul className="space-y-3" aria-busy="true" aria-label="Loading announcements">
      {[0, 1, 2].map((key) => (
        <li key={key} className="card-dash animate-pulse rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl" style={{ background: "var(--dash-border)" }} />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-1/3 rounded" style={{ background: "var(--dash-border)" }} />
              <div className="h-3 w-3/4 rounded" style={{ background: "var(--dash-border)" }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NotificationsClient() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());

  const inbox = useAnnouncementInbox({ page, pageSize: INBOX_PAGE_SIZE });
  const markRead = useMarkAnnouncementRead();
  const markAll = useMarkAllAnnouncementsRead();

  const data = inbox.data;
  const now = inbox.dataUpdatedAt;
  const items = useMemo(() => data?.items ?? [], [data]);
  const unreadItems = useMemo(() => items.filter((item) => !item.isRead), [items]);
  const visible = filter === "unread" ? unreadItems : items;
  const groups = useMemo(() => groupByRecency(visible, now), [visible, now]);

  function markOneRead(id: string) {
    markRead.mutate(id, { onError: (error) => toast.error(getApiErrorMessage(error)) });
  }

  function toggle(item: InboxAnnouncement) {
    const opening = !expanded.has(item.id);
    setExpanded((current) => {
      const next = new Set(current);
      if (opening) next.add(item.id);
      else next.delete(item.id);
      return next;
    });
    if (opening && !item.isRead && item.id) markOneRead(item.id);
  }

  function markAllRead() {
    const ids = unreadItems.map((item) => item.id).filter(Boolean);
    if (ids.length === 0) return;
    markAll.mutate(ids, {
      onSuccess: ({ total, failed }) => {
        if (failed > 0) toast.error(`Couldn't mark ${failed} of ${total} as read. Try again.`);
        else toast.success(total === 1 ? "Marked as read" : `Marked ${total} as read`);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  const showPager = page > 1 || Boolean(data?.hasMore);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10" style={{ color: "var(--dash-text)" }}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Notifications</h1>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => inbox.refetch()}
            disabled={inbox.isFetching}
            aria-label="Refresh notifications"
            className="card-dash flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${inbox.isFetching ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadItems.length === 0 || markAll.isPending}
            className="card-dash inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold shadow-sm transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markAll.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
            Mark all read
          </button>
        </div>
      </div>

      <div role="group" aria-label="Filter announcements" className="card-dash flex w-fit items-center gap-1 rounded-full p-1">
        {(
          [
            { key: "all", label: "All", count: items.length },
            { key: "unread", label: "Unread", count: unreadItems.length },
          ] as const
        ).map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(tab.key)}
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-semibold transition-colors"
              style={active ? { background: "var(--dash-text)", color: "var(--dash-surface)" } : { color: "var(--dash-muted)" }}
            >
              {tab.label}
              <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: active ? "rgba(255,255,255,0.2)" : "var(--dash-border)" }}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {inbox.isPending ? (
        <LoadingList />
      ) : inbox.isError && !data ? (
        <div role="alert" className="card-dash rounded-3xl p-8 text-center">
          <p className="text-sm font-semibold">We couldn&apos;t load your notifications.</p>
          <p className="mt-1 text-sm dash-text-muted">{getApiErrorMessage(inbox.error)}</p>
          <button type="button" onClick={() => inbox.refetch()} className="btn-primary mt-5 rounded-full px-5 py-2 text-xs font-semibold">
            Try again
          </button>
        </div>
      ) : groups.length === 0 ? (
        <div className="card-dash rounded-3xl p-10 text-center">
          <Inbox className="mx-auto h-8 w-8 dash-text-muted" />
          <h2 className="mt-3 text-sm font-semibold">{filter === "unread" ? "You're all caught up" : "No announcements yet"}</h2>
          <p className="mt-1 text-sm dash-text-muted">
            {filter === "unread"
              ? "There's nothing unread on this page."
              : "When your cooperative posts an announcement, it will show up here."}
          </p>
        </div>
      ) : (
        <div className="space-y-10 pt-2">
          {groups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <p className="mb-4 pl-4 text-[10px] font-bold uppercase tracking-widest dash-text-muted">{group.label}</p>
              <ul className="space-y-3">
                {group.items.map((item, index) => (
                  <AnnouncementCard
                    key={item.id || `${group.label}-${index}`}
                    item={item}
                    now={now}
                    expanded={expanded.has(item.id)}
                    marking={markRead.isPending && markRead.variables === item.id}
                    onToggle={() => toggle(item)}
                    onMarkRead={() => markOneRead(item.id)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {showPager && (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || inbox.isFetching}
            className="card-dash inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-xs font-semibold dash-text-muted">
            Page {page}
            {data?.totalCount != null ? ` · ${data.totalCount} total` : ""}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={!data?.hasMore || inbox.isFetching}
            className="card-dash inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
