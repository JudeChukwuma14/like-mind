"use client";

import { useEffect, useRef } from "react";
import { Sparkles, X, Send } from "lucide-react";

export function AskAiPanel({
  open,
  onClose,
  brandName,
}: {
  open: boolean;
  onClose: () => void;
  brandName: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} />

      {/* Panel */}
      <div
        className={`relative w-full max-w-sm h-full flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "var(--dash-surface)", borderLeft: "1px solid var(--dash-border)" }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--dash-border)" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--brand)", color: "var(--brand-fg)" }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "var(--dash-text)" }}>
                Ask {brandName} AI
              </p>
              <p className="text-[11px]" style={{ color: "var(--dash-muted)" }}>
                Assistant · not yet connected
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{ color: "var(--dash-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message thread */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          <div className="flex items-start gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "var(--brand)", color: "var(--brand-fg)" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed max-w-[85%]"
              style={{ background: "var(--dash-bg)", color: "var(--dash-text)", border: "1px solid var(--dash-border)" }}
            >
              Hi! I&apos;m the {brandName} AI assistant. I&apos;m not connected yet — this is a
              preview of what this chat will look like once I go live. Check back soon.
            </div>
          </div>
        </div>

        {/* Input row */}
        <div className="shrink-0 p-4" style={{ borderTop: "1px solid var(--dash-border)" }}>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              disabled
              placeholder="Coming soon…"
              className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none disabled:cursor-not-allowed"
              style={{
                background: "var(--dash-bg)",
                border: "1px solid var(--dash-border)",
                color: "var(--dash-muted)",
              }}
            />
            <button
              type="button"
              disabled
              aria-label="Send"
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--brand)", color: "var(--brand-fg)" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] mt-2 text-center" style={{ color: "var(--dash-muted)" }}>
            The assistant isn&apos;t connected yet.
          </p>
        </div>
      </div>
    </div>
  );
}
