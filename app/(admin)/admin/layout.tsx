"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LogOut,
  LayoutGrid,
  FileText,
  Users,
  PiggyBank,
  HandCoins,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  Megaphone,
  History,
  KeyRound,
  Settings as SettingsIcon,
  Search,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import Image from "next/image";
import { useRequireAdminAuth } from "./useAdminGuard";
import { useAdminAuth } from "@/app/providers/AdminAuthProvider";

/** "RootAdmin" -> "Root Admin" */
function humanizeRole(role: string): string {
  return role.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function initialsFor(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
}

/* ─── Nav items matching image: Overview, Applications, Members,
       Contributions, Loans, Investment, Withdrawals, Reports,
       Announcements, Audit logs, Settings ───────────────────── */
type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "",
    items: [{ href: "/admin", label: "Overview", icon: LayoutGrid }],
  },
  {
    label: "MANAGEMENT",
    items: [
      { href: "/admin/applications", label: "Applications", icon: FileText },
      { href: "/admin/members", label: "Members", icon: Users },
      { href: "/admin/approvals", label: "Approvals", icon: ClipboardCheck },
      { href: "/admin/roles", label: "Roles", icon: KeyRound },
      { href: "/admin/contributions", label: "Contributions", icon: PiggyBank },
      { href: "/admin/loans", label: "Loans", icon: HandCoins },
      { href: "/admin/investments", label: "Investment", icon: TrendingUp },
      { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpRight },
      { href: "/admin/contacts", label: "Contact Messages", icon: MessageSquare },
    ],
  },
  {
    label: "REPORTING",
    items: [
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { href: "/admin/audit-logs", label: "Audit logs", icon: History },
    ],
  },
  {
    label: "SYSTEM",
    items: [{ href: "/admin/settings", label: "Settings", icon: SettingsIcon }],
  },
];

/** Longest-href-first so nested routes (e.g. /admin/audit-logs) don't match a shorter sibling. */
const navItemsByHref = navGroups
  .flatMap((g) => g.items)
  .sort((a, b) => b.href.length - a.href.length);

function pageTitleFor(pathname: string): { category: string; title: string } {
  const item = navItemsByHref.find((i) =>
    i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href),
  );
  const group = item && navGroups.find((g) => g.items.includes(item));
  return { category: group?.label || "OVERVIEW", title: item?.label ?? "Dashboard" };
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
  const router = useRouter();
  const { logout, user } = useAdminAuth();

  const displayName = user?.name || user?.email || "Admin";
  const displayRole = user?.role ? humanizeRole(user.role) : "Admin";
  const avatarInitials = initialsFor(displayName);

  /* Close mobile menu on route change */
  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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
            <ChevronLeft className="w-4 h-4" />
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
                      className={`hover-admin-border flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${active ? "active" : ""}`}
                      style={
                        active
                          ? {
                              background: "rgba(245,158,11,0.15)",
                              color: "#f59e0b",
                            }
                          : {
                              color: "var(--admin-muted)",
                            }
                      }
                    >
                      <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
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
            {avatarInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "var(--admin-text)" }}
              >
                {displayName}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "var(--admin-muted)" }}
              >
                {displayRole}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-black/5"
            style={{ color: "var(--admin-muted)" }}
          >
            <LogOut className="w-4 h-4" />
          </button>
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
          <ChevronRight className="w-4 h-4" />
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
  mobileOpen,
  onMobileToggle,
}: {
  mobileOpen: boolean;
  onMobileToggle: () => void;
}) {
  const pathname = usePathname();
  const { category, title } = pageTitleFor(pathname);

  return (
    <header
      className="fixed top-0 right-0 z-30 h-16 flex items-center justify-between gap-4 px-4 md:px-8"
      style={{
        left: 0,
        marginLeft: `var(--admin-sidebar-offset, 0px)`,
        background: "var(--admin-bg)",
        borderBottom: "1px dashed var(--admin-border)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          id="admin-mobile-menu-toggle"
          className="shrink-0 lg:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-black/5"
          style={{ color: "var(--admin-text)" }}
          onClick={onMobileToggle}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Page title */}
        <div className="min-w-0 hidden sm:block">
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: "#f59e0b" }}
          >
            {category}
          </p>
          <h1 className="text-lg font-bold truncate" style={{ color: "var(--admin-text)" }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Search bar */}
        <div
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm border"
          style={{
            borderColor: "var(--admin-border)",
            color: "var(--admin-muted)",
            background: "var(--admin-surface)",
            width: "260px",
          }}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <input
            type="text"
            placeholder="Search members, refs, loans"
            className="bg-transparent border-none outline-none w-full text-sm min-w-0"
            style={{ color: "var(--admin-text)" }}
          />
          <span className="text-[10px] font-medium shrink-0">⌘K</span>
        </div>

        {/* Theme toggle */}
        <ThemeToggle variant="default" />

        {/* Notification bell */}
        <button
          className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 border shrink-0"
          style={{
            background: "var(--admin-surface)",
            borderColor: "var(--admin-border)",
            color: "var(--admin-text)",
          }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: "var(--admin-accent)" }}
          />
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
  const { isAuthenticated, isLoading } = useRequireAdminAuth();

  const sidebarWidth = collapsed ? 72 : 220;

  // Avoid flashing protected content before the session check (and any
  // resulting redirect to /login) completes.
  if (isLoading || !isAuthenticated) return null;

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
