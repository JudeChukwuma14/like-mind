import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Overview",
  description: "Kajola admin dashboard overview.",
};

const stats = [
  { label: "PENDING REVIEW", value: "31" },
  { label: "ACTIVE MEMBERS", value: "178" },
  { label: "CONTRIBUTIONS - APRIL", value: "₦4.12M" },
  { label: "LOAN EXPOSURE", value: "₦3.62M" },
];

const workloadTasks = [
  { text: "Review 7 new member applications", href: "/admin/applications" },
  { text: "Confirm 12 contributions", href: "/admin/contributions" },
  { text: "Decide on 3 loan applications", href: "/admin/loans" },
  { text: "Approve 5 withdrawals", href: "/admin/withdrawals" },
];

// Mock chart data
const chartData = [
  { month: "NOV", in: 60, out: 40, trend: 55 },
  { month: "DEC", in: 75, out: 45, trend: 60 },
  { month: "JAN", in: 70, out: 35, trend: 50 },
  { month: "FEB", in: 80, out: 55, trend: 65 },
  { month: "MAR", in: 82, out: 58, trend: 68 },
  { month: "APR", in: 90, out: 65, trend: 70 },
];

export default function AdminOverviewPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p
            className="text-xs font-bold tracking-widest uppercase mb-1"
            style={{ color: "var(--admin-muted)" }}
          >
            Overview
          </p>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>
            Today
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors"
            style={{
              borderColor: "var(--admin-border)",
              background: "var(--admin-surface)",
              color: "var(--admin-text)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Today
          </button>
          <button
            className="px-4 py-2 rounded-full border text-sm font-medium transition-colors"
            style={{
              borderColor: "var(--admin-border)",
              background: "var(--admin-surface)",
              color: "var(--admin-text)",
            }}
          >
            Export
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full border text-red-600 text-sm font-medium transition-colors"
            style={{ borderColor: "#fca5a5", background: "#fef2f2" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Deduct from all
          </button>
          <button
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
            style={{ background: "var(--admin-text)", color: "var(--admin-bg)" }}
          >
            New announcement
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 py-6 border-y md:divide-x"
        style={{ borderColor: "var(--admin-border)" }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-4 ${i === 0 ? "pl-0" : ""} ${
              i % 2 !== 0 ? "border-l" : "md:border-l"
            } ${i === 0 || i === 2 ? "border-l-0" : ""} mb-4 md:mb-0`}
            style={{ borderColor: "var(--admin-border)" }}
          >
            <p
              className="text-[10px] font-bold tracking-widest uppercase mb-2"
              style={{ color: "var(--admin-muted)" }}
            >
              {s.label}
            </p>
            <p className="text-3xl font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div
        className="rounded-2xl p-6 md:p-8 shadow-sm border"
        style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <p
              className="text-[10px] font-bold tracking-widest uppercase mb-1"
              style={{ color: "var(--admin-muted)" }}
            >
              CASH FLOW · LAST 6 CYCLES
            </p>
            <h2 className="text-2xl font-bold" style={{ color: "var(--admin-text)" }}>₦1.28M</h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium" style={{ color: "var(--admin-muted)" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#fcd34d] rounded-sm"></div>
              Contributions in
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: "var(--admin-text)" }}></div>
              Outflow
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-[2px]" style={{ background: "var(--admin-muted)" }}></div>
              Net trend
            </div>
          </div>
        </div>

        {/* Chart Graphic (Mock) */}
        <div className="relative h-64 w-full mt-4 flex items-end justify-between px-2 md:px-8">
          {/* Y-axis labels */}
          <div
            className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] opacity-0 sm:opacity-100"
            style={{ color: "var(--admin-muted)" }}
          >
            <span>5.0M</span>
            <span>3.75M</span>
            <span>2.5M</span>
            <span>1.25M</span>
            <span>0</span>
          </div>

          {/* Grid lines */}
          <div className="absolute left-0 sm:left-10 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((n) => (
              <div key={n} className="w-full border-b" style={{ borderColor: "var(--admin-border)" }}></div>
            ))}
          </div>

          {/* SVG Line Trend */}
          <svg
            className="absolute left-0 sm:left-10 right-0 top-0 bottom-8 w-full sm:w-[calc(100%-2.5rem)] h-full pointer-events-none overflow-visible z-10"
            preserveAspectRatio="none"
          >
            <polyline
              points="10%,45% 26.6%,40% 43.3%,50% 60%,35% 76.6%,32% 93.3%,30%"
              fill="none"
              stroke="var(--admin-muted)"
              strokeWidth="2"
            />
            {["10%,45%", "26.6%,40%", "43.3%,50%", "60%,35%", "76.6%,32%"].map((pos) => {
              const [cx, cy] = pos.split(",");
              return (
                <circle
                  key={pos}
                  cx={cx}
                  cy={cy}
                  r="3"
                  fill="var(--admin-surface)"
                  stroke="var(--admin-muted)"
                  strokeWidth="2"
                />
              );
            })}
            {/* Active dot on APR */}
            <circle cx="93.3%" cy="30%" r="4" fill="var(--admin-text)" />
          </svg>

          {/* Bars */}
          <div className="relative z-0 flex justify-between w-full sm:ml-10 h-full pb-8">
            {chartData.map((d, i) => (
              <div
                key={d.month}
                className="flex flex-col items-center justify-end w-[12%] max-w-[40px] group"
              >
                <div className="flex items-end gap-0.5 w-full h-[calc(100%-1rem)]">
                  <div
                    className="w-1/2 bg-[#fcd34d] rounded-t-sm"
                    style={{ height: `${d.in}%` }}
                  ></div>
                  <div
                    className="w-1/2 rounded-t-sm"
                    style={{ height: `${d.out}%`, background: "var(--admin-text)" }}
                  ></div>
                </div>
                <div
                  className="mt-4 text-[10px] font-bold"
                  style={{
                    color:
                      i === chartData.length - 1
                        ? "var(--admin-text)"
                        : "var(--admin-muted)",
                  }}
                >
                  {d.month}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workload */}
      <div>
        <h3 className="text-lg font-bold mb-4" style={{ color: "var(--admin-text)" }}>Workload</h3>
        <div className="flex flex-col gap-3">
          {workloadTasks.map((task, i) => (
            <Link
              key={i}
              href={task.href}
              className="admin-workload-card group flex items-center justify-between p-5 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#fcd34d]"></div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--admin-muted)" }}
                >
                  {task.text}
                </span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--admin-muted)" }}
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
