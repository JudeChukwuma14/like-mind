"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useCurrentUser } from "@/app/lib/useCurrentUser";

/** "Member" claim role strings arrive as-is (e.g. "Member"); this just guards odd casing like "MEMBER". */
function humanizeRole(role: string): string {
  return role.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function initialsFor(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
}

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
      strokeLinejoin="round"
    >
      {right ? (
        <polyline points="9 18 15 12 9 6" />
      ) : (
        <polyline points="15 18 9 12 15 6" />
      )}
    </svg>
  );
}

function IconLogout() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
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
  const user = useCurrentUser();
  const displayName = user?.name || user?.email || "Member";
  const displayRole = user?.role ? humanizeRole(user.role) : "Member";
  const avatarInitials = initialsFor(displayName);

  /* Close mobile menu on route change */
  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const sidebarContent = (
    <aside
      style={{
        background: "var(--dash-surface)",
        borderRight: "1px solid var(--dash-border)",
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
          borderBottom: "1px solid var(--dash-border)",
        }}
      >
        <Link href="/" className="flex items-center gap-3 min-w-0">
          {collapsed ? (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 text-white shadow-md"
              style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
            >
              L
            </div>
          ) : (
            <Image 
              src="/Likemind.png" 
              alt="Logo" 
              width={140} 
              height={40} 
              className="w-32 max-h-8 object-contain drop-shadow-sm transition-transform hover:scale-[1.02]" 
              priority
            />
          )}
        </Link>

        {/* collapse toggle — only visible on desktop */}
        {!collapsed && (
          <button
            id="user-sidebar-collapse"
            onClick={onToggle}
            className="hover-dash-border-mix ml-auto shrink-0 hidden lg:flex items-center justify-center w-7 h-7 rounded-md transition-colors"
            style={{ color: "var(--dash-muted)", background: "transparent" }}
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
                style={{ color: "var(--dash-muted)", opacity: 0.7 }}
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
                      className={`hover-dash-border-mix-50 flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${active ? "active" : ""}`}
                      style={
                        active
                          ? {
                              background: "rgba(245,158,11,0.15)",
                              color: "#f59e0b",
                            }
                          : {
                              color: "var(--dash-muted)",
                            }
                      }
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
        className="shrink-0 p-3 space-y-3"
        style={{ borderTop: "1px solid var(--dash-border)" }}
      >
        {/* Ask AI button */}
        {!collapsed && (
          <button
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.05))",
              color: "#f59e0b",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <span className="text-amber-500 text-sm">✦</span>
            <span className="font-semibold tracking-wide">Ask LikeMind AI</span>
          </button>
        )}

        {/* Avatar row & Logout */}
        <div className="flex flex-col gap-1">
          <div className="hover-dash-border-mix flex items-center gap-3 px-2 py-2 rounded-xl transition-colors cursor-pointer">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
              style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff" }}
            >
              {avatarInitials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--dash-text)" }}>
                  {displayName}
                </p>
                <p
                  className="text-[10px] uppercase tracking-wider font-medium truncate opacity-80"
                  style={{ color: "var(--dash-muted)" }}
                >
                  {displayRole}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              window.location.href = "/signin";
            }}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              collapsed ? "justify-center hover:bg-red-500/10" : "hover:bg-red-500/10"
            }`}
            style={{ color: "var(--dash-muted)" }}
            title={collapsed ? "Logout" : undefined}
          >
            <span className="group-hover:text-red-500 transition-colors flex items-center justify-center">
              <IconLogout />
            </span>
            {!collapsed && <span className="group-hover:text-red-500 transition-colors">Logout</span>}
          </button>
        </div>
      </div>

      {/* Expand button when collapsed (desktop) */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="hover-dash-border-mix mx-auto mb-3 w-8 h-8 hidden lg:flex items-center justify-center rounded-md transition-colors"
          style={{ color: "var(--dash-muted)" }}
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
  mobileOpen,
  onMobileToggle,
}: {
  mobileOpen: boolean;
  onMobileToggle: () => void;
}) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const avatarInitials = initialsFor(user?.name || user?.email || "Member");

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
          className="hover-dash-bg lg:hidden flex items-center justify-center w-10 h-10 rounded-full border shadow-sm transition-colors"
          style={{ color: "var(--dash-text)", background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          onClick={onMobileToggle}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <IconX /> : <IconMenu />}
        </button>

        <div className="hidden sm:block">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">
            {category}
          </p>
          <h2 className="text-lg font-bold" style={{ color: "var(--dash-text)" }}>{mainTitle}</h2>
        </div>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <ThemeToggle variant="default" />
        {/* Search bar */}
        <div
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full border shadow-sm w-[280px]"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-muted)" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search transactions, members"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--dash-text)" }}
          />
          <span className="text-[10px] font-medium" style={{ color: "var(--dash-muted)" }}>⌘K</span>
        </div>

        <Link
          href="/dashboard/notifications"
          id="user-topbar-notifications"
          className="hover-dash-text relative w-10 h-10 rounded-full border shadow-sm flex items-center justify-center transition-colors"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-muted)" }}
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
            {avatarInitials}
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
