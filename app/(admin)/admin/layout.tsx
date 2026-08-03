"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import Image from "next/image";

/* ─── Nav items matching image: Overview, Applications, Members,
       Contributions, Loans, Investment, Withdrawals, Reports,
       Announcements, Audit logs, Settings ───────────────────── */
const navGroups = [
  {
    label: "",
    items: [{ href: "/admin", label: "Overview", icon: "⊞" }],
  },
  {
    label: "MANAGEMENT",
    items: [
      {
        href: "/admin/applications",
        label: "Applications",
        icon: "◧",
        badge: 7,
      },
      { href: "/admin/members", label: "Members", icon: "◉" },
      {
        href: "/admin/contributions",
        label: "Contributions",
        icon: "◈",
        badge: 12,
      },
      { href: "/admin/loans", label: "Loans", icon: "$", badge: 3 },
      { href: "/admin/investments", label: "Investment", icon: "↗" },
      { href: "/admin/withdrawals", label: "Withdrawals", icon: "↑", badge: 5 },
    ],
  },
  {
    label: "REPORTING",
    items: [
      { href: "/admin/reports", label: "Reports", icon: "≡" },
      { href: "/admin/announcements", label: "Announcements", icon: "◎" },
      { href: "/admin/audit-logs", label: "Audit logs", icon: "≋" },
    ],
  },
  {
    label: "SYSTEM",
    items: [{ href: "/admin/settings", label: "Settings", icon: "⚙" }],
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
function AdminSidebar({
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
        background: "var(--admin-bg)",
        borderRight: "1px dashed var(--admin-border)",
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
        }}
      >
        <Link href="/" className="flex items-center gap-3 min-w-0">
          {/* <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 text-black"
            style={{ background: "var(--admin-primary)" }}
          >
            L
          </div>
          {!collapsed && (
            <span
              className="font-bold truncate text-lg"
              style={{ color: "var(--admin-text)" }}
            >
              LikeMind
            </span>
          )} */}
          <Image src="/Likemind.png" alt="Logo" width={50} height={50} style={{ width: "auto", height: "auto" }} />
        </Link>

        {/* Collapse toggle — desktop only */}
        {!collapsed && (
          <button
            id="admin-sidebar-collapse"
            onClick={onToggle}
            className="ml-auto shrink-0 hidden lg:flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-black/5"
            style={{ color: "var(--admin-muted)" }}
            aria-label="Collapse sidebar"
          >
            <IconChevron />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {!collapsed && group.label && (
              <p
                className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: "var(--admin-muted)", opacity: 0.7 }}
              >
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150"
                      style={
                        active
                          ? {
                              background: "rgba(0,0,0,0.05)",
                              color: "var(--admin-text)",
                              fontWeight: 600,
                            }
                          : { color: "var(--admin-muted)", fontWeight: 500 }
                      }
                      onMouseEnter={(e) => {
                        if (!active)
                          e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.background = "";
                      }}
                    >
                      <span className="text-base shrink-0 w-5 text-center">
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}
                      {!collapsed && item.badge != null && (
                        <span
                          className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center flex items-center justify-center"
                          style={{
                            background: "var(--admin-primary)",
                            color: "#000",
                          }}
                        >
                          {item.badge}
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

      {/* Bottom: Admin info */}
      <div className="shrink-0 p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
            style={{ background: "var(--admin-primary)" }}
          >
            AT
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "var(--admin-text)" }}
              >
                Adeyera Triumph
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "var(--admin-muted)" }}
              >
                Super admin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Expand button when collapsed (desktop) */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mb-4 w-8 h-8 hidden lg:flex items-center justify-center rounded-md transition-colors hover:bg-black/5"
          style={{ color: "var(--admin-muted)" }}
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
            className="relative z-10 flex flex-col h-full"
            style={{ width: "260px", background: "var(--admin-bg)" }}
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
function AdminTopbar({
  sidebarWidth,
  mobileOpen,
  onMobileToggle,
}: {
  sidebarWidth: number;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}) {
  return (
    <header
      className="fixed top-0 right-0 z-30 h-16 flex items-center justify-between px-4 md:px-8"
      style={{
        left: 0,
        marginLeft: `var(--admin-sidebar-offset, 0px)`,
        background: "var(--admin-bg)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Hamburger — mobile only */}
        <button
          id="admin-mobile-menu-toggle"
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-black/5"
          style={{ color: "var(--admin-text)" }}
          onClick={onMobileToggle}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <IconX /> : <IconMenu />}
        </button>

        {/* Search bar */}
        <div
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm border"
          style={{
            borderColor: "var(--admin-border)",
            color: "var(--admin-muted)",
            background: "var(--admin-surface)",
            width: "320px",
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
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search members, refs, loans"
            className="bg-transparent border-none outline-none w-full text-sm"
            style={{ color: "var(--admin-text)" }}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <ThemeToggle variant="default" />

        {/* Notification bell */}
        <button
          className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 border"
          style={{
            background: "var(--admin-surface)",
            borderColor: "var(--admin-border)",
            color: "var(--admin-text)",
          }}
          aria-label="Notifications"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}

/* ─── Layout ────────────────────────────────────────────────── */
export default function AdminDashboardLayout({
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
      style={{ background: "var(--admin-bg)", color: "var(--admin-text)" }}
    >
      {/* Inject sidebar offset CSS variable */}
      <style>{`
        @media (min-width: 1024px) {
          :root { --admin-sidebar-offset: ${sidebarWidth}px; }
        }
        @media (max-width: 1023px) {
          :root { --admin-sidebar-offset: 0px; }
        }
      `}</style>

      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((c) => !c)}
        onMobileClose={() => setMobileOpen(false)}
      />

      <AdminTopbar
        sidebarWidth={sidebarWidth}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen((o) => !o)}
      />

      <main className="pt-16 min-h-screen transition-all duration-300">
        <div
          className="transition-all duration-300"
          style={{
            paddingLeft: `max(0px, var(--admin-sidebar-offset, 0px))`,
          }}
        >
          <div className="p-4 md:p-8 lg:px-12 lg:py-10 max-w-[1200px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
