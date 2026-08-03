import { Metadata } from "next";
import {
  FileText,
  FileCheck,
  BookOpen,
  Download,
  ArrowRight,
} from "lucide-react";
import {
  FadeUp,
  FadeIn,
  StaggerChildren,
  StaggerItem,
  HoverScale,
} from "@/app/components/Motion";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Explore the resources LikeMinds offers to support your journey. From insightful content to helpful tools and guides, we’re here to empower you every step of the way.",
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--mkt-bg)" }}>
      {/* ── Resources Hero ────────────────────────────────────────────── */}
      <section
        className="rounded-b-[3rem] pt-12 md:pt-20 pb-20 md:pb-28 px-6 border-b"
        style={{
          background: "var(--mkt-card)",
          borderColor: "var(--mkt-border)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <FadeUp delay={0.1}>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: "var(--mkt-accent)" }}
              >
                — RESOURCES
              </p>
              <h1
                className="text-5xl md:text-[4rem] font-bold tracking-tight leading-[1.05]"
                style={{ color: "var(--mkt-text)" }}
              >
                Bylaws, policies, blog & news.
              </h1>
            </FadeUp>
            <FadeIn delay={0.2} className="shrink-0 md:mb-2">
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm border hover:bg-black/5"
                style={{
                  background: "var(--mkt-bg)",
                  borderColor: "var(--mkt-border)",
                  color: "var(--mkt-text)",
                }}
              >
                <Download
                  className="w-4 h-4"
                  style={{ color: "var(--mkt-muted)" }}
                />
                Download document index
              </button>
            </FadeIn>
          </div>

          <StaggerChildren
            delay={0.3}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Card 1: Bylaws */}
            <StaggerItem>
              <HoverScale scale={1.02}>
                <div
                  className="rounded-4xl p-8 border shadow-sm flex flex-col h-full cursor-default"
                  style={{
                    background: "var(--mkt-card)",
                    borderColor: "var(--mkt-border)",
                  }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <div
                      className="w-10 h-10 rounded-[0.8rem] flex items-center justify-center border"
                      style={{
                        background: "var(--mkt-bg)",
                        borderColor: "var(--mkt-border)",
                        color: "var(--mkt-text)",
                      }}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold tracking-widest uppercase"
                      style={{ color: "var(--mkt-muted)" }}
                    >
                      12 DOCS
                    </span>
                  </div>
                  <h3
                    className="text-[1.35rem] font-bold mb-2"
                    style={{ color: "var(--mkt-text)" }}
                  >
                    Bylaws
                  </h3>
                  <p
                    className="text-[13px] leading-relaxed mb-6 flex-1"
                    style={{ color: "var(--mkt-muted)" }}
                  >
                    The cooperative's constitution. Amended in General Assembly
                    votes only.
                  </p>
                  <div
                    className="border-t border-dashed pt-6 space-y-3"
                    style={{ borderColor: "var(--mkt-border)" }}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: "var(--mkt-text)" }}
                      >
                        2024 Bylaws (current)
                      </span>
                      <span
                        className="text-[11px] font-mono font-semibold uppercase"
                        style={{ color: "var(--mkt-muted)" }}
                      >
                        PDF · 1.2MB
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: "var(--mkt-text)" }}
                      >
                        Amendment history
                      </span>
                      <span
                        className="text-[11px] font-mono font-semibold uppercase"
                        style={{ color: "var(--mkt-muted)" }}
                      >
                        PDF · 480KB
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: "var(--mkt-text)" }}
                      >
                        Founding charter
                      </span>
                      <span
                        className="text-[11px] font-mono font-semibold uppercase"
                        style={{ color: "var(--mkt-muted)" }}
                      >
                        PDF · 220KB
                      </span>
                    </div>
                  </div>
                </div>
              </HoverScale>
            </StaggerItem>

            {/* Card 2: Policies */}
            <StaggerItem>
              <HoverScale scale={1.02}>
                <div
                  className="rounded-4xl p-8 border shadow-sm flex flex-col h-full cursor-default"
                  style={{
                    background: "var(--mkt-card)",
                    borderColor: "var(--mkt-border)",
                  }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <div
                      className="w-10 h-10 rounded-[0.8rem] flex items-center justify-center border"
                      style={{
                        background: "var(--mkt-bg)",
                        borderColor: "var(--mkt-border)",
                        color: "var(--mkt-text)",
                      }}
                    >
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold tracking-widest uppercase"
                      style={{ color: "var(--mkt-muted)" }}
                    >
                      28 DOCS
                    </span>
                  </div>
                  <h3
                    className="text-[1.35rem] font-bold mb-2"
                    style={{ color: "var(--mkt-text)" }}
                  >
                    Policies
                  </h3>
                  <p
                    className="text-[13px] leading-relaxed mb-6 flex-1"
                    style={{ color: "var(--mkt-muted)" }}
                  >
                    Operational rules — set by Board, ratified by members.
                  </p>
                  <div
                    className="border-t border-dashed pt-6 space-y-3"
                    style={{ borderColor: "var(--mkt-border)" }}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: "var(--mkt-text)" }}
                      >
                        Loan disbursement policy
                      </span>
                      <span
                        className="text-[11px] font-mono font-semibold uppercase"
                        style={{ color: "var(--mkt-muted)" }}
                      >
                        PDF · 320KB
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: "var(--mkt-text)" }}
                      >
                        Welfare claim policy
                      </span>
                      <span
                        className="text-[11px] font-mono font-semibold uppercase"
                        style={{ color: "var(--mkt-muted)" }}
                      >
                        PDF · 190KB
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: "var(--mkt-text)" }}
                      >
                        Investment vetting policy
                      </span>
                      <span
                        className="text-[11px] font-mono font-semibold uppercase"
                        style={{ color: "var(--mkt-muted)" }}
                      >
                        PDF · 410KB
                      </span>
                    </div>
                  </div>
                </div>
              </HoverScale>
            </StaggerItem>

            {/* Card 3: Document Library */}
            <StaggerItem>
              <HoverScale scale={1.02}>
                <div
                  className="rounded-4xl p-8 shadow-xl shadow-black/5 flex flex-col h-full cursor-default"
                  style={{ background: "var(--nav-bg)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-10 h-10 rounded-[0.8rem] bg-white/5 border border-white/10 flex items-center justify-center text-[#facc15]">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                      142 DOCS · LIBRARY
                    </span>
                  </div>
                  <h3 className="text-[1.35rem] font-bold text-white mb-2">
                    Document Library
                  </h3>
                  <p className="text-[13px] text-gray-400 leading-relaxed mb-6 flex-1">
                    All quarterly reports, audited financials, council minutes —
                    searchable.
                  </p>
                  <div className="border-t border-dashed border-white/15 pt-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-semibold text-white">
                        Q1 2026 disclosure
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-gray-500 uppercase">
                        PDF · 2.4MB
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-semibold text-white">
                        2025 audited financials
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-gray-500 uppercase">
                        PDF · 6.1MB
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-semibold text-white">
                        AGM 2026 minutes
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-gray-500 uppercase">
                        PDF · 880KB
                      </span>
                    </div>
                  </div>
                </div>
              </HoverScale>
            </StaggerItem>
          </StaggerChildren>
        </div>
      </section>

      {/* ── Latest News / Blog ──────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="flex items-center justify-between mb-12">
            <h2
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--mkt-text)" }}
            >
              Latest from the Blog
            </h2>
            <button
              className="text-sm font-semibold flex items-center gap-1 transition-colors"
              style={{ color: "var(--mkt-accent)" }}
            >
              View all posts <ArrowRight className="w-4 h-4" />
            </button>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Blog Post 1 */}
            <StaggerItem>
              <HoverScale scale={1.01}>
                <div className="group cursor-pointer">
                  <div
                    className="rounded-4xl aspect-video mb-6 overflow-hidden relative border"
                    style={{
                      background: "var(--mkt-card)",
                      borderColor: "var(--mkt-border)",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/5 group-hover:scale-105 transition-transform duration-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <span
                        className="font-mono text-sm tracking-widest uppercase"
                        style={{ color: "var(--mkt-muted)" }}
                      >
                        IMAGE PLACEHOLDER
                      </span>
                    </div>
                  </div>
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-3"
                    style={{ color: "var(--mkt-accent)" }}
                  >
                    Cooperative News — Mar 12, 2026
                  </p>
                  <h3
                    className="text-2xl font-bold mb-3 transition-colors"
                    style={{ color: "var(--mkt-text)" }}
                  >
                    Announcing the Q1 2026 Dividend Distribution
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: "var(--mkt-muted)" }}
                  >
                    Following our recent Board resolution, we are excited to
                    announce a 4.2% annualized dividend distribution for all
                    active Daily Pulse and Quarterly Pool participants...
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>

            {/* Blog Post 2 */}
            <StaggerItem>
              <HoverScale scale={1.01}>
                <div className="group cursor-pointer">
                  <div
                    className="rounded-4xl aspect-video mb-6 overflow-hidden relative border"
                    style={{
                      background: "var(--mkt-card)",
                      borderColor: "var(--mkt-border)",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/5 group-hover:scale-105 transition-transform duration-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <span
                        className="font-mono text-sm tracking-widest uppercase"
                        style={{ color: "var(--mkt-muted)" }}
                      >
                        IMAGE PLACEHOLDER
                      </span>
                    </div>
                  </div>
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-3"
                    style={{ color: "var(--mkt-accent)" }}
                  >
                    Member Spotlight — Mar 05, 2026
                  </p>
                  <h3
                    className="text-2xl font-bold mb-3 transition-colors"
                    style={{ color: "var(--mkt-text)" }}
                  >
                    How the Welfare Fund supported the Adebayo family
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: "var(--mkt-muted)" }}
                  >
                    When unexpected medical emergencies arise, our cooperative
                    stands together. Read the story of the Adebayo family and
                    how the Medical Hardship grant provided critical bridge
                    support...
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
          </StaggerChildren>
        </div>
      </section>
    </div>
  );
}
