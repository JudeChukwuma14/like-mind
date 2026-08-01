import type { Metadata } from "next";

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
    statusColor: "text-gray-500",
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
    <div className="bg-[#fcfbf9] min-h-screen pb-32">
      {/* Hero Section */}
      <section className="bg-[#f6f4eb] rounded-b-[3rem] pt-12 md:pt-20 pb-20 md:pb-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-gray-500 uppercase mb-16 md:mb-20">
            HOME / PROGRAMS
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="">
              <h1 className="text-6xl sm:text-7xl md:text-[6rem] font-bold text-gray-900  tracking-[-0.02em] leading-[1.05] mb-8 ">
                Save. Borrow.
                <br />
                Invest. Belong.
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Four programs. Use one or all four. No upselling, no hidden
                fees.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pb-2">
              {/* <button className="px-6 py-2.5 rounded-full bg-[#111111] text-white text-[13px] font-semibold transition-transform hover:scale-105">
                All
              </button> */}
              <button className="px-6 py-2.5 rounded-full bg-[#111111] text-white text-[13px] font-semibold hover:bg-gray-50 transition-colors">
                Savings
              </button>
              <button className="px-6 py-2.5 rounded-full bg-white text-gray-900 border border-gray-200 text-[13px] font-semibold hover:bg-gray-50 transition-colors">
                Loans
              </button>
              <button className="px-6 py-2.5 rounded-full bg-white text-gray-900 border border-gray-200 text-[13px] font-semibold hover:bg-gray-50 transition-colors">
                Invest
              </button>
              <button className="px-6 py-2.5 rounded-full bg-white text-gray-900 border border-gray-200 text-[13px] font-semibold hover:bg-gray-50 transition-colors">
                Welfare
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 01 - SAVINGS */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-semibold font-mono tracking-[0.15em] text-gray-400 uppercase mb-4">
              01 — SAVINGS
            </p>
            <h2 className="text-4xl md:text-[3rem] font-bold text-gray-900 tracking-tight leading-none">
              Savings schemes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {savingsPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-3xl p-8 flex flex-col ${
                  plan.tagDark
                    ? "border-[2.5px] border-[#111111]"
                    : "border border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="text-[10px] font-mono font-semibold tracking-widest text-gray-400 uppercase">
                    {plan.name}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold tracking-widest px-3 py-1.5 rounded-full uppercase ${
                      plan.tagDark
                        ? "bg-[#111111] text-[#facc15]"
                        : "bg-[#f4efe6] text-gray-600"
                    }`}
                  >
                    {plan.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {plan.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-12 flex-1">
                  {plan.description}
                </p>

                <div className="space-y-3.5 pt-6 border-t border-gray-100">
                  {plan.stats.map((stat, i) => (
                    <div key={i} className="flex justify-between text-[13px]">
                      <span className="text-gray-500">{stat.label}</span>
                      <span className="font-bold text-gray-900">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 - LOANS */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <p className="text-xs font-semibold font-mono tracking-[0.15em] text-gray-400 uppercase mb-4">
                02 — LOANS
              </p>
              <h2 className="text-4xl md:text-[3rem] font-bold text-gray-900 tracking-tight leading-none">
                Loan products
              </h2>
            </div>
            <p className="text-gray-600 text-sm max-w-sm md:text-right leading-relaxed md:pb-1">
              Profit-share only. No compound interest. Decisions made by sector
              council.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {loanProducts.map((loan) => (
              <div
                key={loan.title}
                className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-6"
              >
                <div className="md:w-1/3">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {loan.title}
                  </h3>
                  <p className="text-[13px] text-gray-500 mt-1">
                    {loan.subtitle}
                  </p>
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-10">
                  <div>
                    <p className="text-[10px] font-mono font-semibold tracking-widest text-gray-400 uppercase mb-2">
                      CEILING
                    </p>
                    <p className="font-bold text-gray-900 text-[13px]">
                      {loan.ceiling}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-semibold tracking-widest text-gray-400 uppercase mb-2">
                      {loan.shareType}
                    </p>
                    <p className="font-bold text-gray-900 text-[13px]">
                      {loan.shareValue}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-semibold tracking-widest text-gray-400 uppercase mb-2">
                      TENURE
                    </p>
                    <p className="font-bold text-gray-900 text-[13px]">
                      {loan.tenure}
                    </p>
                  </div>
                </div>

                <div className="md:shrink-0 text-left md:text-right mt-2 md:mt-0">
                  <button className="px-8 py-2.5 rounded-full border border-gray-300 text-gray-900 text-sm font-semibold hover:bg-gray-50 transition-colors">
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 & 04 - INVEST & WELFARE */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Invest */}
          <div className="bg-white rounded-4xl p-8 md:p-12 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold font-mono tracking-[0.15em] text-gray-400 uppercase mb-4">
              03 — INVEST
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-6">
              Investment opportunities
            </h2>
            <p className="text-[15px] text-gray-600 mb-10 leading-relaxed max-w-sm">
              Members propose. Councils vet. Members vote. Quarterly reporting
              on every active project.
            </p>

            <div className="flex flex-col gap-3">
              {investments.map((inv) => (
                <div
                  key={inv.title}
                  className="bg-[#faf9f6] rounded-2xl p-5 flex justify-between items-center group hover:bg-[#f4efe6] transition-colors border border-transparent hover:border-gray-100"
                >
                  <div>
                    <h3 className="font-bold text-gray-900 text-[15px] mb-1">
                      {inv.title}
                    </h3>
                    <p className="text-[13px] text-gray-500">{inv.sub}</p>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold tracking-widest uppercase ${inv.statusColor}`}
                  >
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Welfare */}
          <div className="bg-white rounded-4xl p-8 md:p-12 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold font-mono tracking-[0.15em] text-gray-400 uppercase mb-4">
              04 — WELFARE
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-6">
              Welfare initiatives
            </h2>
            <p className="text-[15px] text-gray-600 mb-10 leading-relaxed max-w-sm">
              A safety net pooled across all members. No claim limits. No
              probation period after Tier 02.
            </p>

            <div className="flex flex-col gap-3">
              {welfare.map((w) => (
                <div
                  key={w.title}
                  className="bg-[#faf9f6] rounded-2xl p-5 flex justify-between items-center group hover:bg-[#f4efe6] transition-colors border border-transparent hover:border-gray-100"
                >
                  <div>
                    <h3 className="font-bold text-gray-900 text-[15px] mb-1">
                      {w.title}
                    </h3>
                    <p className="text-[13px] text-gray-500">{w.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
