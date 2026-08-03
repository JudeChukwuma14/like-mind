import type { Metadata } from "next";
import { FadeUp, StaggerChildren, StaggerItem, HoverScale, FadeIn } from "@/app/components/Motion";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore LikeMinds Cooperative's full suite of programs — savings, loans, investments, and welfare.",
};

const savingsPlans = [
  {
    name: "PLAN A",
    tag: "FLEXIBLE",
    tagDark: false,
    title: "Daily Pulse",
    description:
      "Auto-debit from $5/day. Pause anytime. Withdraw on 7 days notice.",
    stats: [
      { label: "Min commitment", value: "$5/day" },
      { label: "2025 share return", value: "8.2%" },
      { label: "Withdrawal notice", value: "7 days" },
    ],
  },
  {
    name: "PLAN B",
    tag: "POPULAR",
    tagDark: true,
    title: "Quarterly Pool",
    description: "90-day cycles. Higher yield. Auto-rolls unless paused.",
    stats: [
      { label: "Min commitment", value: "$500/qtr" },
      { label: "2025 share return", value: "11.4%" },
      { label: "Lock period", value: "90 days" },
    ],
  },
  {
    name: "PLAN C",
    tag: "LONG-HAUL",
    tagDark: false,
    title: "Generations Trust",
    description:
      "5-year minimum. Compounded shares. Pass-through to next of kin.",
    stats: [
      { label: "Min commitment", value: "$2,500/yr" },
      { label: "2020-25 CAGR", value: "12.8%" },
      { label: "Lock period", value: "5 years" },
    ],
  },
];

const loanProducts = [
  {
    title: "Housing co-finance",
    subtitle: "Down-payment + lien-share",
    ceiling: "Up to $400K",
    shareType: "SHARE",
    shareValue: "8% of equity",
    tenure: "5 — 25 yrs",
  },
  {
    title: "Small business profit-share",
    subtitle: "For member-led ventures",
    ceiling: "Up to $150K",
    shareType: "SHARE",
    shareValue: "12-18% gross profit",
    tenure: "3 — 7 yrs",
  },
  {
    title: "Education advance",
    subtitle: "Member or dependent tuition",
    ceiling: "Up to $40K/yr",
    shareType: "REPAYMENT",
    shareValue: "After graduation",
    tenure: "10 yrs max",
  },
  {
    title: "Emergency bridge",
    subtitle: "Short-term liquidity",
    ceiling: "Up to $5K",
    shareType: "FEE",
    shareValue: "$25 admin only",
    tenure: "90 days",
  },
];

const investments = [
  {
    title: "Toronto Multifamily Fund",
    sub: "14% projected · Min $5K",
    status: "OPEN",
    statusColor: "text-[#10b981]",
  },
  {
    title: "Niagara Greenhouse Project",
    sub: "18% projected · Min $2.5K",
    status: "OPEN",
    statusColor: "text-[#10b981]",
  },
  {
    title: "Solar Microgrid · Alberta",
    sub: "16% projected · Min $5K",
    status: "CLOSING",
    statusColor: "text-[#f59e0b]",
  },
  {
    title: "Member-led SaaS bundle",
    sub: "22% projected · Min $1K",
    status: "VOTING",
    statusColor: "text-gray-500", // Will use mkt-muted for this in component
  },
];

const welfare = [
  { title: "Bereavement support", sub: "Up to $10K · within 72 hours" },
  { title: "Medical hardship", sub: "Up to $15K per incident · case-by-case" },
  { title: "Job-loss bridge", sub: "3 months essentials · no proof of search" },
  {
    title: "Member milestones",
    sub: "Wedding · childbirth · graduation gifts",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--mkt-bg)" }}>
      {/* Hero Section */}
      <section 
        className="rounded-b-[3rem] pt-12 md:pt-20 pb-20 md:pb-28 px-6 border-b"
        style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <FadeUp delay={0.1}>
              <h1 className="text-6xl sm:text-7xl md:text-[6rem] font-bold tracking-[-0.02em] leading-[1.05] mb-8" style={{ color: "var(--mkt-text)" }}>
                Save. Borrow.
                <br />
                Invest. Belong.
              </h1>
              <p className="text-xl leading-relaxed max-w-lg" style={{ color: "var(--mkt-muted)" }}>
                Four programs. Use one or all four. No upselling, no hidden
                fees.
              </p>
            </FadeUp>

            <FadeIn delay={0.2} className="grid grid-cols-2 md:grid-cols-4 gap-2 pb-2">
              <button 
                className="px-6 py-2.5 rounded-full text-[13px] font-semibold transition-colors border"
                style={{ background: "var(--fg)", color: "var(--bg)", borderColor: "var(--fg)" }}
              >
                Savings
              </button>
              <button 
                className="px-6 py-2.5 rounded-full border text-[13px] font-semibold transition-colors hover:bg-black/5"
                style={{ background: "transparent", color: "var(--mkt-text)", borderColor: "var(--mkt-border)" }}
              >
                Loans
              </button>
              <button 
                className="px-6 py-2.5 rounded-full border text-[13px] font-semibold transition-colors hover:bg-black/5"
                style={{ background: "transparent", color: "var(--mkt-text)", borderColor: "var(--mkt-border)" }}
              >
                Invest
              </button>
              <button 
                className="px-6 py-2.5 rounded-full border text-[13px] font-semibold transition-colors hover:bg-black/5"
                style={{ background: "transparent", color: "var(--mkt-text)", borderColor: "var(--mkt-border)" }}
              >
                Welfare
              </button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 01 - SAVINGS */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="mb-14">
            <p className="text-xs font-semibold font-mono tracking-[0.15em] uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
              01 — SAVINGS
            </p>
            <h2 className="text-4xl md:text-[3rem] font-bold tracking-tight leading-none" style={{ color: "var(--mkt-text)" }}>
              Savings schemes
            </h2>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {savingsPlans.map((plan) => (
              <StaggerItem key={plan.name}>
                <HoverScale scale={1.02}>
                  <div
                    className={`rounded-3xl p-8 flex flex-col h-full cursor-default ${
                      plan.tagDark ? "border-[2.5px] border-[#111111]" : "border shadow-sm"
                    }`}
                    style={plan.tagDark ? { background: "var(--mkt-card)" } : { background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
                  >
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-[10px] font-mono font-semibold tracking-widest uppercase" style={{ color: "var(--mkt-muted)" }}>
                        {plan.name}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold tracking-widest px-3 py-1.5 rounded-full uppercase ${
                          plan.tagDark
                            ? "bg-[#111111] text-[#facc15]"
                            : ""
                        }`}
                        style={plan.tagDark ? {} : { background: "var(--mkt-bg)", color: "var(--mkt-text)" }}
                      >
                        {plan.tag}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--mkt-text)" }}>
                      {plan.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-12 flex-1" style={{ color: "var(--mkt-muted)" }}>
                      {plan.description}
                    </p>

                    <div className="space-y-3.5 pt-6 border-t" style={{ borderColor: "var(--mkt-border)" }}>
                      {plan.stats.map((stat, i) => (
                        <div key={i} className="flex justify-between text-[13px]">
                          <span style={{ color: "var(--mkt-muted)" }}>{stat.label}</span>
                          <span className="font-bold" style={{ color: "var(--mkt-text)" }}>
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* 02 - LOANS */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <p className="text-xs font-semibold font-mono tracking-[0.15em] uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
                02 — LOANS
              </p>
              <h2 className="text-4xl md:text-[3rem] font-bold tracking-tight leading-none" style={{ color: "var(--mkt-text)" }}>
                Loan products
              </h2>
            </div>
            <p className="text-sm max-w-sm md:text-right leading-relaxed md:pb-1" style={{ color: "var(--mkt-muted)" }}>
              Profit-share only. No compound interest. Decisions made by sector
              council.
            </p>
          </FadeUp>

          <StaggerChildren className="flex flex-col gap-4">
            {loanProducts.map((loan) => (
              <StaggerItem key={loan.title}>
                <HoverScale scale={1.01}>
                  <div
                    className="rounded-2xl p-6 md:p-8 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-6 cursor-default"
                    style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
                  >
                    <div className="md:w-1/3">
                      <h3 className="font-bold text-lg" style={{ color: "var(--mkt-text)" }}>
                        {loan.title}
                      </h3>
                      <p className="text-[13px] mt-1" style={{ color: "var(--mkt-muted)" }}>
                        {loan.subtitle}
                      </p>
                    </div>

                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-10">
                      <div>
                        <p className="text-[10px] font-mono font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--mkt-muted)" }}>
                          CEILING
                        </p>
                        <p className="font-bold text-[13px]" style={{ color: "var(--mkt-text)" }}>
                          {loan.ceiling}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--mkt-muted)" }}>
                          {loan.shareType}
                        </p>
                        <p className="font-bold text-[13px]" style={{ color: "var(--mkt-text)" }}>
                          {loan.shareValue}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--mkt-muted)" }}>
                          TENURE
                        </p>
                        <p className="font-bold text-[13px]" style={{ color: "var(--mkt-text)" }}>
                          {loan.tenure}
                        </p>
                      </div>
                    </div>

                    <div className="md:shrink-0 text-left md:text-right mt-2 md:mt-0">
                      <button 
                        className="px-8 py-2.5 rounded-full border text-sm font-semibold transition-colors hover:bg-black/5"
                        style={{ color: "var(--mkt-text)", borderColor: "var(--mkt-border)" }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* 03 & 04 - INVEST & WELFARE */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Invest */}
          <FadeUp>
            <div 
              className="rounded-4xl p-8 md:p-12 border shadow-sm h-full"
              style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
            >
              <p className="text-xs font-semibold font-mono tracking-[0.15em] uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
                03 — INVEST
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" style={{ color: "var(--mkt-text)" }}>
                Investment opportunities
              </h2>
              <p className="text-[15px] mb-10 leading-relaxed max-w-sm" style={{ color: "var(--mkt-muted)" }}>
                Members propose. Councils vet. Members vote. Quarterly reporting
                on every active project.
              </p>

              <StaggerChildren delay={0.1} className="flex flex-col gap-3">
                {investments.map((inv) => (
                  <StaggerItem key={inv.title}>
                    <div
                      className="rounded-2xl p-5 flex justify-between items-center group hover:opacity-80 transition-opacity border border-transparent hover:border-black/5"
                      style={{ background: "var(--mkt-bg)" }}
                    >
                      <div>
                        <h3 className="font-bold text-[15px] mb-1" style={{ color: "var(--mkt-text)" }}>
                          {inv.title}
                        </h3>
                        <p className="text-[13px]" style={{ color: "var(--mkt-muted)" }}>{inv.sub}</p>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold tracking-widest uppercase ${inv.statusColor === 'text-gray-500' ? '' : inv.statusColor}`}
                        style={inv.statusColor === 'text-gray-500' ? { color: "var(--mkt-muted)" } : undefined}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </FadeUp>

          {/* Welfare */}
          <FadeUp delay={0.15}>
            <div 
              className="rounded-4xl p-8 md:p-12 border shadow-sm h-full"
              style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
            >
              <p className="text-xs font-semibold font-mono tracking-[0.15em] uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
                04 — WELFARE
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" style={{ color: "var(--mkt-text)" }}>
                Welfare initiatives
              </h2>
              <p className="text-[15px] mb-10 leading-relaxed max-w-sm" style={{ color: "var(--mkt-muted)" }}>
                A safety net pooled across all members. No claim limits. No
                probation period after Tier 02.
              </p>

              <StaggerChildren delay={0.25} className="flex flex-col gap-3">
                {welfare.map((w) => (
                  <StaggerItem key={w.title}>
                    <div
                      className="rounded-2xl p-5 flex justify-between items-center group hover:opacity-80 transition-opacity border border-transparent hover:border-black/5"
                      style={{ background: "var(--mkt-bg)" }}
                    >
                      <div>
                        <h3 className="font-bold text-[15px] mb-1" style={{ color: "var(--mkt-text)" }}>
                          {w.title}
                        </h3>
                        <p className="text-[13px]" style={{ color: "var(--mkt-muted)" }}>{w.sub}</p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
