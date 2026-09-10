"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Mail,
  User,
  FileText,
  Send,
} from "lucide-react";
import {
  getContactMessages,
  getVerifiedContactMessages,
  getContactMessage,
  verifyContactMessage,
  replyContactMessage,
  CONTACT_SUBJECTS,
  type ContactMessage,
} from "@/app/lib/contact-api";
import { getApiErrorMessage } from "@/app/lib/api-client";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

type FilterTab = "all" | "verified" | "unverified";

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all",        label: "All"         },
  { value: "verified",   label: "Verified"    },
  { value: "unverified", label: "Not Verified" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function humanizeSubject(subject: string | null): string {
  if (!subject) return "—";
  const found = CONTACT_SUBJECTS.find((s) => s.value === subject);
  if (found) return found.label;
  // Fallback: split camelCase
  return subject.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function initialsFor(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated pulse skeleton for table rows */
function RowSkeleton() {
  return (
    <div
      className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b last:border-0"
      style={{ borderColor: "var(--admin-border)" }}
    >
      <div className="col-span-5 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full shrink-0 animate-pulse"
          style={{ background: "var(--admin-border)" }}
        />
        <div className="space-y-2 flex-1 min-w-0">
          <div
            className="h-3 rounded animate-pulse"
            style={{ background: "var(--admin-border)", width: "55%" }}
          />
          <div
            className="h-2.5 rounded animate-pulse"
            style={{ background: "var(--admin-border)", width: "40%" }}
          />
        </div>
      </div>
      <div className="col-span-3 hidden md:block">
        <div
          className="h-3 rounded animate-pulse"
          style={{ background: "var(--admin-border)", width: "70%" }}
        />
      </div>
      <div className="col-span-4 md:col-span-2 flex justify-end">
        <div
          className="h-5 w-20 rounded-full animate-pulse"
          style={{ background: "var(--admin-border)" }}
        />
      </div>
      <div className="hidden md:flex col-span-2 justify-end">
        <div
          className="h-3 w-16 rounded animate-pulse"
          style={{ background: "var(--admin-border)" }}
        />
      </div>
    </div>
  );
}

/** Verified / Not verified status badge */
function StatusBadge({ isVerified }: { isVerified: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
      style={
        isVerified
          ? { background: "#dcfce7", color: "#166534" }
          : { background: "var(--admin-border)", color: "var(--admin-muted)" }
      }
    >
      {isVerified ? (
        <>
          <CheckCircle2 className="w-2.5 h-2.5" /> Verified
        </>
      ) : (
        <>
          <Clock className="w-2.5 h-2.5" /> Not verified
        </>
      )}
    </span>
  );
}

/** Empty state block */
function EmptyState({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="p-16 flex flex-col items-center text-center gap-3">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2"
        style={{ background: "var(--admin-border)" }}
      >
        <Icon className="w-5 h-5" style={{ color: "var(--admin-muted)" }} />
      </div>
      <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>
        {title}
      </p>
      <p className="text-sm max-w-xs" style={{ color: "var(--admin-muted)" }}>
        {body}
      </p>
    </div>
  );
}

// ─── Detail Drawer ─────────────────────────────────────────────────────────────

function ContactDrawer({
  messageId,
  onClose,
  onVerified,
}: {
  messageId: string;
  onClose: () => void;
  onVerified: () => void;
}) {
  const queryClient = useQueryClient();

  const { data: message, isLoading, isError, error } = useQuery({
    queryKey: ["admin-contact-message", messageId],
    queryFn: () => getContactMessage(messageId),
    staleTime: 30_000,
  });

  const [replyMessage, setReplyMessage] = useState("");

  const replyMutation = useMutation({
    mutationFn: () => replyContactMessage(messageId, replyMessage),
    onSuccess: () => {
      toast.success("Reply sent successfully.");
      setReplyMessage("");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err) || "Unable to send reply. Please try again.");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyContactMessage(messageId),
    onSuccess: () => {
      toast.success("Message verified successfully.");
      // Invalidate the detail cache + list caches
      queryClient.invalidateQueries({ queryKey: ["admin-contact-message", messageId] });
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      onVerified();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err) || "Unable to verify this message. Please try again.");
    },
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Contact message detail"
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-y-auto custom-scrollbar"
        style={{
          width: "min(480px, 100vw)",
          background: "var(--admin-bg)",
          borderLeft: "1px solid var(--admin-border)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b shrink-0"
          style={{ borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" style={{ color: "var(--admin-primary)" }} />
            <p
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "var(--admin-muted)" }}
            >
              Contact Message
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
            style={{ color: "var(--admin-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-6">
          {/* Loading */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-2">
                  <div
                    className="h-3 rounded animate-pulse"
                    style={{ background: "var(--admin-border)", width: "30%" }}
                  />
                  <div
                    className="h-4 rounded animate-pulse"
                    style={{ background: "var(--admin-border)", width: "70%" }}
                  />
                </div>
              ))}
              <div
                className="h-24 rounded-xl animate-pulse"
                style={{ background: "var(--admin-border)" }}
              />
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertCircle className="w-8 h-8" style={{ color: "var(--admin-accent)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>
                Unable to load this message
              </p>
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                {getApiErrorMessage(error)}
              </p>
            </div>
          )}

          {/* Content */}
          {!isLoading && !isError && message && (
            <>
              {/* ── Sender ──────────────────────────────────── */}
              <div
                className="rounded-2xl border p-5 space-y-3"
                style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5" style={{ color: "var(--admin-primary)" }} />
                  <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>
                    Sender
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "var(--admin-primary)", color: "#000" }}
                  >
                    {initialsFor(message.fullName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--admin-text)" }}>
                      {message.fullName || "—"}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--admin-muted)" }}>
                      {message.email || "—"}
                    </p>
                  </div>
                </div>

                {/* Email row */}
                <div
                  className="flex items-center gap-2 pt-2 border-t"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--admin-muted)" }} />
                  <a
                    href={`mailto:${message.email ?? ""}`}
                    className="text-xs truncate hover:underline"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    {message.email || "No email provided"}
                  </a>
                </div>
              </div>

              {/* ── Message ─────────────────────────────────── */}
              <div
                className="rounded-2xl border p-5 space-y-4"
                style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" style={{ color: "var(--admin-primary)" }} />
                  <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>
                    Message
                  </p>
                </div>

                {/* Subject */}
                <div>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "var(--admin-muted)" }}>
                    Subject
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>
                    {humanizeSubject(message.subject)}
                  </p>
                </div>

                {/* Body */}
                <div>
                  <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--admin-muted)" }}>
                    Content
                  </p>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "var(--admin-text)" }}
                  >
                    {message.message || "—"}
                  </p>
                </div>
              </div>

              {/* ── Date ───────────────────────────────────────── */}
              <div
                className="rounded-2xl border p-5"
                style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-3.5 h-3.5" style={{ color: "var(--admin-primary)" }} />
                  <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>
                    Date
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  {message.createdAtUtc ? (
                    <span className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>
                      {formatDateTime(message.createdAtUtc)}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold" style={{ color: "var(--admin-muted)" }}>
                      —
                    </span>
                  )}
                </div>
              </div>
              
              {/* ── Reply action ────────────────────────────── */}
              {message.replyMessage ? (
                <div
                  className="rounded-2xl border p-5 space-y-3"
                  style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5" style={{ color: "var(--admin-primary)" }} />
                      <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>
                        Reply Sent
                      </p>
                    </div>
                    {message.repliedAtUtc && (
                      <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
                        {formatDateTime(message.repliedAtUtc)}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap p-3 rounded-xl border"
                    style={{ background: "var(--admin-bg)", borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
                  >
                    {message.replyMessage}
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-2xl border p-5 space-y-3"
                  style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Send className="w-3.5 h-3.5" style={{ color: "var(--admin-primary)" }} />
                    <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>
                      Reply
                    </p>
                  </div>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full min-h-[100px] p-3 text-sm rounded-xl border focus:outline-none transition-all custom-scrollbar"
                    style={{
                      background: "var(--admin-bg)",
                      borderColor: "var(--admin-border)",
                      color: "var(--admin-text)",
                    }}
                  />
                  <button
                    type="button"
                    id={`reply-contact-${messageId}`}
                    disabled={!replyMessage.trim() || replyMutation.isPending}
                    onClick={() => replyMutation.mutate()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "var(--admin-text)", color: "var(--admin-bg)" }}
                  >
                    {replyMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactMessagesPage() {
  const [filter, setFilter]   = useState<FilterTab>("all");
  const [page, setPage]       = useState(1);
  const [pageSize]            = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch the appropriate endpoint based on the active filter
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-contacts", filter, page, pageSize],
    queryFn: () => {
      if (filter === "verified")   return getVerifiedContactMessages(page, pageSize, true);
      if (filter === "unverified") return getVerifiedContactMessages(page, pageSize, false);
      return getContactMessages(page, pageSize);
    },
    staleTime: 30_000,
  });

  const messages = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  // Reset page when filter changes
  const handleFilterChange = (next: FilterTab) => {
    setFilter(next);
    setPage(1);
  };

  const handleRowClick = (id: string) => setSelectedId(id);

  const handleDrawerClose = () => setSelectedId(null);

  // After a successful verify: just close drawer — the list re-fetches automatically
  // via `queryClient.invalidateQueries` inside the drawer's mutation
  const handleVerified = () => {
    // Drawer stays open so admin sees the updated "Verified" status
    // The list will refresh in the background
  };

  // ── Empty-state messages ────────────────────────────────────────────────────
  const emptyStateProps = {
    all:        { title: "No contact messages yet",      body: "Messages submitted through the contact form will appear here." },
    verified:   { title: "No verified messages",         body: "There are currently no verified contact messages." },
    unverified: { title: "No unverified messages",       body: "All current contact messages have been verified." },
  }[filter];

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p
              className="text-[10px] font-bold tracking-widest uppercase mb-1"
              style={{ color: "var(--admin-muted)" }}
            >
              COMMUNICATIONS
            </p>
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>
              Contact Messages
            </h1>
            {data && (
              <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
                {totalCount} message{totalCount === 1 ? "" : "s"}
              </p>
            )}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors shrink-0"
            style={{
              borderColor: "var(--admin-border)",
              background: "var(--admin-surface)",
              color: "var(--admin-muted)",
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* ── Filter Tabs ───────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              id={`contact-filter-${tab.value}`}
              onClick={() => handleFilterChange(tab.value)}
              className="px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors border"
              style={
                filter === tab.value
                  ? { background: "var(--admin-text)", color: "var(--admin-bg)", borderColor: "var(--admin-text)" }
                  : { background: "var(--admin-surface)", color: "var(--admin-muted)", borderColor: "var(--admin-border)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Table ─────────────────────────────────────────────── */}
        <div
          className="rounded-3xl border overflow-hidden"
          style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b text-[10px] font-bold tracking-widest uppercase"
            style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}
          >
            <div className="col-span-8 md:col-span-6">Sender</div>
            <div className="col-span-0 hidden md:block md:col-span-4">Subject</div>
            <div className="col-span-4 md:col-span-2 text-right">Date</div>
          </div>

          {/* Loading rows */}
          {isLoading && (
            <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
              {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="p-10 flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-8 h-8" style={{ color: "var(--admin-accent)" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>
                  Unable to load contact messages
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                  {getApiErrorMessage(error)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && messages.length === 0 && (
            <EmptyState
              icon={MessageSquare}
              title={emptyStateProps.title}
              body={emptyStateProps.body}
            />
          )}

          {/* Data rows */}
          {!isLoading && !isError && messages.length > 0 && (
            <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
              {messages.map((msg: ContactMessage) => (
                <button
                  type="button"
                  key={msg.id}
                  id={`contact-row-${msg.id}`}
                  onClick={() => handleRowClick(msg.id)}
                  className="hover-admin-border w-full text-left grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors"
                >
                  {/* Sender */}
                  <div className="col-span-8 md:col-span-6 flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "var(--admin-primary)", color: "#000" }}
                    >
                      {initialsFor(msg.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "var(--admin-text)" }}>
                        {msg.fullName || "—"}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--admin-muted)" }}>
                        {msg.email || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="col-span-0 hidden md:block md:col-span-4 min-w-0">
                    <p className="text-sm truncate" style={{ color: "var(--admin-muted)" }}>
                      {humanizeSubject(msg.subject)}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="col-span-4 md:col-span-2 flex justify-end">
                    <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
                      {formatDate(msg.createdAtUtc)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Pagination ────────────────────────────────────────── */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Page {data.pageNumber} of {totalPages} · {totalCount} message{totalCount === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="contact-page-prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
                className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="contact-page-next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
                className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Contact Detail Drawer ─────────────────────────────── */}
      {selectedId && (
        <ContactDrawer
          messageId={selectedId}
          onClose={handleDrawerClose}
          onVerified={handleVerified}
        />
      )}
    </>
  );
}
