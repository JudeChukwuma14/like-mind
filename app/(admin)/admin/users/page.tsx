import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management | Admin",
  description: "Manage all Kajola platform users.",
};

const users = [
  {
    id: 1,
    name: "Ada Okafor",
    email: "ada@example.com",
    role: "User",
    plan: "Pro",
    status: "active",
    joined: "Jan 12, 2025",
  },
  {
    id: 2,
    name: "Kwame Mensah",
    email: "kwame@example.com",
    role: "User",
    plan: "Starter",
    status: "active",
    joined: "Feb 3, 2025",
  },
  {
    id: 3,
    name: "Yemi Adeyemi",
    email: "yemi@example.com",
    role: "Moderator",
    plan: "Pro",
    status: "active",
    joined: "Mar 19, 2025",
  },
  {
    id: 4,
    name: "Sola Bello",
    email: "sola@example.com",
    role: "User",
    plan: "Starter",
    status: "suspended",
    joined: "Apr 7, 2025",
  },
  {
    id: 5,
    name: "Chidi Nwosu",
    email: "chidi@example.com",
    role: "Admin",
    plan: "Enterprise",
    status: "active",
    joined: "Jan 1, 2025",
  },
  {
    id: 6,
    name: "Fatima Diallo",
    email: "fatima@example.com",
    role: "User",
    plan: "Pro",
    status: "active",
    joined: "May 22, 2025",
  },
];

const roleColors: Record<string, { bg: string; color: string }> = {
  Admin: { bg: "rgba(239,68,68,0.15)", color: "#f87171" },
  Moderator: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
  User: { bg: "rgba(99,102,241,0.15)", color: "#818cf8" },
};

export default function AdminUsersPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--admin-text)" }}
          >
            User Management
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--admin-muted)" }}>
            View, edit, and manage all platform users.
          </p>
        </div>
        <button
          id="admin-users-invite"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105 self-start"
          style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
        >
          + Invite User
        </button>
      </div>

      {/* Search + filter bar */}
      <div
        className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl border"
        style={{
          background: "var(--admin-surface)",
          borderColor: "var(--admin-border)",
        }}
      >
        <input
          id="admin-users-search"
          type="search"
          placeholder="Search by name or email…"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--admin-border)",
            color: "var(--admin-text)",
          }}
        />
        <select
          id="admin-users-filter-role"
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--admin-border)",
            color: "var(--admin-muted)",
          }}
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">User</option>
        </select>
        <select
          id="admin-users-filter-status"
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--admin-border)",
            color: "var(--admin-muted)",
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--admin-border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-xs uppercase tracking-wider border-b"
                style={{
                  background: "var(--admin-surface)",
                  borderColor: "var(--admin-border)",
                  color: "var(--admin-muted)",
                }}
              >
                {["User", "Role", "Plan", "Status", "Joined", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-5 py-4 text-left font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: "var(--admin-border)" }}
            >
              {users.map((u) => (
                <tr
                  key={u.id}
                  id={`admin-user-row-${u.id}`}
                  className="transition-colors hover:bg-white/5"
                  style={{ background: "var(--admin-bg)" }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: "rgba(245,158,11,0.35)" }}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p
                          className="font-medium"
                          style={{ color: "var(--admin-text)" }}
                        >
                          {u.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--admin-muted)" }}
                        >
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={roleColors[u.role]}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td
                    className="px-5 py-4 text-sm"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    {u.plan}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={
                        u.status === "active"
                          ? {
                              background: "rgba(34,197,94,0.12)",
                              color: "#4ade80",
                            }
                          : {
                              background: "rgba(239,68,68,0.12)",
                              color: "#f87171",
                            }
                      }
                    >
                      {u.status}
                    </span>
                  </td>
                  <td
                    className="px-5 py-4 text-xs"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    {u.joined}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        id={`admin-edit-user-${u.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
                        style={{
                          color: "#f59e0b",
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        id={`admin-${u.status === "active" ? "suspend" : "activate"}-user-${u.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
                        style={{
                          color: u.status === "active" ? "#f87171" : "#4ade80",
                          border: `1px solid ${u.status === "active" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                        }}
                      >
                        {u.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-5 py-4 border-t"
          style={{
            background: "var(--admin-surface)",
            borderColor: "var(--admin-border)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Showing 1–6 of 4,821 users
          </p>
          <div className="flex gap-2">
            {["← Prev", "1", "2", "3", "Next →"].map((p) => (
              <button
                key={p}
                id={`admin-users-page-${p.replace(/[^a-z0-9]/gi, "")}`}
                className="px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/5"
                style={{
                  color: p === "1" ? "#f59e0b" : "var(--admin-muted)",
                  border:
                    p === "1"
                      ? "1px solid rgba(245,158,11,0.3)"
                      : "1px solid var(--admin-border)",
                  background:
                    p === "1" ? "rgba(245,158,11,0.1)" : "transparent",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
