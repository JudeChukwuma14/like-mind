"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  INBOX_PAGE_SIZE,
  createAnnouncement,
  getAnnouncementInbox,
  markAnnouncementRead,
  type CreateAnnouncementPayload,
  type InboxPage,
} from "@/app/lib/announcement-api";
import { useUserAuth } from "@/app/providers/UserAuthProvider";

/** Scopes cached inboxes to the signed-in member so one member's list is never shown to another. */
function memberKey(user: { id?: string; email?: string } | null): string {
  return user?.id ?? user?.email ?? "member";
}

export const announcementKeys = {
  inboxRoot: (member: string) => ["announcements", "inbox", member] as const,
  inbox: (member: string, page: number, pageSize: number) =>
    ["announcements", "inbox", member, page, pageSize] as const,
};

// ─── Member: inbox ────────────────────────────────────────────────────────────

export function useAnnouncementInbox({
  page = 1,
  pageSize = INBOX_PAGE_SIZE,
  refetchInterval,
}: { page?: number; pageSize?: number; refetchInterval?: number } = {}) {
  const { user } = useUserAuth();
  return useQuery({
    queryKey: announcementKeys.inbox(memberKey(user), page, pageSize),
    queryFn: () => getAnnouncementInbox(page, pageSize),
    enabled: Boolean(user),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchInterval,
  });
}

/**
 * Unread count for the topbar bell. The API has no unread-count endpoint, so this
 * counts unread rows in the newest inbox page — the same cache entry the
 * notifications screen shows on its first page. Polls once a minute while the tab is visible.
 */
export function useUnreadAnnouncements() {
  const query = useAnnouncementInbox({ page: 1, pageSize: INBOX_PAGE_SIZE, refetchInterval: 60_000 });
  const unread = query.data ? query.data.items.filter((item) => !item.isRead).length : 0;
  return { unread };
}

/** Flips matching rows to read across every cached inbox page, so the UI responds instantly. */
function markReadInCache(queryClient: QueryClient, root: readonly unknown[], ids: ReadonlySet<string>) {
  const readAt = new Date().toISOString();
  queryClient.setQueriesData<InboxPage>({ queryKey: root }, (page) =>
    page
      ? {
          ...page,
          items: page.items.map((item) =>
            ids.has(item.id) && !item.isRead ? { ...item, isRead: true, readAtUtc: readAt } : item,
          ),
        }
      : page,
  );
}

/** Optimistic mark-read for one announcement; rolls back if the request fails. */
export function useMarkAnnouncementRead() {
  const queryClient = useQueryClient();
  const { user } = useUserAuth();
  const root = announcementKeys.inboxRoot(memberKey(user));

  return useMutation({
    mutationFn: (announcementId: string) => markAnnouncementRead(announcementId),
    onMutate: async (announcementId) => {
      await queryClient.cancelQueries({ queryKey: root });
      const snapshot = queryClient.getQueriesData<InboxPage>({ queryKey: root });
      markReadInCache(queryClient, root, new Set([announcementId]));
      return { snapshot };
    },
    onError: (_error, _announcementId, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: root }),
  });
}

/**
 * The API only marks one announcement at a time, so "mark all" fans out one request
 * per id. It fails outright only if every request failed; on a partial failure the
 * refetch in `onSettled` restores whichever rows are still unread.
 */
export function useMarkAllAnnouncementsRead() {
  const queryClient = useQueryClient();
  const { user } = useUserAuth();
  const root = announcementKeys.inboxRoot(memberKey(user));

  return useMutation({
    mutationFn: async (announcementIds: string[]) => {
      const results = await Promise.allSettled(announcementIds.map((id) => markAnnouncementRead(id)));
      const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
      if (results.length > 0 && failures.length === results.length) throw failures[0].reason;
      return { total: results.length, failed: failures.length };
    },
    onMutate: async (announcementIds) => {
      await queryClient.cancelQueries({ queryKey: root });
      const snapshot = queryClient.getQueriesData<InboxPage>({ queryKey: root });
      markReadInCache(queryClient, root, new Set(announcementIds));
      return { snapshot };
    },
    onError: (_error, _announcementIds, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: root }),
  });
}

// ─── Admin: create ────────────────────────────────────────────────────────────

export function useCreateAnnouncement() {
  return useMutation({
    mutationFn: ({ cooperativeId, payload }: { cooperativeId: string; payload: CreateAnnouncementPayload }) =>
      createAnnouncement(cooperativeId, payload),
  });
}
