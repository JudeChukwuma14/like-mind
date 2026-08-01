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
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">
            Overview
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Today
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition-colors">
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
          <button className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition-colors">
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors">
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
          <button className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            New announcement
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-gray-200 py-6 md:divide-x divide-gray-200">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-4 ${i === 0 || i === 2 ? "pl-0 md:pl-4" : ""} ${i === 0 ? "md:pl-0" : ""} ${
              i % 2 !== 0 ? "border-l border-gray-200" : "md:border-l border-gray-200"
            } ${i === 0 || i === 2 ? "border-l-0" : ""} mb-4 md:mb-0`}
          >
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
              {s.label}
            </p>
            <p className="text-3xl font-bold tracking-tight text-gray-900">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
              CASH FLOW · LAST 6 CYCLES
            </p>
            <h2 className="text-2xl font-bold text-gray-900">₦1.28M</h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#fcd34d] rounded-sm"></div>
              Contributions in
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-black rounded-sm"></div>
              Outflow
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-[2px] bg-gray-400"></div>
              Net trend
            </div>
          </div>
        </div>

        {/* Chart Graphic (Mock) */}
        <div className="relative h-64 w-full mt-4 flex items-end justify-between px-2 md:px-8">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-gray-400 opacity-0 sm:opacity-100">
            <span>5.0M</span>
            <span>3.75M</span>
            <span>2.5M</span>
            <span>1.25M</span>
            <span>0</span>
          </div>

          {/* Grid lines */}
          <div className="absolute left-0 sm:left-10 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
            <div className="w-full border-b border-gray-100"></div>
            <div className="w-full border-b border-gray-100"></div>
            <div className="w-full border-b border-gray-100"></div>
            <div className="w-full border-b border-gray-100"></div>
            <div className="w-full border-b border-gray-100"></div>
          </div>

          {/* SVG Line Trend */}
          <svg
            className="absolute left-0 sm:left-10 right-0 top-0 bottom-8 w-full sm:w-[calc(100%-2.5rem)] h-full pointer-events-none overflow-visible z-10"
            preserveAspectRatio="none"
          >
            {/* We'll use a simple polyline for the trend. The coordinates are mocked based on percentages */}
            <polyline
              points="10%,45% 26.6%,40% 43.3%,50% 60%,35% 76.6%,32% 93.3%,30%"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
            />
            {/* Dots */}
            <circle
              cx="10%"
              cy="45%"
              r="3"
              fill="white"
              stroke="#9ca3af"
              strokeWidth="2"
            />
            <circle
              cx="26.6%"
              cy="40%"
              r="3"
              fill="white"
              stroke="#9ca3af"
              strokeWidth="2"
            />
            <circle
              cx="43.3%"
              cy="50%"
              r="3"
              fill="white"
              stroke="#9ca3af"
              strokeWidth="2"
            />
            <circle
              cx="60%"
              cy="35%"
              r="3"
              fill="white"
              stroke="#9ca3af"
              strokeWidth="2"
            />
            <circle
              cx="76.6%"
              cy="32%"
              r="3"
              fill="white"
              stroke="#9ca3af"
              strokeWidth="2"
            />
            {/* The active dot on APR */}
            <circle cx="93.3%" cy="30%" r="4" fill="black" />
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
                    className="w-1/2 bg-black rounded-t-sm"
                    style={{ height: `${d.out}%` }}
                  ></div>
                </div>
                <div
                  className={`mt-4 text-[10px] font-bold ${i === chartData.length - 1 ? "text-black" : "text-gray-400"}`}
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">Workload</h3>
        <div className="flex flex-col gap-3">
          {workloadTasks.map((task, i) => (
            <Link
              key={i}
              href={task.href}
              className="group flex items-center justify-between p-5 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-gray-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#fcd34d]"></div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-black">
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
                className="text-gray-400 group-hover:text-black transition-colors"
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
