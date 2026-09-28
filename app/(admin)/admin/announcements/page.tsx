"use client";

import { useState, type FormEvent } from "react";
import { CalendarClock, Loader2, Mail, Megaphone, Send, Smartphone, X, Bell } from "lucide-react";
import toast from "react-hot-toast";
import { CooperativeIdStatus } from "@/app/components/CooperativeIdStatus";
import { getApiErrorMessage } from "@/app/lib/api-client";
import {
  AUDIENCE_TYPES,
  SCHEDULE_TYPES,
  type CreateAnnouncementPayload,
} from "@/app/lib/announcement-api";
import { useCreateAnnouncement } from "@/app/lib/useAnnouncements";
import { useCooperativeId } from "@/app/lib/useCooperativeId";

const LABEL = "mb-3 block text-[10px] font-bold uppercase tracking-widest admin-text-muted";
const FIELD =
  "input-admin w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[color:var(--brand)]/40";
const FIELD_INVALID = "ring-2 ring-red-400/60";
const MIN_LEAD_MS = 60_000;

export default function AnnouncementsPage() {
  const cooperative = useCooperativeId();
  const cooperativeId = cooperative.cooperativeId;
  const create = useCreateAnnouncement();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendInApp, setSendInApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [when, setWhen] = useState<"now" | "later">("now");
  const [scheduledLocal, setScheduledLocal] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scheduleTimeError, setScheduleTimeError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const scheduledAt = when === "later" && scheduledLocal ? new Date(scheduledLocal) : null;
  const scheduledLabel =
    scheduledAt && !Number.isNaN(scheduledAt.getTime())
      ? scheduledAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
      : null;

  const errors = {
    title: title.trim() ? undefined : "Add a title.",
    message: message.trim() ? undefined : "Write the message members will read.",
    channels: sendInApp || sendEmail ? undefined : "Choose at least one channel.",
    schedule: when === "later" && !scheduledLabel ? "Pick a date and time." : (scheduleTimeError ?? undefined),
  };
  const show = (field: keyof typeof errors) => (submitted ? errors[field] : undefined);
  const channelNames = [sendInApp && "In-app", sendEmail && "Email"].filter(Boolean) as string[];

  function resetForm() {
    setTitle("");
    setMessage("");
    setSendInApp(true);
    setSendEmail(true);
    setWhen("now");
    setScheduledLocal("");
    setSubmitted(false);
    setScheduleTimeError(null);
  }

  function requestPublish(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitted(true);
    if (!cooperativeId) return;

    const firstInvalid = errors.title
      ? "announcement-title"
      : errors.message
        ? "announcement-message"
        : errors.schedule
          ? "announcement-when"
          : null;
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    if (errors.channels) return;

    if (scheduledAt && scheduledAt.getTime() <= Date.now() + MIN_LEAD_MS) {
      setScheduleTimeError("Choose a time at least a minute from now.");
      document.getElementById("announcement-when")?.focus();
      return;
    }
    setScheduleTimeError(null);
    setConfirmOpen(true);
  }

  function publish() {
    if (!cooperativeId) return;
    const payload: CreateAnnouncementPayload = {
      title: title.trim(),
      message: message.trim(),
      audienceType: AUDIENCE_TYPES.allMembers,
      sendInApp,
      sendEmail,
      sendSms: false,
      scheduleType: when === "later" ? SCHEDULE_TYPES.scheduleForLater : SCHEDULE_TYPES.sendNow,
      ...(when === "later" && scheduledAt ? { scheduledAtUtc: scheduledAt.toISOString() } : {}),
    };

    create.mutate(
      { cooperativeId, payload },
      {
        onSuccess: () => {
          toast.success(when === "later" ? "Announcement scheduled" : "Announcement published");
          setConfirmOpen(false);
          resetForm();
        },
        onError: (error) => {
          setConfirmOpen(false);
          setSubmitError(getApiErrorMessage(error));
        },
      },
    );
  }

  const busy = create.isPending;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest admin-text-muted">Announcements</p>
          <h1 className="text-4xl font-bold tracking-tight">New announcement</h1>
        </div>
        <button
          type="submit"
          form="announcement-form"
          disabled={!cooperativeId || busy}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {when === "later" ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {when === "later" ? "Schedule announcement" : "Publish announcement"}
        </button>
      </header>

      <CooperativeIdStatus selection={cooperative} />

      {submitError && (
        <div role="alert" className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="whitespace-pre-line">{submitError}</p>
          <button type="button" onClick={() => setSubmitError(null)} aria-label="Dismiss error" className="shrink-0 rounded-full p-1 hover:bg-red-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Form column */}
        <form id="announcement-form" onSubmit={requestPublish} noValidate className="col-span-1 lg:col-span-7">
          {!cooperativeId && (
            <p className="mb-6 text-sm admin-text-muted">Choose a cooperative above to write an announcement.</p>
          )}
          <fieldset disabled={!cooperativeId || busy} className="min-w-0 space-y-8 disabled:opacity-60">
            <div>
              <label htmlFor="announcement-title" className={LABEL}>Title</label>
              <input
                id="announcement-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. April cycle closes Friday"
                autoComplete="off"
                aria-invalid={Boolean(show("title"))}
                aria-describedby={show("title") ? "announcement-title-error" : undefined}
                className={`${FIELD} font-medium ${show("title") ? FIELD_INVALID : ""}`}
              />
              {show("title") && <p id="announcement-title-error" role="alert" className="mt-2 text-xs text-red-600">{show("title")}</p>}
            </div>

            <div>
              <label htmlFor="announcement-message" className={LABEL}>Message</label>
              <textarea
                id="announcement-message"
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="What should members know, and what do you need them to do?"
                aria-invalid={Boolean(show("message"))}
                aria-describedby={show("message") ? "announcement-message-error" : undefined}
                className={`${FIELD} resize-y ${show("message") ? FIELD_INVALID : ""}`}
              />
              {show("message") && <p id="announcement-message-error" role="alert" className="mt-2 text-xs text-red-600">{show("message")}</p>}
            </div>

            <div>
              <span className={LABEL}>Audience</span>
              <span className="btn-primary inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium">All members</span>
              <p className="mt-2 text-xs admin-text-muted">Every member of the selected cooperative receives this announcement.</p>
            </div>

            <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
              <div>
                <span className={LABEL}>Channels</span>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                    <input type="checkbox" checked={sendInApp} onChange={(event) => setSendInApp(event.target.checked)} className="h-5 w-5 accent-(--brand)" />
                    <Bell className="h-4 w-4 admin-text-muted" /> In-app
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                    <input type="checkbox" checked={sendEmail} onChange={(event) => setSendEmail(event.target.checked)} className="h-5 w-5 accent-(--brand)" />
                    <Mail className="h-4 w-4 admin-text-muted" /> Email
                  </label>
                  <label className="flex cursor-not-allowed items-center gap-3 text-sm opacity-60">
                    <input type="checkbox" disabled className="h-5 w-5" />
                    <Smartphone className="h-4 w-4" /> SMS
                    <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ borderColor: "var(--admin-border)" }}>Not available yet</span>
                  </label>
                </div>
                {show("channels") && <p role="alert" className="mt-3 text-xs text-red-600">{show("channels")}</p>}
              </div>

              <div className="min-w-0 flex-1">
                <span className={LABEL}>Schedule</span>
                <div role="radiogroup" aria-label="Delivery time" className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                    <input type="radio" name="announcement-schedule" checked={when === "now"} onChange={() => { setWhen("now"); setScheduleTimeError(null); }} className="h-5 w-5 accent-(--brand)" />
                    Send now
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                    <input type="radio" name="announcement-schedule" checked={when === "later"} onChange={() => setWhen("later")} className="h-5 w-5 accent-(--brand)" />
                    Schedule for later
                  </label>
                </div>
                {when === "later" && (
                  <div className="mt-4">
                    <label htmlFor="announcement-when" className="sr-only">Send date and time</label>
                    <input
                      id="announcement-when"
                      type="datetime-local"
                      value={scheduledLocal}
                      onChange={(event) => { setScheduledLocal(event.target.value); setScheduleTimeError(null); }}
                      aria-invalid={Boolean(show("schedule"))}
                      aria-describedby="announcement-when-hint"
                      className={`${FIELD} ${show("schedule") ? FIELD_INVALID : ""}`}
                    />
                    <p id="announcement-when-hint" className="mt-2 text-xs admin-text-muted">
                      Uses your local time ({Intl.DateTimeFormat().resolvedOptions().timeZone}). Sent to members at that moment.
                    </p>
                    {show("schedule") && <p role="alert" className="mt-2 text-xs text-red-600">{show("schedule")}</p>}
                  </div>
                )}
              </div>
            </div>
          </fieldset>
        </form>

        {/* Preview column */}
        <aside className="col-span-1 lg:col-span-5" aria-label="Announcement preview">
          <span className={LABEL}>Preview · member app</span>
          <div className="card-admin mx-auto w-full max-w-sm rounded-2xl p-5 shadow-sm lg:mx-0">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--brand)", color: "var(--brand-fg)" }}>
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold">Cooperative admin</h4>
                <p className="mt-0.5 text-xs admin-text-muted">
                  {when === "later" ? (scheduledLabel ? `Scheduled · ${scheduledLabel}` : "Scheduled") : "Just now"} · to all members
                </p>
              </div>
            </div>
            <div className="mt-5">
              <h3 className="wrap-break-word text-lg font-bold">
                {title.trim() || <span className="font-medium admin-text-muted">Your title appears here</span>}
              </h3>
              <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
                {message.trim() || <span className="admin-text-muted">Your message appears here.</span>}
              </p>
            </div>
            {channelNames.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {channelNames.map((name) => (
                  <span key={name} className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider admin-text-muted" style={{ borderColor: "var(--admin-border)" }}>{name}</span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-confirm-title"
          onKeyDown={(event) => { if (event.key === "Escape" && !busy) setConfirmOpen(false); }}
          onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setConfirmOpen(false); }}
        >
          <div className="card-admin w-full max-w-md rounded-3xl p-6 shadow-2xl" style={{ color: "var(--admin-text)" }}>
            <h2 id="announcement-confirm-title" className="text-xl font-semibold">
              {when === "later" ? "Schedule this announcement?" : "Publish to all members?"}
            </h2>
            <p className="mt-2 text-sm admin-text-muted">
              {when === "later"
                ? "It will be sent automatically at the time below. Review the details before confirming."
                : "It is delivered right away and can't be recalled once sent."}
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="admin-text-muted">To</dt><dd className="text-right font-medium">All members</dd></div>
              <div className="flex justify-between gap-4"><dt className="shrink-0 admin-text-muted">Cooperative</dt><dd className="truncate font-mono text-xs">{cooperativeId}</dd></div>
              <div className="flex justify-between gap-4"><dt className="admin-text-muted">Channels</dt><dd className="text-right font-medium">{channelNames.join(", ")}</dd></div>
              <div className="flex justify-between gap-4"><dt className="admin-text-muted">Delivery</dt><dd className="text-right font-medium">{when === "later" ? (scheduledLabel ?? "Scheduled") : "Immediately"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="admin-text-muted">Title</dt><dd className="wrap-break-word text-right font-medium">{title.trim()}</dd></div>
            </dl>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" autoFocus onClick={() => setConfirmOpen(false)} disabled={busy} className="rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:bg-black/5 disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}>
                Go back
              </button>
              <button type="button" onClick={publish} disabled={busy} className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? "Sending…" : when === "later" ? "Confirm schedule" : "Publish now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
