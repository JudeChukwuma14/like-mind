"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

/* ─── Nav items matching image: Overview, Cash Wallet, Investments, Loans,
       Withdrawals, Notifications, Profile ──────────────────────────── */
const navGroups = [
  {
    label: "OVERVIEW",
    items: [{ href: "/dashboard", label: "Dashboard", icon: "⊞" }],
  },
  {
    label: "MONEY",
    items: [
      { href: "/dashboard/cash-wallet", label: "Cash wallet", icon: "◈" },
      { href: "/dashboard/investments", label: "Investments", icon: "↗" },
      { href: "/dashboard/loans", label: "Loans", icon: "$" },
      { href: "/dashboard/withdrawals", label: "Withdrawals", icon: "↑" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { href: "/dashboard/notifications", label: "Notifications", icon: "◎" },
      { href: "/dashboard/profile", label: "Profile", icon: "◉" },
    ],
  },
];

/* ─── SVG Icons ─────────────────────────────────────────────── */
function IconMenu() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function IconX() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconChevron({ right }: { right?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      {right ? (
        <polyline points="9 18 15 12 9 6" />
      ) : (
        <polyline points="15 18 9 12 15 6" />
      )}
    </svg>
  );
}

/* ─── Sidebar ───────────────────────────────────────────────── */
function Sidebar({
  collapsed,
  mobileOpen,
  onToggle,
  onMobileClose,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();

  /* Close mobile menu on route change */
  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const sidebarContent = (
    <aside
      style={{
        background: "var(--dash-surface)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        width: collapsed ? "72px" : "220px",
        transition: "width 0.3s ease",
      }}
      className="flex flex-col h-full overflow-hidden"
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height: "64px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Link href="/" className="flex items-center gap-3 min-w-0">
          {/* <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 text-white"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
          >
            L
          </div>
          {!collapsed && (
            <span className="font-bold text-white truncate text-sm">
              LikeMind
            </span>
          )} */}

          <Image src="/Likemind.png" alt="Logo" width={100} height={100} className="w-20 h-auto object-cover"/>
        </Link>

        {/* collapse toggle — only visible on desktop */}
        {!collapsed && (
          <button
            id="user-sidebar-collapse"
            onClick={onToggle}
            className="ml-auto shrink-0 hidden lg:flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.4)" }}
            aria-label="Collapse sidebar"
          >
            <IconChevron />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5 dark-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p
                className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                      style={
                        active
                          ? {
                              background: "rgba(245,158,11,0.15)",
                              color: "#f59e0b",
                            }
                          : {
                              color: "rgba(255,255,255,0.55)",
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!active)
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.06)";
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.background = "";
                      }}
                    >
                      <span className="text-base shrink-0 w-5 text-center">
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                      {!collapsed && item.href === "/dashboard/loans" && (
                        <span
                          className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: "rgba(239,68,68,0.2)",
                            color: "#ef4444",
                          }}
                        >
                          Review
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom: AI + User Info */}
      <div
        className="shrink-0 p-3 space-y-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Ask AI button */}
        {!collapsed && (
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: "rgba(245,158,11,0.1)",
              color: "#f59e0b",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <span>✦</span>
            <span>Ask LikeMind AI</span>
          </button>
        )}

        {/* Avatar row */}
        <div className="flex items-center gap-2 px-1 py-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
          >
            AT
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Adeyera Triumph
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Member · ALM 04513
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Expand button when collapsed (desktop) */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mb-3 w-8 h-8 hidden lg:flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.4)" }}
          aria-label="Expand sidebar"
        >
          <IconChevron right />
        </button>
      )}
    </aside>
  );

  return (
    <>
      {/* ── Desktop: fixed sidebar ─────────────────────────────── */}
      <div
        className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col"
        style={{
          width: collapsed ? "72px" : "220px",
          transition: "width 0.3s ease",
        }}
      >
        {sidebarContent}
      </div>

      {/* ── Mobile overlay ─────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          onClick={onMobileClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Drawer */}
          <div
            className="relative z-10 flex flex-col"
            style={{ width: "260px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Topbar ────────────────────────────────────────────────── */
function Topbar({
  sidebarWidth,
  mobileOpen,
  onMobileToggle,
}: {
  sidebarWidth: number;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}) {
  const pathname = usePathname();

  /* Derive page title and category from pathname */
  let category = "OVERVIEW";
  let mainTitle = "Dashboard";

  if (pathname.includes("/profile")) {
    category = "PROFILE";
    mainTitle = "Personal, interac, documents";
  } else if (pathname.includes("/cash-wallet")) {
    category = "MONEY";
    mainTitle = "Cash Wallet";
  } else if (pathname.includes("/investments")) {
    category = "MONEY";
    mainTitle = "Investments";
  } else if (pathname.includes("/loans")) {
    category = "MONEY";
    mainTitle = "Loans";
  } else if (pathname.includes("/withdrawals")) {
    category = "MONEY";
    mainTitle = "Withdrawals";
  } else if (pathname.includes("/notifications")) {
    category = "ACCOUNT";
    mainTitle = "Notifications";
  }
  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 md:py-6"
      style={{
        left: 0,
        marginLeft: `var(--sidebar-offset, 0px)`,
        background: "var(--dash-bg)",
        height: "88px",
      }}
    >
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-4">
        <button
          id="user-mobile-menu-toggle"
          className="lg:hidden flex items-center justify-center w-10 h-10 bg-white rounded-full border border-gray-100 shadow-sm transition-colors hover:bg-gray-50"
          style={{ color: "var(--dash-text)" }}
          onClick={onMobileToggle}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <IconX /> : <IconMenu />}
        </button>

        <div className="hidden sm:block">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">
            {category}
          </p>
          <h2 className="text-lg font-bold text-[#111]">{mainTitle}</h2>
        </div>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white rounded-full border border-gray-100 shadow-sm w-[280px]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-gray-400"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search transactions, members"
            className="flex-1 bg-transparent text-sm outline-none text-[#111] placeholder:text-gray-400"
          />
          <span className="text-[10px] font-medium text-gray-400">⌘K</span>
        </div>

        {/* Notifications bell */}
        <Link
          href="/dashboard/notifications"
          id="user-topbar-notifications"
          className="relative w-10 h-10 bg-white rounded-full border border-gray-100 shadow-sm flex items-center justify-center transition-colors hover:bg-gray-50 text-gray-600 hover:text-[#111]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span
            className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ background: "#ef4444" }}
          />
        </Link>

        {/* Avatar - hide on profile page since it has its own large avatar */}
        {pathname !== "/dashboard/profile" && (
          <Link
            href="/dashboard/profile"
            id="user-topbar-avatar"
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
          >
            AT
          </Link>
        )}
      </div>
    </header>
  );
}

/* ─── Layout ────────────────────────────────────────────────── */
export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? 72 : 220;

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--dash-bg)", color: "var(--dash-text)" }}
    >
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((c) => !c)}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Inject CSS variable for topbar left offset */}
      <style>{`
        @media (min-width: 1024px) {
          :root { --sidebar-offset: ${sidebarWidth}px; }
        }
        @media (max-width: 1023px) {
          :root { --sidebar-offset: 0px; }
        }
      `}</style>

      <Topbar
        sidebarWidth={sidebarWidth}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen((o) => !o)}
      />

      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{
          marginLeft: 0,
        }}
      >
        {/* On desktop, push content right of sidebar via inline style */}
        <div
          className="transition-all duration-300"
          style={{
            paddingLeft: `max(0px, var(--sidebar-offset, 0px))`,
          }}
        >
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
