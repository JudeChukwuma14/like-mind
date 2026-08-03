import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, TrendingUp, DollarSign, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Kajola dashboard overview.",
};

export default function DashboardOverviewPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10" style={{ color: "var(--dash-text)" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Good morning, Triumph.
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--dash-muted)" }}>
          April dues are unpaid. You&apos;re 2 months from full loan eligibility.
        </p>
      </div>

      {/* Top section: Total Balance & Next Due */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* TOTAL BALANCE */}
        <div
          className="lg:col-span-2 rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between min-h-55 border"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
        >
          {/* Subtle gradient background effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="relative z-10">
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--dash-muted)" }}
            >
              TOTAL BALANCE
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl md:text-6xl font-bold tracking-tighter">
                $ 2,700
              </span>
              <span className="text-2xl font-medium" style={{ color: "var(--dash-muted)" }}>.00</span>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 mt-8">
            <button
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
              style={{ background: "var(--dash-text)", color: "var(--dash-surface)" }}
            >
              Make payment
            </button>
            <button
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors border"
              style={{
                background: "transparent",
                borderColor: "var(--dash-border)",
                color: "var(--dash-text)",
              }}
            >
              Withdraw
            </button>
            <button
              className="px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
              style={{ color: "var(--dash-muted)" }}
            >
              Statement
            </button>
          </div>
        </div>

        {/* NEXT DUE — intentionally dark accent card */}
        <div
          className="rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-55"
          style={{ background: "var(--nav-bg)", color: "var(--nav-text)" }}
        >
          <div>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3">
              NEXT DUE - 15 APRIL
            </p>
            <p className="text-4xl md:text-5xl font-bold tracking-tighter mb-1">
              $200
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Share capital</p>
          </div>
          <div className="mt-8">
            <button
              className="w-full px-5 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              style={{ background: "var(--nav-text)", color: "var(--nav-bg)" }}
            >
              Pay now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* Savings */}
        <div
          className="rounded-3xl p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-sm" style={{ color: "var(--dash-muted)" }}>Savings balance</span>
          </div>
          <p className="text-3xl font-bold tracking-tight mb-4">₦ 985,000</p>
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+ $ 200 this month</span>
          </div>
        </div>

        {/* Investment */}
        <div
          className="rounded-3xl p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-sm" style={{ color: "var(--dash-muted)" }}>Investment balance</span>
          </div>
          <p className="text-3xl font-bold tracking-tight mb-4">$ 700</p>
          <div
            className="text-[10px] font-bold tracking-wider flex items-center gap-1.5 uppercase"
            style={{ color: "var(--dash-muted)" }}
          >
            <span className="w-full max-w-10 h-1 bg-amber-100 rounded-full overflow-hidden block">
              <span className="bg-amber-400 w-[60%] h-full block" />
            </span>
            ₦ 1,200,000 / ₦ 2,000,000 monthly cap
          </div>
        </div>

        {/* Loan */}
        <div
          className="rounded-3xl p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-sm" style={{ color: "var(--dash-muted)" }}>Loan eligibility</span>
          </div>
          <p className="text-3xl font-bold tracking-tight mb-4">$ 520</p>
          <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            Eligible · 3x savings
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        {/* Activity */}
        <div
          className="lg:col-span-2 rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                ACTIVITY
              </p>
              <h2 className="text-lg font-bold">Recent contributions</h2>
            </div>
            <div
              className="flex p-1 rounded-full self-start"
              style={{ background: "color-mix(in srgb, var(--dash-border) 60%, transparent)" }}
            >
              <button
                className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "var(--dash-text)", color: "var(--dash-surface)" }}
              >
                All
              </button>
              <button
                className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ color: "var(--dash-muted)" }}
              >
                Savings
              </button>
              <button
                className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ color: "var(--dash-muted)" }}
              >
                Investment
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {[
              {
                month: "APR",
                title: "April savings contribution",
                ref: "REF #SAV-2684-118 · 14 Apr",
                badge: { label: "Pending review", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100/50", dot: "bg-amber-500" },
                amount: "+ ₦ 25,000",
              },
              {
                month: "MAR",
                title: "March savings contribution",
                ref: "REF #SAV-2683-104 · 12 Mar",
                badge: { label: "Confirmed", bg: "bg-green-50", text: "text-green-600", border: "border-green-100/50", dot: "bg-green-500" },
                amount: "+ ₦ 25,000",
              },
              {
                month: "APR",
                title: "April investment contribution",
                ref: "REF #INV-2684-027 · 11 Apr",
                badge: { label: "Confirmed", bg: "bg-green-50", text: "text-green-600", border: "border-green-100/50", dot: "bg-green-500" },
                amount: "+ ₦ 1,200,000",
              },
              {
                month: "MAR",
                title: "March investment contribution",
                ref: "REF #INV-2683-019 · 10 Mar",
                badge: { label: "Confirmed", bg: "bg-green-50", text: "text-green-600", border: "border-green-100/50", dot: "bg-green-500" },
                amount: "+ ₦ 1,000,000",
              },
              {
                month: "FEB",
                title: "February savings contribution",
                ref: "REF #SAV-2682-091 · 09 Feb",
                badge: { label: "Confirmed", bg: "bg-green-50", text: "text-green-600", border: "border-green-100/50", dot: "bg-green-500" },
                amount: "+ ₦ 25,000",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm border"
                  style={{
                    background: "var(--dash-bg)",
                    borderColor: "var(--dash-border)",
                    color: "var(--dash-muted)",
                  }}
                >
                  {item.month}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.title}</p>
                  <p
                    className="text-[11px] truncate mt-0.5 uppercase tracking-wider"
                    style={{ color: "var(--dash-muted)" }}
                  >
                    {item.ref}
                  </p>
                </div>
                <div
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${item.badge.bg} ${item.badge.text} ${item.badge.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.badge.dot}`}></span>
                  {item.badge.label}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{item.amount}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="flex items-center justify-between mt-8 pt-4 border-t"
            style={{ borderColor: "var(--dash-border)" }}
          >
            <span className="text-xs font-medium" style={{ color: "var(--dash-muted)" }}>
              5 of 24
            </span>
            <Link
              href="#"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View all activity <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right side group: Inbox + Share Capital */}
        <div className="space-y-4 lg:space-y-6">
          {/* Inbox */}
          <div
            className="rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                INBOX{" "}
                <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-sm">
                  5 NEW
                </span>
              </p>
              <Link href="#" className="text-xs font-bold text-amber-600 hover:text-amber-700">
                View all
              </Link>
            </div>

            <div className="space-y-5">
              {[
                {
                  dot: "bg-amber-500",
                  title: "April dues reminder",
                  time: "2h",
                  body: "Pay by 15 April to stay current.",
                },
                {
                  dot: "bg-green-500",
                  title: "Loan request received",
                  time: "1d",
                  body: "Admin will review within 3 days.",
                },
                {
                  dot: "bg-green-500",
                  title: "March payment confirmed",
                  time: "3d",
                  body: "Receipt available in your records.",
                },
              ].map((msg, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${msg.dot} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold">{msg.title}</p>
                      <span
                        className="text-[10px] shrink-0 mt-0.5 font-medium"
                        style={{ color: "var(--dash-muted)" }}
                      >
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-[13px]" style={{ color: "var(--dash-muted)" }}>
                      {msg.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Capital */}
          <div
            className="rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-4">
              SHARE CAPITAL
            </p>
            <p className="text-xl font-bold tracking-tight mb-1">
              $2,000 of $2,000 paid
            </p>
            <p className="text-sm mb-5" style={{ color: "var(--dash-muted)" }}>
              Paid in full - + $100 registration fee
            </p>

            <div
              className="w-full h-1.5 rounded-full mb-3 overflow-hidden"
              style={{ background: "var(--dash-border)" }}
            >
              <div className="bg-green-600 h-full rounded-full w-full"></div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-medium tracking-wide" style={{ color: "var(--dash-muted)" }}>
                Completed 28 Dec 2024
              </p>
            </div>

            <button
              className="px-5 py-2.5 rounded-full text-xs font-semibold transition-colors"
              style={{ background: "var(--dash-text)", color: "var(--dash-surface)" }}
            >
              Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
