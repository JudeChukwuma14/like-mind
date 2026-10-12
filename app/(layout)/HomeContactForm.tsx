"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  submitContactMessage,
  CONTACT_SUBJECTS,
  type ContactSubject,
} from "@/app/lib/contact-api";
import { getApiErrorMessage } from "@/app/lib/api-client";

type FormFields = {
  fullName: string;
  email: string;
  subject: ContactSubject;
  message: string;
  agreeToPrivacyPolicy: boolean;
};

type FieldErrors = Partial<Record<keyof FormFields, string>>;

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }
  if (!fields.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_RE.test(fields.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!fields.subject) {
    errors.subject = "Please select a subject.";
  }
  if (!fields.message.trim()) {
    errors.message = "Message is required.";
  } else if (fields.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }
  if (!fields.agreeToPrivacyPolicy) {
    errors.agreeToPrivacyPolicy =
      "You must agree to the privacy policy to continue.";
  }
  return errors;
}

// ─── Small helper components ──────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs mt-1.5" style={{ color: "var(--admin-accent)" }}>
      {message}
    </p>
  );
}

const INITIAL_FIELDS: FormFields = {
  fullName: "",
  email: "",
  subject: "MembershipApplication",
  message: "",
  agreeToPrivacyPolicy: false,
};

export default function HomeContactForm() {
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Generic field updater
  const set = <K extends keyof FormFields>(key: K, value: FormFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Clear the error for this field as soon as the user changes it
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await submitContactMessage({
        fullName: fields.fullName.trim(),
        email: fields.email.trim(),
        subject: fields.subject,
        message: fields.message.trim(),
        agreeToPrivacyPolicy: fields.agreeToPrivacyPolicy,
      });

      setSubmitted(true);
      setFields(INITIAL_FIELDS);
      toast.success(
        "Message sent! We'll get back to you within 8 business hours.",
      );
    } catch (err) {
      const message = getApiErrorMessage(err);
      toast.error(message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Input / textarea shared style helpers ──────────────────────────────────
  const inputStyle = {
    background: "var(--mkt-card)",
    borderColor: "var(--mkt-border)",
    color: "var(--mkt-text)",
  };
  const inputClass =
    "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm";
  return (
    <div
      className="rounded-[2.5rem] p-8 md:p-12 shadow-sm border"
      style={{
        background: "var(--mkt-bg)",
        borderColor: "var(--mkt-border)",
      }}
    >
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-4"
        style={{ color: "var(--mkt-accent)" }}
      >
        — Contact Form
      </p>
      <h2
        className="text-4xl font-bold tracking-tight mb-10"
        style={{ color: "var(--mkt-text)" }}
      >
        Tell us how we can help.
      </h2>

      {submitted && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl mb-8 border"
          style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}
        >
          <CheckCircle2
            className="w-5 h-5 shrink-0 mt-0.5"
            style={{ color: "#16a34a" }}
          />
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "#15803d" }}
            >
              Message sent successfully!
            </p>
            <p
              className="text-sm mt-0.5"
              style={{ color: "#166534" }}
            >
              Thank you for reaching out. We&apos;ll get back to you
              within 8 business hours.
            </p>
          </div>
        </div>
      )}

      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Full name + Email */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <label
              htmlFor="contact-fullname"
              className="block text-[13px] font-semibold mb-2"
              style={{ color: "var(--mkt-text)" }}
            >
              Full name{" "}
              <span
                aria-hidden="true"
                style={{ color: "var(--admin-accent)" }}
              >
                *
              </span>
            </label>
            <input
              id="contact-fullname"
              type="text"
              placeholder="Alexandra Morgan"
              value={fields.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              disabled={isSubmitting}
              aria-describedby={
                errors.fullName ? "err-fullname" : undefined
              }
              aria-invalid={!!errors.fullName}
              className={inputClass}
              style={{
                ...inputStyle,
                ...(errors.fullName
                  ? { borderColor: "var(--admin-accent)" }
                  : {}),
              }}
            />
            <FieldError message={errors.fullName} />
          </div>
          <div className="flex-1">
            <label
              htmlFor="contact-email"
              className="block text-[13px] font-semibold mb-2"
              style={{ color: "var(--mkt-text)" }}
            >
              Email{" "}
              <span
                aria-hidden="true"
                style={{ color: "var(--admin-accent)" }}
              >
                *
              </span>
            </label>
            <input
              id="contact-email"
              type="email"
              placeholder="alex@example.com"
              value={fields.email}
              onChange={(e) => set("email", e.target.value)}
              disabled={isSubmitting}
              aria-describedby={
                errors.email ? "err-email" : undefined
              }
              aria-invalid={!!errors.email}
              className={inputClass}
              style={{
                ...inputStyle,
                ...(errors.email
                  ? { borderColor: "var(--admin-accent)" }
                  : {}),
              }}
            />
            <FieldError message={errors.email} />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label
            htmlFor="contact-subject"
            className="block text-[13px] font-semibold mb-2"
            style={{ color: "var(--mkt-text)" }}
          >
            I&apos;d like to ask about{" "}
            <span
              aria-hidden="true"
              style={{ color: "var(--admin-accent)" }}
            >
              *
            </span>
          </label>
          <div className="relative">
            <select
              id="contact-subject"
              value={fields.subject}
              onChange={(e) =>
                set("subject", e.target.value as ContactSubject)
              }
              disabled={isSubmitting}
              aria-invalid={!!errors.subject}
              className={`${inputClass} appearance-none`}
              style={{
                ...inputStyle,
                ...(errors.subject
                  ? { borderColor: "var(--admin-accent)" }
                  : {}),
              }}
            >
              {CONTACT_SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <svg
              className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--mkt-muted)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <FieldError message={errors.subject} />
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="contact-message"
            className="block text-[13px] font-semibold mb-2"
            style={{ color: "var(--mkt-text)" }}
          >
            Your message{" "}
            <span
              aria-hidden="true"
              style={{ color: "var(--admin-accent)" }}
            >
              *
            </span>
          </label>
          <textarea
            id="contact-message"
            rows={5}
            placeholder="I'd like to learn more about…"
            value={fields.message}
            onChange={(e) => set("message", e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!errors.message}
            className={`${inputClass} resize-none`}
            style={{
              ...inputStyle,
              ...(errors.message
                ? { borderColor: "var(--admin-accent)" }
                : {}),
            }}
          />
          <p
            className="text-xs mt-2"
            style={{ color: "var(--mkt-muted)" }}
          >
            Avg response time: 8 hours on business days.
          </p>
          <FieldError message={errors.message} />
        </div>

        {/* Privacy policy + Submit */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-6 pt-4 border-t"
          style={{ borderColor: "var(--mkt-border)" }}
        >
          {/* Privacy policy checkbox */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              id="contact-privacy"
              role="checkbox"
              aria-checked={fields.agreeToPrivacyPolicy}
              onClick={() =>
                set(
                  "agreeToPrivacyPolicy",
                  !fields.agreeToPrivacyPolicy,
                )
              }
              disabled={isSubmitting}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* Custom checkbox visual */}
              <div
                className="w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors"
                style={{
                  borderColor: errors.agreeToPrivacyPolicy
                    ? "var(--admin-accent)"
                    : fields.agreeToPrivacyPolicy
                      ? "#111111"
                      : "var(--mkt-border)",
                  background: fields.agreeToPrivacyPolicy
                    ? "#111111"
                    : "var(--mkt-card)",
                }}
              >
                <svg
                  className="w-3 h-3"
                  style={{
                    color: fields.agreeToPrivacyPolicy
                      ? "#ffffff"
                      : "transparent",
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span
                className="text-[13px] font-medium text-left"
                style={{ color: "var(--mkt-muted)" }}
              >
                I agree to the privacy policy
              </span>
            </button>
            <FieldError message={errors.agreeToPrivacyPolicy} />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            id="contact-submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 shrink-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "var(--fg)",
              color: "var(--bg)",
              transform: isSubmitting ? "scale(1)" : undefined,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                Send message <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
